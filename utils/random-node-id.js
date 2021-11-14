'use strict';

const buffer = require('crypto').randomBytes(6);
buffer[0] |= 0x01;

console.log(
  '%s:%s:%s:%s:%s:%s',
  buffer.toString('hex', 0, 1),
  buffer.toString('hex', 1, 2),
  buffer.toString('hex', 2, 3),
  buffer.toString('hex', 3, 4),
  buffer.toString('hex', 4, 5),
  buffer.toString('hex', 5, 6),
);
