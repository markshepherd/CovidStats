import React from 'react';
import {Line} from 'react-chartjs-2';
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import Analytics from './Analytics';

const buttonsStyle = {position: "absolute", left: "10px", top: "5px"};
const containerStyle = {position: "relative", top: "0px"};
const radioStyle = {height: "25px"};

class SeriesChart extends React.Component {
	chartRef = React.createRef();
	state = {type: "linear"};
	datasetInitiallyHidden = [false, false, true, true];
	
	createChartData (series) {
		var labels = [];
		var casesData = [];
		var deathsData = [];
		var cumulativeCasesData = [];
		var cumulativeDeathsData = [];
		for (var i = 0; i < series.timeline.length; i += 1) {
			var item = series.timeline[i];
			labels.push(item.date.replace(/2020-/, ""));
			casesData.push(item.cases);
			deathsData.push(item.deaths);
			cumulativeCasesData.push(item.cumulativeCases);
			cumulativeDeathsData.push(item.cumulativeDeaths);
		}

		return {
			labels: labels,
			datasets: [{
				label: 'Daily New Cases',
				backgroundColor: "000000",
				borderColor: 'rgba(75,75,192,0.5)',
				borderWidth: 2,
				fill: false,
				hidden: this.datasetInitiallyHidden[0],
				data: casesData
			},
			{
				label: 'Daily Deaths',
				backgroundColor: "#333333",
				borderColor: 'rgba(75,150,75,0.5)',
				borderWidth: 2,
				fill: false,
				hidden: this.datasetInitiallyHidden[1],
				data: deathsData
			},
			{
				label: 'Cumulative Cases',
				backgroundColor: "#333333",
				borderColor: 'rgba(200,200,100,0.5)',
				borderWidth: 2,
				fill: false,
				hidden: this.datasetInitiallyHidden[2],
				data: cumulativeCasesData
			},
			{
				label: 'Cumulative Deaths',
				backgroundColor: "#333333",
				borderColor: 'rgba(100,30,30,0.5)',
				borderWidth: 2,
				fill: false,
				hidden: this.datasetInitiallyHidden[3],
				data: cumulativeDeathsData
			}]
		};
	}

	handleLinearClick = () => {
		Analytics.linearLogToggleClicked();
    	this.setState({type: "linear"});
	}

	handleLogClick = () => {
		Analytics.linearLogToggleClicked();
		this.setState({type: "logarithmic"});
	}

	handleChartClick = () => {
		setTimeout(() => {
			for (var i = 0; i < this.datasetInitiallyHidden.length; i += 1) {
				const hidden = !this.chartRef.current.chartInstance.isDatasetVisible(i);
				if (hidden !== this.datasetInitiallyHidden[i]) {
					Analytics.reportHideShowDataset();
				}
			}
		}, 500)
	}

	render() {
	    const options = {
			animation: {
				duration: 300
			},
			responsive: true,
			maintainAspectRatio: true,
			onClick: this.handleChartClick,
			// onResize: (x) => console.log("resize", x), */
			// onComplete: (e) => {console.log("chart onComplete", e);},
			// onHover: (e) => {if (e.type !== "mousemove") {console.log("chart onHover", e);}},
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

		return (<div style={containerStyle}>
			<div style={buttonsStyle}>
		        <RadioGroup value={this.state.type} onChange={this.handleRadioChange}>
		          <FormControlLabel control={<Radio color="default"/>} size="small" style={radioStyle} value="linear" label="Linear" onClick={this.handleLinearClick}/>
		          <FormControlLabel control={<Radio color="default"/>} size="small" style={radioStyle} value="logarithmic" label="Log" onClick={this.handleLogClick}/>
		        </RadioGroup>
			</div>
			{this.props.series && <Line ref={this.chartRef} options={options} data={this.createChartData(this.props.series)}/>}
		</div>);
	}
}	

export default SeriesChart;

