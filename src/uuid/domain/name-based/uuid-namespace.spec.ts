import { UuidNamespace } from './uuid-namespace';
import { Buffer } from 'buffer';
import { PredefinedNamespaces } from './predefined-namespaces';

describe('UuidNamespace', () => {
  it('must be 16 bytes', () => {
    expect(() => UuidNamespace.fromBuffer(Buffer.from('foo'))).toThrowError(
      'must be 16 bytes',
    );
  });

  it('should accept any valid UUID', () => {
    expect(() =>
      UuidNamespace.fromBuffer(Buffer.from('L7D1k77gJAfAKqR8')),
    ).not.toThrowError();
  });

  it('can detect a predefined namespace', () => {
    expect(UuidNamespace.isPredefined('ns:dns')).toBeTruthy();
    expect(UuidNamespace.isPredefined(PredefinedNamespaces.Dns)).toBeTruthy();
    expect(UuidNamespace.isPredefined(PredefinedNamespaces.Url)).toBeTruthy();
    expect(UuidNamespace.isPredefined('foo')).toBeFalsy();
  });

  it.each`
    predefinedNamespace          | rfc4122
    ${PredefinedNamespaces.Dns}  | ${'6ba7b810-9dad-11d1-80b4-00c04fd430c8'}
    ${PredefinedNamespaces.Url}  | ${'6ba7b811-9dad-11d1-80b4-00c04fd430c8'}
    ${PredefinedNamespaces.Oid}  | ${'6ba7b812-9dad-11d1-80b4-00c04fd430c8'}
    ${PredefinedNamespaces.X500} | ${'6ba7b814-9dad-11d1-80b4-00c04fd430c8'}
  `(
    'can be created from the predefined $predefinedNamespace namespace',
    ({
      predefinedNamespace,
      rfc4122,
    }: {
      predefinedNamespace: PredefinedNamespaces;
      rfc4122: string;
    }) => {
      expect(
        UuidNamespace.fromPredefined(predefinedNamespace).asRfc4122(),
      ).toBe(rfc4122);
    },
  );
});
