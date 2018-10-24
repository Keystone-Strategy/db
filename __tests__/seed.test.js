const mongoose = require("mongoose");
const path = require("path");

const Todo = require("./support/models/todo");
const { seed } = require("../index");

beforeEach(async () => {
  await Todo.deleteMany({});
});

test("seeding a database", async () => {
  await seed({
    path: path.join(__dirname, "support", "seed"),
    connection: mongoose.connection
  });

  const results = await Todo.find();
  expect(results).toHaveLength(1);
});
