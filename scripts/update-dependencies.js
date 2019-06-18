/**
 * Update all dependency versions to match top level package.json
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

const dependencies = require('../package.json').dependencies;
const builtInPackages = new Map(packages.map(pkg => [pkg.name, pkg.version]));
function copyDependenciesTo(deps) {
  return Object.keys(deps).some(dep => {
    const version = builtInPackages.get(dep) || dependencies[dep];
    if (!version) {
      throw new Error('Could not find ' + dep);
    }
    if (deps[dep] !== version) {
      deps[dep] = version;
      return true;
    }
    return false;
  });
}
packages.forEach(pkg => {
  if (
    copyDependenciesTo(pkg.dependencies || {}) ||
    copyDependenciesTo(pkg.devDependencies || {})
  ) {
    fs.writeFileSync(
      __dirname + '/../packages/' + pkg.name + '/package.json',
      JSON.stringify(pkg, null, '  ') + '\n',
    );
  }
});
