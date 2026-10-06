import { useEffect, useState } from 'react'

function formatDate(date) {
  return date.toString().split(' ').slice(0, 4).join(' ')
}

export default function App() {
  const [dateLabel] = useState(() => formatDate(new Date()))
  const [weather, setWeather] = useState('fetching weather…')
  const [news, setNews] = useState({ status: 'loading', articles: [] })

  useEffect(() => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY
    if (!apiKey) {
      setWeather('Add VITE_WEATHER_API_KEY to load the weather')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const params = new URLSearchParams({
          units: 'metric',
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          appid: apiKey,
        })
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?${params}`,
          )
          if (!response.ok) throw new Error('Weather request failed')
          const data = await response.json()
          setWeather(`It is ${data.main.temp}°C right now`)
        } catch {
          setWeather('Unable to retrieve the weather')
        }
      },
      () => setWeather('Unable to retrieve your location for weather'),
    )
  }, [])

  useEffect(() => {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY
    if (!apiKey) {
      setNews({
        status: 'error',
        articles: [],
        message: 'Add VITE_NEWS_API_KEY to load the news',
      })
      return
    }

    const params = new URLSearchParams({
      sources: 'the-next-web',
      apiKey,
    })

    fetch(`https://newsapi.org/v2/top-headlines?${params}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('News request failed')
        return response.json()
      })
      .then((data) => {
        setNews({ status: 'ready', articles: data.articles ?? [] })
      })
      .catch(() => {
        setNews({ status: 'error', articles: [], message: 'Unable to load the news' })
      })
  }, [])

  return (
    <>
      <h1>
        Hello! Today is <span>{dateLabel}</span>
      </h1>
      <hr />

      <h2>{weather}</h2>
      <hr />

      <h2>Latest news</h2>
      <div id="news">
        {news.status === 'loading' && 'fetching news…'}
        {news.status === 'error' && news.message}
        {news.status === 'ready' &&
          news.articles.map((article) => (
            <a key={article.url} href={article.url}>
              {article.title}
            </a>
          ))}
      </div>
      <p>
        Powered by <a href="https://newsapi.org/">NewsAPI</a> and{' '}
        <a href="https://openweathermap.org/">OpenWeatherMap</a>
      </p>
    </>
  )
}
