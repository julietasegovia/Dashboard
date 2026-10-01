function loadDate(){
    var currentDate = new Date()
    var dateString = currentDate.toString().split(' ').splice(0, 4).join(' ')
    $('#date').text(dateString)
}

function loadWeather() {
    var weather = $('#weather')
    var url = 'https://api.openweathermap.org/data/2.5/weather'
    var apiKey = WEATHER_API_KEY

    function success(position) {
        var latitude = position.coords.latitude 
        var longitude = position.coords.longitude

        $.getJSON(
            url +
                '?units=metric&lat=' +
                latitude +
                '&lon=' +
                longitude +
                '&appid=' +
                apiKey,
        function (data) {
            weather.text(
            'It is ' + data.main.temp + '°C right now'
            )
        }
    )}

    function error() {
        alert('Unable to retrieve your location for weather')
    }

    navigator.geolocation.getCurrentPosition(success, error)

    weather.text('fetching weather…')
}


function loadNews() {
    var news = $('#news')
    var url = 'https://newsapi.org/v2/top-headlines?sources=the-next-web&apiKey='
    var apiKey = NEWS_API_KEY

    $.getJSON(url + apiKey, function (data) {
        var titles = data.articles.map(function (articles) {
            return "<a href='" + articles.url + "'>" + articles.title + '</a>'
            })
        news.html(titles.join('<br><br>'))
    })
    news.text('fetching news…')
}

loadDate()
loadWeather()
loadNews()