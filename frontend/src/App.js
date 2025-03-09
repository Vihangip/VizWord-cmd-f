import './App.css';
import { Button } from '@mui/material';
import Chat from './components/chat.js';
import Navbar from './components/navbar.js';
import Camera from './images/camera_icon.png';
import Dictionary from './images/your_dictionary.png';
import CameraComponent from './CameraComponent.js';

function App() {

  const parent = {
    display: 'flex',
    backgroundColor: 'var(--white)',
    width: '100vw',
    height: '83vh'
  }

  const child = {
    flex: 1,
    padding: '20px',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  }

  const camerabox = {
    backgroundColor: 'var(--yellow)',
    width: '100%',
    height: '60%',
    borderRadius: 'var(--border)'
  }

  const photoButtonArea = { 
    display: 'flex',
    height: '5%',
    paddingTop: '15px',
    paddingBottom: '20px',
    justifyContent: 'flex-start'
  }

  const photoButton = {
    borderRadius: "var(--border)",
    width: '168px',
    height: '40px'
  }

  const dictonaryArea = {
    backgroundImage: 'url("././images/your_dictionary.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: 'var(--pink)',
    width: '80%',
    height: '90%',
  }

  return (
    <div className="App">
      <Navbar/>
      <div style={parent}>
        <div style={child}>
        <div style={camerabox}/>
          <div style={photoButtonArea}>
            <Button variant="contained" color="secondary" sx={photoButton}>
              <img src={Camera} alt="camera" width={20} height={20} style={{ marginRight: '10px' }}/>
              Take A Photo
            </Button>
          </div>
          <div style={dictonaryArea}>
            <h1 style={{margin: 0}}>Testing</h1>
          </div>
        </div>
        <div style={child}>
          <Chat/>
        </div>
      </div>
    </div>
  );
}

export default App;
