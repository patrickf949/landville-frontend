/**
 * Helper to recursively extract error messages from backend API responses.
 * Handles NestJS, Django REST Framework, Flask, and standard HTTP error formats.
 */
export function extractErrorMessage(error: any): string {
  if (!error) {
    return 'An unexpected error occurred.';
  }

  // 1. If error is a string
  if (typeof error === 'string') {
    return error;
  }

  // Helper to extract from an errors object (which could be a string, array, or object map)
  const extractFromErrorsObj = (errors: any): string | null => {
    if (!errors) return null;
    if (typeof errors === 'string') return errors;
    if (Array.isArray(errors)) {
      if (errors.length > 0) {
        return extractErrorMessage(errors[0]);
      }
      return null;
    }
    if (typeof errors === 'object') {
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        // Find the first key and extract its message
        const firstKey = keys[0];
        const val = errors[firstKey];
        const extracted = extractFromErrorsObj(val);
        if (extracted) {
          // Capitalize key and prefix it for context, e.g., "Email: ..."
          if (isNaN(Number(firstKey)) && firstKey !== 'detail' && firstKey !== 'error' && firstKey !== 'message') {
            const capitalizedKey = firstKey.charAt(0).toUpperCase() + firstKey.slice(1);
            return `${capitalizedKey}: ${extracted}`;
          }
          return extracted;
        }
      }
    }
    return null;
  };

  // 2. If it's an HttpErrorResponse (or nested under error.error)
  if (error.error) {
    const nested = error.error;
    if (typeof nested === 'string') {
      if (nested.trim().startsWith('{') || nested.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(nested);
          return extractErrorMessage(parsed);
        } catch (e) {
          // ignore parsing error
        }
      }
      return nested;
    }
    if (typeof nested === 'object') {
      if (nested.errors) {
        const msg = extractFromErrorsObj(nested.errors);
        if (msg) return msg;
      }
      if (nested.message) {
        return extractFromErrorsObj(nested.message);
      }
      if (nested.detail) {
        return extractFromErrorsObj(nested.detail);
      }
      const msg = extractFromErrorsObj(nested);
      if (msg) return msg;
    }
  }

  // 3. Directly on the error object
  if (error.errors) {
    const msg = extractFromErrorsObj(error.errors);
    if (msg) return msg;
  }
  if (error.message) {
    return extractFromErrorsObj(error.message);
  }
  if (error.detail) {
    return extractFromErrorsObj(error.detail);
  }

  // Fallback to checking keys on the error object itself (if it's a direct dictionary of fields)
  const directMsg = extractFromErrorsObj(error);
  if (directMsg) return directMsg;

  return 'An unexpected error occurred.';
}
