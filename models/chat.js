const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db.sqlite'
});

const Chat = sequelize.define('Chat', {
  title: {
    type: DataTypes.STRING,
    defaultValue: 'Nouvelle conversation',
  },
}, { timestamps: true });

const Message = sequelize.define('Message', {
  role: DataTypes.STRING, // 'user' ou 'ai'
  content: DataTypes.TEXT,
}, { timestamps: true });

Chat.hasMany(Message, { onDelete: 'CASCADE' });
Message.belongsTo(Chat);

module.exports = { sequelize, Chat, Message };
