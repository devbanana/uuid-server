import { GenerateUuidV1Command } from './generate-uuid-v1.command';
import { validate } from 'class-validator';

describe('GenerateUuidV1Command', () => {
  it('should be defined', () => {
    expect(new GenerateUuidV1Command()).toBeDefined();
  });

  it('should require time to be a valid date', async () => {
    const command = new GenerateUuidV1Command({ time: 'foo' });
    const errors = await validate(command);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('time');
    expect(errors[0].constraints).toHaveProperty('isIso8601');
  });

  it('should require clockSeq to be at least 0', async () => {
    const command = new GenerateUuidV1Command({ clockSeq: -3 });
    const errors = await validate(command);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('clockSeq');
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('should require clockSeq to not be greater than 0x3fff', async () => {
    const command = new GenerateUuidV1Command({ clockSeq: 0x4000 });
    const errors = await validate(command);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('clockSeq');
    expect(errors[0].constraints).toHaveProperty('max');
  });

  describe('the node', () => {
    it.each([
      ['should accept colons', '92:5F:CF:BE:F9:98'],
      ['should accept hyphens', '18-94-94-EA-95-53'],
      ['should accept dots', 'CFF4.94C8.C0EA'],
      ['should accept a lowercase address', 'a3:9b:b5:0a:80:26'],
    ])('%s', async (description, mac) => {
      const command = new GenerateUuidV1Command({ node: mac });
      const errors = await validate(command);
      expect(errors).toHaveLength(0);
    });

    it('should not accept non-hexadecimal values', async () => {
      const command = new GenerateUuidV1Command({ node: '35:07:CZ:17:6C:E7' });
      const errors = await validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('node');
      expect(errors[0].constraints).toHaveProperty('isMacAddress');
    });
  });
});
