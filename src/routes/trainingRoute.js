`use-strict`;
const express = require('express');
const router = express.Router();
require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define a post "customer-support" route
router.post('/customer-support', async (req, res) => {
    const { prompt } = req.body;
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
    model: process.env.MODEL_NAME,
    prompt: prompt,
    max_tokens: 7,
    temperature: 0,
    });
res.send({
    answer: response.data.choices[0].text || ""
});
});

module.exports = router;
