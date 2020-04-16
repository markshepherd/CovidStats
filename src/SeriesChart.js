import React from 'react';
import { Line } from 'react-chartjs-2';
import { Checkbox, FormControlLabel, Link, Slider, Typography } from '@material-ui/core';
import Analytics from './Analytics';
import "./SeriesChart.css";

class SeriesChart extends React.Component {
	constructor (props) {
		super(props);
		this.chartRef = React.createRef();
		this.state = {type: "linear", movingAverageDays: 1, cumulative: false, smooth: false};
		this.datasets = [];
	}

	calcMovingAverage(array, number) {
		var half = Math.floor(this.state.movingAverageDays / 2);
		var result = [];
		var i;
		for (i = 0; i < half; i += 1) {
			result.push(array[i]);
		}
		for (i = half; i < array.length; i += 1) {
			var sum = 0;
			for (var j = 0; j < number; j += 1) {
				var ind = Math.min(array.length - 1, i + half - j);
				sum += array[ind];
			}
			result.push(sum / number);
		}
		return result;
	}

	isHidden = {
		0: false,
		1: false,
		2: false,
		3: false,
		4: false,
		5: false
	};

	findMin(array) {
		let min = Number.POSITIVE_INFINITY;
		for (let i = 0; i < array.length; i += 1) {
			min = Math.min(min, array[i]);
		}
		return min;
	}

	findMax(array) {
		let max = Number.NEGATIVE_INFINITY;
		for (let i = 0; i < array.length; i += 1) {
			max = Math.max(max, array[i]);
		}
		return max;
	}

	createChartData (series, cumulative, smooth) {
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

		const datasetLabels = [
			"Cumulative Cases", "Cumulative Deaths", "Daily New Cases", 
			`Daily New Cases ${this.state.movingAverageDays}-day Average`, "Daily Deaths",
			`Daily Deaths ${this.state.movingAverageDays}-day Average`];

		this.minY = undefined;
		this.maxY = undefined;

		if (cumulative) {
			this.datasets = [
				{
					myId: 0,
					label: datasetLabels[0],
					backgroundColor: "#333333",
					borderColor: 'rgba(75,75,192,0.5)',
					borderWidth: 2,
					fill: false,
					hidden: this.isHidden[0],
					data: cumulativeCasesData
				},
				{
					myId: 1,
					label: datasetLabels[1],
					backgroundColor: "#333333",
					borderColor: 'rgba(75,150,75,0.5)',
					borderWidth: 2,
					fill: false,
					hidden: this.isHidden[1],
					data: cumulativeDeathsData
				}
			];

		} else if (smooth) {
			this.datasets = [
				{
					myId: 3,
					label: datasetLabels[3],
					backgroundColor: "#aaaaaa",
					borderColor: 'rgba(75,75,192,0.3)',
					borderWidth: 4,
					fill: false,
					hidden: this.isHidden[3],
					data: this.calcMovingAverage(casesData, this.state.movingAverageDays),
					origData: casesData
				},			
				{
					myId: 5,
					label: datasetLabels[5],
					borderColor: 'rgba(75,150,75,0.3)',
					borderWidth: 4,
					fill: false,
					hidden: this.isHidden[5],
					data: this.calcMovingAverage(deathsData, this.state.movingAverageDays),
					origData: deathsData
				}
			];

			if (!this.isHidden[3] && !this.isHidden[5]) {
				this.minY = Math.min(this.findMin(casesData), this.findMin(deathsData));
				this.maxY = Math.max(this.findMax(casesData), this.findMax(deathsData));
			}

		} else {
			this.datasets = [
				{
					myId: 2,
					label: datasetLabels[2],
					backgroundColor: "#aaaaaa",
					borderColor: 'rgba(75,75,192,0.7)',
					borderWidth: 2,
					fill: false,
					hidden: this.isHidden[2],
					data: casesData
				},
				{
					myId: 4,
					label: datasetLabels[4],
					backgroundColor: "#aaaaaa",
					borderColor: 'rgba(75,150,75,0.7)',
					borderWidth: 2,
					fill: false,
					hidden: this.isHidden[4],
					data: deathsData
				}
			];
		}

		return {labels: labels, datasets: this.datasets};
	}

