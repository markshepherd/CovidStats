import React from 'react';
import {Line} from 'react-chartjs-2';
import './App.css';
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';

const buttonsStyle = {position: "absolute", left: "5px", top: "5px"};
const radioStyle = {height: "25px"};

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

	handleLinearClick = () => {
    	this.setState({type: "linear"});
	}

	handleLogClick = () => {
		this.setState({type: "logarithmic"});
	}

	chartRef = React.createRef();
	state = {type: "logarithmic"};

	render() {
	    const options = {
			animation: {
				duration: 300
			},
			responsive: true,
			legend: {position: 'top'},
			title: {display: true, text: this.props.title},
			scales: {
				xAxes: [{
					display: true
				}],
				yAxes: [{
					display: true,
					type: this.state.type,
					ticks: {
						callback: function(value, index, values) {
							return value;
						}
					}
				}]
			}
		};

		return (<div style={this.props.style}>
			{this.props.series && <Line ref={this.chartRef} options={options} data={this.createChartData(this.props.series)}/>}
			<div style={buttonsStyle}>
		        <RadioGroup value={this.state.type} onChange={this.handleRadioChange}>
		          <FormControlLabel control={<Radio color=""/>} size="small" style={radioStyle} value="linear" label="Linear" onClick={this.handleLinearClick}/>
		          <FormControlLabel control={<Radio color=""/>} size="small" style={radioStyle} value="logarithmic" label="Log" onClick={this.handleLogClick}/>
		        </RadioGroup>
			</div>
		</div>);
	}
}	

export default SeriesChart;
