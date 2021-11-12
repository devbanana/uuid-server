'use strict';

const buffer = require('crypto').randomBytes(6);
buffer[0] |= 0x01;

console.log(buffer.toString('hex'));
