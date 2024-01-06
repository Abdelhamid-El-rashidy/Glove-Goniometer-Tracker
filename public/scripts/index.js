

// convert epoch time to JavaScript Date object
function epochToJsDate(epochTime) {
    return new Date(epochTime * 1000);
}

// convert time to human-readable format YYYY/MM/DD HH:MM:SS
function epochToDateTime(epochTime) {
    var epochDate = new Date(epochToJsDate(epochTime));
    var dateTime =
        epochDate.getFullYear() +
        "/" +
        ("00" + (epochDate.getMonth() + 1)).slice(-2) +
        "/" +
        ("00" + epochDate.getDate()).slice(-2) +
        " " +
        ("00" + epochDate.getHours()).slice(-2) +
        ":" +
        ("00" + epochDate.getMinutes()).slice(-2) +
        ":" +
        ("00" + epochDate.getSeconds()).slice(-2);

    return dateTime;
}

// function to plot values on charts
function plotValuesMPU(chart, timestamp, mpuRoll, mpuPitch, mpuYaw) {
    var x = epochToJsDate(timestamp).getTime();
    
    // Plot Roll
    if (chart.series[0].data.length > 40) {
        chart.series[0].addPoint({ x: x, y: Number(mpuRoll) }, true, true, true);
    } else {
        chart.series[0].addPoint({ x: x, y: Number(mpuRoll) }, true, false, true);
    }

    // Plot Pitch
    if (chart.series[1].data.length > 40) {
        chart.series[1].addPoint({ x: x, y: Number(mpuPitch) }, true, true, true);
    } else {
        chart.series[1].addPoint({ x: x, y: Number(mpuPitch) }, true, false, true);
    }

    // Plot Yaw
    if (chart.series[2].data.length > 40) {
        chart.series[2].addPoint({ x: x, y: Number(mpuYaw) }, true, true, true);
    } else {
        chart.series[2].addPoint({ x: x, y: Number(mpuYaw) }, true, false, true);
    }
}
function plotValuesFlex(chart, timestamp, flex) {
    var x = epochToJsDate(timestamp).getTime();

    // Plot Flex Sensor data
    if (chart.series[0].data.length > 40) {
        chart.series[0].addPoint({ x: x, y: Number(flex) }, true, true, true);
    } else {
        chart.series[0].addPoint({ x: x, y: Number(flex) }, true, false, true);
    }
}

// DOM elements
const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector("#content-sign-in");
const userDetailsElement = document.querySelector('#user-details');
const authBarElement = document.querySelector('#authentication-bar');
const deleteButtonElement = document.getElementById('delete-button');
const deleteModalElement = document.getElementById('delete-modal');
const deleteDataFormElement = document.querySelector('#delete-data-form');
const viewDataButtonElement = document.getElementById('view-data-button');
const hideDataButtonElement = document.getElementById('hide-data-button');
const tableContainerElement = document.querySelector('#table-container');
const chartsRangeInputElement = document.getElementById('charts-range');
const loadDataButtonElement = document.getElementById('load-data');
const cardsCheckboxElement = document.querySelector('input[name=cards-checkbox]');
const chartsCheckboxElement = document.querySelector('input[name=charts-checkbox]');

// DOM elements for sensor readings
const cardsReadingsElement = document.querySelector("#cards-div");
const chartsDivElement = document.querySelector('#charts-div');
const mpuElement = document.getElementById("mpu");
const flexElement = document.getElementById("flex");
const updateElement = document.getElementById("lastUpdate")