	handleLogChanged = () => {
		Analytics.linearLogToggleClicked();
		this.setState({type: (this.state.type === "logarithmic") ? "linear" : "logarithmic"});
	}

	handleCumulativeChanged = (event) => {
		this.setState({cumulative: event.target.checked});
	}

	handleChartClick = () => {
		setTimeout(() => {
			for (var i = 0; i < this.datasets.length; i += 1) {
				const hidden = !this.chartRef.current.chartInstance.isDatasetVisible(i);
				if (hidden !== this.isHidden[this.datasets[i].myId]) {
					Analytics.hideShowDatasetClicked();
					this.isHidden[this.datasets[i].myId] = hidden;
				}
			}
		}, 200)
	}

	handleSliderChanged = (e, value) => {
		this.setState({movingAverageDays: value, smooth: value !== 1});
	}

	handleSmoothChanged = (event) => {
		this.setState({movingAverageDays: 5, smooth: event.target.checked});
	}

	render() {
		const chartData = this.props.series && this.createChartData(
			this.props.series, this.state.cumulative, this.state.smooth);

	    const options = {
			animation: {
				duration: 0
			},
			responsive: true,
			maintainAspectRatio: true,
			aspectRatio: 1.5,
			onClick: this.handleChartClick, // FYI there is also onResize, onComplete, onHover, before/afterUpdate
			legend: {position: this.props.small ? "bottom" : "top"},
			title: {display: this.props.title !== "", text: this.props.title, fontSize: "16"},
			layout: this.props.small ? {
				padding: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 50
				}
			} : undefined,
			scales: {
				xAxes: [{
					display: true
				}],
				yAxes: [{
					display: true,
					type: this.state.type,
					ticks: {
						suggestedMin: this.minY, // minY and maxY are computed by createChartData()
						suggestedMax: this.maxY,
						callback: function(value, index, values) {
							return value;
						}
					}
				}]
			}
		};

		const checkboxLabelPlacement = this.props.small ? "start" : undefined;
		return (<div className="chartRoot">
			<div className={this.props.small ? "smallChartControls" : "bigChartControls"}>
				<FormControlLabel labelPlacement={checkboxLabelPlacement} className="log" control={<Checkbox size="small" color="default"/>} value={this.state.type === "logarithmic"} label="Log" onChange={this.handleLogChanged}/>
				<FormControlLabel labelPlacement={checkboxLabelPlacement} className="cumulative" control={<Checkbox size="small" color="default"/>} value={this.state.cumulative} label="Cumulative" onChange={this.handleCumulativeChanged}/>

				{this.props.small && <Link className="appTitle" onClick={this.props.onTitleClick}><Typography variant="h6">{this.props.appTitle}</Typography></Link>}
				{this.props.small && <Typography variant="subtitle2" className="updateDate">Updated {this.props.updateDate}</Typography>}

				{this.props.small && <FormControlLabel
					labelPlacement={checkboxLabelPlacement}
					className="smooth"
					control={<Checkbox size="small" color="default"/>} 
					value={this.state.smooth}
					label="Smooth"
					disabled={this.state.cumulative}
					onChange={this.handleSmoothChanged}/>}

				{!this.props.small && <Typography className="label" disabled={this.state.cumulative}>Smooth</Typography>}
				{!this.props.small && <Slider
					className="slider"
					disabled={this.state.cumulative}
					min={1}
					max={5}
					step={2}
					track="inverted"
					defaultValue={1}
					onChange={this.handleSliderChanged}
				/>}
				{this.props.children}
			</div>
			{this.props.series && <Line ref={this.chartRef} options={options} data={chartData}/>}
		</div>)
	}
}	

export default SeriesChart;
