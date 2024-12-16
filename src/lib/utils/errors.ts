export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof Error) {
    console.error(`${error.name}: ${error.message}`);
    throw error;
  }
  console.error('Unknown error:', error);
  throw new Error('An unknown error occurred');
}