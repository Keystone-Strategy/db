const mongoose = require('mongoose')

mongoose.Promise = Promise
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })

mongoose.connection.on('error', function (err) {
  console.error('MongoDB connection error: ' + err)
  process.exit(1)
})
