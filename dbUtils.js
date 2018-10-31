const mongoose = require("mongoose");
const chalk = require("chalk");

module.exports = {
  connectToDB: () => {
    if (!process.env.MONGODB_URI) {
      console.error(
        chalk.red(
          "Error: not DB connection specified. Use MONGODB_URI env variable."
        )
      );
      process.exit(1);
    }
    mongoose.connect(
      process.env.MONGODB_URI,
      { useNewUrlParser: true }
    );
    mongoose.connection.on("error", function(err) {
      console.error("MongoDB connection error: " + err);
      process.exit(1);
    });
  },

  disconnectFromDB: () => {
    mongoose.connection.close();
  }
};
