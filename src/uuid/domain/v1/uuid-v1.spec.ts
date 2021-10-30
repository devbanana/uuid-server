import { UuidV1 } from './uuid-v1';
import { UuidTime } from './uuid-time';
import { Node } from './node';
import { Buffer } from 'buffer';

describe('UuidV1', () => {
  const uuid = 'ced717a0-2ab6-11ec-bce4-bf507cc82961';
  let uuidV1: UuidV1;

  beforeEach(() => {
    uuidV1 = UuidV1.fromRfc4122(uuid);
  });

  it('should be defined', () => {
    expect(uuidV1).toBeDefined();
  });

  it('should get the UUID as a string', () => {
    expect(uuidV1.toString()).toBe(uuid);
  });

  describe('from RFC4122', () => {
    it('should require a validly formatted UUID', () => {
      expect(() => UuidV1.fromRfc4122('foo')).toThrowError(
        /foo is not a valid UUID/,
      );

      // UUID is missing hyphen after first field
      expect(() =>
        UuidV1.fromRfc4122('65b485402b20-11ec-946a-37aba894513f'),
      ).toThrowError(/is not a valid UUID/);
    });

    it('should require a V1 UUID', () => {
      // Is V4 UUID
      expect(() =>
        UuidV1.fromRfc4122('816fd5e3-dea6-4f79-b2be-41dea6d4f503'),
      ).toThrowError(/is not a V1 UUID/);
    });
  });

  describe('from Buffer', () => {
    it('should accept a buffer', () => {
      // noinspection SpellCheckingInspection
      expect(
        UuidV1.fromBuffer(
          Buffer.from('ced717a02ab611ecbce4bf507cc82961', 'hex'),
        ).asRfc4122(),
      ).toBe(uuid);
    });

    it('should require the buffer to be 16 bytes', () => {
      expect(() =>
        UuidV1.fromBuffer(Buffer.from('ced717a02ab611ec', 'hex')),
      ).toThrowError(/must be 16 bytes/);
    });

    it('should not accept an invalid variant', () => {
      // Bits 64-65 are set to '11' instead of '10'
      // noinspection SpellCheckingInspection
      expect(() =>
        UuidV1.fromBuffer(
          Buffer.from('3ec8fbdc365611ecc393eb37d804f408', 'hex'),
        ),
      ).toThrowError(/is not a variant 1 UUID/);
    });

    describe('checking the version', () => {
      it('should not accept version 3', () => {
        // noinspection SpellCheckingInspection
        expect(() =>
          UuidV1.fromBuffer(
            Buffer.from('1dbfc9ac4546358caa6e37e8499ec948', 'hex'),
          ),
        ).toThrowError(/is not a V1 UUID/);
      });

      it('should not accept version 4', () => {
        expect(() =>
          UuidV1.fromBuffer(
            Buffer.from('816fd5e3dea64f79b2be41dea6d4f503', 'hex'),
          ),
        ).toThrowError(/is not a V1 UUID/);
      });

      it('should not accept version 5', () => {
        expect(() =>
          UuidV1.fromBuffer(
            Buffer.from('aae1f36589325e9fa4a63930b4862cf2', 'hex'),
          ),
        ).toThrowError(/is not a V1 UUID/);
      });

      it('should require bits 48-50 to be 0', () => {
        // noinspection SpellCheckingInspection
        expect(() =>
          UuidV1.fromBuffer(
            Buffer.from('a2333b691a25fafa9e413eb526bc3bb8', 'hex'),
          ),
        ).toThrowError(/is not a V1 UUID/);
      });
    });
  });

  it("should extract the UUID's time", () => {
    expect(uuidV1.time).toStrictEqual(
      UuidTime.fromString('2021-10-11T17:15:18.426Z'),
    );
  });

  it("should extract the UUID's clock sequence", () => {
    expect(uuidV1.clockSequence.asNumber()).toBe(0x3ce4);
  });

  it("should extract the UUID's node", () => {
    expect(uuidV1.node).toStrictEqual(Node.fromString('bf:50:7c:c8:29:61'));
  });

  it('should return the RFC4122-formatted UUID', () => {
    expect(uuidV1.asRfc4122()).toBe(uuid);
  });

  it('should return the base32-formatted UUID', () => {
    // noinspection SpellCheckingInspection
    expect(uuidV1.asBase32()).toBe('6ETWBT0ANP27PBSS5ZA1YCGAB1');
  });

  it('should return the base58-formatted UUID', () => {
    expect(uuidV1.asBase58()).toBe('SYQe9KwSqj9TViUYgNsp16');
  });

  it('should return the base64-formatted UUID', () => {
    expect(uuidV1.asBase64()).toBe('ztcXoCq2Eey85L9QfMgpYQ==');
  });

  it('should return the UUID as a number', () => {
    expect(uuidV1.asNumber()).toBe(274937790141423023587971456784237341025n);
  });

  it('should return the UUID as a binary string', () => {
    expect(uuidV1.asBinary()).toBe(
      '\xce\xd7\x17\xa0\x2a\xb6\x11\xec\xbc\xe4\xbf\x50\x7c\xc8\x29\x61',
    );
  });
});
