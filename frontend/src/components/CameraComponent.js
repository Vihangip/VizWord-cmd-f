import '../App.css';
import Camera from './Camera.js';
import { useState, Button } from 'react';

function CameraComponent() {
  const [language, setLanguage] = useState("French");
  const [objectData, setObjectData] = useState(null);
  
  const handleResultsUpdate = (data) => {
    console.log("Received data in parent:", data);
    setObjectData(data);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };


  return (
    <div className="app-container" style={{minWidth: '100%'}} maxWidth={false}>
      <Camera 
        selectedLanguage={language} 
        onResultsUpdate={handleResultsUpdate} 
      />
    </div>
  );
}

export default CameraComponent;