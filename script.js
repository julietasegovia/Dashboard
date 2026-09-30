function loadDate(){
    var currentDate = new Date()
    var dateDtring = currentDate.toString().split(' ').splice(0, 4).join(' ')
    $('#date').text(dateString)
}

function loadWeather() {
    var weather = $('#weather')
    var url = 'api.openweathermap.org/data/2.5/weather'
    var apiKey = 'YOUR API KEY'

    function success(position) {
        var latitude = position.coords.latitude 
        var longitude = position.coords.longitude

        $.getJSON(
            url +
                '?units=si&lat=' +
                latitude +
                '&lon=' +
                longitude +
                '&appid=' +
                apiKey,
        function (data) {
            weather.text(
            'It is ' + main.temp + '°C right now'
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
    var apiKey = 'YOUR API KEY'

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