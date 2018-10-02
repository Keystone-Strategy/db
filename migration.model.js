const mongoose = require('mongoose')

let MigrationSchema = new mongoose.Schema(
  { name: String },
  { timestamps: { createdAt: 'createdAt' } }
)

MigrationSchema.statics.findMostRecent = async function () {
  const migrations = await this.find()
    .sort({ createdAt: -1 })
    .limit(1)
    .exec()
  return migrations[0]
}

module.exports = mongoose.model('Migration', MigrationSchema)
