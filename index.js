'use strict'

const fs = require('fs')
const path = require("path")
const Migration = require('./migration.model')
const config = require(`${process.cwd()}/package.json`)['mongo-migrate'] || {}

const serverMigrationPath = () => path.resolve(config.migrationsPath || './migrations')

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
