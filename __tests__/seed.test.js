const Todo = require("./support/models/todo");
const { execSync } = require('./support/utils')

beforeEach(async () => {
  await Todo.deleteMany({});
});

test("seeding a database", async () => {
  execSync('bin/db seed')

  const results = await Todo.find();
  expect(results).toHaveLength(1);
});
