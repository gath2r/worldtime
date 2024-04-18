var map;
var currentTime24, currentTime12; // 전역 변수로 선언
var zoneName = null; // 전역 변수로 시간대 이름 저장

document.addEventListener('DOMContentLoaded', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            initMap(lat, lon);
        }, function() {
            initMap(51.505, -0.09); // Default location if geolocation fails
        });
    } else {
        alert("Geolocation is not supported by this browser.");
        initMap(51.505, -0.09); // Default location if geolocation is not supported
    }

    function initMap(lat, lon) {
        map = L.map('map').setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        map.on('click', function(e) {
            showMarkerAndTimezone(e.latlng.lat, e.latlng.lng);
        });
    }

    function showMarkerAndTimezone(lat, lon) {
        if (map.currentMarker) {
            map.removeLayer(map.currentMarker);
        }

        var customIcon = L.icon({
            iconUrl: 'https://i.postimg.cc/d3YFsnJB/map-location-icon-129048.png',
            iconSize: [38, 35],
            iconAnchor: [22, 34],
            popupAnchor: [-3, -76]
        });
        map.currentMarker = L.marker([lat, lon], {icon: customIcon}).addTo(map);

        fetchTimezoneInfo(lat, lon);
    }

    function fetchTimezoneInfo(lat, lon) {
        fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=QLTUCRKUM8ZG&format=json&by=position&lat=${lat}&lng=${lon}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'OK') {
                    zoneName = data.zoneName;
                    updateCurrentTime();
                    setInterval(updateCurrentTime, 1000); // 매초마다 시간 업데이트
                } else {
                    alert("시간대 정보를 찾을 수 없습니다.");
                }
            })
            .catch(error => {
                alert('시간대 조회 중 오류가 발생했습니다: ' + error.message);
            });
    }

    function updateCurrentTime() {
        if (zoneName) {
            currentTime24 = moment().tz(zoneName).format('YYYY-MM-DD HH:mm:ss');
            currentTime12 = moment().tz(zoneName).format('YYYY-MM-DD hh:mm:ss A');
            displayTime();
        } else {
            console.log("Zone name not set.");
        }
    }

    function displayTime() {
        var timeInfo = document.getElementById('timeInfo');
        timeInfo.innerHTML = "<button onclick='toggleTimeFormat()'>AM/PM OR 24TIME</button><div id='timeDisplay'>" + currentTime24 + "</div>";
    }

    window.toggleTimeFormat = function() {
        var timeDisplay = document.getElementById('timeDisplay');
        if (timeDisplay.innerHTML === currentTime24) {
            timeDisplay.innerHTML = currentTime12;
        } else {
            timeDisplay.innerHTML = currentTime24;
        }
    };

    var searchInput = document.getElementById('searchInput');
    var searchButton = document.getElementById('searchButton');

    searchButton.addEventListener('click', searchLocation);
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchLocation();
        }
    });

    function searchLocation() {
        var searchQuery = searchInput.value;
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    var lat = data[0].lat;
                    var lon = data[0].lon;
                    map.setView([lat, lon], 13);
                } else {
                    alert("No search results found.");
                }
            })
            .catch(error => {
                alert('Error during search: ' + error.message);
            });
    }
});
