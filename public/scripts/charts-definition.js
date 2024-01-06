// Create the charts when the web page loads
window.addEventListener('load', onload);

var chartMPU, chartFlex;

function onload(event) {
    chartMPU = createMPU6050Chart();
    chartFlex = createFlexSensorChart();
}

// Create MPU6050 Chart
function createMPU6050Chart() {
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart-mpu',
            type: 'spline'
        },
        series: [
            { name: 'Roll', visible: true },
            { name: 'Pitch', visible: true },
            { name: 'Yaw', visible: true }
        ],
        title: {
            text: 'MPU6050 Data'
        },
        plotOptions: {
            line: {
                animation: false,
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            },
            series: {
                color: ['#4285F4', '#34A853', '#FBBC05']
            }
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { second: '%H:%M:%S' }
        },
        yAxis: {
            title: {
                text: 'Value'
            }
        },
        credits: {
            enabled: false
        }
    });
    return chart;
}

// Create Flex Sensor Chart
function createFlexSensorChart() {
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart-flex',
            type: 'spline'
        },
        series: [
            { name: 'Flex Angle' }
        ],
        title: {
            text: 'Flex Sensor Data'
        },
        plotOptions: {
            line: {
                animation: false,
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            },
            series: {
                color: ['#FF5733']
            }
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { second: '%H:%M:%S' }
        },
        yAxis: {
            title: {
                text: 'Angle'
            }
        },
        credits: {
            enabled: false
        }
    });
    return chart;
}