const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const moment = require('moment');

const Todo = require('./support/models/todo');
const {Migration, serverMigrationPath} = require('..');
const {execSync} = require('./support/utils');

describe('bin/db', () => {
	describe('create', () => {
		it('creates a file with the provided name and unix timestamp', () => {
			const migrationName = 'some-migration';

			executeCreateMigration(migrationName);
			const results = fs.readdirSync(serverMigrationPath());

			expect(results.length).toBe(1);
			expect(results[0]).toMatch(new RegExp(`\\d{13}\\-${migrationName}.js`));
		});

		it('returns an error if no name is specified', () => {
			expect(() => execSync('bin/db create-migration')).toThrowError(
				'Please specify a migration name.'
			);
		});
	});

	describe('run', () => {
		it('displays an error when not DB connection is specified', () => {
			delete process.env.MONGODB_URI;

			expect(() => executeRunMigrations()).toThrowError(
				'Error: no DB connection specified. Use MONGODB_URI env variable.'
			);
		});

		it('displays an error when not able to connect to DB', () => {
			process.env.MONGODB_URI = 'mongodb://127.0.0.1:49806/not-existing-db';

			expect(() => executeRunMigrations()).toThrowError(
				'MongoDB connection error'
			);
		});

		it('runs migrations sequentially', async () => {
			await createTodo();
			const firstMigrationName = 'first migration';
			const secondMigrationName = ' second migration';
			createMigration({
				dependencies: [buildTodoRequire()],
				async up() {
					const todo = await Todo.findOne();
					await Todo.updateOne(
						{_id: todo._id},
						{$set: {name: 'first migration'}}
					);
				}
			});
			createMigration({
				dependencies: [buildTodoRequire()],
				async up() {
					const todo = await Todo.findOne();
					await Todo.updateOne(
						{_id: todo._id},
						{$set: {name: todo.name + ' second migration'}}
					);
				}
			});

			executeRunMigrations();

			await expect(Todo.findOne()).resolves.toHaveProperty(
				'name',
				firstMigrationName + secondMigrationName
			);
		});

		it("doesn't run migrations more than once", async () => {
			const initialName = 'Some name';
			await createTodo(initialName);

			createMigration({
				dependencies: [buildTodoRequire()],
				async up() {
					const todo = await Todo.findOne();
					await Todo.updateOne(
						{_id: todo._id},
						{$set: {name: todo.name + ' migration'}}
					);
				}
			});

			executeRunMigrations();
			executeRunMigrations();

			await expect(Todo.findOne()).resolves.toHaveProperty(
				'name',
				initialName + ' migration'
			);
		});

		it("doesn't run when no pending migrations exist", () => {
			const result = execSync('bin/db run-migrations');

			expect(result).toContain('No pending migrations to run.');
			expect(result).not.toContain('Running migrations:');
		});

		it("doesn't run migrations that have errors", async () => {
			createMigration({
				up() {
					throw new Error('Testing, 1, 2, 3');
				}
			});

			expect(() => execSync('bin/db run-migrations')).toThrowError();
			await expect(Migration.countDocuments()).resolves.toBe(0);
		});
	});

	describe('rerun', () => {
		it('reruns the last migration', async () => {
			const nameSetBySpec = 'Name set by spec';
			const todo = await createTodo();
			createMigration({
				dependencies: [buildTodoRequire()],
				async up() {
					const todo = await Todo.findOne();
					await Todo.updateOne(
						{_id: todo._id},
						{$set: {name: 'Name set by migration'}}
					);
				}
			});

			executeRunMigrations();

			await Todo.updateOne({_id: todo._id}, {$set: {name: nameSetBySpec}});
			const todoAfterMigration = await Todo.findOne();
			expect(todoAfterMigration.name).toBe(nameSetBySpec);

			executeRerunMigrations();

			await expect(Todo.findOne()).resolves.toHaveProperty(
				'name',
				'Name set by migration'
			);
		});

		it("displays an error when there aren't any migrations to rerun", async () => {
			await Migration.deleteMany();
			expect(() => executeRerunMigrations()).toThrowError(
				'Error: Cannot rerun migration. No migrations have been run.'
			);
		});
	});
});

const createMigration = (args = {}) => {
	const {up, dependencies = []} = args;
	const migrationName = buildMigrationName();
	const template = fs.readFileSync(
		path.join(__dirname, 'support', 'test-template')
	);
	const compile = _.template(template);
	fs.writeFileSync(migrationName, compile({up, dependencies}));
};

const buildMigrationName = () => {
	const migrationName = _.uniqueId('some-migration-');
	const unixTimeStamp = moment().valueOf();
	return `${serverMigrationPath()}/${unixTimeStamp}-${migrationName}.js`;
};

const buildTodoRequire = () => {
	return `const Todo = require("${path.join(
		__dirname,
		'support',
		'models',
		'todo'
	)}")`;
};

const executeCreateMigration = migrationName =>
	execSync(`bin/db create-migration ${migrationName}`);

const executeRunMigrations = () => execSync('bin/db run-migrations');

const executeRerunMigrations = () => execSync('bin/db rerun-migrations');

const createTodo = (name = 'initialName') => {
	const todo = new Todo({name});
	return todo.save();
};
