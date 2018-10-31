const MongodbMemoryServer = require("mongodb-memory-server").default;
const mongoose = require("mongoose");

const { execSync } = require("./utils");
const { serverMigrationPath } = require("../..");
const Todo = require("./models/todo");
const Migration = require("../../migration.model");

let mongod;
let MONGODB_URI;

beforeAll(async () => {
  mongod = new MongodbMemoryServer();
  MONGODB_URI = await mongod.getConnectionString();
  return mongoose.connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  );
});

beforeEach(async () => {
  deleteMigrationsDirectory();
  await Promise.all([Todo.deleteMany(), Migration.deleteMany()]);
  process.env.MONGODB_URI = MONGODB_URI;
  execSync(`mkdir -p ${serverMigrationPath()}`);
});

afterAll(() => {
  mongod.stop();
});

const deleteMigrationsDirectory = () => {
  return execSync(`rm -rf ${serverMigrationPath()}`);
};
