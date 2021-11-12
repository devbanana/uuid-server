'use strict';

const clockseq = require('crypto').randomBytes(2).readUInt16BE() & 0x3fff;
console.log(clockseq.toString(16).padStart(4, '0'));
