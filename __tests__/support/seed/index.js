const Todo = require("../models/todo");

module.exports = async () => {
  await Todo.create({ name: "Testing", completed: false });
};
