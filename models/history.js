const { Sequelize, DataTypes } = require('sequelize');

// SQLite local
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db.sqlite'  // fichier créé localement
});

const History = sequelize.define('History', {
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
}, {
  tableName: 'histories',
  timestamps: true, // createdAt / updatedAt
});

module.exports = { sequelize, History };
