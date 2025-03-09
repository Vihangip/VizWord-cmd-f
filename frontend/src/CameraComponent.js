import { useState, useRef } from "react";
import './App.css';

function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Error accessing webcam:", err));
  };

  const captureImage = () => {
    let timeLeft = 4;
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

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      setCapturedImage(canvasRef.current.toDataURL("image/png"));
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <video ref={videoRef} autoPlay playsInline className="video-feed" />
        <button onClick={startCamera}>Start Camera</button>
        <button onClick={captureImage}>Capture Image</button>
        {countdown > 0 && <p>Capturing in {countdown}...</p>}
        <canvas ref={canvasRef} style={{ display: "none" }} />
        {capturedImage && <img src={capturedImage} alt="Captured" className="captured-image" />}
      </header>
    </div>
  );
}

export default Camera;
