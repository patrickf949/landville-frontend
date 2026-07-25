import { extractErrorMessage } from './error-handler';

describe('extractErrorMessage', () => {
  it('should return default message when error is falsy (!error)', () => {
    expect(extractErrorMessage(null)).toBe('An unexpected error occurred.');
    expect(extractErrorMessage(undefined)).toBe('An unexpected error occurred.');
    expect(extractErrorMessage('')).toBe('An unexpected error occurred.');
  });

  it('should return error string if error is a string', () => {
    expect(extractErrorMessage('Something went wrong')).toBe('Something went wrong');
  });

  it('should extract message from error.detail', () => {
    expect(extractErrorMessage({ detail: 'Invalid token' })).toBe('Invalid token');
  });

  it('should extract message from error.error.message (nested.message)', () => {
    expect(extractErrorMessage({ error: { message: 'Server unavailable' } })).toBe('Server unavailable');
  });

  it('should extract message from error.error.detail (nested.detail)', () => {
    expect(extractErrorMessage({ error: { detail: 'Permission denied' } })).toBe('Permission denied');
  });

  it('should handle nested string starting with { or [ and parse JSON (nested.trim.startsWith)', () => {
    // Valid JSON string inside error.error
    const jsonError = { error: '  {"detail": "JSON parsed error"}  ' };
    expect(extractErrorMessage(jsonError)).toBe('JSON parsed error');

    const jsonArrayError = { error: '  [{"message": "Array error"}]  ' };
    expect(extractErrorMessage(jsonArrayError)).toBe('Array error');

    // Invalid JSON string starting with { that fails JSON.parse
    const invalidJsonError = { error: '{ bad json format' };
    expect(extractErrorMessage(invalidJsonError)).toBe('{ bad json format');

    // Plain string not starting with { or [
    const plainStringError = { error: 'Plain error string' };
    expect(extractErrorMessage(plainStringError)).toBe('Plain error string');
  });

  it('should extract from error.errors object or array', () => {
    expect(extractErrorMessage({ errors: ['First error in list'] })).toBe('First error in list');
    expect(extractErrorMessage({ errors: { phone: ['Invalid phone number'] } })).toBe('Phone: Invalid phone number');
  });

  it('should fallback to default error message when error object is empty or unrecognized', () => {
    expect(extractErrorMessage({})).toBe('An unexpected error occurred.');
    expect(extractErrorMessage({ errors: [] })).toBe('An unexpected error occurred.');
  });
});
