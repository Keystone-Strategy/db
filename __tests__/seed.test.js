const jsonfile = require("jsonfile");
const path = require("path");

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

test("seeding the database with a missing seed path", async () => {
  const packageJsonPath = path.resolve(__dirname, "../", "package.json");
  const originalPackageJson = jsonfile.readFileSync(packageJsonPath);
  const packageJsonWithMissingSeedPath = {
    ...originalPackageJson,
    db: { ...originalPackageJson.db, seedPath: null }
  };
  jsonfile.writeFileSync(packageJsonPath, packageJsonWithMissingSeedPath, {
    spaces: 2
  });

  expect(() => {
    execSync("bin/db seed");
  }).toThrowError(
    "No seed path specified. Please specify a path relative to your root directory that contains your seed file."
  );

  jsonfile.writeFileSync(packageJsonPath, originalPackageJson, { spaces: 2 });
});
