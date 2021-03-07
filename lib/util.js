const { createHash, scryptSync } = require('crypto');
const { Transform } = require('stream');

const { ALGORITHM } = require('./constants');

// Appends the initialization vector to the front of the stream, which is then
// used for decryption later.
class AppendInitVect extends Transform {
  constructor(initVect, opts) {
    super(opts);
    this.initVect = initVect;
    this.appended = false;
  }

  _transform(chunk, _encoding, cb) {
    if(!this.appended) {
      this.push(this.initVect);
      this.appended = true;
    }
    this.push(chunk);
    cb();
  }
}

function sha256() {
  const data = Array.from(arguments);
  const hasher = createHash('sha256');

  data.forEach((item) => hasher.update(item.toString()));
  return hasher.digest();
}

function createBasicSalt(entropy) {
  const hasher = createHash('sha256');
  const loops = entropy.length * 8;

  for (let i = 0; i < loops; i++) hasher.update(sha256(i, entropy[i % entropy.length]));

  return hasher.digest();
}

function getCipherKey(key) {
    const keyLength = parseInt(ALGORITHM.replace(/[^0-9]/g,''), 10) / 8;
    const salt = createBasicSalt([key, keyLength]);
    return scryptSync(key, salt, keyLength);
}

module.exports = {
    AppendInitVect,
    getCipherKey
};
