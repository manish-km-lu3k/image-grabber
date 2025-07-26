import { memo } from 'react';
import '../Styles/circ.css';
import { Triangle } from 'react-loader-spinner';

export default memo(function CircularIndeterminate() {
    return (
        <>
            <div id="cir">
                <h2>Downloading...</h2>
                <Triangle
                    visible={true}
                    height="50"
                    width="80"
                    color="#c80000ff"
                    ariaLabel="triangle-loading"
                />
            </div>
        </>

    );
});
