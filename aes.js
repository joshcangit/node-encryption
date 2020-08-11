#!/usr/bin/env node
const encrypt = require('./lib/encrypt');
const decrypt = require('./lib/decrypt');
const password = require('./lib/password');

const argv = process.argv.slice(2);
const [mode, file] = argv;

if (mode === '--help' || mode === '-h' || mode === 'help' || !mode) {
  console.log(`
  Usage:
    aes [encrypt/decrypt] [file]
    
    Examples:
    aes encrypt test.txt
    aes decrypt test.txt
`);
}

const shouldEncrypt = mode === 'encrypt';
const shouldDecrypt = mode === 'decrypt';

password(({ password1, password2 }) => {
  if (password1 !== password2) {
    console.log('Passwords do not match!');
    return;
  } else {
    console.log('Passwords matched.');
  }

  const password = password1;

  if (shouldEncrypt) {
    encrypt({ file, password });
  }

  if (shouldDecrypt) {
    decrypt({ file, password });
  }
});
