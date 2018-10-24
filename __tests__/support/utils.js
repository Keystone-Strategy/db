const childProcess = require('child_process')

const execSync = command => {
  const options = { env: process.env, encoding: "utf-8" };
  return childProcess.execSync(command, options);
};

module.exports = {
    execSync
}