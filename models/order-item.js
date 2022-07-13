const { DataTypes } = require('sequelize')
const sequelize = require('../util/database')
const OrderItem = sequelize.define('orderItem', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  quantity: DataTypes.INTEGER

})

module.exports = OrderItem