import './App.css';
import Chat from './components/chat.js';
import Navbar from './components/navbar.js';
import Dictionary from './images/your_dictionary.png';
import Star from './images/star_icon.png';
import CameraComponent from './components/CameraComponent.js';
import { useEffect, useState } from 'react';
import mascotTexture from './images/mascot_baseColor.png'
import ThreeDComponent from './components/threeDComponent.js';
import mascot from './images/mascot.glb';

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [objectData, setObjectData] = useState(null);
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

  const dictonaryArea = {
    backgroundImage: `url(${Dictionary})`,
    backgroundSize: 'contain', 
    backgroundRepeat: 'no-repeat',
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
    gap: '20px',
    marginRight: '25px'
  }

  const props =  {
    object: "bottle",
    translation: "Botella",
    adjectives: [
      {
          "english": "clear",
          "translation": "claro/a"
      },
      {
          "english": "plastic",
          "translation": "de plástico"
      },
      {
          "english": "cylindrical",
          "translation": "cilíndrico/a"
      }
    ]
  }

  useEffect(() => { 
    if (objectData) {
      console.log(objectData);
    }
  }
  , [objectData])

  return (
    <div className="App">
      <Navbar selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage}/>
      <div style={parent}>
        <div style={child}>
          <div style={{borderRadius: 'var(--border)', paddingBottom: '30px'}}>
            <CameraComponent selectedLanguage={selectedLanguage} setObjectData={setObjectData}/>
          </div>
          <div style={dictonaryArea}>
            <h1 style={{margin: 0, color: 'var(--white)', marginRight: '25px'}}>Your Dictionary</h1>
            <div style={dictionaryLabel}>
              <img src={Star} width={30} height={30}/>
              <h2 style={{margin: 0, color: 'var(--black)'}}>7 Objects</h2>
            </div>
          </div>
        </div>
        <div style={child}>
          <Chat props={objectData} resetObjectData={() => setObjectData(null)}/>
        </div>
        <ThreeDComponent modelPath={mascot} texturePath={mascotTexture}/>
      </div>
    </div>
  );
}

export default App;
