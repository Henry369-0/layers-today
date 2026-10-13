import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, expect, it, vi } from 'vitest';
import App from './App';
import CitySearch from './components/CitySearch';
import PosterCard from './components/PosterCard';
import HistoryList from './components/HistoryList';
import { calcLayers } from './lib/layers';
import { fetchWeather } from './lib/weather';
import type { Weather } from './types';

vi.mock('./lib/weather', async () => ({
  ...await vi.importActual<typeof import('./lib/weather')>('./lib/weather'),
  fetchWeather: vi.fn(),
}));

let renderer: ReactTestRenderer | undefined;
afterEach(() => {
  act(() => renderer?.unmount());
  vi.unstubAllGlobals();
});

it('keeps a selected history entry when a previous weather request finishes late', async () => {
  vi.stubGlobal('document', new EventTarget());
  const weather: Weather = { date: '2026-10-13', temperature: 20, apparentTemperature: 20, humidity: 50, weatherCode: 0, windSpeed: 5 };
  const entry = { city: { id: 1, name: '杭州', latitude: 30.2, longitude: 120.2 }, weather, result: calcLayers(20, 5, 0, 50), copy: '历史穿搭', savedAt: 1 };
  const setItem = vi.fn();
  vi.stubGlobal('localStorage', { getItem: (key: string) => key.includes('history') ? JSON.stringify([entry]) : null, setItem, removeItem: vi.fn() });
  let resolve!: (value: Weather) => void;
  vi.mocked(fetchWeather).mockImplementation(() => new Promise<Weather>(done => { resolve = done; }));
  act(() => { renderer = create(<App />); });
  let request!: Promise<void>;
  act(() => { request = renderer!.root.findByType(CitySearch).props.onSelect({ id: 2, name: '上海', latitude: 31.2, longitude: 121.5 }); });
  const signal = vi.mocked(fetchWeather).mock.calls.at(-1)![2]!;
  act(() => renderer!.root.findByType(HistoryList).props.onSelect(entry));
  expect(signal.aborted).toBe(true);
  await act(async () => { resolve(weather); await request; });
  expect(renderer!.root.findByType(PosterCard).props.data.city.name).toBe('杭州');
  expect(setItem).not.toHaveBeenCalled();
});

it('lets the user cancel weather loading and ignores a late response', async () => {
  vi.stubGlobal('document', new EventTarget());
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() });
  let resolve!: (value: Weather) => void;
  vi.mocked(fetchWeather).mockImplementation(() => new Promise<Weather>(done => { resolve = done; }));
  act(() => { renderer = create(<App />); });
  const city = { id: 1, name: '杭州', latitude: 30.2, longitude: 120.2 };
  let request!: Promise<void>;
  act(() => { request = renderer!.root.findByType(CitySearch).props.onSelect(city); });
  const cancel = renderer!.root.findAllByType('button').find(button => button.children.includes('取消查询'));
  expect(cancel).toBeDefined();
  act(() => cancel!.props.onClick());
  expect(renderer!.root.findByType(CitySearch).props.disabled).toBe(false);
  await act(async () => {
    resolve({ date: '2026-10-13', temperature: 20, apparentTemperature: 20, humidity: 50, weatherCode: 0, windSpeed: 5 });
    await request;
  });
  expect(renderer!.root.findAllByType(PosterCard)).toHaveLength(0);
});
