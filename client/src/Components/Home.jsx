import { useState } from 'react';
import '../Styles/home.css';
import Footer from './Footer';
import CircularIndeterminate from './CircularIndeterminate';
import { toast } from 'react-toastify';
import axios from 'axios';

const Home = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const downloadImages = async () => {
    try {
      setLoading(true);

      const response = await axios.post(`${process.env.SERVER_API}/scrape`, { url }, { responseType: 'blob' });

      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'images.zip';
      link.click();

      toast.success('Download Success !!');
    } catch (error) {
      console.log('Something went wrong: ' + error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div id='home'>
        <div id="cont-parent">
          <div id="container">
            <h2 id='title'>Grab Images from any site</h2>
            <input
              name='site_url'
              type="text"
              placeholder="Enter website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <br />
            <button className='button-70' onClick={downloadImages}>Download</button>
            {loading && <CircularIndeterminate />}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Home;
