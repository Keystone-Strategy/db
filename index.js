'use strict'

const fs = require('fs')
const path = require("path")
const Migration = require('./migration.model')

const serverMigrationPath = () => process.env.SERVER_MIGRATION_PATH || path.resolve('./migrations')

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
