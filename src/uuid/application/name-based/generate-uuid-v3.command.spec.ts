import { GenerateUuidV3Command } from './generate-uuid-v3.command';
import { UuidFormats } from '../../domain/uuid-formats';
import { plainToClass } from 'class-transformer';
import { PredefinedNamespaces } from '../../domain/name-based/predefined-namespaces';

describe('GenerateUuidV3Command', () => {
  it('accepts a namespace and name', async () => {
    await expect(
      new GenerateUuidV3Command('048d192e-71a8-4015-a9d3-8c4a0cb9b95d', 'foo'),
    ).not.toHaveValidationErrors();
  });

  describe('the namespace', () => {
    it('rejects non-RFC4122 UUIDs', async () => {
      await expect(
        new GenerateUuidV3Command('41424344-4546-4748-494a-4b4c4d4e4f50', ''),
      ).not.toHaveValidationErrorsOn('namespace');
    });

    it('accepts RFC4122 UUIDs', async () => {
      await expect(
        new GenerateUuidV3Command('YlTG3r', ''),
      ).toHaveValidationConstraint('isUuid', 'namespace');
    });

    it('accepts a domain name', async () => {
      await expect(
        new GenerateUuidV3Command(PredefinedNamespaces.Dns, 'devbanana.me'),
      ).not.toHaveValidationErrors();
    });

    it('accepts a URL', async () => {
      await expect(
        new GenerateUuidV3Command(
          PredefinedNamespaces.Url,
          'https://www.devbanana.me',
        ),
      ).not.toHaveValidationErrors();
    });

    it('can accept an OID', async () => {
      await expect(
        new GenerateUuidV3Command(PredefinedNamespaces.Oid, '1.3.6.1'),
      ).not.toHaveValidationErrors();
    });
    it('can accept an X.500 DN', async () => {
      await expect(
        new GenerateUuidV3Command(PredefinedNamespaces.X500, 'CN=Bob,C=US'),
      ).not.toHaveValidationErrors();
    });
  });

  describe('the name', () => {
    it('cannot be empty', async () => {
      await expect(
        new GenerateUuidV3Command('', ''),
      ).toHaveValidationConstraint('minLength', 'name');
    });

    it('must have at least 1 character', async () => {
      await expect(
        new GenerateUuidV3Command('', 'a'),
      ).not.toHaveValidationErrorsOn('name');
    });
  });

  describe('the format', () => {
    it('accepts a valid format', async () => {
      await expect(
        new GenerateUuidV3Command(
          PredefinedNamespaces.Dns,
          'devbanana.me',
          UuidFormats.Base32,
        ),
      ).not.toHaveValidationErrors();
    });

    it('rejects any invalid format', async () => {
      await expect(
        plainToClass(GenerateUuidV3Command, { format: 'foo' }),
      ).toHaveValidationConstraint('isEnum', 'format');
    });
  });
});
