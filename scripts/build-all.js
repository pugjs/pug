const {sync: spawnSync} = require('cross-spawn');

const onlyChanged = process.argv.includes('--only-changed');
const boltArgs = process.argv.slice(2).filter(arg => arg !== '--only-changed');
const scriptArgs = onlyChanged ? [] : ['--force'];
console.log(
  'bolt ' +
    [
      'ws',
      'exec',
      ...boltArgs,
      '--',
      'node',
      '../../scripts/build',
      ...scriptArgs,
    ]
      .map(v => JSON.stringify(v))
      .join(' '),
);
const result = spawnSync(
  'bolt',
  [
    'ws',
    'exec',
    ...boltArgs,
    '--',
    'node',
    '../../scripts/build',
    ...scriptArgs,
  ],
  {
    stdio: 'inherit',
  },
);

if (result.status !== 0) {
  process.exit(1);
}
