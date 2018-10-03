# migrate
NPM package for automated Mongoose migrations. 
Provide commands for the creation and execution of migrations scripts. 

## Configuration
Configurations are set through enviroment variables.

`MONGODB_URI`

Database connection where migrations will be executed and saved.

`SERVER_MIGRATION_PATH`

A folder path where migrations will be saved.If this variable is not specified it will create a `migrations` folder in the
root path of the project.

## commands

`yarn migrate create <<migration-name>>`

Create a new migration file in the folder specified by `SERVER_MIGRATION_PATH`. it requires a `<<migration-name>>`.

`yarn run`

Execute pending migrations (migrations that are not been run in the database). 

`yarn rerurn`

Execute the last migration that was run.
