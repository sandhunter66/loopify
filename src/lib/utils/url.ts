import { ConfigurationError } from './errors';

/**
 * Validates and normalizes a URL string
 * @param url URL to validate
 * @returns Validated URL string
 * @throws {ConfigurationError} If URL is invalid
 */
export function validateUrl(url: string): string {
  try {
    return new URL(url).toString();
  } catch (error) {
    console.error('Invalid URL:', error);
    throw new ConfigurationError(
      `Invalid Supabase URL: ${url}`
    );
  }
}