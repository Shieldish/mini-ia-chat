const { Sequelize, DataTypes } = require('sequelize');

// Connexion à PostgreSQL via DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
});

// === Modèle Utilisateur ===
const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, { timestamps: true, freezeTableName: true });

// === Modèle Chat ===
const Chat = sequelize.define('Chat', {
  title: {
    type: DataTypes.STRING,
    defaultValue: 'Nouvelle conversation',
  },
  UserId: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: true, freezeTableName: true });

// === Modèle Message ===
const Message = sequelize.define('Message', {
  role: {
    type: DataTypes.STRING, // 'user' ou 'ai'
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ChatId: {
    type: DataTypes.INTEGER, // assuming Chat id remains integer auto-increment
    allowNull: false
  }
}, { timestamps: true, freezeTableName: true });

// === Modèle History ===
const History = sequelize.define('History', {
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  UserId: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: true, freezeTableName: true });

// === Associations ===
User.hasMany(Chat, { foreignKey: 'UserId', onDelete: 'CASCADE' });
Chat.belongsTo(User, { foreignKey: 'UserId' });

Chat.hasMany(Message, { foreignKey: 'ChatId', onDelete: 'CASCADE' });
Message.belongsTo(Chat, { foreignKey: 'ChatId' });

User.hasMany(History, { foreignKey: 'UserId', onDelete: 'CASCADE' });
History.belongsTo(User, { foreignKey: 'UserId' });

module.exports = {
  sequelize,
  User,
  Chat,
  Message,
  History
};
