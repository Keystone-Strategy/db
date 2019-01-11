# db
NPM package to perform common DB operations via Mongoose. Operations include:
- Creating and running migrations.
- Seeding a database.

## Configuration

### Environment variables.

`MONGODB_URI`

Database connection where migrations will be executed. you might opt to use a .env file to set this variable.

### Migrations folder.

```
// package.json
{
...
  db: { migrationsPath: './path/where/migration/will/save' }
...
}
```

A folder path where migrations will be saved. If this is not specified it will create a `migrations` folder in the
root path of the project.

## commands

`yarn db create-migration <<migration-name>>`

Create a new migration file in the folder specified by `SERVER_MIGRATION_PATH`. It requires a `<migration-name>`. This command creates a file with a template in that can be filled in with the logic of your migration. After you've tested your migration locally (using the commands below), open up a PR for your changes, and the build will automatically run the migration in the `heroku:postbuild` task once the PR is merged to master and production.

`yarn db run-migrations`

Execute pending migrations (migrations that are not been run in the database). A `migrations` collection exists in the database to keep track of which migrations have been run. It stores the file name of the migration and uses that to filter out migrations that have been previously run. 

`yarn db rerurn-migrations`

Execute the last migration that was run.

`yarn db seed`

Seed the database. Looks for the path to the seed file in the package.json at `db.seedPath`.
