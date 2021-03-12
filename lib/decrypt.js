const { createDecipheriv } = require('crypto');
const { statSync, createReadStream, createWriteStream } = require('fs');
const { extname } = require('path');

const { ALGORITHM, ENCRYPTED_EXT, DECRYPTED_SUFFIX } = require('./constants');
const { extract, getCipherKey, compression } = require('./util');

function fileError(file) {
  if(typeof file !== 'string') {
    console.error('Filename required to decrypt');
    process.exit(1);
  }
  if(extname(file) !== ENCRYPTED_EXT) {
    console.error(`File must of be of type '${ENCRYPTED_EXT}'`);
    process.exit(1);
  }
}

function decryptStream(input, output, decipher) {
  return new Promise((resolve, reject) => {
    // init transformers
    const transformSteps = [decipher, output];
    const decryption = transformSteps.reduce((stream, step) => {
      step.removeAllListeners();
      step.on('error', reject);
      return stream.pipe(step);
    }, input);
    decryption.on('finish', resolve);
  });
}

async function decrypt({ file, password }) {
  fileError(file);

  // Rename output file with suffix
  const filename = file.split(ENCRYPTED_EXT)[0];
  const unencrypted = filename.replace(/^([^.]+)(.+)/gm, `$1${DECRYPTED_SUFFIX}$2`);

  // init file streams
  const { size } = statSync(file);
  const input = createReadStream(file, { start: 16, end: size - 17 });
  const output = createWriteStream(unencrypted);
  const ivInput = createReadStream(file, { end: 15 });
  const tagInput = createReadStream(file, { start: size - 16 });

  const [initVect, authTag] = await Promise.all([extract(ivInput), extract(tagInput)]);
  // init decipher
  const CIPHER_KEY = getCipherKey(password);
  const decipher = createDecipheriv(ALGORITHM, CIPHER_KEY, initVect).setAuthTag(authTag);
  try {
    await decryptStream(input, output, decipher);
    await compression('decompress');
    console.log('Decryption success!');
  } catch (error) {
    console.error(error.message);
    return;
  }
}

module.exports = decrypt;
