var battalions;
var stations;
initVars();


function initVars() {
    $.getJSON('https://api.myjson.com/bins/ux6tx', function(data) {
        battalions = data;  
    });

    $.getJSON('https://api.myjson.com/bins/q5f9v', function(data) {
        stations = data;  
    });
}

function onSliderChange(val) {
    var time;

    if (val == 0)
        time = "12:00 AM";
    else if (val == 12)
        time = "12:00 PM";
    else if (val / 12 >= 1) {
        time = "" + val % 12 + ":00 PM";
    } else {
        time = "" + val + ":00 AM";
    }
    $('#timeText').text(time);
}

function initGeo() {
    var geocoder = new google.maps.Geocoder();
    document.getElementById('submitButton').addEventListener('click', function() {
        geocodeAddress(geocoder);
    });
}

function geocodeAddress(geocoder) {
    var address = document.getElementById('address').value;

    var data = {
        bounds: {
          west: 37.703021,
          east: 37.848657,
          south: -122.536031,
          north: -122.347089
        }
    };

    var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(data.bounds.south, data.bounds.west), 
        new google.maps.LatLng(data.bounds.north, data.bounds.east));

    if (address == "")
        alert('Please enter an address in the address field.');
    else {
        geocoder.geocode({'address': address, 'bounds':bounds}, function(results, status) {
            if (status === 'OK') {
                displayStats(results);
            } else {
            alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }
}

function displayStats(results) {

    document.getElementById("probability-card").style.visibility = "visible";
    
    var geodata = results[0];
    console.log(geodata);

    battalion = findBattalion(geodata);

    var time = document.getElementById('hourSlider').value;

    var most_likely_dispatch = battalion.most_likely_dispatch[time];
    
    var probs = {};

    for (i = 0; i < most_likely_dispatch.length; i++) {
        probs[most_likely_dispatch[i]] = battalion.dispatch_types[i];
    }

    most_likely_dispatch.sort().reverse();

    $('h5[id^="likely"]').each(function(index) {
        var curProb = (most_likely_dispatch[index] * 100).toFixed(2);
        $(this).text(probs[most_likely_dispatch[index]] + ": " + curProb  + "%");
    })
}

function findBattalion(geodata) {
    var closestStation = 1;
    var loc = geodata.geometry.location;
    var closestDistance = 10;

    //45 stations
    for (i = 1; i < 46; i++) {
        var latDif = loc.lat() - stations[i][0];
        var longDif = loc.lng() - stations[i][1];

        var totalDif = Math.sqrt(Math.pow(latDif,2) + Math.pow(longDif,2));

        if (i==1) {
            closestDistance = totalDif;
        }
        else {
            if (closestDistance > totalDif) {
                closestDistance = totalDif;
                closestStation = i;
            }
        }
    }
    
    //Find the battalion associated with the station
    //The stations have some values missing from the numbers
    var actualStationNumber;

    if (closestStation < 27)
        actualStationNumber = closestStation;
    else if (closestStation < 29)
        actualStationNumber = closestStation + 1;
    else if (closestStation < 43)
        actualStationNumber = closestStation + 2
    else if (closestStation == 43)
        actualStationNumber = 48;
    else if (closestStation == 44)
        actualStationNumber = 49;
    else if (closestStation == 45)
        actualStationNumber = 51;
    
    var battalion_number = stationToBattalion(actualStationNumber);
    
    for (var key in battalions) {
        if (battalions[key].number == battalion_number)
            battalion = battalions[key];
    }

    return battalion;
}

function stationToBattalion(stationNumber) {
    if (stationNumber == 2 || stationNumber == 13 || stationNumber == 28 || stationNumber == 41 )
        return 1;
    else if (stationNumber == 1 || stationNumber == 6 || stationNumber == 29 || stationNumber == 36)
        return 2;
    else if (stationNumber == 4 || stationNumber == 8 || stationNumber == 35 || stationNumber == 48)
        return 3;
    else if (stationNumber == 3 || stationNumber == 16 || stationNumber == 38 || stationNumber == 51)
        return 4;
    else if (stationNumber == 5 || stationNumber == 10 || stationNumber == 12 || stationNumber == 21)
        return 5;
    else if (stationNumber == 7 || stationNumber == 11 || stationNumber == 24 || stationNumber == 26
            || stationNumber == 32)
        return 6;
    else if (stationNumber == 14 || stationNumber == 22 || stationNumber == 31 || stationNumber == 34)
        return 7;
    else if (stationNumber == 18 || stationNumber == 20 || stationNumber == 23 || stationNumber == 40)
        return 8;
    else if (stationNumber == 15 || stationNumber == 19 || stationNumber == 33 || stationNumber == 39
            || stationNumber == 43)
        return 9;
    else
        return 10;
}

function getSize(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}