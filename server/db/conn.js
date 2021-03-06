const { MongoClient } = require("mongodb");
const Db = process.env.MONGODB_URI;
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var _db;

module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      _db = db.db("shopify");
      return callback(err);
      console.log("Successfully connected to MongoDB.");    });
  },

  getDb: function () {
    return _db;
  },
};
