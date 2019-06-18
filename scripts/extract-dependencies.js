/**
 * copy all dependencies from all packages in the monorepo
 * to the top level package.json
 */

const fs = require('fs');
const cp = require('child_process');

const packages = fs
  .readdirSync(__dirname + '/../packages')
  .filter(pkgName => {
    const dirname = __dirname + '/../packages/' + pkgName;
    return fs.statSync(dirname).isDirectory();
  })
  .map(pkgName => {
    const dirname = __dirname + '/../packages/' + pkgName;
    const pkg = JSON.parse(fs.readFileSync(dirname + '/package.json', 'utf8'));
    return pkg;
  });

const names = new Set(packages.map(pkg => pkg.name));
const dependencies = new Set();
packages.forEach(pkg => {
  Object.keys(pkg.dependencies || {})
    .concat(Object.keys(pkg.devDependencies || {}))
    .forEach(dep => {
      if (!names.has(dep)) {
        dependencies.add(dep);
      }
    });
});

console.log('yarn add', ...dependencies);
const result = cp.spawnSync('yarn', ['add', ...dependencies], {
  stdio: 'inherit',
});
if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  process.exit(result.status);
}
