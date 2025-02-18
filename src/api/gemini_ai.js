require("dotenv").config({ path: "../../.env" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});
const generationConfig = {
  temperature: 0.9,
  topP: 0.85,
  topK: 40,
  maxOutputTokens: 4096,
  responseMimeType: "text/plain",
};
const gemini_ai = {
  ask: async function (history, message) {
    const chatSession = model.startChat({
      generationConfig,
      history: history || [],
    });

    return await chatSession.sendMessage(message || "");
  },
};

module.exports = gemini_ai;
