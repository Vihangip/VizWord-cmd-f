const express = require("express");
const multer = require("multer");
const axios = require('axios');
const fs = require("fs");
const path = require("path");
const FormData = require('form-data');
const cors = require('cors'); // Add this
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Enable CORS for all routes
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY environment variable.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const MODEL_NAME = "gemini-2.0-pro-exp-02-05";

app.post("/gemini", upload.single("image"), async (req, res) => {
  try {
    console.log("sending to gemini");
    const { object, language } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Image is required." });
    }

    // Convert the image file to base64
    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString("base64");

    // Prepare request for Gemini API
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }, // Image part
            { text: `Give me the '${language}' translation for the word '${object}'. Additionally, give 3 adjectives about the '${object}' in this image. You can use adjectives 
            like colour, material, texture, size, etc. Also, provide the equivalent translations. 
            In your response, only give me an array of objects with the english words and translations as key value pairs 
            where keys are "english" and "translation"` }, // Prompt part
          ],
        },
      ],
    });

    const responseText = result.response.text().trim();
    const cleanedResponse = responseText.replace(/```json\n|\n```/g, "");
    const parsedResponse = JSON.parse(cleanedResponse);
    console.log("gemini response", parsedResponse);

    res.json({ response: parsedResponse });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process image.", details: error.message });
  }
});

app.post('/process-image', upload.single('image'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    console.log("received by backend");
    const language = req.body.language;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }
    if (!language) {
      return res.status(400).json({ error: 'Language parameter is required.' });
    }

    const uniqueFilename = `image_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
    tempFilePath = path.join(uploadsDir, uniqueFilename);
    
    fs.writeFileSync(tempFilePath, image.buffer);
    console.log(`Temporary file created at: ${tempFilePath}`);

    const flaskFormData = new FormData();
    flaskFormData.append('image', fs.createReadStream(tempFilePath));

    console.log("Sending request to Flask server...");
    const flaskResponse = await axios.post("http://127.0.0.1:3002/detect", flaskFormData, {
      headers: flaskFormData.getHeaders(),
    });
    console.log("Received response from Flask server");

    const detections = flaskResponse.data.detections;
    if (!detections || detections.length === 0) {
      return res.status(400).json({ error: 'No objects detected in the image.' });
    }

    // Step 2: Process detections and send the result to /gemini endpoint
    const detectedObjects = detections.map((detection) => detection.class);
    console.log(`Detected objects: ${detectedObjects.join(", ")}`);

    // Determine the object to send
    let object;
    if (detectedObjects.length === 2 && detectedObjects.includes("person")) {
    object = detectedObjects.find((obj) => obj !== "person"); // Get the non-person object
    } else {
    object = detectedObjects.join(", "); // If only one object, use it directly
    }

    console.log(`Selected object: ${object}`);


    // Create form data for the Gemini request
    const geminiFormData = new FormData();
    geminiFormData.append('image', fs.createReadStream(tempFilePath));
    geminiFormData.append('object', detectedObjects.join(', '));
    geminiFormData.append('language', language);

    console.log("Sending request to Gemini endpoint...");
    const geminiResponse = await axios.post('http://localhost:3001/gemini', geminiFormData, {
      headers: geminiFormData.getHeaders(),
    });

    const responseData = {
      object: object, // Selected object excluding "person" if necessary
      adjectives: geminiResponse.data.response // Extracted adjectives from Gemini response
    };
    
    console.log("Final response:", responseData); // Debugging log
    
    return res.json(responseData);
  } catch (error) {
    console.error('Error processing image:', error);
    return res.status(500).json({ error: 'Failed to process image.', details: error.message });
  } finally {
    // Clean up the temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`Temporary file removed: ${tempFilePath}`);
      } catch (err) {
        console.error(`Failed to remove temporary file: ${err.message}`);
      }
    }
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});