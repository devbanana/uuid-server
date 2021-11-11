import validator from 'validator';
import { Buffer } from 'buffer';

export class Node {
  private constructor(private node: number) {}

  static fromString(macAddress: string): Node {
    if (!validator.isMACAddress(macAddress)) {
      throw new Error('Invalid MAC address provided');
    }

    return new Node(parseInt(macAddress.replace(/[^0-9a-f]/gi, ''), 16));
  }

  static fromBuffer(buffer: Buffer): Node {
    if (buffer.length !== 6) {
      throw new Error('Node ID must be 48 bits');
    }

    return new Node(buffer.readUIntBE(0, 6));
  }

  asNumber(): number {
    return this.node;
  }
}
