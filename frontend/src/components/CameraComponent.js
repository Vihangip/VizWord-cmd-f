import '../App.css';
import Camera from './Camera.js';
import { useState } from 'react';

function CameraComponent({ selectedLanguage }) {
  const [objectData, setObjectData] = useState(null);
  
  const handleResultsUpdate = (data) => {
    console.log("Received data in parent:", data);
    setObjectData(data); // Update App.js state
  };

  return (
    <div className="app-container" style={{ minWidth: '100%' }} maxWidth={false}>
      <Camera 
        selectedLanguage={selectedLanguage} 
        onResultsUpdate={handleResultsUpdate} 
      />
    </div>
  );
}

export default CameraComponent;