var dispatch_avgs, battalion_numbers, battalion_dispatch_counts, thePieChart, hasRendered;
var total_counts, total_min_counts, dispatch_ct_min_bar;
var chartIsCount = false;

var day_counts = {
    "2018-01-13": 783,
    "2018-01-14": 831,
    "2018-01-15": 899,
    "2018-01-16": 874,
    "2018-01-17": 755,
    "2018-01-18": 811,
    "2018-01-19": 860,
    "2018-01-20": 896,
    "2018-01-21": 763,
    "2018-01-22": 829,
    "2018-01-23": 862,
    "2018-01-24": 837
}

function initVisuals() {
    setHighestTime();
    toggleCtMinBarChart();
    renderDispatchCountChart(0);
    renderDayCountChart();
    hasRendered = true;
}

function setHighestTime() {
    var ctx = document.getElementById('dis_avg_chart').getContext('2d');

    dispatch_avgs = [];
    battalion_numbers = [1,2,3,4,5,6,7,8,9,10];


    for (var key in battalions) {
        dispatch_avgs.push(battalions[key].dispatch_time_avg.toFixed(3));
    }

    var dispatch_avgs_bar = new Chart(ctx, {
        type: 'bar',

        data: {

            animationEnabled: true,

            labels: ["Battalion 1","Battalion 2","Battalion 3","Battalion 4","Battalion 5","Battalion 6",
            "Battalion 7","Battalion 8","Battalion 9","Battalion 10"],

            datasets: [{
                label: 'Average Dispatch Time',
                backgroundColor: 'rgb(159, 226, 147)',
                data: dispatch_avgs
            }]
        },

        options: {
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Battalion",
                        fontSize: 14,
                        fontColor: '#000000'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Minutes",
                        fontSize: 14,
                        fontColor: '#000000'
                    }
                }]
            }
        }
    })

}

function initValues() {
    total_counts = [];
    total_min_counts = [];

    for (var key in battalions) {
        total_counts.push(battalions[key].total_dispatch_count);
        total_min_counts.push(battalions[key].total_dispatch_minutes);
    }
}

function toggleCtMinBarChart() {
    chartIsCount = !chartIsCount;
    
    var ctButton = document.getElementById("countButton");
    var minButton = document.getElementById("minuteButton");

    ctButton.disabled = !ctButton.disabled;
    minButton.disabled = !minButton.disabled;

    chartIsCount ? setCtMinBarChart(total_counts) : setCtMinBarChart(total_min_counts);
}

function setCtMinBarChart(data) {
    var ctx = document.getElementById('dis_counts_bar').getContext('2d');

    if (hasRendered)
        dispatch_ct_min_bar.destroy();


    dispatch_ct_min_bar = new Chart(ctx, {
        type: 'horizontalBar',

        data: {

            animationEnabled: true,

            labels: ["Battalion 1","Battalion 2","Battalion 3","Battalion 4","Battalion 5","Battalion 6",
            "Battalion 7","Battalion 8","Battalion 9","Battalion 10"],

            datasets: [{
                label: chartIsCount ? "Total Dispatch Counts" : "Total Dispatch Minutes",
                backgroundColor: 'rgb(159, 226, 147)',
                data: data
            }]
        },

        options: {
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: chartIsCount ? "Dispatches" : "Minutes",
                        fontSize: 14,
                        fontColor: '#000000'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Battalions",
                        fontSize: 14,
                        fontColor: '#000000'
                    }
                }]
            }
        }
    })
}

function renderDispatchCountChart(bat_number) {
    var counts = battalions["Battalion" + bat_number].dispatch_type_counts;
    console.log(counts);
    var sum = 0;
    for (i = 0; i < counts.length; i++) {
        sum += counts[i];
    }

    var disCountChart = document.getElementById("dis_counts_chart");

    if (hasRendered)
        thePieChart.destroy();

    thePieChart = new Chart(disCountChart, {
        type: 'doughnut',
        data: {
          labels: ["Medical Incident", "Fire", "Traffic Collision", "Alarms", "Other"],
          datasets: [
            {
              label: "Type",
              backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
              data: counts
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: "Dispatch counts",
            maintainAspectRatio: false,
          }
        }
    });

    $('#total_count').text('Total: ' + sum);
    $('#med_counts').html("Medical: " + counts[0] + '<br/>(' + (counts[0] / sum * 100).toFixed(2) + '%)');
    $('#fire_counts').html('Fires: ' + counts[1] + '<br/>(' + (counts[1] / sum * 100).toFixed(2) + '%)');
    $('#traf_counts').html('Traffic: ' + counts[2] + '<br/>(' + (counts[2] / sum * 100).toFixed(2) + '%)')
    $('#alarm_counts').html('Alarms: ' + counts[3] + '<br/>(' + (counts[3] / sum * 100).toFixed(2) + '%)')
    $('#other_counts').html('Other: ' + counts[4] + '<br/>(' + (counts[4] / sum * 100).toFixed(2) + '%)')
}

function renderDayCountChart(top_unit_counts) {
    days = [];
    counts = [];

    for (var day in day_counts) {
        days.push(day);
        counts.push(day_counts[day]);
    }

    console.log(days)
    console.log(counts)

    var ctx = document.getElementById('dispatchDayCountsChart').getContext('2d');

    var dispatchDayCountChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,

            datasets: [{
                label: "Dispatch Counts per Day",
                data: counts,
                borderColor: '#ea6a2e',
                backgroundColor: '#ea6a2e',
                fill: false
            }]
        },
        options: {}
    });
}
function onSliderChange(val) {

    $('#battalion_num').text("Battalion: " + val);
    renderDispatchCountChart(val - 1);
}

function showVal(val) {
    $('#battalion_num').text("Battalion: " + val);
}


