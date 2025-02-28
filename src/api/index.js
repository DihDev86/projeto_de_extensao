require("dotenv").config({ path: process.env.DOTENV_CONFIG_PATH });
const express = require("express");
const cors = require("cors");
const gemini_ai = require("./gemini_ai");
const app = express();
const marked = require("marked");

app.use(express.json());
app.use(cors());

app.post("/ask", async (req, res) => {
  try {
    const { question, history } = req.body;
    //console.log("Pergunta: ", question);
    //console.log("Histórico: ", history);  

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    if (!question) {
      return res.status(400).json({ error: "A pergunta  é obrigatória." });
    }
    
    const { response } = await gemini_ai.ask(history, question);

    if (response.candidates.length < 1) {
      const errorData = await response.json();
      return res.status(500).json(errorData);
    }

    for (let i = 0; i < history.length; i++) {
      const parts = history[i].parts;

      for (let j = 0; j < parts.length; j++) {
        const text = parts[j].text;
        parts[j].text = marked.parse(text);
      }
    }

    res.status(201).json(history);
  } catch (error) {
    res.status(error.status)
      .json({ error, erroMsg: "Erro ao conectar com Google Gemini AI" });
  }
});

app.post("/stream", async (req, res) => {
  try {
    const { question, history } = req.body;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    if (!question) {
      return res.status(400).json({ error: "A pergunta  é obrigatória." });
    }

    const result = await gemini_ai.getStream(history, question);

    for await (const chunk of result.stream) {
      if (chunk.candidates.length < 1) {
        const errorData = await chunk.json();
        return res.status(500).json(errorData);
      }

      res.write(marked.parse(chunk.text()));
      //res.write(chunk.text());
    }

    res.end();
  } catch (error) {
    res
      .status(error.status)
      .json({ error, erroMsg: "Erro ao conectar com Google Gemini AI" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
