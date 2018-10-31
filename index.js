'use strict';

const fs = require('fs');
const path = require('path');
const Migration = require('./migration.model');

const config = require(`${process.cwd()}/package.json`).db || {};

const serverMigrationPath = () =>
	path.resolve(config.migrationsPath || './migrations');

const createMigrationsDirectory = () => {
	if (!fs.existsSync(serverMigrationPath())) {
		fs.mkdirSync(serverMigrationPath());
	}
};

const seed = args => {
	const {path, connection} = args;
	return new Promise((resolve, reject) => {
		const _seed = require(path);
		connection
			.dropDatabase()
			.then(() => {
				resolve(_seed());
			})
			.catch(reject);
	});
};

module.exports = {
	serverMigrationPath,
	createMigrationsDirectory,
	Migration,
	seed
};
