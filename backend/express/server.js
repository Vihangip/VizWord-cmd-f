const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" }); // Store images temporarily

// 🖼️ Route: Receive Image from Frontend & Send to Flask Server
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const flaskServerUrl = "http://localhost:5001/detect"; // Adjust to Flask server URL

    // Send image to Flask
    const formData = new FormData();
    formData.append("image", req.file);

    const flaskResponse = await axios.post(flaskServerUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const detectedObject = flaskResponse.data.object; // Flask returns detected object

    // Get translation from Gemini API
    const geminiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        prompt: `Translate "${detectedObject}" into multiple languages.`,
      },
      {
        headers: { Authorization: `Bearer ${process.env.GEMINI_API_KEY}` },
      }
    );

    const translation = geminiResponse.data.translations; // Adjust based on API response

    // Send JSON response to frontend
    res.json({
      object: detectedObject,
      translation,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
