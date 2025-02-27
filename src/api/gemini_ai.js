const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  //model: "gemini-1.5-flash"
});
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 4096,
  responseMimeType: "text/plain",
};
const gemini_ai = {
  ask: async (local_history, newQuestion) => {
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: local_history || [],
      });

      return await chatSession.sendMessage(newQuestion || "");
    } catch (error) {
      console.error("Erro em gemini_ai.ask(): ", error);

      throw error;
    }
  },

  getStream: async (local_history, newQuestion) => {
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: local_history || [],
      });

      await chatSession.sendMessageStream(newQuestion);
    } catch (error) {
      console.error("Erro em gemini_ai.getStream(): ", error);

      throw error;
    }
  },
};

module.exports = gemini_ai;
