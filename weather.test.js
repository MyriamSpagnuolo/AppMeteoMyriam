// weather.test.js
const { geocodeCity, fetchCurrentWeather, fetchDailyForecast, getWeatherByCity, getForecastByCity } = require('./weather');

beforeEach(() => {
  global.fetch = jest.fn();
});

// Test 1: geocodeCity restituisce correttamente i dati della città
test('geocodeCity restituisce nome, paese e coordinate corrette', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      results: [
        { name: 'Roma', country: 'Italia', latitude: 41.9, longitude: 12.5 }
      ]
    })
  });

  const result = await geocodeCity('Roma');

  expect(result).toEqual({ name: 'Roma', country: 'Italia', latitude: 41.9, longitude: 12.5 });
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

// Test 2: geocodeCity lancia un errore se la città non viene trovata
test('geocodeCity lancia un errore se non trova risultati', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ results: [] })
  });

  await expect(geocodeCity('CittàInesistente')).rejects.toThrow(
    'Nessuna città trovata con il nome "CittàInesistente".'
  );
});

// Test 3: fetchDailyForecast restituisce le previsioni giornaliere corrette
test('fetchDailyForecast restituisce data, temperature e condizione per ogni giorno', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      daily: {
        time: ['2026-07-24', '2026-07-25'],
        temperature_2m_max: [30, 28],
        temperature_2m_min: [20, 19],
        weather_code: [0, 61]
      }
    })
  });

  const result = await fetchDailyForecast(41.9, 12.5, 2);

  expect(result).toEqual([
    { date: '2026-07-24', tempMax: 30, tempMin: 20, condition: 'Cielo sereno' },
    { date: '2026-07-25', tempMax: 28, tempMin: 19, condition: 'Pioggia leggera' }
  ]);
});

// Test 4: getForecastByCity combina geocoding e previsioni correttamente
test('getForecastByCity restituisce città, paese e previsioni', async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ name: 'Milano', country: 'Italia', latitude: 45.5, longitude: 9.2 }]
      })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        daily: {
          time: ['2026-07-24'],
          temperature_2m_max: [27],
          temperature_2m_min: [18],
          weather_code: [2]
        }
      })
    });

  const result = await getForecastByCity('Milano', 1);

  expect(result).toEqual({
    city: 'Milano',
    country: 'Italia',
    forecast: [
      { date: '2026-07-24', tempMax: 27, tempMin: 18, condition: 'Parzialmente nuvoloso' }
    ]
  });
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
