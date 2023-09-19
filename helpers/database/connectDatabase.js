const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      console.log("MongoDb Connection Successful");
    })
    .catch((err) => {
      console.error(err);
    });
};

module.exports = connectDatabase;
