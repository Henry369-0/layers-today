import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CitySearch from './CitySearch';

let renderer: ReactTestRenderer;
let pending: Array<{ signal?: AbortSignal; resolve(response: Response): void }>;
const fetchMock = vi.fn();
const city = { id: 1, name: '杭州', latitude: 30.2, longitude: 120.2 };

beforeEach(() => {
  vi.useFakeTimers();
  pending = [];
  fetchMock.mockReset().mockImplementation((_url: string, options?: RequestInit) =>
    new Promise<Response>(resolve => pending.push({ signal: options?.signal ?? undefined, resolve })),
  );
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('document', new EventTarget());
  act(() => { renderer = create(<CitySearch onSelect={() => {}} />); });
});

afterEach(() => {
  act(() => renderer.unmount());
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function type(value: string) {
  act(() => renderer.root.findByType('input').props.onChange({ target: { value } }));
}

async function respond(index: number) {
  await act(async () => {
    pending[index].resolve(new Response(JSON.stringify({ results: [city] })));
  });
}

describe('CitySearch request lifecycle', () => {
  it('cancels an in-flight search when its input is cleared', async () => {
    type('hang');
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    type('');
    expect(pending[0].signal?.aborted).toBe(true);
    await respond(0);
    expect(renderer.root.findAllByType('button')).toHaveLength(0);
    expect(renderer.root.findByType('input').props.value).toBe('');
  });

  it('does not display the old response while a new query is still debouncing', async () => {
    type('hang');
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    type('shang');
    await respond(0);
    expect(renderer.root.findAllByType('button')).toHaveLength(0);
    expect(renderer.root.findByType('input').props.value).toBe('shang');
  });

  it('does not search again after a city has been selected', async () => {
    type('hang');
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    await respond(0);
    act(() => renderer.root.findByType('button').props.onClick());
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('cancels pending work when the input is disabled', async () => {
    type('hang');
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    act(() => renderer.update(<CitySearch onSelect={() => {}} disabled />));
    expect(pending[0].signal?.aborted).toBe(true);
  });
});
