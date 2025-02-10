require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { log } = require('console');

const app = express();
app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        log('message: ', message)
        
        if (!message) {
            return res.status(400).json({ error: 'Mensagem obrigatória!' });
        }
        
        const response = await fetch('https://free.churchless.tech/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
            })
        });
        log('response: ', response)

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        res.json(data.choices[0].message);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao conectar com OpenAI' });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
