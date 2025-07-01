require('dotenv').config();
const axios = require('axios');
const express = require('express');
const { sequelize, Chat, Message } = require('./models/chat');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // important pour AJAX
app.use(express.static('public'));
app.set('view engine', 'ejs');

sequelize.sync();

// Afficher la page principale avec la liste des chats + messages du chat courant
app.get('/', async (req, res) => {
  const chats = await Chat.findAll({ order: [['createdAt', 'DESC']] });
  const currentChat = chats[0] || null;
  let messages = [];
  if (currentChat) {
    messages = await Message.findAll({ where: { ChatId: currentChat.id }, order: [['createdAt', 'ASC']] });
  }
  res.render('index', {
    chats,
    currentChatId: currentChat ? currentChat.id : null,
    messages,
  });
});

// Créer un nouveau chat et rediriger vers '/'
app.get('/new', async (req, res) => {
  await Chat.create();
  res.redirect('/');
});

// API pour récupérer messages d’un chat (pour chargement AJAX)
app.get('/chat/:id', async (req, res) => {
  const messages = await Message.findAll({ where: { ChatId: req.params.id }, order: [['createdAt', 'ASC']] });
  res.json({ messages });
});

// Envoyer un message dans un chat + obtenir réponse IA
app.post('/chat/:id/message', async (req, res) => {
  const chatId = req.params.id;
  const question = req.body.question;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const history = await Message.findAll({ where: { ChatId: chatId }, order: [['createdAt', 'ASC']] });
  const context = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));
  context.push({ role: 'user', parts: [{ text: question }] });

  try {
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: context },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const aiReply = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '...';

    await Message.create({ role: 'user', content: question, ChatId: chatId });
    await Message.create({ role: 'ai', content: aiReply, ChatId: chatId });

    res.json({ reply: aiReply });
  } catch (err) {
    console.error(err);
    res.json({ reply: 'Erreur IA' });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
