import { gregorianStart, UuidTime } from './uuid-time';
import { ClockSequence } from './clock-sequence';
import { Node } from './node';
import { Rfc4122Uuid } from '../rfc4122-uuid';

export class UuidV1 extends Rfc4122Uuid {
  static version = 1;

  static create(
    time: UuidTime,
    clockSequence: ClockSequence,
    node: Node,
  ): UuidV1 {
    const buffer = Buffer.alloc(16);

    const timestamp = time.ns / 100n;

    // Write timestamp
    buffer.writeUInt32BE(Number(timestamp & 0xffffffffn));
    buffer.writeUInt16BE(Number((timestamp >> 32n) & 0xffffn), 4);
    buffer.writeUInt16BE(Number((timestamp >> 48n) & 0xfffn), 6);

    // Write clock sequence
    buffer.writeUInt16BE(clockSequence.asNumber(), 8);

    // Node
    buffer.writeUIntBE(node.asNumber(), 10, 6);

    this.setVersion(buffer, 1);
    this.setVariant(buffer);

    return this.fromBuffer(buffer);
  }

  get time(): UuidTime {
    const high = BigInt(this.uuid.readUInt16BE(6) & 0xfff);
    const mid = BigInt(this.uuid.readUInt16BE(4));
    const low = BigInt(this.uuid.readUInt32BE(0));

    let uuidTime = (high << 48n) | (mid << 32n) | low;
    const ns = Number(uuidTime % 10000n) * 100;
    uuidTime /= 10000n;
    uuidTime += BigInt(gregorianStart);

    return UuidTime.fromMilliseconds(Number(uuidTime)).withAddedNanoseconds(ns);
  }

  get clockSequence(): ClockSequence {
    return ClockSequence.fromNumber(this.uuid.readUInt16BE(8) & 0x3fff);
  }

  get node(): Node {
    return Node.fromBuffer(this.uuid.subarray(10));
  }
}
