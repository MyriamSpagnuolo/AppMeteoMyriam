# App Meteo (Node.js + Open-Meteo API)

Script Node.js che recupera il meteo attuale e le previsioni sui giorni successivi per una città, usando le API pubbliche di [Open-Meteo](https://open-meteo.com/).

## Funzionalità

- **Meteo attuale**: temperatura, velocità del vento e condizione meteo (tradotta da codice WMO in descrizione leggibile in italiano)
- **Previsioni multi-giorno**: temperatura massima/minima e condizione per ciascun giorno richiesto (fino a 16)
- Geocoding automatico: basta il nome della città, nessuna coordinata da inserire manualmente

## Struttura del progetto

```
weather-app/
├── weather.js         ← logica principale (geocoding, meteo attuale, previsioni)
├── weather.test.js     ← test Jest
├── package.json
└── README.md
```

## Prerequisiti

- Node.js 18 o superiore (serve `fetch` nativo)
- Jest, se vuoi eseguire i test: `npm install --save-dev jest`

## Utilizzo

```bash
node weather.js
```

Lo script di esempio in fondo a `weather.js` stampa il meteo attuale e le previsioni sui prossimi giorni per una città di default. Per usarlo in un tuo script:

```javascript
const { getWeatherByCity, getForecastByCity } = require('./weather');

getWeatherByCity('Napoli').then(console.log);
getForecastByCity('Napoli', 5).then(console.log); // previsioni sui prossimi 5 giorni
```

## Test

```bash
npx jest
```

I test mockano le chiamate `fetch`, quindi non servono connessione o chiamate reali all'API per eseguirli.

## API utilizzate

- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search` — converte il nome città in coordinate
- **Forecast**: `https://api.open-meteo.com/v1/forecast` — meteo attuale (parametro `current`) e previsioni giornaliere (parametro `daily`)

Nessuna API key richiesta per uso non commerciale.

## Licenza dati

I dati meteo sono forniti da [Open-Meteo.com](https://open-meteo.com/), distribuiti sotto licenza **Creative Commons Attribution 4.0 International (CC BY 4.0)**.

## Possibili miglioramenti futuri

- Meteo per più città contemporaneamente
- Gestione più robusta dei limiti di richieste dell'API (rate limiting)
