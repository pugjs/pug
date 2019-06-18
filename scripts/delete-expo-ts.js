const {unlinkSync} = require('fs');
const {lsrSync} = require('lsr');

lsrSync(__dirname + '/../node_modules', {
  filterPath(path) {
    return path.indexOf('./expo') === 0;
  },
}).forEach(entry => {
  if (/\.d\.ts$/.test(entry.path)) {
    unlinkSync(entry.fullPath);
  }
});
