import express from 'express';
import puppeteer from 'puppeteer';
import archiver from 'archiver';
import axios from 'axios';
import cors from 'cors';
import serverless from 'serverless-http';

const app = express();
const PORT = 8000;

app.use(cors(
    {
        origin: [
            "https://image-grabber-ov1j-client.vercel.app",
            "https://image-grabber-beta.vercel.app"
        ],
        methods: ['GET', 'POST'],
        credentials: true
    }
));

app.use(express.json());

app.post('/api/scrape', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing URL' });

    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/114 Safari/537.36');

        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Auto-scroll to load lazy images
        await autoScroll(page);

        // Extract image URLs
        const imageUrls = await page.evaluate(() => {
            const urls = new Set();

            document.querySelectorAll('img, source').forEach(el => {
                const src = el.getAttribute('src') || el.getAttribute('data-src');
                const srcset = el.getAttribute('srcset');

                if (src && src.startsWith('http')) urls.add(src);
                if (srcset) {
                    srcset.split(',').forEach(part => {
                        const clean = part.trim().split(' ')[0];
                        if (clean.startsWith('http')) urls.add(clean);
                    });
                }
            });

            document.querySelectorAll('*').forEach(el => {
                const bg = window.getComputedStyle(el).backgroundImage;
                if (bg?.startsWith('url("')) {
                    const bgUrl = bg.slice(5, -2);
                    if (bgUrl.startsWith('http')) urls.add(bgUrl);
                }
            });

            return [...urls].slice(0, 50); // 🛑 LIMIT HERE
        });


        await browser.close();

        if (!imageUrls.length) {
            return res.status(404).json({ error: 'No images found.' });
        }

        console.log(`Found ${imageUrls.length} image(s). Zipping...`);

        // Setup zip stream
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=images.zip');
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        const downloadTasks = imageUrls.map(async (url, index) => {
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                const ext = getExtension(url);
                const name = `image_${index + 1}${ext}`;
                archive.append(response.data, { name });
            } catch (err) {
                console.warn(`Failed to download: ${url}`);
            }
        });

        await Promise.allSettled(downloadTasks);
        await archive.finalize();

    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Scroll to load more content
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise(resolve => {
            let totalHeight = 0;
            const distance = 300;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 400);
        });
    });
}

// Guess file extension
function getExtension(url) {
    const ext = url.split('.').pop().split('?')[0];
    return ext && ext.length < 6 ? `.${ext}` : '.jpg';
}

export default serverless(app);