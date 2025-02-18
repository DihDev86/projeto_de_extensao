require("dotenv").config({ path: "../../.env" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  //model: "gemini-2.0-flash-lite-preview-02-05"
});
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 4096,
  responseMimeType: "text/plain",
};
const gemini_ai = {
  ask: async function (local_history, question) {
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: local_history || [],
      });

      return await chatSession.sendMessage(question || "");
    } catch (error) {
      console.error("Erro em gemini_ai.ask(): ", error);
      throw error;
    }
  },
};

module.exports = gemini_ai;
