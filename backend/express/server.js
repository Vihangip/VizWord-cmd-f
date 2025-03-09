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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});