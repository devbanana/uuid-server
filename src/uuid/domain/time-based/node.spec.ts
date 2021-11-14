import { Node } from './node';
import { Buffer } from 'buffer';

describe('Node', () => {
  it('should be defined', () => {
    expect(Node.fromString('92:5F:CF:BE:F9:98')).toBeDefined();
  });

  it('should not accept an invalid MAC address', () => {
    expect(() => Node.fromString('foo')).toThrowError(
      /Invalid MAC address provided/,
    );
  });

  it('can be converted to a number', () => {
    expect(Node.fromString('34:F7:17:63:76:07').asNumber()).toBe(
      58_235_853_960_711,
    );
  });

  it('can be converted to a buffer', () => {
    expect(Node.fromString('c0:84:b2:af:83:1f').asBuffer()).toStrictEqual(
      Buffer.from('c084b2af831f', 'hex'),
    );
  });

  // noinspection SpellCheckingInspection
  it.each`
    format       | macAddress             | hexString
    ${'colons'}  | ${'92:5F:CF:BE:F9:98'} | ${'925fcfbef998'}
    ${'hyphens'} | ${'16-50-2F-F3-DB-1A'} | ${'16502ff3db1a'}
    ${'dots'}    | ${'8071.8D6A.DCB1'}    | ${'80718d6adcb1'}
    ${'zeros'}   | ${'00:E8:35:98:61:87'} | ${'00e835986187'}
  `(
    'can accept a node ID with $format',
    ({ macAddress, hexString }: { macAddress: string; hexString: string }) => {
      expect(Node.fromString(macAddress)).toStrictEqual(
        Node.fromBuffer(Buffer.from(hexString, 'hex')),
      );
    },
  );

  describe('from buffer', () => {
    it('can be accepted', () => {
      // noinspection SpellCheckingInspection
      expect(Node.fromBuffer(Buffer.from('618feabe756a', 'hex'))).toStrictEqual(
        Node.fromString('61:8f:ea:be:75:6a'),
      );
    });

    it('must be 48 bits', () => {
      expect(() =>
        Node.fromBuffer(Buffer.from('4C54980D1A', 'hex')),
      ).toThrowError('Node ID must be 48 bits');
    });
  });

  describe('from number', () => {
    it('can be accepted', () => {
      const node = Node.fromNumber(0xffa1255017b5);
      expect(node.asNumber()).toBe(281_067_580_823_477);
    });

    it('cannot be more than 48 bits', () => {
      expect(() => Node.fromNumber(0x9aafb8ba7e05ea)).toThrowError(
        'Node ID must be 48 bits',
      );
    });
  });
});
