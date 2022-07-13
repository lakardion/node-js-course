const { MongoClient } = require('mongodb')

/**
 * @type import('mongodb').Db
 */
let _db;
const mongoConnect = async () => {
  try {
    const client = await MongoClient.connect('mongodb+srv://root:mongodb@cluster0.5zaox.mongodb.net/shop?retryWrites=true&w=majority')
    _db = client.db()

  } catch (connectErr) {
    console.error({ connectErr })
    throw new Error('Error when connecting to dabatase')
  }
}

const getDb = () => {
  if (_db) return _db
  throw new Error('Db not found')
}
exports.mongoConnect = mongoConnect
exports.getDb = getDb


