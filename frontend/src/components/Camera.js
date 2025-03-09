import { useState, useRef, useEffect } from "react";
import CameraIcon from '../images/camera_icon.png';
import '../App.css';

function Camera({ selectedLanguage, onResultsUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const photoButton = {
    backgroundColor: "var(--purple)",
    borderRadius: "var(--border)",
    width: '170px',
    height: '40px',
    alignItems: 'center'
  }

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
    onResultsUpdate(null);
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
      const videoWidth = videoRef.current.videoWidth || 640;
      const videoHeight = videoRef.current.videoHeight || 480;
  
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
      
      // Convert base64 to blob properly
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64Data = imageDataUrl.split(',')[1];
      
      // Decode base64 string to binary
      const binaryString = atob(base64Data);
      
      // Create an array buffer to hold the binary data
      const bytes = new Uint8Array(binaryString.length);
      
      // Convert binary string to byte array
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create a blob with the correct MIME type
      const blob = new Blob([bytes], { type: 'image/png' });
      
      // Verify the blob has content
      console.log(`Blob size: ${blob.size} bytes`);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'captured-image.png');
      formData.append('language', selectedLanguage);
      
      // Send to Express server
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
      
      // Pass the entire response data to the parent component
      if (data) {
        // Check if the response is in the expected format
        if (data.response) {
          onResultsUpdate(data.response);
        } else {
          // If data doesn't have a response property, pass the whole data object
          onResultsUpdate(data);
        }
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

  return (
    <div className="App" style={{minWidth: '100%', backgroundColor: 'var(--white)'}}>
        <div className="camera-container" style={{width: '100%', minHeight: '375px', marginBottom: '10px', backgroundColor: 'var(--black)', borderRadius: 'var(--border)'}}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="video-feed" 
            style={{ 
              transform: "scaleX(-1)",
              backgroundColor: 'var(--black)',
              borderRadius: 'var(--border)' }
            } 
            width="100%"
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
            <button onClick={startCamera} style={photoButton}>
              <img src={CameraIcon} alt="camera" width={20} height={20} style={{ marginRight: '10px' }}/>
              Start Camera
            </button>
          ) : (
            <button 
              onClick={captureImage} 
              disabled={countdown > 0 || isProcessing}
              style={photoButton}
            >
              {countdown > 0 
                ? `Capturing in ${countdown}...` 
                : isProcessing
                  ? "Processing..."
                  : "Take a Photo"}
            </button>
          )}
        </div>
        
        <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default Camera;