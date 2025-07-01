require('dotenv').config();
const axios = require('axios');
const express = require('express');
const { sequelize, History } = require('./models/history');

// Synchroniser la base


const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

sequelize.sync();
// Routes
app.get('/', async (req, res) => {
  const history = await History.findAll({
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  res.render('index', {
    response: null,
    history, // ✅ maintenant défini même dans le GET
  });
});


app.post('/ask', async (req, res) => {
  const question = req.body.question;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  try {
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ role: 'user', parts: [{ text: question }] }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const response =
      geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Pas de réponse obtenue.";

    // ✅ Enregistrer dans la base de données
    await History.create({ question, response });

    // ✅ Récupérer l'historique
    const history = await History.findAll({ order: [['createdAt', 'DESC']], limit: 10 });

    res.render('index', { response, history });
  } catch (error) {
    console.error('Erreur avec Gemini API :', error.response?.data || error.message);
    res.render('index', { response: "Une erreur est survenue avec Gemini AI.", history: [] });
  }
});


app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
