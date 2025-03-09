import '../App.css';
import Camera from './Camera.js';

function CameraComponent({ selectedLanguage, setObjectData }) {  
  const handleResultsUpdate = (data) => {
    console.log("Received data in parent:", data);
    setObjectData(data); 
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