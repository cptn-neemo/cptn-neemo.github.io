//The current heat map data
var curHeatMapData;
//True if all of the options are unchecked
var allFalse = true;

/**
 * Initialize the options. This is called once the data is loaded
 */
function initOptions() {
    $('#loadOptions').text('Options');
    document.getElementById('options').style.visibility = "visible";
    console.log('in options');
}

/*
 * When the all option is clicked, uncheck the other options
*/
function onAllClick() {
    $('#medicalCheckbox').prop('checked', false);
    $('#trafficCheckbox').prop('checked', false);
    $('#fireCheckbox').prop('checked', false);
    $('#alarmCheckbox').prop('checked', false);
    $('#otherCheckbox').prop('checked', false);
    toggleHeatMap();
}

/*
 * When a checkbox other than All is clicked, uncheck All
*/
function onOtherClick() {
    $('#allCheckbox').prop('checked', false);
    toggleHeatMap();
}

/*
 * Classify every type of Fire into one category
 * @param dispatch: dispatch object
*/
function isFire(dispatch) {
    if (dispatch.type == 'Fire' || dispatch.type == 'Structure Fire' ||
        dispatch.type == 'Outside Fire' || dispatch.type == 'Vehicle Fire')
        return true;
    else 
        return false;
}

/*
 * Get and set the various variables used to describe the dispatches
*/
function getData() {

    //All of the different types of categories
    heatMapData = [];
    medicalData = [];
    alarmData = [];
    fireData = [];
    trafficData = [];
    otherData = [];

    //Set the data arrays
    for (var key in dispatches) {
        if (dispatches.hasOwnProperty(key)) {
            var dispatch = dispatches[key];

            if (dispatch.type == 'Medical Incident')
                medicalData.push(new google.maps.LatLng(dispatch.lat, dispatch.long));
            else if (isFire(dispatch))
                fireData.push(new google.maps.LatLng(dispatch.lat, dispatch.long));     
            else if (dispatch.type == 'Traffic Collision')
                trafficData.push(new google.maps.LatLng(dispatch.lat, dispatch.long));
            else if (dispatch.type ==  'Alarms')
                alarmData.push(new google.maps.LatLng(dispatch.lat, dispatch.long));
            else
                otherData.push(new google.maps.LatLng(dispatch.lat, dispatch.long));
                
            heatMapData.push(new google.maps.LatLng(dispatch.lat, dispatch.long))
        }
    }

    heatmap.setData(heatMapData);
    loaded = true;
}

/*
 * Initialize the map
*/
function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.7532508, lng: -122.460038},
        zoom: 12
    });
    
    heatmap = new google.maps.visualization.HeatmapLayer({
        map: null
    });
}

/*
 * Get all of the checked options
*/
function getCheckedOptions() {
    curChecked = [];

    curChecked.push($('#allCheckbox').is(':checked'));
    curChecked.push($('#medicalCheckbox').is(':checked'));
    curChecked.push($('#trafficCheckbox').is(':checked'));
    curChecked.push($('#fireCheckbox').is(':checked'));
    curChecked.push($('#alarmCheckbox').is(':checked'));
    curChecked.push($('#otherCheckbox').is(':checked'));

    //Check to see if any are true. If one is true, then we don't want to clear the heatmap
    allFalse = !(curChecked[0] || curChecked[1] || curChecked[2] || curChecked[3] || curChecked[4] 
        || curChecked[5]);

    return curChecked;
}

/*
 * Toggle the heatmap based on the options inputed
*/
function toggleHeatMap() {

    getCheckedOptions();
    
    if (allFalse)
        heatmap.setMap(null)
    else {
        curHeatMapData = [];

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
        heatmap.setData(curHeatMapData);
    }
}
