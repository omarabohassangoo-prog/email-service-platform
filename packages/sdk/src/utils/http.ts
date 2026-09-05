/**
 * @file http.ts
 * @description Robust, dependency-free HTTP client built on native Fetch with retry and timeout support.
 */

import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  EmailSendError,
  TimeoutError,
  EmailServiceError,
} from '../errors.js';
import { Logger } from './logger.js';

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  retries?: number;
}

export class HttpClient {
  private baseUrl: string;
  private apiKey: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private logger: Logger;
  private customHeaders: Record<string, string>;

  constructor(options: {
    baseUrl: string;
    apiKey: string;
    timeout?: number;
    retries?: number;
    logger: Logger;
    headers?: Record<string, string>;
  }) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.defaultTimeout = options.timeout ?? 30000;
    this.defaultRetries = options.retries ?? 3;
    this.logger = options.logger;
    this.customHeaders = options.headers ?? {};
  }

  /**
   * Executes an HTTP request with automatic retry on transient failure.
   */
  public async request<T>(options: HttpRequestOptions): Promise<T> {
    const maxRetries = options.retries ?? this.defaultRetries;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        return await this.executeOnce<T>(options);
      } catch (err: unknown) {
        lastError = err as Error;

        const isTransient = this.isTransientError(err);
        const canRetry = attempt < maxRetries && isTransient;

        if (!canRetry) {
          throw err;
        }

        attempt++;
        const backoffMs = this.calculateBackoff(attempt);
        this.logger.warn(
          `Request to ${options.path} failed (${lastError.message}). Retrying attempt ${attempt}/${maxRetries} in ${backoffMs}ms...`
        );
        await this.delay(backoffMs);
      }
    }

    throw lastError ?? new EmailServiceError('HTTP Request failed after maximum retries');
  }

  private async executeOnce<T>(options: HttpRequestOptions): Promise<T> {
    const method = options.method ?? 'GET';
    const timeout = options.timeout ?? this.defaultTimeout;

    let urlString = `${this.baseUrl}${options.path.startsWith('/') ? '' : '/'}${options.path}`;
    if (options.query) {
      const searchParams = new URLSearchParams();
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined && v !== null) {
          searchParams.append(k, String(v));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        urlString += (urlString.includes('?') ? '&' : '?') + qs;
      }
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-API-Key': this.apiKey,
      ...this.customHeaders,
      ...(options.headers ?? {}),
    };

    let bodyData: string | undefined;
    if (options.body !== undefined && options.body !== null) {
      headers['Content-Type'] = 'application/json';
      bodyData = JSON.stringify(options.body);
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => {
      controller.abort();
    }, timeout);

    this.logger.debug(`HTTP ${method} -> ${urlString}`);

    try {
      const response = await fetch(urlString, {
        method,
        headers,
        body: bodyData,
        signal: controller.signal,
      });

      clearTimeout(timeoutHandle);

      // Handle HTTP Errors
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      const text = await response.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        return { message: text } as unknown as T;
      }
    } catch (err: unknown) {
      clearTimeout(timeoutHandle);

      if (err instanceof EmailServiceError) {
        throw err;
      }

      const anyErr = err as { name?: string; message?: string };
      if (anyErr?.name === 'AbortError') {
        throw new TimeoutError(`Request to ${options.path} exceeded ${timeout}ms timeout limit.`, timeout);
      }

      throw new EmailServiceError(
        `Network error during ${method} ${options.path}: ${anyErr?.message || 'Connection failed'}`,
        'NETWORK_ERROR',
        undefined,
        err
      );
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorBody: unknown;
    try {
      const text = await response.text();
      try {
        errorBody = JSON.parse(text);
      } catch {
        errorBody = { message: text };
      }
    } catch {
      errorBody = { message: response.statusText };
    }

    const details = (errorBody as Record<string, unknown>) || {};
    const message =
      (details.error as string) ||
      (details.message as string) ||
      `HTTP Error ${response.status}: ${response.statusText}`;

    switch (response.status) {
      case 401:
      case 403:
        throw new AuthenticationError(message, details);

      case 400:
      case 422:
        throw new ValidationError(message, details);

      case 404:
        throw new NotFoundError(message, details);

      case 429: {
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfterSec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
        throw new RateLimitError(message, isNaN(retryAfterSec as number) ? undefined : retryAfterSec, details);
      }

      case 500:
      case 502:
      case 503:
      case 504:
        throw new EmailSendError(message, response.status, details);

      default:
        throw new EmailServiceError(message, 'HTTP_ERROR', response.status, details);
    }
  }

  private isTransientError(err: unknown): boolean {
    if (err instanceof RateLimitError) return true;
    if (err instanceof TimeoutError) return true;
    if (err instanceof EmailSendError && (err.statusCode === 502 || err.statusCode === 503 || err.statusCode === 504)) {
      return true;
    }
    if (err instanceof EmailServiceError && err.code === 'NETWORK_ERROR') return true;
    return false;
  }

  private calculateBackoff(attempt: number): number {
    // Exponential backoff: 300ms, 600ms, 1200ms with jitter
    const base = 300 * Math.pow(2, attempt - 1);
    const jitter = Math.floor(Math.random() * 100);
    return base + jitter;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
