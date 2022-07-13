const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('node-complete', 'root', 'mysql', { dialect: 'mysql', host: 'localhost' })

module.exports = sequelize