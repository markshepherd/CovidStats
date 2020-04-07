import React from 'react';
import {Line} from 'react-chartjs-2';
import './App.css';

class SeriesChart extends React.Component {
	createChartData (series) {
		var labels = [];
		var casesData = [];
		var deathsData = [];
		for (var i = 0; i < series.timeline.length; i += 1) {
			var item = series.timeline[i];
			labels.push(item.date.replace(/2020-/, ""));
			casesData.push(item.cases);
			deathsData.push(item.deaths);
		}

		return {
			labels: labels,
			datasets: [{
				label: 'Daily New Cases',
				backgroundColor: "000000",
				borderColor: 'rgba(75,75,192,0.5)',
				borderWidth: 2,
				fill: false,
				data: casesData
			},
			{
				label: 'Daily Deaths',
				backgroundColor: "#333333",
				borderColor: 'rgba(75,150,75,0.5)',
				borderWidth: 2,
				fill: false,
				data: deathsData
			}]
		};
	}

	render() {
	    var options = {
			animation: {
				duration: 300
			},
			responsive: true,
			legend: {position: 'top'},
			title: {display: true, text: "Foo"},
			scales: {
				xAxes: [{
					display: true
				}],
				yAxes: [{
					display: true,
					type: "logarithmic",
					ticks: {
						callback: function(value, index, values) {
							return value;
						}
					}
				}]
			}
		};
		return (<div>
			{this.props.series && <Line options={options} data={this.createChartData(this.props.series)}/>}
		</div>);
	}
}	

export default SeriesChart;

/*


	var context = document.getElementById('canvas').getContext('2d');
	window.myChart = new Chart(context, settings);
	document.getElementById('container').style.visibility = "visible";


	sampleData = {
	  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
	  datasets: [
	    {
	      label: 'My First dataset',
	      fill: false,
	      lineTension: 0.1,
	      backgroundColor: 'rgba(75,192,192,0.4)',
	      borderColor: 'rgba(75,192,192,1)',
	      borderCapStyle: 'butt',
	      borderDash: [],
	      borderDashOffset: 0.0,
	      borderJoinStyle: 'miter',
	      pointBorderColor: 'rgba(75,192,192,1)',
	      pointBackgroundColor: '#fff',
	      pointBorderWidth: 1,
	      pointHoverRadius: 5,
	      pointHoverBackgroundColor: 'rgba(75,192,192,1)',
	      pointHoverBorderColor: 'rgba(220,220,220,1)',
	      pointHoverBorderWidth: 2,
	      pointRadius: 1,
	      pointHitRadius: 10,
	      data: [65, 59, 80, 81, 56, 55, 40]
	    }
	  ]
	};
*/
