import validator from 'validator';

export class Node {
  private constructor(private node: number) {}

  static fromString(macAddress: string): Node {
    if (!validator.isMACAddress(macAddress)) {
      throw new Error('Invalid MAC address provided');
    }

    return new Node(parseInt(macAddress.replace(/[^0-9a-f]/gi, ''), 16));
  }

  static fromHexString(hex: string): Node {
    if (!validator.isHexadecimal(hex)) {
      throw new Error('Invalid hex string provided');
    }
    if (hex.length !== 12) {
      throw new Error('Hex string must be 48 bits');
    }

    return new Node(parseInt(hex, 16));
  }

  asHexString(): string {
    return this.node.toString(16).padStart(12, '0');
  }

  asByteArray(): Uint8Array {
    const hexArray = this.asHexString().match(/[0-9a-f]{2}/gi);

    // istanbul ignore next: This can never really happen if we've validated our input
    if (hexArray === null) {
      return new Uint8Array();
    }

    return new Uint8Array(hexArray.map(byte => parseInt(byte, 16)));
  }
}
