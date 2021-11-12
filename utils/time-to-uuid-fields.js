'use strict';

if (process.argv.length < 3) {
  console.error('Please specify the time');
  process.exit(1);
}

process.env.TZ = 'UTC';
const date = new Date(process.argv[2]).getTime();
if (isNaN(date)) {
  console.error('An invalid date has been provided');
  process.exit(2);
}

// Convert to milliseconds since gregorian start
const time = date + 0xb1d069b5400;
// Use bigint to prevent integer overflow
const ns = BigInt(time) * 10000n;

const timeLow = ns & 0xffffffffn;
const timeMid = (ns >> 32n) & 0xffffn;
const timeHigh = (ns >> 48n) & 0xfffn;

const buffer = Buffer.alloc(8);
buffer.writeUInt32BE(Number(timeLow));
buffer.writeUInt16BE(Number(timeMid), 4);
buffer.writeUInt16BE(Number(timeHigh) | 0x1000, 6);

console.log(
  '%s-%s-%s',
  buffer.toString('hex', 0, 4),
  buffer.toString('hex', 4, 6),
  buffer.toString('hex', 6, 8),
);
