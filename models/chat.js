const { Sequelize, DataTypes } = require('sequelize');

// Utilise les variables d'environnement
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
});

const Chat = sequelize.define('Chat', {
  title: {
    type: DataTypes.STRING,
    defaultValue: 'Nouvelle conversation',
  },
}, {
  timestamps: true,  // <- doit être là ou laissé par défaut
});

const Message = sequelize.define('Message', {
  role: DataTypes.STRING, // 'user' ou 'ai'
  content: DataTypes.TEXT,
}, { timestamps: true });

Chat.hasMany(Message, { onDelete: 'CASCADE' });
Message.belongsTo(Chat);

module.exports = { sequelize, Chat, Message };
