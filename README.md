# Snowboard
This is a simple dashboard where Iput the stats I check the most, so that i didn't have to alt+tab constantly.

## Features
- **Weather**: Snowboard asks for browser location to display your current weather and tomorrow's forecast
- **News**: Top three headlines from NewsApi, you'll be redirected to the whole article by clicking on them
- **Coding Time**: You'll be asked to paste your hackatime API key into a text input. It's not very intuitive so I added the link to where to find it below
- **Device**:  Battery is read from browser, I couldn't make it so that it can display cpuTemp without user running locally

## Structure
I made it using React + Vite for frontend and pure JavaScript for backend, with the additional TailwindCSS framework for styling. I also used tspartciles to add the little snow effect detail on the weather's snowglobe.

## APIs

- Weather: https://openweathermap.org
- News: https://newsapi.com
- Coding Time: https://hackatime.hackclub.com