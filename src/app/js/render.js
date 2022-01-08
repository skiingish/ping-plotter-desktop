const { ipcRenderer } = require('electron');
const Chart = require('chart.js');

// Start ping test button.
var testStartBtn = document.getElementById('startPingTestButton');

// Contents panels
var contents = document.querySelectorAll('.content');

// Host Address field.
var hostAddressInput = document.getElementById('hostAddressInput');

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
  options: {},
};

// New Chart Obj, upon creating the object it will also render the chart.
const chart = new Chart(document.getElementById('myChart'), config);

// Ask the renderer to ping a host.
function pinghost(host) {
  ipcRenderer.send('ping:pingonce', {
    host,
  });
}

if (testStartBtn) {
  testStartBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Hide all and then show the ping plot display screen
    //hideAllContents();
    contents[1].classList.add('show');

    const host = hostAddressInput.value;

    //Start the data faker interval function.
    setInterval(() => {
      pinghost(host);
    }, 1000);
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

// Result coming back from the main.
ipcRenderer.on('ping:result', (e, res) => {
  addDataToChart(chart, res.resultTime);
});
