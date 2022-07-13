const sequelize = require('../util/database')
const { DataTypes } = require('sequelize')

const Order = sequelize.define('order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
})

module.exports = Order