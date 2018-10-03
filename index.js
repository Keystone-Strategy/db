'use strict'

const fs = require('fs')
const path = require("path")
const Migration = require('./migration.model')

const serverMigrationPath = () => path.resolve(process.env.SERVER_MIGRATION_PATH || './migrations')

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
