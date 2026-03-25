import fetch from 'node-fetch';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export async function getWeatherForLocation({ lat, lng, date }) {
  if (!OPENWEATHER_API_KEY) {
    return getMockWeather(date);
  }

  try {
    // For current/near-future, use forecast API
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=40`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== '200') {
      return getMockWeather(date);
    }

    // Find closest forecast to the date
    const targetDate = new Date(date).getTime();
    const closest = data.list.reduce((prev, curr) => {
      const prevDiff = Math.abs(new Date(prev.dt * 1000) - targetDate);
      const currDiff = Math.abs(new Date(curr.dt * 1000) - targetDate);
      return currDiff < prevDiff ? curr : prev;
    });

    return {
      temp: Math.round(closest.main.temp),
      feelsLike: Math.round(closest.main.feels_like),
      humidity: closest.main.humidity,
      description: closest.weather[0].description,
      icon: closest.weather[0].icon,
      windSpeed: closest.wind.speed,
    };
  } catch (err) {
    console.error('Weather service error:', err.message);
    return getMockWeather(date);
  }
}

function getMockWeather(date) {
  const icons = ['01d', '02d', '03d', '10d', '13d'];
  const descs = ['Clear skies', 'Partly cloudy', 'Overcast', 'Light rain', 'Sunny'];
  const idx = new Date(date).getDate() % 5;
  return {
    temp: 20 + (idx * 2),
    feelsLike: 18 + (idx * 2),
    humidity: 55 + idx * 5,
    description: descs[idx],
    icon: icons[idx],
    windSpeed: 10 + idx,
    isMock: true,
  };
}
