# Node Encryption

An example of how one might encrypt/decrypt files using node. 

Code for this companion article: [Encrypting Files With Node](http://brandonstilson.com/encrypting-files-with-node/).

## Important

This code is adapted from the original. The original repo can be found here: https://github.com/bbstilson/node-encryption

## Changelog

Added support for using this example as a CLI tool. - [F1LT3R](https://f1lt3r.io)

## Installation

```shell
npm install
```

## Usage

### Encryption

```shell
aes encrypt test.txt sesame
```

You will now see `test.txt.enc`. This is the encrypted data. 

You can delete the original file.

### Decryption

```shell
aes decrypt test.txt sesame
```

You will now see `test.txt.unenc`. This file will be identical to the original.

You can rename this file back to `test.txt`.
