const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards"); 

const API_KEY = "2c04c4f6bb65c8f0a3550369f663547d"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) { //for the main weather card
    return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
  } else { //for the next five days forecast
    return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
  }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
    // Filter the forecasts to get only one forecast per day
    const uniqueForecastDays = [];
    const fiveDaysForecast = data.list.filter(forecast => {
      const forecastDate = new Date(forecast.dt_txt).getDate();
      if (!uniqueForecastDays.includes(forecastDate)) {
        return uniqueForecastDays.push(forecastDate);
      }
    });

    // Previous weather data needs to be cleared
    cityInput.value = "";
    currentWeatherDiv.innerHTML = "";
    weatherCardsDiv.innerHTML = "";

    // Creating weather cards 
    fiveDaysForecast.forEach((weatherItem, index) => {
      const html = createWeatherCard(cityName, weatherItem, index);
      if (index === 0) {
        currentWeatherDiv.insertAdjacentHTML("beforeend", html);
      } else {
        weatherCardsDiv.insertAdjacentHTML("beforeend", html);
      }
    });
  }).catch(() => {
    alert("An error occurred while fetching the weather forecast");
  });
}

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim(); //clears empty space
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  //entered city coordinates (latitude, longitude, and name) from the API response
  fetch(API_URL).then(response => response.json()).then(data => {
    if (!data.length) return alert(`No coordinates found for ${cityName}`); //city error
    const { lat, lon, name } = data[0];
    getWeatherDetails(name, lat, lon);
  }).catch(() => {
    alert("An error occurred while fetching the coordinates");
  });
}

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords; // Get coordinates of user location
      //city name from coordinates
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(API_URL).then(response => response.json()).then(data => {
        const { name } = data[0];
        getWeatherDetails(name, latitude, longitude);
      }).catch(() => {
        alert("An error occurred while fetching the city name!");
      });
    },
    error => { //alert will appear if user will deny the location permission
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation request denied. Please reset location permission to grant access again.");
      } else {
        alert("Geolocation request error. Please reset location permission.");
      }
    });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates()); // User can use an enter button on their keyboard instead of search button on the website