require('dotenv').config();
const axios = require('axios');
const express = require('express');
const { sequelize, User, Chat, Message, History } = require('./models/index');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Synchronisation Sequelize
sequelize.sync()
  .then(() => console.log('Base synchronisée'))
  .catch(err => console.error('Erreur de synchronisation :', err));

// Page login
app.get('/', (req, res) => {
  res.render('login');
});

function generateRandomId() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Connexion / Création d'utilisateur
app.post('/login', async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).send('Nom requis');

  let user = await User.findOne({ where: { name } });

  if (!user) {
    let id = generateRandomId();
    while (await User.findByPk(id)) {
      id = generateRandomId();
    }
    user = await User.create({ id, name });
    await Chat.create({ UserId: user.id });
  }

  res.redirect(`/chat/user/${user.id}`);
});

// ✅ Afficher page chat utilisateur
app.get('/chat/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).send('Utilisateur introuvable');

    const chats = await Chat.findAll({
      where: { UserId: userId },
      order: [['createdAt', 'DESC']],
    });

    let currentChat = null;
    if (req.query.chatId) {
      const chatId = parseInt(req.query.chatId, 10);
      currentChat = chats.find(c => c.id === chatId) || null;
    }
    if (!currentChat) {
      currentChat = chats[0] || null;
    }

    let messages = [];
    if (currentChat) {
      messages = await Message.findAll({
        where: { ChatId: currentChat.id },
        order: [['createdAt', 'ASC']],
      });
    }

    res.render('index', {
      chats,
      currentChatId: currentChat ? currentChat.id : null,
      messages,
      userId,
      userName: user.name
    });

  } catch (err) {
    console.error('Erreur dans /chat/user/:userId:', err);
    res.status(500).send('Erreur serveur interne');
  }
});

// Créer un nouveau chat
app.get('/new', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).send('ID utilisateur invalide');

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).send('Utilisateur non trouvé');

    await Chat.create({ UserId: userId, title: 'Nouvelle conversation' });
    res.redirect(`/chat/user/${userId}`);
  } catch (err) {
    console.error('Erreur création nouveau chat :', err);
    res.status(500).send('Erreur serveur interne');
  }
});

// Récupérer les messages d’un chat
app.get('/chat/:id', async (req, res) => {
  try {
    const chatId = parseInt(req.params.id, 10);
    if (isNaN(chatId)) return res.status(400).json({ error: 'ID chat invalide' });

    const messages = await Message.findAll({
      where: { ChatId: chatId },
      order: [['createdAt', 'ASC']],
    });
    res.json({ messages });
  } catch (err) {
    console.error('Erreur récupération messages :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Envoyer un message et recevoir la réponse IA
app.post('/chat/:id/message', async (req, res) => {
  try {
    const chatId = parseInt(req.params.id, 10);
    if (isNaN(chatId)) return res.status(400).json({ reply: 'ID chat invalide' });

    const question = req.body.question;
    if (!question) return res.status(400).json({ reply: 'Question requise' });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) return res.status(500).json({ reply: 'Clé API manquante' });

    const history = await Message.findAll({ where: { ChatId: chatId }, order: [['createdAt', 'ASC']] });
    const context = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    context.push({ role: 'user', parts: [{ text: question }] });

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: context },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const aiReplyRaw = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '...';

  

    // Format HTML avec <strong> et <em> à la place des ***
    const aiReply = `<br><br>${aiReplyRaw
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')}`;

    await Message.create({ role: 'user', content: question, ChatId: chatId });
    await Message.create({ role: 'ai', content: aiReply, ChatId: chatId });

    res.json({ reply: aiReply });

  } catch (err) {
    console.error('Erreur IA:', err);
    res.json({ reply: 'Une erreur est survenue 🤕' });
  }
});


// ✅ Récupérer tous les utilisateurs avec leurs chats et messages
app.get('/admin/users-chats', async (req, res) => {
  try {
    const usersWithChats = await User.findAll({
      include: {
        model: Chat,
        include: {
          model: Message,
          order: [['createdAt', 'ASC']],
        },
        order: [['createdAt', 'DESC']],
      },
      order: [['createdAt', 'ASC']],
    });

    res.json(usersWithChats);
  } catch (err) {
    console.error('Erreur récupération utilisateurs et chats :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.listen(port, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${port}`);
});
