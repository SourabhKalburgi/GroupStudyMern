const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/authMiddleware');

router.post('/ask', auth, async (req, res) => {
  try {
    const { question } = req.body;
    console.log('Received question:', question);

    console.log('Sending request to Hugging Face API...');
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt2-large',
      { inputs: question },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Received response from Hugging Face API');

    console.log('API response:', response.data);

    const answer = response.data[0].generated_text;
    console.log('Generated answer:', answer);

    res.json({ answer });
  } catch (error) {
    console.error('Error asking AI:', error.response ? error.response.data : error.message);
    res.status(500).json({ 
      message: 'Error processing AI request', 
      error: error.response ? error.response.data : error.message 
    });
  }
});

module.exports = router;