import { UuidV1 } from './uuid-v1';
import { UuidTime } from './uuid-time';
import { Node } from './node';

describe('UuidV1', () => {
  const uuid = 'ced717a0-2ab6-11ec-bce4-bf507cc82961';
  let uuidV1: UuidV1;

  beforeEach(() => {
    uuidV1 = UuidV1.fromUuid(uuid);
  });

  it('should be defined', () => {
    expect(uuidV1).toBeDefined();
  });

  it('should get the UUID as a string', () => {
    expect(uuidV1.toString()).toBe(uuid);
  });

  it('should require a validly formatted UUID', () => {
    expect(() => UuidV1.fromUuid('foo')).toThrowError(
      /foo is not a valid UUID/,
    );

    // UUID is missing hyphen after first field
    expect(() =>
      UuidV1.fromUuid('65b485402b20-11ec-946a-37aba894513f'),
    ).toThrowError(/is not a valid UUID/);
  });

  it('should require a V1 UUID', () => {
    // Is V4 UUID
    expect(() =>
      UuidV1.fromUuid('816fd5e3-dea6-4f79-b2be-41dea6d4f503'),
    ).toThrowError(/is not a V1 UUID/);
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
    expect(uuidV1.asBase32()).toBe('6ETWBT0ANP27PBSS5ZA1YCGAB1');
  });

  it('should return the UUID as a number', () => {
    expect(uuidV1.asNumber()).toBe(274937790141423023587971456784237341025n);
  });
});
