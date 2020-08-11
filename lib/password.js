const readline = require('readline');
const Writable = require('stream').Writable;

module.exports = (cb) => {
  var mutableStdout1 = new Writable({
    write: function (chunk, encoding, callback) {
      if (!this.muted) {
        process.stdout.write(chunk, encoding);
      }
      callback();
    },
  });

  mutableStdout1.muted = false;

  var input = readline.createInterface({
    input: process.stdin,
    output: mutableStdout1,
    terminal: true,
  });

  input.question('Password: ', function (password1) {
    input.close();
    process.stdout.write('\n');

    var mutableStdout2 = new Writable({
      write: function (chunk, encoding, callback) {
        if (!this.muted) {
          process.stdout.write(chunk, encoding);
        }
        callback();
      },
    });

    mutableStdout2.muted = false;

    var input2 = readline.createInterface({
      input: process.stdin,
      output: mutableStdout2,
      terminal: true,
    });

    input2.question('Verify password: ', function (password2) {
      input2.close();
      process.stdout.write('\n');
      cb({ password1, password2 });
    });

    mutableStdout2.muted = true;
  });

  mutableStdout1.muted = true;
};
