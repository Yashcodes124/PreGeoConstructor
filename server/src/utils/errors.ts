export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, code = 'app_error', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ProviderUnavailableError extends Error {
  readonly provider: string;

  constructor(provider: string, message: string) {
    super(message);
    this.name = 'ProviderUnavailableError';
    this.provider = provider;
  }
}
