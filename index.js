'use strict'

const bignum = require('bignum');
const bip39 = require('bip39');
const crypto = require('crypto');
const fs = require('fs');
const sodium = require('sodium');

const noop = function() {};

function LiskVanitygen(config) {
    if (typeof config !== 'object') {
        throw new Error('Config must be an object.');
    }

    if (!config.pattern) {
        throw new Error('config.pattern must be specifed.');
    }

    let newConfig = {};
    let tempPattern;

    if (typeof config.pattern === 'number') {
        tempPattern = [config.pattern];
    } else if (config.pattern instanceof Array) {
        tempPattern = config.pattern;
    } else {
        throw new Error('config.pattern must be array or number.');
    }

    tempPattern = tempPattern
        .filter((a) => Number.isInteger(a))
        .sort((a, b) => b - a);

    if (!tempPattern.length) {
        throw new Error('config.pattern must be array with at least one number.');
    }

    newConfig.pattern = tempPattern;
    newConfig.continue = typeof config.continue !== 'undefined' ? !!config.continue : true;
    newConfig.messageInterval = typeof config.messageInterval === 'number' ? config.messageInterval : 1000;

    this.config = newConfig;
}

LiskVanitygen.prototype.generateLiskPair = function(passphrase) {
    if (!passphrase) {
        passphrase = bip39.generateMnemonic();
    }

    const hash = crypto.createHash('sha256').update(passphrase, 'utf8').digest();
    const kp2 = new sodium.Key.Sign.fromSeed(hash, 'base64');
    const publicKey = kp2.publicKey.baseBuffer;

    function getAddress(key) {
        const hash = crypto.createHash('sha256').update(key).digest();

        let temp = new Buffer(8);

        for (let i = 0; i < 8; i++) {
            temp[i] = hash[7 - i];
        }

        return bignum.fromBuffer(temp).toString() + 'L';
    }

    return {
        passphrase,
        address: getAddress(publicKey),
    }
}

LiskVanitygen.prototype.run = function(foundCallback, statusCallback) {
    if (typeof foundCallback !== 'function') {
        throw new Error('Found callback must be a function.');
    }

    if (typeof statusCallback !== 'function') {
        statusCallback = noop;
    }

    const startTime = new Date().valueOf();

    let found = false;
    let count = 1;
    let lastMessage = 0;

    do {
        let generated = this.generateLiskPair();
        let singleStartTime = new Date().valueOf();

        if (singleStartTime - startTime > 1000 && singleStartTime - lastMessage >= this.config.messageInterval) {
            let time = parseInt((singleStartTime - startTime) / 1000);

            statusCallback({
                count,
                time,
                avg: parseFloat((count / time).toFixed(2))
            });

            lastMessage = singleStartTime;
        }

        found = this.config.pattern.find((a) => generated.address.indexOf(a) === 0);

        if (found) {
            foundCallback({
                count,
                pattern: found,
                address: generated.address,
                passphrase: generated.passphrase
            });
        }

        count++;
    }
    while (this.config.continue || !found);

    return this;
};

module.exports = LiskVanitygen;
