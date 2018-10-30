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

`yarn create-migration <<migration-name>>`

Create a new migration file in the folder specified by `SERVER_MIGRATION_PATH`. it requires a `<<migration-name>>`.

`yarn run-migrations`

Execute pending migrations (migrations that are not been run in the database). 

`yarn rerurn-migrations`

Execute the last migration that was run.

`yarn seed`

Seed the database. Looks for the path to the seed file in the package.json at `db.seedPath`.