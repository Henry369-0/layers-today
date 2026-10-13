import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather } from './weather';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  fetchMock.mockReset().mockImplementation((_url: string, options?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('weather request deadlines', () => {
  it('times out a weather service that never responds', async () => {
    const request = fetchWeather(30.2, 120.2);
    const signal = fetchMock.mock.calls[0][1]?.signal as AbortSignal | undefined;
    expect(signal).toBeDefined();
    const rejected = expect(request).rejects.toThrow('超时');
    await vi.advanceTimersByTimeAsync(15_000);
    expect(signal?.aborted).toBe(true);
    await rejected;
  });

  it('forwards a user cancellation without reporting a timeout', async () => {
    const controller = new AbortController();
    const request = fetchWeather(30.2, 120.2, controller.signal);
    const rejected = expect(request).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await rejected;
    expect(vi.getTimerCount()).toBe(0);
  });
});
