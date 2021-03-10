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

function getCipherKey(key) {
    const keyLength = parseInt(ALGORITHM.replace(/[^0-9]/g,''), 10) / 8;
    const salt = createHash('sha384').update(key).digest();
    return scryptSync(key, salt, keyLength);
}

module.exports = {
    AppendInitVect,
    getCipherKey
};
