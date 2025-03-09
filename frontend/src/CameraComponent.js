import { useState, useRef, useEffect } from "react";
import './App.css';

function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [detections, setDetections] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("French");
  const [translations, setTranslations] = useState([]);

  const languages = [
    "French", "Spanish", "German", "Italian", "Japanese", 
    "Chinese", "Hindi", "Arabic", "Portuguese", "Russian"
  ];

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      })
      .catch(err => console.error("Error accessing webcam:", err));
  };

  const captureImage = () => {
    let timeLeft = 3;
    setCountdown(timeLeft);

    const countdownInterval = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);
      if (timeLeft === 0) {
        clearInterval(countdownInterval);
        takePicture();
      }
    }, 1000);
  };

  const takePicture = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
  
      // Set canvas dimensions to match the crop size
      canvasRef.current.width = videoWidth * 0.4;
      canvasRef.current.height = videoHeight;
      
      const cropX = videoWidth * 0.6; // Start from 60% in (right side becomes left after flip)
      const cropY = 0; // No vertical offset
      const cropWidth = videoWidth * 0.4; // Same width (40% of total)
      const cropHeight = videoHeight; // Full height
  
      // Apply horizontal flip transformation
      context.scale(-1, 1);
      context.translate(-canvasRef.current.width, 0);
      
      // Draw only the cropped area
      context.drawImage(
        videoRef.current,
        cropX, cropY, cropWidth, cropHeight, // Source (from video)
        0, 0, cropWidth, cropHeight // Destination (on canvas)
      );
  
      // Convert to image
      const imageDataUrl = canvasRef.current.toDataURL("image/png");
      setCapturedImage(imageDataUrl);
      
      // Send image to server for processing
      await sendImageToServer(imageDataUrl);
    }
  };
  
  const sendImageToServer = async (imageDataUrl) => {
    try {
      setIsProcessing(true);
      setDetections([]);
      setTranslations([]);
      
      // Convert base64 to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'captured-image.png');
      formData.append('language', selectedLanguage);
      
      // Send to Express server - updated port to 3001
      console.log(`Sending image to server with language: ${selectedLanguage}`);
      const expressResponse = await fetch('http://localhost:3001/process-image', {
        method: 'POST',
        body: formData
      });
      
      if (!expressResponse.ok) {
        throw new Error(`Server responded with ${expressResponse.status}`);
      }
      
      const data = await expressResponse.json();
      console.log("Server response:", data);
      
      // Process response
      if (data.response) {
        // Set translations from the Gemini response
        setTranslations(data.response);
        
        // If you need to integrate with detection data
        if (data.detections) {
          setDetections(data.detections);
        }
      } else if (data.error) {
        console.error("Server returned an error:", data.error);
      }
    } catch (error) {
      console.error("Error sending image to server:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    // Clean up function to stop the camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const renderDetectionBoxes = () => {
    if (!capturedImage || detections.length === 0) return null;
    
    return (
      <div className="detection-overlay">
        {detections.map((detection, index) => {
          const [x, y, width, height] = detection.bbox;
          // Calculate relative positions for the overlay
          const relativeX = (x / canvasRef.current?.width) * 100;
          const relativeY = (y / canvasRef.current?.height) * 100;
          const relativeWidth = (width / canvasRef.current?.width) * 100;
          const relativeHeight = (height / canvasRef.current?.height) * 100;
          
          return (
            <div 
              key={index}
              className="detection-box"
              style={{
                left: `${relativeX - relativeWidth/2}%`,
                top: `${relativeY - relativeHeight/2}%`,
                width: `${relativeWidth}%`,
                height: `${relativeHeight}%`
              }}
            >
              <div className="detection-label">
                {detection.class} ({Math.round(detection.confidence * 100)}%)
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="language-selector">
          <label htmlFor="language-select">Translate to: </label>
          <select 
            id="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isProcessing}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        
        <div className="camera-container">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="video-feed" 
            style={{ transform: "scaleX(-1)" }} 
          />
          
          {cameraActive && (
            <div className="frame-guide">
              <div className="frame-outline">
                <div className="corner top-left"></div>
                <div className="corner top-right"></div>
                <div className="corner bottom-left"></div>
                <div className="corner bottom-right"></div>
                <div className="guide-text">Position object here</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="controls">
          {!cameraActive ? (
            <button onClick={startCamera}>Start Camera</button>
          ) : (
            <button 
              onClick={captureImage} 
              disabled={countdown > 0 || isProcessing}
            >
              {countdown > 0 
                ? `Capturing in ${countdown}...` 
                : isProcessing
                  ? "Processing..."
                  : "Capture Image"}
            </button>
          )}
        </div>
        
        <canvas ref={canvasRef} style={{ display: "none" }} />
        
        {capturedImage && (
          <div className="result-container">
            <div className="detection-image-container">
              <img src={capturedImage} alt="Captured" className="captured-image" />
              {renderDetectionBoxes()}
            </div>
            
            {detections.length > 0 ? (
              <div className="detection-results">
                <h3>Detected Objects:</h3>
                <ul>
                  {detections.map((detection, index) => (
                    <li key={index}>
                      {detection.class} (Confidence: {(detection.confidence * 100).toFixed(1)}%)
                    </li>
                  ))}
                </ul>
              </div>
            ) : isProcessing ? (
              <p>Analyzing image...</p>
            ) : capturedImage ? (
              <p>No objects detected</p>
            ) : null}
            
            {translations.length > 0 && (
              <div className="translation-results">
                <h3>Adjectives and Translations:</h3>
                <table>
                  <thead>
                    <tr>
                      <th>English</th>
                      <th>{selectedLanguage}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {translations.map((item, index) => (
                      <tr key={index}>
                        <td>{item.english}</td>
                        <td>{item.translation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default Camera;