const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(express.json());

// Set up Multer to handle file uploads
const upload = multer({ dest: "uploads/" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY environment variable.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const MODEL_NAME = "gemini-1.5-pro"; // Make sure the model supports images

app.post("/gemini-image", upload.single("image"), async (req, res) => {
  try {
    const { object, language } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Image is required." });
    }

    // Convert the image file to base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");

    // Prepare request for Gemini API
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }, // Image part
            { text: `Give 3 adjectives about the '${object}' in this image. You can use adjectives 
            like colour, material, texture, size, etc. Also, provide the equivalent '${language}' translations. 
            In your response, only give me an array of objects with the english words and translations as key value pairs 
            where keys are "english" and "translation"` }, // Prompt part
          ],
        },
      ],
    });

    // Clean and parse the response text
    const responseText = result.response.text().trim();
    const cleanedResponse = responseText.replace(/```json\n|\n```/g, ""); // Remove code block formatting
    const parsedResponse = JSON.parse(cleanedResponse); // Parse the cleaned JSON

    // Send formatted response
    res.json({ response: parsedResponse });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process image.", details: error.message });
  }
});

app.post('/process-image', async (req, res) => {
  try {
    const image = req.body;

    // Step 1: Send image to Flask /detect endpoint
    const flaskResponse = await axios.post('http://localhost:3002/detect', image, {
      headers: { 'Content-Type': 'application/octet-stream' },
    });

    const detections = flaskResponse.data.detections;
    if (!detections || detections.length === 0) {
      return res.status(400).json({ error: 'No objects detected in the image.' });
    }

    // Step 2: Process detections and send the result to /gemini endpoint
    const detectedObjects = detections.map((detection) => detection.class).join(', ');
    const language = 'en'; // Or pass a language parameter as needed

    const geminiResponse = await axios.post('http://localhost:3000/gemini', {
      object: detectedObjects,
      language: language,
    });

    // Step 3: Send the final response back to the client
    return res.json(geminiResponse.data);
  } catch (error) {
    console.error('Error processing image:', error);
    return res.status(500).json({ error: 'Failed to process image.', details: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
