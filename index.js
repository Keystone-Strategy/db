'use strict'

const fs = require('fs')
const Migration = require('./migration.model')

// determinate default value
const serverMigrationPath = () => process.env.SERVER_MIGRATION_PATH || `${__dirname}/migrations`

const createMigrationsDirectory = () => {
  if (!fs.existsSync(serverMigrationPath())) {
    fs.mkdirSync(serverMigrationPath())
  }
}

module.exports = {
  serverMigrationPath,
  createMigrationsDirectory,
  Migration
}
