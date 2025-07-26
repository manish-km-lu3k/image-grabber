import { memo } from 'react';
import '../Styles/footer.css';

export default memo(function Footer() {
    return (
        <>
            <div id="footer">
                <h2>Some websites load images through APIs, while others are secured, <br />so this method may not work on them.</h2>
            </div>
        </>
    )
});
