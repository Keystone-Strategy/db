# migrate
NPM package for the creation and execution of MongoDB migrations. 
Provides commands for the creation and execution of MongoDB migration scripts.

## Configuration

### Environment variables.

`MONGODB_URI`

Database connection where migrations will be executed. you might opt to use a .env file to set this variable.

### Migrations folder.

```
// package.json
{
...
  mongo-migrate: { migrationsPath: './path/where/migration/will/save' }
...
}
```

A folder path where migrations will be saved. If this is not specified it will create a `migrations` folder in the
root path of the project.

## commands

`yarn migrate create <<migration-name>>`

Create a new migration file in the folder specified by `SERVER_MIGRATION_PATH`. it requires a `<<migration-name>>`.

`yarn run`

Execute pending migrations (migrations that are not been run in the database). 

`yarn rerurn`

Execute the last migration that was run.
