import './App.css';
import Chat from './components/chat.js';
import Navbar from './components/navbar.js';
import Dictionary from './images/your_dictionary.png';
import Star from './images/star_icon.png';
import CameraComponent from './components/CameraComponent.js';

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
    //overflow: 'hidden'
  }

  const dictonaryArea = {
    backgroundImage: 'url("././images/your_dictionary.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: 'var(--pink)',
    borderRadius: 'var(--border)',
    width: '60%',
    height: '85%',
    padding: '50px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
  }

  const dictionaryLabel = {
    backgroundColor: 'var(--white)',
    borderRadius: 'var(--border)',
    width: '300px',
    height: '30px',
    display: 'flex',
    justifyContents: 'center',
    alignItems: 'center',
    padding: '20px',
    gap: '20px'
  }

  return (
    <div className="App">
      <Navbar/>
      <div style={parent}>
        <div style={child}>
          <div style={{borderRadius: 'var(--border)', paddingBottom: '30px'}}>
            <CameraComponent/>
          </div>
          <div style={dictonaryArea}>
            <h1 style={{margin: 0, color: 'var(--white)'}}>Your Dictionary</h1>
            <div style={dictionaryLabel}>
              <img src={Star} width={30} height={30}/>
              <h2 style={{margin: 0, color: 'var(--black)'}}>7 Objects</h2>
            </div>
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
