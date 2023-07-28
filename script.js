// Weather api
const apiKey = 'd4cf702f064ac2d9644fc4309bbb0973';

let latitude = ''
let longitude = ''

const weatherCards = document.getElementById('weather-cards');
const city = 'Kathmandu'; // Replace with the city you want to get the weather forecast for
const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

fetch(apiUrl).then(response => response.json()).then(data => { // Filter the weather data to only include the next 5 days, including today
    const forecast = data.list.filter(item => {
        const date = new Date(item.dt_txt);
        return date.getHours() === 12;
    }).slice(0, 5);

    // Create a card for each day's weather forecast
    forecast.forEach(day => {
        const card = document.createElement('div');
        card.classList.add('card');
        const cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');
        cardHeader.textContent = new Date(day.dt_txt).toLocaleDateString('en-US', {weekday: 'long'});
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        const iconUrl = `https://openweathermap.org/img/w/${
            day.weather[0].icon
        }.png`;
        const icon = document.createElement('img');
        const city = document.createElement('p');
        city.textContent = `City: Kathmandu`;
        icon.src = iconUrl;
        icon.alt = day.weather[0].description;
        const temp = document.createElement('p');
        temp.textContent = `Temperature: ${
            (day.main.temp - 273.15).toFixed(1)
        }°C`;
        const humidity = document.createElement('p');
        humidity.textContent = `Humidity: ${
            day.main.humidity
        }%`;
        cardBody.appendChild(icon);
        cardBody.appendChild(temp);
        cardBody.appendChild(humidity);
        card.appendChild(cardHeader);
        card.appendChild(city);
        card.appendChild(cardBody);
        weatherCards.appendChild(card);
    });
}).catch(error => console.error(error));


// Forecaset dangers api
const forecastDangers = document.querySelector('.chat-text');

fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=3&orderby=time&limit=100').then(response => response.json()).then(data => {
    forecastDangers.innerHTML = `
      <p>
        ${
        data.features.map(feature => `<p>${
            feature.properties.title
        }</p>`).join('')
    }
      </p>
    `;
}).catch(error => {
    forecastDangers.innerHTML = `<p>Error fetching earthquake hazards data: ${error}</p>`;
});


// news api
const newsContainer = document.getElementById('news-container');

fetch('https://newsapi.org/v2/top-headlines?q=weather&apiKey=1cbf04db8b87488380a07aea817f9a8b').then(response => response.json()).then(data => {
    const news = data.articles.slice(0,);

    news.forEach(article => {
        const card = document.createElement('div');
        card.classList.add('card', 'mb-3');
        card.style.maxWidth = '540px';

        const img = document.createElement('img');
        img.src = article.urlToImage || 'https://via.placeholder.com/150';
        img.classList.add('card-img-top');
        img.alt = article.title;

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const title = document.createElement('h5');
        title.classList.add('card-title');
        title.textContent = article.title;

        const desc = document.createElement('p');
        desc.classList.add('card-text');
        desc.textContent = article.description;

        const date = document.createElement('p');
        date.classList.add('card-text', 'text-muted');
        date.textContent = new Date(article.publishedAt).toLocaleDateString();

        cardBody.appendChild(img);
        cardBody.appendChild(title);
        cardBody.appendChild(desc);
        cardBody.appendChild(date);

        card.appendChild(cardBody);
        newsContainer.appendChild(card);
    });
}).catch(error => console.error(error));

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');


searchButton.addEventListener('click', () => {
    const city = searchInput.value.trim();

    if (city) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        fetch(apiUrl).then(response => response.json()).then(data => {
            latitude = data.coord.lat;
            longitude = data.coord.lon;
            cityName.textContent = data.name;
            temperature.textContent = `${
                data.main.temp.toFixed(1)
            }°C`;
            description.textContent = data.weather[0].description;
            humidity.textContent = `Humidity: ${
                data.main.humidity
            }%`;
            windSpeed.textContent = `Wind speed: ${
                data.wind.speed
            } m/h`;



            /// Get prediction
            getStormPrediction(city)

            // / Map box
            const weatherInfo = document.getElementById('map');

            const mapboxApiKey = 'pk.eyJ1IjoiYWxlcDQ1IiwiYSI6ImNsZ3NmaDZrNjB3YXYzcG1rb2Y5ZTh1YnYifQ.W8uYyJna3NYRIVoziQdxXA';

            const map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [
                    longitude, latitude
                ],
                zoom: 10,
                accessToken: mapboxApiKey
            });

        }).catch(function (error) {


            return console.error(error);
        });
    }
});

function getStormPrediction(locationName) { // Build the URL with the locationName parameter
    const url = `http://localhost:5000/predict?location=${locationName}`;

    // Make the HTTP GET request
    fetch(url).then(response => response.json()).then(data => { // Handle the response data here
        console.log(data['prediction'])
        const possibleDisaster = document.getElementById('possible-disaster');
        possibleDisaster.innerHTML =  data['prediction'] + ' chances of storm.'
    }).catch(error => { // Handle any errors here
        console.error(error);
    });
}


