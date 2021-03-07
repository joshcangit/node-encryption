const { randomBytes, createCipheriv } = require('crypto');
const { createReadStream, createWriteStream } = require('fs');
const { createGzip } = require('zlib');

const { ALGORITHM, ENCRYPED_EXT } = require('./constants');
const { AppendInitVect, getCipherKey } = require('./util');

function encrypt({ file, password }) {
  if(typeof file !== 'string') {
    console.error('Filename required to encrypt');
    process.exit(1);
  }

  // Generate a secure, pseudo random initialization vector. 12 bytes for GCM, 16 for other modes
  const initVect = randomBytes(16);

  // Generate a cipher key from the password.
  const CIPHER_KEY = getCipherKey(password);

  const readStream = createReadStream(file);
  const gzip = createGzip();
  const cipher = createCipheriv(ALGORITHM, CIPHER_KEY, initVect);
  const appendInitVect = new AppendInitVect(initVect);
  const writeStream = createWriteStream(file + ENCRYPED_EXT);

  writeStream.on('close', () => {
    console.log('Encryption success!');
  });

  readStream
    .pipe(gzip)
    .pipe(cipher)
    .pipe(appendInitVect)
    .pipe(writeStream);
}

module.exports = encrypt;
