const path = require('path');
const _ = require('lodash');

const Todo = require('./support/models/todo');
const {execSync, readJsonFile} = require('./support/utils');

beforeEach(async () => {
	await Todo.deleteMany({});
});

test('seeding the database', async () => {
	execSync('bin/db seed');

	const results = await Todo.find();
	expect(results).toHaveLength(1);
});

test('seeding the database with no MONGODB_URI', () => {
	delete process.env.MONGODB_URI;

	expect(() => {
		execSync('bin/db seed');
	}).toThrowError(
		'No `MONGODB_URI` environment variable found. Please specify the mongo connection string in the `MONGODB_URI` environment variable.'
	);
});

test('seeding the database with a missing seed path', () => {
	const packageJsonPath = path.resolve(__dirname, '../', 'package.json');
	readJsonFile(packageJsonPath).edit(updateSeedPath(null));

	expect(() => {
		execSync('bin/db seed');
	}).toThrowError(
		'No seed path specified. Please specify a path relative to your root directory that contains your seed file.'
	);
});

test('seeding the database with a wrong seed path', () => {
	const packageJsonPath = path.resolve(__dirname, '../', 'package.json');
	const nonExistentPath = 'foobar';
	readJsonFile(packageJsonPath).edit(updateSeedPath(nonExistentPath));

	expect(() => {
		execSync('bin/db seed');
	}).toThrowError(
		`No file found for path ${nonExistentPath}. Please specify a path relative to your root directory that contains your seed file.`
	);
});

test('seeding the database with a missing seed path', () => {
	const packageJsonPath = path.resolve(__dirname, '../', 'package.json');
	readJsonFile(packageJsonPath).edit(packageJson => ({
		...packageJson,
		db: null
	}));

	expect(() => {
		execSync('bin/db seed');
	}).toThrowError(
		'No configuration specified. Please specify add a `db` property to your package.json.'
	);
});

const updateSeedPath = _.curry((seedPath, packageJson) => ({
	...packageJson,
	db: {...packageJson.db, seedPath}
}));
