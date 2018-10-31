const mongoose = require('mongoose');

module.exports = {
	connectToDB: () => {
		if (!process.env.MONGODB_URI) {
			throw new Error(
				'Error: no DB connection specified. Use MONGODB_URI env variable.'
			);
		}
		mongoose.connect(
			process.env.MONGODB_URI,
			{useNewUrlParser: true}
		);
		mongoose.connection.on('error', err => {
			throw new Error('MongoDB connection error: ' + err);
		});
	},

	disconnectFromDB: () => {
		mongoose.connection.close();
	}
};
