const {
  readdirSync,
  writeFileSync,
  statSync,
  readFileSync,
  existsSync,
} = require('fs');

const LICENSE = `Copyright (c) ${new Date().getFullYear()} Forbes Lindesay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.`;

const packageNames = [];
const typeScriptPackages = [];
const packageDirectories = readdirSync(__dirname + '/../packages')
  .filter(directory =>
    statSync(__dirname + '/../packages/' + directory).isDirectory()
  )
  .sort();
packageDirectories.forEach(directory => {
  if (!existsSync(__dirname + '/../packages/' + directory + '/LICENSE')) {
    writeFileSync(
      __dirname + '/../packages/' + directory + '/LICENSE',
      LICENSE
    );
  }
  let pkg = {};
  try {
    pkg = JSON.parse(
      readFileSync(
        __dirname + '/../packages/' + directory + '/package.json',
        'utf8'
      )
    );
  } catch (ex) {
    if (ex.code !== 'ENOENT') {
      throw ex;
    }
  }
  const before = JSON.stringify(pkg);
  if (!pkg.name) {
    pkg.name = directory;
  }
  packageNames.push(pkg.name);
  const after = JSON.stringify(pkg);
  if (before !== after) {
    writeFileSync(
      __dirname + '/../packages/' + directory + '/package.json',
      JSON.stringify(pkg, null, '  ') + '\n'
    );
  }
  if (existsSync(__dirname + '/../packages/' + directory + '/tsconfig.json')) {
    typeScriptPackages.push(directory);
    const deps = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ]
      .filter(dep =>
        existsSync(__dirname + '/../packages/' + dep + '/tsconfig.json')
      )
      .map(
        dep =>
          `\n    {"path": ${JSON.stringify(
            `../${dep.substr(`@databases/`.length)}`
          )}},`
      )
      .join(``);
    writeFileSync(
      __dirname + '/../packages/' + directory + '/tsconfig.json',
      `{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "lib",
    "tsBuildInfoFile": "lib/tsconfig.tsbuildinfo",
  },
  "references": ${deps.length ? `[${deps}\n  ],` : `[],`}
}
`
    );
  }
});

writeFileSync(
  `scripts/tsconfig.json`,
  `{
  "extends": "../tsconfig.json",
  "references": [${typeScriptPackages
    .map(n => `\n    {"path": ${JSON.stringify(`../packages/${n}`)}},`)
    .join(``)}
  ],
}`
);
const [README_HEADER, _table, README_FOOTER] = readFileSync(
  __dirname + '/../README.md',
  'utf8'
).split('<!-- VERSION_TABLE -->');

const versionsTable = `
Package Name | Version
-------------|--------
${packageNames
  .sort()
  .map(
    name =>
      `${name} | [![NPM version](https://img.shields.io/npm/v/${name}?style=for-the-badge)](https://www.npmjs.com/package/${name})`
  )
  .join('\n')}
`;
writeFileSync(
  __dirname + '/../README.md',
  [README_HEADER, versionsTable, README_FOOTER || ''].join(
    '<!-- VERSION_TABLE -->'
  )
);
