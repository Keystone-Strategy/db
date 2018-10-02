const fs = require('fs')
const childProcess = require('child_process')
const _ = require('lodash')
const moment = require('moment')
const Todo = require('../mocks/todo.model')
const { Migration, serverMigrationPath } = require('..')

const execSync = command => {
  const options = { env: process.env, encoding: 'utf-8' }
  return childProcess.execSync(command, options)
}

describe('bin/migrate', function () {

  beforeEach(() => {
    process.env.SERVER_MIGRATION_PATH = `${__dirname}/test-migrations`
    deleteMigrationsDirectory()
    execSync(`mkdir -p ${serverMigrationPath()}`)
  })

  afterEach(async () => {
    deleteMigrationsDirectory()
    await Todo.deleteMany()
    delete process.env.SERVER_MIGRATION_PATH
  })

  describe('create', function () {
    it('creates a file with the provided name and unix timestamp', function () {
      const migrationName = 'some-migration'

      runCreateMigration(migrationName)
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

      runMigrations()

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

      runMigrations()
      runMigrations()

      await expect(Todo.findOne()).resolves.toHaveProperty('name', initialName + ' migration')
    })

    it("doesn't run when no pending migrations exist", function () {
      const result = execSync('bin/migrate run')

      expect(result).toContain('No pending migrations to run.')
      expect(result).not.toContain('Running migrations:')
    })

    it("doesn't run migrations that have errors", async function () {
      // handle this clean up on an before each hook
      await Migration.deleteMany()
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

      runMigrations()

      await Todo.updateOne({ _id: todo._id }, { $set: { name: nameSetBySpec } })
      const todoAfterMigration = await Todo.findOne()
      expect(todoAfterMigration.name).toBe(nameSetBySpec)

      rerunMigrations()

      await expect(Todo.findOne()).resolves.toHaveProperty('name', 'Name set by migration')
    })

    it("displays an error when there aren't any migrations to rerun", async () => {
      await Migration.deleteMany()
      expect(
        () => execSync('bin/migrate rerun')
      ).toThrowError('Error: Cannot rerun migration. No migrations have been run.')
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
    return 'const Todo = require("../../mocks/todo.model")'
  }

  const runCreateMigration = migrationName => execSync(`bin/migrate create ${migrationName}`)

  const runMigrations = () => execSync('bin/migrate run')

  const rerunMigrations = () => execSync('bin/migrate rerun')

  const createTodo = (name = 'initialName') => {
    const todo = new Todo({ name })
    return todo.save()
  }
})
