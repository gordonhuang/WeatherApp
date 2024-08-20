const key = "2dc288e2ce1b3694e41f35a68579c615";

// Uses GeoLocation API to return coordinates
function getCoords() {
    return new Promise((success, failure) => {
        navigator.geolocation.getCurrentPosition(
            (position) => success(position.coords),
            (error) => failure(error)
        );
    });
}

// Locates user and retrieves weather based on their coordinates
async function locateUser() {
    try {
        const coords = await getCoords();
        const lat = coords.latitude;
        const lon = coords.longitude;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
        const response = await fetch(url, {method: "GET"});
        
        if (!response.ok) {
            throw new Error(`Response not ok. Status: ${response.status}`);
        }

        const data = await response.json();
        // Setting search bar's content to user's coordinates
        document.getElementById("search-text").value = lat + ", " + lon;
        setWeather(data);
    } catch (error) {
        invalidSearch();
        console.error("Error locating user: ", error);
    }
}

// Uses user input to search for weather
async function searchLocation() {
    try {
        const search = document.getElementById("search-text").value.trim();
        let url;
        // If digits are in the user input latitude and longitude search will be used
        if (/\d/.test(search)) {
            const coords = search.replace(" ", "").split(",");
            if (coords.length === 2) {
                const lat = coords[0].trim();
                const lon = coords[1].trim();
                if (isNaN(lat) || isNaN(lon)) {
                    throw new Error("Invalid coordinates");
                } else {
                    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;    
                }
            } else {
                throw new Error("Invalid format for coordinates");
            }
        // Default search using city name and country code
        } else {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${key}&units=metric`;
        }
        const response = await fetch(url, {method: "GET"});

        if (!response.ok) {
            throw new Error(`Response not ok. Status: ${response.status}`);
        }
        
        const data = await response.json();
        setWeather(data);
    } catch (error) {
        invalidSearch();
        console.error("Error searching location: ", error);
    }
}

// Using weather information retrieved to update corresponding elements on the page
function setWeather(data) {
    const city = document.getElementById("location");
    // Cities with more than 13 letters can not fit in bot
    if (data.name.length > 13) {
        // Add scrolling animation to the city depending on how many letters there are
        document.documentElement.style.setProperty("--scroll-percent", `-${(data.name.length - 13) * 9}%`);
        console.log(city.offsetWidth);
        console.log(city.offsetHeight);
        city.classList.add("scroll-animation");
    } else {
        city.classList.remove("scroll-animation");
    }
    city.textContent = data.name;

    const temperature = document.getElementById("temperature");
    temperature.textContent = Math.round(data.main.temp) + "°ᶜ";
    // Setting the picture for the weather condition
    const weather = document.getElementById("weather");
    setWeatherPicture(weather, data.weather[0], data.weather[0].icon.includes("d"));

    const condition = document.getElementById("condition");
    condition.textContent = data.weather[0].main;

    const feelsLike = document.getElementById("feels-like");
    feelsLike.textContent = Math.round(data.main.feels_like) + "°ᶜ";

    const humidity = document.getElementById("humidity");
    humidity.textContent = data.main.humidity + "%";
    // Converting m/s to km/h 
    const wind = document.getElementById("wind");
    wind.textContent = Math.round(data.wind.speed * 3.6) + " km/h";
}

// Sets the corresponding image for the weather condition
function setWeatherPicture(element, weatherInfo, isDayTime) {
    const weatherIcons = {
        thunder: "thunder.svg",
        rain: "rain.svg",
        snow: "snow.svg",
        mist: "mist.svg",
        clear: isDayTime ? "clear.svg" : "clear-night.svg",
        fewClouds: isDayTime ? "few-clouds.svg" : "few-clouds-night.svg",
        scatteredClouds: "scattered-clouds.svg",
        brokenClouds: "broken-clouds.svg",
        overcastClouds: "overcast-clouds.svg",
    };

    const weatherCode = weatherInfo.id;
    let icon;

    if (weatherCode >= 200 && weatherCode < 300) {
        icon = "thunder";
    } else if ((weatherCode >= 300 && weatherCode < 400) || (weatherCode >= 500 && weatherCode < 600)) {
        icon = "rain";
    } else if (weatherCode >= 600 && weatherCode < 700) {
        icon = "snow";
    } else if (weatherCode >= 700 && weatherCode < 800) {
        icon = "mist";
    } else if (weatherCode === 800) {
        icon = "clear";
    } else if (weatherCode > 800 && weatherCode < 900) {
        let desc = weatherInfo.description;
        // Matching cloud descriptions with the right image
        if (desc === "few clouds") {
            icon = "fewClouds";
        } else if (desc === "scattered clouds") {
            icon = "scatteredClouds";
        } else if (desc === "broken clouds") {
            icon = "brokenClouds";
        } else if (desc === "overcast clouds") {
            icon = "overcastClouds";
        }
    }
    
    element.src = `images/weather-conditions/${weatherIcons[icon]}`;
}

// Sets page elements to null when user makes an invalid search
function invalidSearch() {
    document.getElementById("location").classList.remove("scroll-animation");
    document.getElementById("location").textContent = "N/A";
    document.getElementById("temperature").textContent = ""
    document.getElementById("weather").src = "images/invalid.svg";
    document.getElementById("condition").textContent = "Oops! Location not found";
    document.getElementById("feels-like").textContent = "n/a";
    document.getElementById("humidity").textContent = "n/a";
    document.getElementById("wind").textContent = "n/a";
}

// Listening for when the user presses "enter" in the input field and makes a search
document.getElementById("search-text").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchLocation();
    }
});

// Locate the user upon loading the page
locateUser();