import { NetworkError } from './errors';

/**
 * Enhances the global fetch with better error handling
 */
export function setupFetchInterceptor(): void {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      if (!response.ok) {
        throw new NetworkError(
          `HTTP error! status: ${response.status}`
        );
      }
      return response;
    } catch (error) {
      console.error('Network error:', error);
      throw new NetworkError(
        'Network error occurred. Please check your connection.'
      );
    }
  };
}