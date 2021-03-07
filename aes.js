#!/usr/bin/env node
const encrypt = require('./lib/encrypt');
const decrypt = require('./lib/decrypt');
const password = require('./lib/password');

const argv = process.argv.slice(2);
const [op, file] = argv;

const MODE_OPTIONS = [['encrypt', 'enc', 'e'], ['decrypt', 'dec', 'd']];
const HELP_OPTIONS = ['--help', '-h', '-?', 'help'];

function usage() {
  console.log(`Usage:
    aes encrypt|decrypt [file]
    or
    aes enc|dec [file]
    or
    aes e|d [file]

Examples:
    aes encrypt test.txt
    aes decrypt test.txt
`);
}

if(HELP_OPTIONS.includes(op) || !op) {
  usage();
  process.exit(0);
} else if(!MODE_OPTIONS.flat().includes(op)) {
  console.log(`Invalid operation: ${op ? `'${op}' ` : ''}`);
  usage();
  process.exit(1);
}

if(MODE_OPTIONS[0].includes(op)) {
  mode = MODE_OPTIONS[0][0];
}
if(MODE_OPTIONS[1].includes(op)) {
  mode = MODE_OPTIONS[1][0];
}

console.log(mode, file);

mode && password(mode, ({ password1, password2 }) => {
  if (mode === 'decrypt') {
    decrypt({ file, password: password1 });
    return;
  }

  if (password1 !== password2) {
    console.log('Passwords do not match!');
    return;
  }

  if (mode === 'encrypt') {
    encrypt({ file, password: password2 });
  }
});
