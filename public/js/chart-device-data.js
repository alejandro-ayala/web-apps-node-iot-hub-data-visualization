/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);


const labels = ["StationA","Station2","Station3","Station4","Station5"];
const chartData = {
  labels: labels,
  datasets: [{
    label: '',
    data: [0, 0, 0, 0, 0],
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
        options: {
          scales: {
            y: [{
                ticks: {
                    autoSkip: false,
                    min: 0,
                    max: 100
                }
            }]
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


  webSocket.onmessage = function onMessage(message) {
    try {
      const messageData = JSON.parse(message.data);
      console.log(messageData);
      jsonStr = JSON.stringify(messageData);
      console.log(jsonStr);
      if(jsonStr.includes("occupation1"))
      {
            console.log("Updating chart"); 
            myLineChart.data.labels = [messageData.IotData.station1,messageData.IotData.station2,messageData.IotData.station3,messageData.IotData.station4,messageData.IotData.station5];
            myLineChart.data.datasets[0].data = [messageData.IotData.occupation1,messageData.IotData.occupation2,messageData.IotData.occupation3,messageData.IotData.occupation4,messageData.IotData.occupation5];
            myLineChart.update();
            console.log("Updated chart");        
      }

    } catch (err) {
      console.error(err);
    }
  };
});
