import { ToastContainer } from 'react-toastify';
import Home from './Components/Home';
import './Styles/App.css';

function App() {
  function setVhUnit() {
    let vh = window.innerHeight * 0.01;
    let vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--vw', `${vw}px`);
    // console.log(vh,vw);
  }
  // setVhUnit();
  // window.addEventListener('resize', setVhUnit);
  return (
    <>
      <ToastContainer />
      <Home />
    </>
  )
}

export default App;