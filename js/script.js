
import {create_option} from "./helpers";

const INPUT_SEARCH_LOCATION         = document.getElementById('js-search-location');
const SELECT_RESULT                 = document.getElementById("result");

const WEATHER_ICON                  = document.querySelector(".js-current-icon");
const WEATHER_REQUEST_FORM          = document.querySelector(".js-weather-request-form");
const LOCATION                      = document.querySelector(".js-location-country");
const TEMPERATURE                   = document.querySelector(".js-current-temp");
const WIND                          = document.querySelector(".js-current-wind");
const PRECIP                        = document.querySelector(".js-current-precip");
const PRESSURE                      = document.querySelector(".js-current-pressure");
const GRADUS                        = document.querySelector(".js-temp-gradus");
const DESCRIPTION_WEATHER           = document.querySelector(".js-description-inner");
const CURRENT_DATA                  = document.querySelector(".js-current-date");
const FUTURE_DATA                   = document.querySelectorAll(".js-future-date");
const FUTURE_ICON                   = document.querySelectorAll(".js-future-icon");
const FUTURE_TEMP                   = document.querySelectorAll(".js-future-temp");
const FUTURE_GRADUS                 = document.querySelectorAll(".js-future-gradus");

let ukraineCity = [];
let lat;
let lon;
let api_key = "";
/**
 * get API from file, which is in gitignore
 * @returns {Promise<void>}
 * @constructor
 */
const REQUEST_API_KEY = async ()=>{
    fetch('/weather/key.json')
        .then(
            function (response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }
                response.json().then(function (data){
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].name === "MY_KEY") {
                            api_key = data[i].key;
                        }
                    }
                })
            })
};
const requestApi = REQUEST_API_KEY();

/**
 * performs request to json file and get base of cities, then filter ukraine's cities and create option in select
 * @returns {Promise<void>}
 */
const cityRequest = async () => {
    fetch('/weather/city.list.json')
        .then(
            function (response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }
                response.json().then(function (data) {

                    for (let i = 0; i < data.length; i++) {
                        if (data[i].country === "UA") {
                            ukraineCity.push(data[i]);
                            create_option('result', data[i].name);
                        }
                    }
                })
            })
};
let city = cityRequest();

/**
 * Enter and 'live' search in input
 */
(INPUT_SEARCH_LOCATION) && INPUT_SEARCH_LOCATION.addEventListener('input', event => {
    event.preventDefault();
    let  filter, allOptions ;
    filter = INPUT_SEARCH_LOCATION.value.toUpperCase();
    SELECT_RESULT.classList.add('active');
    allOptions = SELECT_RESULT.getElementsByTagName("option");
    for (let i = 0; i < allOptions.length; i++) {
        let txt = allOptions[i].text;
        if (txt.toUpperCase().indexOf(filter) > -1) {
            allOptions[i].style.display = "";
        } else {
            allOptions[i].style.display = "none";
        }
    }
});
/**
 * when user choice city, his name we insert in input
 */
SELECT_RESULT.addEventListener('change', event => {
    event.preventDefault();
    //console.log('ok');
    let tex = SELECT_RESULT.options[SELECT_RESULT.selectedIndex].text;
    //console.log('text', tex);
    INPUT_SEARCH_LOCATION.value = tex;
});

/**
 * convert date from unix format
 * @param timestamp
 * @returns {string}
 */
const getCurrentTimeFromStamp = function (timestamp) {
    let d = new Date(timestamp * 1000);
    let timeStampCon = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();

    return timeStampCon;
};
/**
 * Retrieve weather for user selected location
 * @param location
 * @param weather_box
 * @return {Promise.<void>}
 * fbef056026b1609515d49ab0bb9fc291
 */
const weather_request = async () => {

    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${api_key}`)

        .then(response => response.json())
        .then(response => {
            let data = response;
            //console.log(data);
            WEATHER_ICON.src            = `http://openweathermap.org/img/w/${data.current.weather[0].icon}.png`;
            CURRENT_DATA.innerHTML      = getCurrentTimeFromStamp(data.current.dt);
            TEMPERATURE.innerHTML       = Math.floor(data.current.temp);
            GRADUS.classList.add('active');
            WIND.innerHTML              = data.current.wind_speed;
            PRECIP.innerHTML            = data.current.humidity;
            PRESSURE.innerHTML          = data.current.pressure;
            DESCRIPTION_WEATHER.classList.add('active');
            //console.log('id', data.current.weather[0].id);

            data.daily.forEach(function (item, index) {
                FUTURE_DATA[index].innerHTML    = getCurrentTimeFromStamp(data.daily[index + 1].dt);
                FUTURE_ICON[index].src          = `http://openweathermap.org/img/w/${data.daily[index + 1].weather[0].icon}.png`;
                FUTURE_TEMP[index].innerHTML    = Math.floor(data.daily[index + 1].temp.eve);
                FUTURE_GRADUS[index].classList.add('active');
            })
        })
        .catch(err => {
            console.log(err);
        });
};
/**
 * read name city in input, search his in array Ukrainian city, and take dates about your lon and lat
 * when user down on button, send request for get weather
 */
(WEATHER_REQUEST_FORM) && WEATHER_REQUEST_FORM.addEventListener('submit', event => {
    event.preventDefault();
    SELECT_RESULT.classList.remove('active');
    const newLocation = event.target.querySelector('#js-search-location').value;
    for (let i = 0; i < ukraineCity.length; i++) {

        if (ukraineCity[i].name === newLocation) {
            //console.log('my city', ukraineCity[i]);
            lat = ukraineCity[i].coord.lat;
            lon = ukraineCity[i].coord.lon;
        }
    }
    LOCATION.innerHTML = newLocation;
    weather_request();
});