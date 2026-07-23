/**
 * weather.js
 * -----------------------------------------------------------
 * Tutta la logica in un unico file: dal nome città ai dati meteo.
 * Nessuna gestione del DOM: solo funzionamento.
 * -----------------------------------------------------------
 * Dati meteo forniti da Open-Meteo.com, distribuiti sotto licenza
 * Creative Commons Attribution 4.0 International (CC BY 4.0).
 * -----------------------------------------------------------
 */

// Mappa dei "weather code" di Open-Meteo in descrizioni leggibili.
// Fonte: documentazione ufficiale Open-Meteo (WMO Weather interpretation codes)
const WEATHER_CODES = {
  0: "Cielo sereno",
  1: "Prevalentemente sereno",
  2: "Parzialmente nuvoloso",
  3: "Nuvoloso",
  45: "Nebbia",
  48: "Nebbia con brina",
  51: "Pioggerella leggera",
  53: "Pioggerella moderata",
  55: "Pioggerella intensa",
  61: "Pioggia leggera",
  63: "Pioggia moderata",
  65: "Pioggia forte",
  71: "Neve leggera",
  73: "Neve moderata",
  75: "Neve forte",
  80: "Rovesci leggeri",
  81: "Rovesci moderati",
  82: "Rovesci violenti",
  95: "Temporale",
  96: "Temporale con grandine",
  99: "Temporale con grandine forte",
};

/**
 * Converte il nome di una città nelle sue coordinate geografiche.
 * Open-Meteo, infatti, vuole latitudine/longitudine, non il nome della città.
 *
 * @param {string} cityName
 * @returns {Promise<{ name: string, country: string, latitude: number, longitude: number }>}
 */
async function geocodeCity(cityName) {
  if (!cityName || cityName.trim() === "") {
    throw new Error("Il nome della città non può essere vuoto.");
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    cityName.trim()
  )}&count=1&language=it&format=json`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    throw new Error("Impossibile contattare il servizio di geocoding (controlla la connessione).");
  }

  if (!response.ok) {
    throw new Error("Errore nella ricerca della città.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`Nessuna città trovata con il nome "${cityName}".`);
  }

  const { name, country, latitude, longitude } = data.results[0];
  return { name, country, latitude, longitude };
}

/**
 * Recupera i dati meteo attuali per una coppia di coordinate.
 * Usa il parametro "current" (aggiornato) invece del deprecato "current_weather".
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{ temperature: number, windspeed: number, weatherCode: number }>}
 */
async function fetchCurrentWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    throw new Error("Impossibile contattare il servizio meteo (controlla la connessione).");
  }

  if (!response.ok) {
    throw new Error("Errore nel recupero dei dati meteo.");
  }

  const data = await response.json();
  const current = data.current;

  return {
    temperature: current.temperature_2m,
    windspeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
  };
}

/**
 * Recupera le previsioni meteo giornaliere per una coppia di coordinate.
 * Usa il parametro "daily" dell'API forecast di Open-Meteo.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} days - numero di giorni di previsione (1-16)
 * @returns {Promise<Array<{ date: string, tempMax: number, tempMin: number, condition: string }>>}
 */
async function fetchDailyForecast(latitude, longitude, days = 7) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=${days}&timezone=auto`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    throw new Error("Impossibile contattare il servizio meteo (controlla la connessione).");
  }

  if (!response.ok) {
    throw new Error("Errore nel recupero delle previsioni.");
  }

  const data = await response.json();
  const daily = data.daily;

  return daily.time.map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    condition: WEATHER_CODES[daily.weather_code[i]] || "Condizione sconosciuta",
  }));
}

/**
 * Combina geocoding + previsioni su più giorni per una città.
 *
 * @param {string} cityName
 * @param {number} days - numero di giorni di previsione (default 7)
 * @returns {Promise<{ city: string, country: string, forecast: Array<object> }>}
 */
async function getForecastByCity(cityName, days = 7) {
  const location = await geocodeCity(cityName);
  const forecast = await fetchDailyForecast(location.latitude, location.longitude, days);

  return {
    city: location.name,
    country: location.country,
    forecast,
  };
}

/**
 * Funzione principale: combina geocoding + meteo.
 *
 * @param {string} cityName
 * @returns {Promise<object>} dati meteo pronti all'uso
 */
async function getWeatherByCity(cityName) {
  const location = await geocodeCity(cityName);
  const weather = await fetchCurrentWeather(location.latitude, location.longitude);

  return {
    city: location.name,
    country: location.country,
    temperature: weather.temperature,
    windspeed: weather.windspeed,
    condition: WEATHER_CODES[weather.weatherCode] || "Condizione sconosciuta",
  };
}

module.exports = { geocodeCity, fetchCurrentWeather, fetchDailyForecast, getWeatherByCity, getForecastByCity };

// ---- Esempio di utilizzo ----
// Richiama la funzione e stampa il risultato in console.
getWeatherByCity("Roma")
  .then((data) => console.log(data))
  .catch((err) => console.error(err.message));

// Esempio: previsioni sui prossimi 5 giorni
getForecastByCity("Roma", 5)
  .then((data) => console.log(data))
  .catch((err) => console.error(err.message));
