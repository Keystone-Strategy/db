const _ = require('lodash')
const fs = require('fs')
const mongoose = require('mongoose')
const childProcess = require('child_process')
const moment = require('moment')
const MongodbMemoryServer = require('mongodb-memory-server').default
const Todo = require('../mocks/todo.model')
const { Migration, serverMigrationPath } = require('..')

describe('bin/migrate', function () {
  let mongod
  let MONGODB_URI
  beforeAll(async () => {
    mongod = new MongodbMemoryServer()
    MONGODB_URI = await mongod.getConnectionString()
    console.log(MONGODB_URI)
    return mongoose.connect(MONGODB_URI,  { useNewUrlParser: true })
  })

  beforeEach(() => {
    process.env.MONGODB_URI = MONGODB_URI
    execSync(`mkdir -p ${serverMigrationPath()}`)
  })

  afterEach(async () => {
    deleteMigrationsDirectory()
    await Promise.all([Todo.deleteMany(), Migration.deleteMany()])
  })

  afterAll(() => {
    mongod.stop()
    delete process.env.MONGODB_URI
  })

  describe('create', function () {
    it('creates a file with the provided name and unix timestamp', function () {
      const migrationName = 'some-migration'

      executeCreateMigration(migrationName)
      const results = fs.readdirSync(serverMigrationPath())

      expect(results.length).toBe(1)
      expect(results[0]).toMatch(new RegExp(`\\d{13}\\-${migrationName}.js`))
    })

    it('returns an error if no name is specified', function () {
      expect(
        () => childProcess.execSync(`bin/migrate create`)
      ).toThrowError('Please specify a migration name.')
    })
  })

  describe('run', function () {
    it('displays an error when not DB connection is specified', () => {
      delete process.env.MONGODB_URI

      expect(
        () => executeRunMigrations()
      ).toThrowError('Error: not DB connection specified. Use MONGODB_URI env variable.')
    })

    it('displays an error when not able to connect to DB', () => {
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:49806/not-existing-db'

      expect(
        () => executeRunMigrations()
      ).toThrowError('MongoDB connection error')
    })

    it('runs migrations sequentially', async function () {
      await createTodo()
      const firstMigrationName = 'first migration'
      const secondMigrationName = ' second migration'
      createMigration({
        dependencies: [buildTodoRequire()],
        async up () {
          const todo = await Todo.findOne()
          await Todo.updateOne(
            { _id: todo._id },
            { $set: { name: 'first migration' } }
          )
        }
      })
      createMigration({
        dependencies: [buildTodoRequire()],
        async up () {
          const todo = await Todo.findOne()
          await Todo.updateOne(
            { _id: todo._id },
            { $set: { name: todo.name + ' second migration' } }
          )
        }
      })

      executeRunMigrations()

      await expect(Todo.findOne()).resolves.toHaveProperty('name', firstMigrationName + secondMigrationName)
    })

    it("doesn't run migrations more than once", async function () {
      const initialName = 'Some name'
      await createTodo(initialName)

      createMigration({
        dependencies: [buildTodoRequire()],
        async up () {
          const todo = await Todo.findOne()
          await Todo.updateOne(
            { _id: todo._id },
            { $set: { name: todo.name + ' migration' } }
          )
        }
      })

      executeRunMigrations()
      executeRunMigrations()

      await expect(Todo.findOne()).resolves.toHaveProperty('name', initialName + ' migration')
    })

    it("doesn't run when no pending migrations exist", function () {
      const result = execSync('bin/migrate run')

      expect(result).toContain('No pending migrations to run.')
      expect(result).not.toContain('Running migrations:')
    })

    it("doesn't run migrations that have errors", async function () {
      createMigration({
        async up () {
          throw new Error('Testing, 1, 2, 3')
        }
      })

      expect(() => execSync('bin/migrate run')).toThrowError()
      await expect(Migration.countDocuments()).resolves.toBe(0)
    })
  })

  describe('rerun', function () {
    it('reruns the last migration', async () => {
      const nameSetBySpec = 'Name set by spec'
      const todo = await createTodo()
      createMigration({
        dependencies: [buildTodoRequire()],
        async up () {
          const todo = await Todo.findOne()
          await Todo.updateOne(
            { _id: todo._id },
            { $set: { name: 'Name set by migration' } }
          )
        }
      })

      executeRunMigrations()

      await Todo.updateOne({ _id: todo._id }, { $set: { name: nameSetBySpec } })
      const todoAfterMigration = await Todo.findOne()
      expect(todoAfterMigration.name).toBe(nameSetBySpec)

      executeRerunMigrations()

      await expect(Todo.findOne()).resolves.toHaveProperty('name', 'Name set by migration')
    })

    it("displays an error when there aren't any migrations to rerun", async () => {
      await Migration.deleteMany()
      expect(
        () => execSync('bin/migrate rerun')
      ).toThrowError('Error: Cannot rerun migration. No migrations have been run.')
    })
  })
})

const createMigration = (args = {}) => {
  const { up, dependencies = [] } = args
  const migrationName = buildMigrationName()
  const template = fs.readFileSync('./mocks/test-template')
  const compile = _.template(template)
  fs.writeFileSync(migrationName, compile({ up, dependencies }))
}

const buildMigrationName = () => {
  const migrationName = _.uniqueId('some-migration-')
  const unixTimeStamp = moment().valueOf()
  return `${serverMigrationPath()}/${unixTimeStamp}-${migrationName}.js`
}

const deleteMigrationsDirectory = () => {
  return execSync(`rm -rf ${serverMigrationPath()}`)
}

const buildTodoRequire = () => {
  return 'const Todo = require("../mocks/todo.model")'
}

const executeCreateMigration = migrationName => execSync(`bin/migrate create ${migrationName}`)

const executeRunMigrations = () => execSync('bin/migrate run')

const executeRerunMigrations = () => execSync('bin/migrate rerun')

const createTodo = (name = 'initialName') => {
  const todo = new Todo({ name })
  return todo.save()
}

const execSync = command => {
  const options = { env: process.env, encoding: 'utf-8' }
  return childProcess.execSync(command, options)
}
