const Todo = require("./support/models/todo");
const { execSync } = require("./support/utils");

beforeEach(async () => {
  await Todo.deleteMany({});
});

test("seeding the database", async () => {
  execSync("bin/db seed");

  const results = await Todo.find();
  expect(results).toHaveLength(1);
});

test("seeding the database with no MONGODB_URI", () => {
  delete process.env.MONGODB_URI;

  expect(() => {
    execSync("bin/db seed");
  }).toThrowError(
    "No `MONGODB_URI` environment variable found. Please specify the mongo connection string in the `MONGODB_URI` environment variable."
  );
});
