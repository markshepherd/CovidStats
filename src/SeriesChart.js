import React from 'react';
import { 
	Button,
} from '@material-ui/core';
import './App.css';

class SeriesChart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	    this.handleCellClick = this.handleCellClick.bind(this);
	}

	chartType = "line";
	Chart = {};
	yAxisType = "linear";
	title = "Foo";
	chartData = {
		labels: ['January', 'February'],
		datasets: [{
			label: 'Daily New Cases',
			backgroundColor: this.Chart.helpers.color(window.chartColors.green).alpha(0.5).rgbString(),
			borderColor: window.chartColors.green,
			borderWidth: 2,
			fill: false,
			data: [123, 456]
		},
		{
			label: 'Daily Deaths',
			backgroundColor: this.Chart.helpers.color(window.chartColors.blue).alpha(0.5).rgbString(),
			borderColor: window.chartColors.blue,
			borderWidth: 2,
			fill: false,
			data: [123, 456]
		}]
	};

	createChart() {
	    var settings = {
			type: this.chartType,
			data: this.chartData,
			options: {
				animation: {
					duration: 300
				},
				responsive: true,
				legend: {position: 'top'},
				title: {display: true, text: this.title},
				scales: {
					xAxes: [{
						display: true
					}],
					yAxes: [{
						display: true,
						type: this.yAxisType,
						ticks: {
							callback: function(value, index, values) {
								return value;
							}
						}
					}]
				}
			}
		};
		var context = document.getElementById('canvas').getContext('2d');
		window.myChart = new this.Chart(context, settings);
		document.getElementById('container').style.visibility = "visible";
	}

	componentDidMount() {
		this.createChart();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		this.createChart();
	}

	render() {
		return (<div>
			
		</div>);
	}
}

export default SeriesChart;