const randomBytesAsync = require('util').promisify(require('crypto').randomBytes);
const { scrypt } = require('crypto');
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
  return new Promise((resolve, reject) => {
    const max = 2**31 - 1; // Maximum size for randomBytes
    const min = 16; // Minimum size for scrypt
    const length = parseInt(ALGORITHM.replace(/[^0-9]/g,''), 10) / 8;
    const safeLength = length > max ? max : length < min ? min : length;
    const salt = randomBytesAsync(safeLength).toString('hex');
    scrypt(key, salt, safeLength, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey);
    });
  })
}

function compression(action) {
  if(action === 'compress') {
    return new Promise((resolve) => {
      resolve(zlib.createGzip());
    });
  } else if(action === 'decompress') {
    return new Promise((resolve, reject) => {
      resolve(zlib.createUnzip());
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
