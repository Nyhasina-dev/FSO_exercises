import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { WEATHER_API_KEY } from "../config";

const CountryList = ({ countries, onSelectCountry }) => {
  const [weather, setWeather] = useState(null);
  const api_key = WEATHER_API_KEY;
  const country = countries.length === 1 ? countries[0] : null;
  const capital = country?.capital?.[0];
  useEffect(() => {
    if (!capital) {
      return;
    }
    axios
      .get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: capital,
          appid: api_key,
          units: "metric",
        },
      })
      .then((response) => {
        setWeather(response.data);
      })
      .catch((error) => {
        console.error("Meteo Error:", error);
        setWeather(null);
      });
  }, [capital, api_key]);

  if (countries.length > 10) {
    return <p> Too many matches, specify another filter</p>;
  }

  if (countries.length > 1) {
    return (
      <ul>
        {countries.map((country) => {
          return (
            <React.Fragment key={country.cca3}>
              <li>{country.name.common}</li>
              <button onClick={() => onSelectCountry(country)}>show</button>
            </React.Fragment>
          );
        })}
      </ul>
    );
  }

  if (countries.length === 1) {
    const country = countries[0];
    return (
      <div>
        <h2>{country.name.common}</h2>
        <p>Capital: {country.capital?.[0]}</p>
        <p> Area: {country.area} km²</p>
        <h4>Langages: </h4>
        <ul>
          {Object.values(country.languages).map((lang) => (
            <li key={lang}>{lang}</li>
          ))}
        </ul>

        <img
          src={country.flags.png}
          alt={`Flag of ${country.name.common}`}
          style={{ width: "150px", border: "1px solid #ccc" }}
        />

        {weather && (
          <div>
            <h3>Weather in {capital}</h3>
            <p>Temperature: {weather.main.temp} °C</p>
            <p>Wind: {weather.wind.speed} m/s</p>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default CountryList;
