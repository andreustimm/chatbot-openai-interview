import { validate } from 'class-validator';
import { ChatRequestDto } from './chat.dto';

describe('ChatRequestDto', () => {
  it('should validate a valid message', async () => {
    const dto = new ChatRequestDto();
    dto.message = 'What is feijoada?';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject an empty message', async () => {
    const dto = new ChatRequestDto();
    dto.message = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should reject a message that is not a string', async () => {
    const dto = new ChatRequestDto();
    // @ts-expect-error Testing invalid type
    dto.message = 123;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a message that exceeds max length', async () => {
    const dto = new ChatRequestDto();
    dto.message = 'a'.repeat(2001);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should accept a message at max length', async () => {
    const dto = new ChatRequestDto();
    dto.message = 'a'.repeat(2000);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
