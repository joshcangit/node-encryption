const { createHash, scryptSync } = require('crypto');
const zlib = require('zlib');

const { ALGORITHM } = require('./constants');

function injectIV(fstream, iv) {
  return new Promise((resolve, reject) => {
    fstream.write(iv, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function appendTag(encryptedStream, authTag) {
  return new Promise((resolve, reject) => {
    encryptedStream.end(authTag);

    encryptedStream.on('finish', resolve);
    encryptedStream.on('error', reject);
  });
}

function extract(input) {
  return new Promise((resolve, reject) => {
    const data = [];

    input.on('data', (chunk) => data.push(chunk));
    input.on('end', () => resolve(Buffer.concat(data)));
    input.on('error', reject);
  });
}

function getCipherKey(key) {
  const keyLength = parseInt(ALGORITHM.replace(/[^0-9]/g,''), 10) / 8;
  const salt = createHash('sha384').update(key).digest();
  return scryptSync(key, salt, keyLength);
}

function compression(action) {
  if(action === 'compress') {
    return new Promise((resolve) => {
      if(zlib.createBrotliDecompress()) {
        resolve(zlib.createBrotliCompress());
    } else resolve(zlib.createGzip());
    });
  } else if(action === 'decompress') {
    return new Promise((resolve, reject) => {
      if(zlib.createBrotliDecompress()) {
        resolve(zlib.createBrotliDecompress());
    } else resolve(zlib.createUnzip());
      reject(new Error('Failed to decrypt.'));
    });
  }
}

module.exports = {
    getCipherKey,
    injectIV,
    appendTag,
    extract,
    compression
};
