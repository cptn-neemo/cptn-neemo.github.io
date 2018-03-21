
function onAllClick() {
    $('#medicalCheckbox').prop('checked', false);
    $('#trafficCheckbox').prop('checked', false);
    $('#fireCheckbox').prop('checked', false);
    $('#alarmCheckbox').prop('checked', false);
    $('#otherCheckbox').prop('checked', false);
}

function onOtherClick() {
    $('#allCheckbox').prop('checked', false);
}

function isFire(val) {
    if (val.type == 'Fire' || val.type == 'Structure Fire' ||
        val.type == 'Outside Fire' || val.type == 'Vehicle Fire')
        return true;
    else 
        return false;
}

function getData() {

                  
    heatMapData = [];
    medicalData = [];
    alarmData = [];
    fireData = [];
    trafficData = [];
    otherData = [];

    for (var dispatch in dispatches) {
        if (dispatches.hasOwnProperty(dispatch)) {
            var val = dispatches[dispatch];

            if (val.type == 'Medical Incident')
                medicalData.push(new google.maps.LatLng(val.lat, val.long));
            else if (isFire(val))
                fireData.push(new google.maps.LatLng(val.lat, val.long));     
            else if (val.type == 'Traffic Collision')
                trafficData.push(new google.maps.LatLng(val.lat, val.long));
            else if (val.type ==  'Alarms')
                alarmData.push(new google.maps.LatLng(val.lat, val.long));
            else
                otherData.push(new google.maps.LatLng(val.lat, val.long));
                
            heatMapData.push(new google.maps.LatLng(val.lat, val.long))
        }
    }
    console.log('setting data');
    heatmap.setData(heatMapData);
    loaded = true;

}

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.7532508, lng: -122.460038},
        zoom: 12
    });
    
    heatmap = new google.maps.visualization.HeatmapLayer({
        map: null
    });
    console.log(heatmap);
}

function getCheckedOptions() {
    curChecked = [];
    clearMap = true;

    curChecked.push($('#allCheckbox').is(':checked'));
    curChecked.push($('#medicalCheckbox').is(':checked'));
    curChecked.push($('#trafficCheckbox').is(':checked'));
    curChecked.push($('#fireCheckbox').is(':checked'));
    curChecked.push($('#alarmCheckbox').is(':checked'));
    curChecked.push($('#otherCheckbox').is(':checked'));

    //Check to see if any are true. If one is true, then we don't want to clear the heatmap
    for (i = 0; i < curChecked.length; i++) {
        if (curChecked[i])
            clearMap = false;
    }

    return curChecked;
}

function toggleHeatMap() {
    getCheckedOptions();

    curHeatMapData = [];

    if (!clearMap) {
        if (curChecked[0]) {
            curHeatMapData = heatMapData.slice(0);
        } else {
            curHeatMapData = curHeatMapData.concat(curChecked[1] ? medicalData : []);
            curHeatMapData = curHeatMapData.concat(curChecked[2] ? trafficData : []);                 
            curHeatMapData = curHeatMapData.concat(curChecked[3] ? fireData : []);                 
            curHeatMapData = curHeatMapData.concat(curChecked[4] ? alarmData : []);
            curHeatMapData = curHeatMapData.concat(curChecked[5] ? otherData : []);
        }

        heatmap.setMap(map);
    } else {
        heatmap.setMap(null);
    }
    heatmap.setData(curHeatMapData);
}
