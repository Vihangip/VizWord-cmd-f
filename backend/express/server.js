const express = require('express');
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY environment variable.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const MODEL_NAME = "gemini-2.0-pro-exp-02-05"; 

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

app.post('/gemini', async (req, res) => {
  try {
    const { object, language } = req.body;

    if (!object && !language) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const chatSession = model.startChat({
      generationConfig,
      history: [], 
    });

    const result = await chatSession.sendMessage("give me the answer only. what is " + object + " in " + language + "?");
    let response = result.response.text();
    response = response.trim();

    res.json({ result: response });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Failed to generate content.", details: error.message });
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