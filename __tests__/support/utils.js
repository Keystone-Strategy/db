const childProcess = require('child_process')
const jsonfile = require("jsonfile");
const _ = require("lodash");

let editedFiles = [];

afterEach(() => {
  _.each(editedFiles, editedFile => {
    jsonfile.writeFileSync(editedFile.path, editedFile.original, { spaces: 2 });
  });
  editedFiles = [];
});

const execSync = command => {
  const options = { env: process.env, encoding: "utf-8" };
  return childProcess.execSync(command, options);
};

const readJsonFile = path => {
  return {
    edit(editor) {
      const original = jsonfile.readFileSync(path);
      const edit = editor(original);
      jsonfile.writeFileSync(path, edit, { spaces: 2 });
      editedFiles.push({ path, original });
    }
  };
};

module.exports = {
    execSync,
    readJsonFile
}