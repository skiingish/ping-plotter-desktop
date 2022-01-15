const { ipcRenderer } = require('electron');
const Chart = require('chart.js');

// Start ping test button.
var testStartBtn = document.getElementById('startPingTestButton');
var stopBtn = document.getElementById('stopBtn');
var resetBtn = document.getElementById('resetBtn');

// Contents panels
var contents = document.querySelectorAll('.content');

// Host Address field.
var hostAddressInput = document.getElementById('hostAddressInput');
var pingIntervalTimeInput = document.getElementById('pingIntervalTimeInput');

// Text Fields
var pingStatsText = document.getElementById('pingStatsText');

// The ping interval function.
var pingIntervalFunction;

// Array of ping times
var pingTimes = [];

// Hides all content divs
function hideAllContents() {
  contents.forEach((content) => {
    content.classList.remove('show');
  });
}

// Labels for the chart
const labels = [];

// Chart data.
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Round Trip Time',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: [],
    },
  ],
};

// Chart config.
const config = {
  type: 'line',
  data: data,
  options: {
    animation: false,
    scales: {
      y: {
        display: true,
        title: {
          display: true,
          text: 'ms',
        },
      },
    },
  },
};

// New Chart Obj, upon creating the object it will also render the chart.
const chart = new Chart(document.getElementById('myChart'), config);

// Ask the renderer to ping a host.
function pinghost(host) {
  ipcRenderer.send('ping:pingonce', {
    host,
  });
}

// Start Ping Test and Plot
if (testStartBtn) {
  testStartBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Hide all and then show the ping plot display screen
    //hideAllContents();
    contents[1].classList.add('show');

    // Get the host name, trim the whitespace.
    const host = hostAddressInput.value.trim();

    // Start the ping test.
    startPingTest(host);
  });
}

function startPingTest(host) {
  const currentData = chart.data;

  // Set the host name that's being pinged.
  currentData.datasets[0].label = `Host: ${host}`;

  //Start the data faker interval function.
  pingIntervalFunction = setInterval(() => {
    pinghost(host);
  }, pingIntervalTimeInput.value * 1000);
}

function stopPingTest() {
  // Stop the pings
  clearInterval(pingIntervalFunction);
}

if (stopBtn) {
  stopBtn.addEventListener('click', (e) => {
    e.preventDefault();

    stopPingTest();
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Reload Panel.
    location.reload();
  });
}

function addDataToChart(thisChart, datapt) {
  const currentData = thisChart.data;

  // New label of the current time.
  var now = new Date().toLocaleString();

  labels.push(now);

  currentData.labels = labels;

  // Add the new data to the data set.
  currentData.datasets[0].data.push(datapt);

  // Update the chart.
  thisChart.update();
}

function buildShowStats(lastestPingtime) {
  pingTimes.push(lastestPingtime);

  // Find Max
  var max = (Math.round(Math.max(...pingTimes) * 100) / 100).toFixed(2);
  // Find Min
  var min = (Math.round(Math.min(...pingTimes) * 100) / 100).toFixed(2);
  // Find Avg
  var avg = (Math.round(calAvg(pingTimes) * 100) / 100).toFixed(2);

  pingStatsText.innerText = `Min: ${min}ms Max: ${max}ms Avg: ${avg}ms`;
}

function calAvg(array) {
  var count = 0;
  var sum = 0;

  for (let index = 0; index < array.length; index++) {
    sum = sum + array[index];
    count++;
  }

  return sum / count;
}
// Result coming back from the main.
ipcRenderer.on('ping:result', (e, res) => {
  buildShowStats(res.resultTime);
  addDataToChart(chart, res.resultTime);
});

// Used when IPC main starts a ping test to be displayed on the IPC render
ipcRenderer.on('ping:startping', (e, res) => {
  // Show the ping ploter chart.
  contents[1].classList.add('show');

  // Start the ping test
  startPingTest(res.host);
});

// Used when IPC main stops a ping test to be displayed on the IPC render
ipcRenderer.on('ping:stop', (e, res) => {
  // Stop the pings
  stopPingTest();
});

// Used when IPC main wants to reset the window
ipcRenderer.on('window:reset', (e, res) => {
  // Stop the pings
  location.reload();
});
