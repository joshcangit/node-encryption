const { createDecipheriv } = require('crypto');
const { createReadStream, createWriteStream } = require('fs');
const { basename, extname } = require('path');
const { createUnzip } = require('zlib');

const { ALGORITHM, ENCRYPED_EXT, DECRYPTED_SUFFIX } = require('./constants');
const { getCipherKey } = require('./util');

function fileError(file) {
    if(typeof file !== 'string') {
      console.error('Filename required to decrypt');
      process.exit(1);
    }
    if(extname(file) !== ENCRYPED_EXT) {
      console.error(`File must of be of type '${ENCRYPED_EXT}'`);
      process.exit(1);
    }
}

function decrypt({ file, password }) {
  fileError(file);

  const filename = file.split('.enc')[0];
  const unencrypted = basename(filename, extname(filename)) + DECRYPTED_SUFFIX + extname(filename);

  // First, get the initialization vector from the file.
  const readInitVect = createReadStream(file, { end: 15 });

  let initVect;
  readInitVect.on('data', (chunk) => {
    initVect = chunk;
  });

  // Once we've got the initialization vector, we can decrypt the file.
  readInitVect.on('close', () => {
    const CIPHER_KEY = getCipherKey(password);

    const readStream = createReadStream(file, { start: 16 });
    const decipher = createDecipheriv(ALGORITHM, CIPHER_KEY, initVect);

    const unzip = createUnzip();
    const writeStream = createWriteStream(unencrypted);

    writeStream.on('close', () => {
      console.log('Decryption success!');
    });

    unzip.on('error', () => {
      console.log('Failed')
      process.exit(0);
    });

    readStream
      .pipe(decipher)
      .pipe(unzip)
      .pipe(writeStream);
  });

}

module.exports = decrypt;
