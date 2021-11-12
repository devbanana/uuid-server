'use strict';

if (process.argv.length < 3) {
  console.error('Please specify the UUID fields');
  process.exit(1);
}

const buffer = Buffer.from(process.argv[2].replace(/-+/g, ''), 'hex');
if (buffer.length < 8) {
  console.error('The time fields of a UUID must be at least 8 bytes');
  process.exit(2);
}

const timeLow = BigInt(buffer.readUInt32BE());
const timeMid = BigInt(buffer.readUInt16BE(4));
const timeHigh = BigInt(buffer.readUInt16BE(6) & 0xfff);

const ns = (timeHigh << 48n) | (timeMid << 32n) | timeLow;
const ms = Number(ns / 10000n);
// Back to unix epoch
const timestamp = ms - 0xb1d069b5400;

console.log(new Date(timestamp).toISOString());
