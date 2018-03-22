var battalions;
var stations;
var closestStation;
initVars();

//Init the variables used for the address predictor
function initVars() {
    $.getJSON('https://api.myjson.com/bins/ux6tx', function(data) {
        battalions = data;  
    });

    $.getJSON('https://api.myjson.com/bins/q5f9v', function(data) {
        stations = data;  
    });
}

/*
 * Set the event for when the slider value is changed
 * @param val: current value of the slider
*/
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

/*
 * Initialize the geocoder
*/
function initGeo() {
    var geocoder = new google.maps.Geocoder();
    document.getElementById('submitButton').addEventListener('click', function() {
        geocodeAddress(geocoder);
    });
}

/*
 * Get the location of the address
 * @param geocoder: The google maps geocoder object
*/
function geocodeAddress(geocoder) {

    var address = document.getElementById('address').value;

    //Initialize the bounds for the geocoder
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

    //Check for a value not being entered in the address field.
    if (address == "")
        alert('Please enter an address in the address field.');
    else {

        geocoder.geocode({'address': address, 'bounds':bounds}, function(results, status) {
            //If the status was 'OK', then display the panel and initialize the Map
            if (status === 'OK') {
                displayStats(results);
                initMap(results[0]);
            } else {
                alert('Geocode was not successful. Either an incorrect address was entered, or the address is not in the San Francisco area.');
            }
        });
    }
}

function displayStats(results) {

    document.getElementById("probability-card").style.visibility = "visible";
    
    //Get the actual geodata
    var geodata = results[0];

    //Find the battalion the address lies in
    battalion = findBattalion(geodata);

    var time = document.getElementById('hourSlider').value;
    console.log(time)
    var dispatch_probabilities = battalion.most_likely_dispatch[time];
    
    //Keep a dictionary of the key being the probability and the value being the type of dispatch
    var probabilities = {};

    //Set the dictionary
    for (i = 0; i < dispatch_probabilities.length; i++) {
        probabilities[dispatch_probabilities[i]] = battalion.dispatch_types[i];
    }

    //Sort and reverse the dispatches to display them from greatest to least
    dispatch_probabilities.sort().reverse();

    //Loop through the <h5>s with the ID likely, and set the text to the probabilities
    $('h5[id^="likely"]').each(function(index) {
        var curProb = (dispatch_probabilities[index] * 100).toFixed(2);

        //Used the probabilities dict to dispaly the type of dispatch
        $(this).text(probabilities[dispatch_probabilities[index]] + ": " + curProb  + "%");
    })
}

/*
 *Find the battalion associated with a given location
 *@param geodata: the location of the address
*/
function findBattalion(geodata) {
    closestStation = 1;

    //Set the location variable
    var loc = geodata.geometry.location;
    var closestDistance;

    //45 stations
    for (i = 1; i < 46; i++) {

        //Get the differences in lat and lng, then apply Pythagorean thm to get distance
        var latDif = loc.lat() - stations[i][0];
        var longDif = loc.lng() - stations[i][1];

        var totalDif = Math.sqrt(Math.pow(latDif,2) + Math.pow(longDif,2));

        if (i==1) {
            //Set the first closest difference
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
    
    //Get the battalion associated with the closest station
    var battalion_number = stationToBattalion(actualStationNumber);
    
    for (var key in battalions) {
        if (battalions[key].number == battalion_number)
            battalion = battalions[key];
    }

    return battalion;
}

/*
 * Find the battalion associated with a station number
*/
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

/*
 * Initialize the google map
*/
function initMap(loc) {
    var station = stations[closestStation];

    //Set the lats and lngs for the markers
    sLat = station[0];
    sLng = station[1];
    aLat  = loc.geometry.location.lat();
    aLng = loc.geometry.location.lng();

    //Set the path variable for the line between station and dispatch
    var path = [
        {lat: sLat, lng: sLng},
        {lat: aLat, lng: aLng},
    ]

    var map = new google.maps.Map(document.getElementById('marker_map'), {
        center: {lat: aLat, lng: aLng},
        zoom: 12
    });

    var address_marker = new google.maps.Marker({
        position: {lat: aLat, lng: aLng},
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });

    var station_marker = new google.maps.Marker({
        position: {lat: sLat, lng: sLng},
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });
    
    var line = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    }).setMap(map);
}