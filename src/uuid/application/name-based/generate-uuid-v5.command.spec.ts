import { GenerateUuidV5Command } from './generate-uuid-v5.command';
import { PredefinedNamespaces } from '../../domain/name-based/predefined-namespaces';
import { GenerateNameBasedUuidCommand } from './generate-name-based-uuid.command';

describe('GenerateUuidV5Command', () => {
  it('should accept a namespace and name', async () => {
    await expect(
      new GenerateUuidV5Command(PredefinedNamespaces.Dns, 'devbanana.me'),
    ).not.toHaveValidationErrors();
  });

  it('extends GenerateNameBasedCommand', () => {
    expect(
      new GenerateUuidV5Command('156dd75e-4e78-48a0-b66e-426a90a17da8', 'foo'),
    ).toBeInstanceOf(GenerateNameBasedUuidCommand);
  });
});
