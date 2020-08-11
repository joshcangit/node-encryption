#!/usr/bin/env node
const encrypt = require('./lib/encrypt');
const decrypt = require('./lib/decrypt');

const argv = process.argv.slice(2);
const [ mode, file, password ] = argv;

if (mode === '--help' || mode === '-h' || mode === 'help' || !mode) {
  console.log(`
  Usage:
    aes [encrypt/decrypt] [file] [password]
  
  Examples:
    aes encrypt test.txt sesame
    aes decrypt test.txt sesame
`);
}

const shouldEncrypt = mode === 'encrypt';
const shouldDecrypt =  mode === 'decrypt';

if (shouldEncrypt) {
  encrypt({ file, password });
}

if (shouldDecrypt) {
  decrypt({ file, password });
}
