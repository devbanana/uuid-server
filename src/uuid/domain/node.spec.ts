import { Node } from './node';

describe('Node', () => {
  it('should be defined', () => {
    expect(Node.fromString('92:5F:CF:BE:F9:98')).toBeDefined();
  });

  it('should not accept an invalid MAC address', () => {
    expect(() => Node.fromString('foo')).toThrowError(
      /Invalid MAC address provided/,
    );
  });

  it('can be converted to a byte array', () => {
    expect(Node.fromString('34:F7:17:63:76:07').asByteArray()).toStrictEqual(
      new Uint8Array([0x34, 0xf7, 0x17, 0x63, 0x76, 0x07]),
    );
  });

  // noinspection SpellCheckingInspection
  describe.each`
    format            | macAddress             | hexString
    ${'with colons'}  | ${'92:5F:CF:BE:F9:98'} | ${'925fcfbef998'}
    ${'with hyphens'} | ${'16-50-2F-F3-DB-1A'} | ${'16502ff3db1a'}
    ${'with dots'}    | ${'8071.8D6A.DCB1'}    | ${'80718d6adcb1'}
    ${'with zeros'}   | ${'00:E8:35:98:61:87'} | ${'00e835986187'}
  `(
    '$format',
    ({ macAddress, hexString }: { macAddress: string; hexString: string }) => {
      it('can be converted to a hex string', () => {
        expect(Node.fromString(macAddress).asHexString()).toBe(hexString);
      });

      it('should be 48 bits', () => {
        expect(Node.fromString(macAddress).asHexString()).toHaveLength(12);
      });
    },
  );

  describe('from hex string', () => {
    it('can be turned back into a hex string', () => {
      // noinspection SpellCheckingInspection
      expect(Node.fromHexString('618feabe756a').asHexString()).toBe(
        '618feabe756a',
      );
    });

    it('must be 48 bits', () => {
      expect(() => Node.fromHexString('4C54980D1A')).toThrowError(
        /Hex string must be 48 bits/,
      );
    });

    it('must be a valid hex string', () => {
      expect(() => Node.fromHexString('foo')).toThrowError(
        /Invalid hex string provided/,
      );
    });
  });
});
