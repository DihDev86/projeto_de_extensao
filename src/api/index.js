const express = require("express");
const cors = require("cors");
const gemini_ai = require("./gemini_ai");
const app = express();

app.use(express.json());
app.use(cors());

app.post("/api/chat", async (req, res) => {
  try {
    const { question, history } = req.body;

    if (!question) {
      return res.status(400).json({ error: "A pergunta  é obrigatória." });
    }

    console.log("history: ", history);

    const { response } = await gemini_ai.ask(history, question);

    if (response.candidates.length < 1) {
      const errorData = await response.json();
      return res.status(500).json(errorData);
    }

    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ error: "Erro ao conectar com Google Gemini AI" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
