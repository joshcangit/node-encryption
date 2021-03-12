const { randomBytes, createCipheriv } = require('crypto');
const { createReadStream, createWriteStream } = require('fs');

const { ALGORITHM, ENCRYPTED_EXT } = require('./constants');
const { getCipherKey, injectIV, appendTag, compression } = require('./util');

function encryptStream(input, output, cipher) {
  return new Promise((resolve, reject) => {
    const transformSteps = [cipher, output];
    const encryption = transformSteps.reduce((stream, step) => {
      step.removeAllListeners();
      step.on('error', reject);
      return stream.pipe(step);
    }, input);

    encryption.on('finish', () => resolve(cipher.getAuthTag()));
  });
}

async function encrypt({ file, password }) {
  if(typeof file !== 'string') {
    console.error('Filename required to encrypt');
    process.exit(1);
  }

  // Generate a secure, pseudo random initialization vector. 12 bytes for GCM, 16 for other modes.
  const initVect = randomBytes(16);

  // Generate a cipher key from the password.
  const CIPHER_KEY = getCipherKey(password);

  // init file streams and cipher
  const input = createReadStream(file);
  const output = createWriteStream(file + ENCRYPTED_EXT);
  const cipher = createCipheriv(ALGORITHM, CIPHER_KEY, initVect);
  const encryptedStream = createWriteStream(output.path, { flags: 'a' });

  // inject iv
  await injectIV(output, initVect);
  const authTag = await encryptStream(input, output, cipher);
  await appendTag(encryptedStream, authTag);
  await compression('compress');
  console.log('Encryption success!');
}

module.exports = encrypt;
