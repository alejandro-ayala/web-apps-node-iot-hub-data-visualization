/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 1;
      this.timeData = new Array(this.maxLen);
      this.idStation = new Array(this.maxLen);
      this.occupancyData1 = 1;
      this.occupancyData2 = 1;
      this.occupancyData3 = 1;
      this.occupancyData4 = 1;
      this.occupancyData5 = 1;
    }

    updateData(time, id, occuppancy1,occuppancy2,occuppancy3,occuppancy4,occuppancy5) {
      this.timeData.push(time);
      this.occupancyData1 = occuppancy1;
      this.occupancyData2 = occuppancy2;
      this.occupancyData3 = occuppancy3;
      this.occupancyData4 = occuppancy4;
      this.occupancyData5 = occuppancy5;
      UpdateChart();
      //if (this.timeData.length > this.maxLen) {
      //  this.timeData.shift();
      //  this.occupancyData1.shift();
      //  this.occupancyData1.shift();
      //}
    }
  }

  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
          return this.devices[i];
        }
      }

      return undefined;
    }

    getDevicesCount() {
      return this.devices.length;
    }
  }

  const trackedDevices = new TrackedDevices();

const labels = ["Station1","Station2","Station3","Station4","Station5"];
const chartData = {
  labels: labels,
  datasets: [{
    label: 'Real time occupancy bike station',
    data: [65, 59, 80, 81, 56],
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 205, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(54, 162, 235, 0.2)'
    ],
    borderColor: [
      'rgb(255, 99, 132)',
      'rgb(255, 159, 64)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(54, 162, 235)'
    ],
    borderWidth: 1
  }]
};

  const chartOptions = {
        type: 'bar',
        //data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        },
      };  

  // Get the context of the canvas element we want to select
  const ctx = document.getElementById('iotChart').getContext('2d');
  const myLineChart = new Chart(
    ctx,
    {
      type: 'bar',
      data: chartData,
      options: chartOptions,
    });

  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  function UpdateChart() {
    //const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    //TODO: update the labels in case that stations change dinamically
    //chartData.labels = 
    chartData.data = device.occupancyData1;
    chartData.data = device.occupancyData2;
    chartData.data = device.occupancyData3;
    chartData.data = device.occupancyData4;
    chartData.data = device.occupancyData5;                
    myLineChart.update();
  }
  listOfDevices.addEventListener('change', UpdateChart, false);

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and occupancyData
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  webSocket.onmessage = function onMessage(message) {
    try {
      const messageData = JSON.parse(message.data);
      console.log(messageData);

      // time and either idStation or occupancyData are required
      //if (!messageData.MessageDate || (!messageData.IotData.idStation && !messageData.IotData.occupancyData)) {
        //return;
      //}

      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);

      if (existingDeviceData) {
        existingDeviceData.updateData(messageData.MessageDate,  messageData.IotData.occupancyData1, messageData.IotData.occupancyData2, messageData.IotData.occupancyData3, messageData.IotData.occupancyData4, messageData.IotData.occupancyData5);
      } else {
        const newDeviceData = new DeviceData(messageData.DeviceId);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
        newDeviceData.updateData(messageData.MessageDate,  messageData.IotData.occupancyData1, messageData.IotData.occupancyData2, messageData.IotData.occupancyData3, messageData.IotData.occupancyData4, messageData.IotData.occupancyData5);

        // add device to the UI list
        const node = document.createElement('option');
        const nodeText = document.createTextNode(messageData.DeviceId);
        node.appendChild(nodeText);
        listOfDevices.appendChild(node);

        // if this is the first device being discovered, auto-select it
        if (needsAutoSelect) {
          needsAutoSelect = false;
          listOfDevices.selectedIndex = 0;
          UpdateChart();
        }
      }
      UpdateChart();
    } catch (err) {
      console.error(err);
    }
  };
});
