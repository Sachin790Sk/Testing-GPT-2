const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// API endpoint to handle queries
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Determine the best source for this query
    if (query.toLowerCase().includes('latest') || 
        query.toLowerCase().includes('news') || 
        query.toLowerCase().includes('current')) {
      // Use web search for current information
      const webResults = await searchWeb(query);
      res.json({
        content: webResults,
        source: 'Web'
      });
    } else {
      // Use AI models for other types of queries
      const aiResponse = await getAIResponse(query);
      res.json(aiResponse);
    }
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});

// Function to search the web
async function searchWeb(query) {
  try {
    // Replace with your preferred search API 
    // (Google Custom Search, Bing Search, SerpAPI, etc.)
    const response = await axios.get('https://api.searchengine.com/search', {
      params: {
        q: query,
        key: process.env.SEARCH_API_KEY
      }
    });
    
    // Process and format the search results
    return formatWebResults(response.data);
  } catch (error) {
    console.error('Search error:', error);
    return 'I encountered an error while searching the web.';
  }
}

// Function to get responses from AI models
async function getAIResponse(query) {
  // Randomly select an AI source
  const sources = ['ChatGPT', 'Gemini', 'Genspark'];
  const selectedSource = sources[Math.floor(Math.random() * sources.length)];
  
  try {
    let aiResponse;
    
    // Use different AI providers based on the selected source
    switch(selectedSource) {
      case 'ChatGPT':
        aiResponse = await getChatGPTResponse(query);
        break;
      case 'Gemini':
        aiResponse = await getGeminiResponse(query);
        break;
      case 'Genspark':
        aiResponse = await getGensparkResponse(query);
        break;
    }
    
    return {
      content: aiResponse,
      source: selectedSource
    };
  } catch (error) {
    console.error(`${selectedSource} error:`, error);
    return {
      content: `I encountered an error while connecting to ${selectedSource}.`,
      source: selectedSource
    };
  }
}

// AI provider-specific functions
async function getChatGPTResponse(query) {
  // OpenAI API integration
  const openai = require('openai');
  const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await client.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: query }],
  });
  
  return response.choices[0].message.content;
}

async function getGeminiResponse(query) {
  // Google Gemini API integration
  // Implement as needed based on their API
  return `Based on Gemini's knowledge: ${query}...`;
}

async function getGensparkResponse(query) {
  // Custom or alternative AI model integration
  return `Here's what Genspark knows about ${query}...`;
}

// Function to format web search results
function formatWebResults(data) {
  // Process and format search results from API
  const results = data.results || [];
  let formattedResponse = "Based on recent information from the web:\n\n";
  
  results.forEach((result, index) => {
    if (index < 3) { // Limit to top 3 results
      formattedResponse += `- ${result.title}: ${result.snippet}\n`;
      if (result.link) {
        formattedResponse += `[Read more](${result.link})\n\n`;
      }
    }
  });
  
  return formattedResponse;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
