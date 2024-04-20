var map;
var currentMarker;
var infoWindow;
var zoneName = null;
var currentTime24, currentTime12;
var updateTimeInterval = null;
var is24HourFormat = true;  // 시간 형식을 추적하는 변수, 초기값은 24시간 형식

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    document.getElementById('searchInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchLocation();
        }
    });
});

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 51.505, lng: -0.09}
    });

    infoWindow = new google.maps.InfoWindow();

    map.addListener('click', function(e) {
        showMarkerAndTimezone(e.latLng.lat(), e.latLng.lng());
        fetchWeather(e.latLng.lat(), e.latLng.lng());
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            map.setCenter({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
        }, function() {
            handleLocationError(true, map.getCenter());
        });
    }
}

function showMarkerAndTimezone(lat, lon) {
    if (currentMarker) {
        currentMarker.setMap(null);
    }
    currentMarker = new google.maps.Marker({
        position: {lat: lat, lng: lon},
        map: map
    });
    fetchTimezoneInfo(lat, lon);
}

function fetchWeather(lat, lon) {
    const apiKey = 'c3f294d7a25fd0c71085f8421fc741ab';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const weather = data.weather[0].description;
            const temp = data.main.temp;
            const content = `Temperature: ${temp}°C<br>Weather: ${weather}`;
            infoWindow.setContent(content);
            infoWindow.setPosition({lat: lat, lng: lon});
            infoWindow.open(map);
            infoWindow.setOptions({
                pixelOffset: new google.maps.Size(0, -40)  // 정보 창의 위치 조정
            });
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function fetchTimezoneInfo(lat, lon) {
    if (updateTimeInterval) clearInterval(updateTimeInterval);
    var apiUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=QLTUCRKUM8ZG&format=json&by=position&lat=${lat}&lng=${lon}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                zoneName = data.zoneName;
                updateCurrentTime();
                updateTimeInterval = setInterval(updateCurrentTime, 1000);
            } else {
                alert("Time zone data not found.");
            }
        })
        .catch(error => console.error('Error fetching timezone data:', error));
}

function updateCurrentTime() {
    if (zoneName) {
        currentTime24 = moment().tz(zoneName).format('YYYY-MM-DD HH:mm:ss');
        currentTime12 = moment().tz(zoneName).format('YYYY-MM-DD hh:mm:ss A');
        displayTime();
    }
}

function displayTime() {
    var timeInfo = document.getElementById('timeInfo');
    var displayTime = is24HourFormat ? currentTime24 : currentTime12;
    timeInfo.innerHTML = `<div id='timeDisplay'>${displayTime}</div><button onclick='toggleTimeFormat()'>Switch to ${is24HourFormat ? "AM/PM" : "24-Hour"}</button>`;
}

function toggleTimeFormat() {
    is24HourFormat = !is24HourFormat;
    displayTime();
}

function searchLocation() {
    var searchQuery = document.getElementById('searchInput').value;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': searchQuery}, function(results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            if (currentMarker) currentMarker.setMap(null);
            currentMarker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            fetchWeather(results[0].geometry.location.lat(), results[0].geometry.location.lng());
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function handleLocationError(browserHasGeolocation, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesnt support geolocation.');
    infoWindow.open(map);
}
