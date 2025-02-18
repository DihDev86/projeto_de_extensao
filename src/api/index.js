const express = require("express");
const cors = require("cors");
const gemini_ai = require("./gemini_ai");
let CURRENT_HISTORY = [];
const app = express();

app.use(express.json());
app.use(cors());

app.post("/api/chat", async (req, res) => {
  try {
    const { message: question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "A pergunta  é obrigatória." });
    }

    const response = gemini_ai.ask(CURRENT_HISTORY, question);

    if (response < 1) {
      const errorData = await response.json();
      return res.status(500).json(errorData);
    }

    const data = await CURRENT_HISTORY.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao conectar com Google Gemini AI" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