// MANAGE LOGIN/LOGOUT UI
const setupUI = (user) => {
    if (user) {
        // toggle UI elements
        loginElement.style.display = 'none';
        contentElement.style.display = 'block';
        authBarElement.style.display = 'block';
        userDetailsElement.style.display = 'block';
        userDetailsElement.innerHTML = user.email;

        // get user UID to get data from the database
        var uid = user.uid;
        console.log(uid);

        // Database paths (with user UID)
        var dbPath = 'UsersData/' + uid.toString() + '/readings';
        var chartPath = 'UsersData/' + uid.toString() + '/charts/range';

        // Database references
        var dbRef = firebase.database().ref(dbPath);
        var chartRef = firebase.database().ref(chartPath);

        // CHARTS
        
        // Number of readings to plot on charts
        var chartRange = 0;
        // Get the number of readings to plot saved on the database (runs when the page first loads and whenever there's a change in the database)
        chartRef.on('value', snapshot => {
            chartRange = Number(snapshot.val());
            console.log(chartRange);
            // Delete all data from charts to update with new values when a new range is selected
            // chartMPU.destroy();
            // chartFlex.destroy();
            // Render new charts to display a new range of data
            chartMPU = createMPU6050Chart();
            chartFlex = createFlexSensorChart();
            // Update the charts with the new range
            // Get the latest readings and plot them on charts (the number of plotted readings corresponds to the chartRange value)            
            dbRef.orderByKey().limitToLast(chartRange).on('child_added', snapshot =>{
                var jsonData = snapshot.toJSON(); // example: {mpu: {roll: 12, pitch: 34, yaw: 56}, flex: 78, timestamp: 1641317355}
                // Save values on variables
                var mpuRoll = jsonData.roll;
                var mpuPitch = jsonData.pitch;
                var mpuYaw = jsonData.yaw;
                var flex = jsonData['flex-angle'];
                var timestamp = jsonData.timestamp;
                // Plot the values on the charts
                plotValuesMPU(chartMPU, timestamp, mpuRoll, mpuPitch, mpuYaw);
                // plotValuesMPU(chartMPU, timestamp, mpuPitch);
                // plotValuesMPU(chartMPU, timestamp, mpuYaw);
                plotValuesFlex(chartFlex, timestamp, flex);
            });
        });

        // Update the database with a new range (input field)
        chartsRangeInputElement.onchange = () => {
            chartRef.set(chartsRangeInputElement.value);
        };

        // CHECKBOXES
        // Checkbox (cards for sensor readings)
        cardsCheckboxElement.addEventListener('change', (e) => {
            if (cardsCheckboxElement.checked) {
                cardsReadingsElement.style.display = 'block';
            } else {
                cardsReadingsElement.style.display = 'none';
            }
        });
        // Checkbox (charts for sensor readings)
        chartsCheckboxElement.addEventListener('change', (e) => {
            if (chartsCheckboxElement.checked) {
                chartsDivElement.style.display = 'block';
            } else {
                chartsDivElement.style.display = 'none';
            }
        });

        // CARDS
        // Get the latest readings and display on cards
        dbRef.orderByKey().limitToLast(1).on('child_added', snapshot => {
            var jsonData = snapshot.toJSON(); // example: {mpu: {roll: 12, pitch: 34, yaw: 56}, flex: 78, timestamp: 1641317355}
            var mpuRoll = jsonData.roll;
            var mpuPitch = jsonData.pitch;
            var mpuYaw = jsonData.yaw;
            var flex = jsonData['flex-angle'];
            var timestamp = jsonData.timestamp;
            // Update DOM elements
            mpuElement.innerHTML = `Roll: ${mpuRoll}, Pitch: ${mpuPitch}, Yaw: ${mpuYaw}`;
            flexElement.innerHTML = `Flex Angle: ${flex}`;
            updateElement.innerHTML = epochToDateTime(timestamp);
        });


        // DELETE DATA
        // Add an event listener to open the modal when clicking on "Delete Data" button
        deleteButtonElement.addEventListener('click', e => {
            console.log("Remove data");
            e.preventDefault;
            deleteModalElement.style.display = "block";
        });

        // Add an event listener when the delete form is submitted
        deleteDataFormElement.addEventListener('submit', (e) => {
            // delete data (readings)
            dbRef.remove();
        });

        // TABLE
        var lastReadingTimestamp; //saves the last timestamp displayed on the table
        function createTable() {
            // Clear existing data
            $('#tbody').empty();
        
            // Append all data to the table
            var firstRun = true;
            dbRef.orderByKey().limitToLast(100).on('child_added', function (snapshot) {
                if (snapshot.exists()) {
                    var jsonData = snapshot.toJSON();
                    console.log(jsonData);
                    var mpuRoll = jsonData.roll;
                    var mpuPitch = jsonData.pitch;
                    var mpuYaw = jsonData.yaw;
                    var flex = jsonData['flex-angle'];
                    var timestamp = jsonData.timestamp;
                    var content = '';
                    content += '<tr>';
                    content += '<td>' + epochToDateTime(timestamp) + '</td>';
                    content += '<td>' + `Roll: ${mpuRoll}, Pitch: ${mpuPitch}, Yaw: ${mpuYaw}` + '</td>';
                    content += '<td>' + `Flex Angle: ${flex}` + '</td>';
                    content += '</tr>';
                    $('#tbody').prepend(content);
                    // Save lastReadingTimestamp --> corresponds to the first timestamp on the returned snapshot data
                    if (firstRun) {
                        lastReadingTimestamp = timestamp;
                        firstRun = false;
                        console.log(lastReadingTimestamp);
                    }
                }
            });
        }
        
        // Function to append readings to the table (after pressing More results... button)
        function appendToTable() {
            // Clear existing data
            $('#tbody').empty();
        
            var dataList = []; // Saves the list of readings returned by the snapshot (oldest-->newest)
            var reversedList = []; // The same as the previous but reversed (newest--> oldest)
            console.log("APEND");
            dbRef.orderByKey().limitToLast(100).endAt(lastReadingTimestamp).once('value', function (snapshot) {
                // Convert the snapshot to JSON
                if (snapshot.exists()) {
                    snapshot.forEach(element => {
                        var jsonData = element.toJSON();
                        dataList.push(jsonData); // Create a list with all data
                    });
                    lastReadingTimestamp = dataList[0].timestamp; // Oldest timestamp corresponds to the first on the list (oldest --> newest)
                    reversedList = dataList.reverse(); // Reverse the order of the list (newest data --> oldest data)
        
                    var firstTime = true;
                    // Loop through all elements of the list and append to the table (newest elements first)
                    reversedList.forEach(element => {
                        if (firstTime) { // Ignore the first reading (it's already on the table from the previous query)
                            firstTime = false;
                        } else {
                            var mpuRoll = element.roll;
                            var mpuPitch = element.pitch;
                            var mpuYaw = element.yaw;
                            var flex = element['flex-angle'];
                            var timestamp = element.timestamp;
                            var content = '';
                            content += '<tr>';
                            content += '<td>' + epochToDateTime(timestamp) + '</td>';
                            content += '<td>' + `Roll: ${mpuRoll}, Pitch: ${mpuPitch}, Yaw: ${mpuYaw}` + '</td>';
                            content += '<td>' + `Flex Angle: ${flex}` + '</td>';
                            content += '</tr>';
                            $('#tbody').append(content);
                        }
                    });
                }
            });
        }


        viewDataButtonElement.addEventListener('click', (e) => {
            // Toggle DOM elements
            tableContainerElement.style.display = 'block';
            viewDataButtonElement.style.display = 'none';
            hideDataButtonElement.style.display = 'inline-block';
            loadDataButtonElement.style.display = 'inline-block'
            createTable();
        });

        loadDataButtonElement.addEventListener('click', (e) => {
            appendToTable();
        });

        hideDataButtonElement.addEventListener('click', (e) => {
            tableContainerElement.style.display = 'none';
            viewDataButtonElement.style.display = 'inline-block';
            hideDataButtonElement.style.display = 'none';
        });

        // IF USER IS LOGGED OUT
    } else {
        // toggle UI elements
        loginElement.style.display = 'block';
        authBarElement.style.display = 'none';
        userDetailsElement.style.display = 'none';
        contentElement.style.display = 'none';
    }
}
