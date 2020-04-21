import React from 'react';
import { Line } from 'react-chartjs-2';
import { Button, Checkbox, FormControlLabel, Link, Slider, Typography } from '@material-ui/core';
import Analytics from './Analytics';
import Utils from './Utils';
import URLUpdater from './URLUpdater';
import "./SeriesChart.css";

// from https://material.io/resources/color/#!/?view.left=0&view.right=0
// all the "500" colors in primary and light.
const material500Colors = [
	["#009688", "#52c7b8"],
	["#8bc34a", "#bef67a"],
	["#673ab7", "#9a67ea"],
	["#2196f3", "#6ec6ff"],
	["#00bcd4", "#62efff"],
	["#4caf50", "#80e27e"],
	["#f44336", "#ff7961"],
	["#e91e63", "#ff6090"],
	["#9c27b0", "#d05ce3"],
	["#3f51b5", "#757de8"],
	["#03a9f4", "#67daff"],
];

const lockMax = 11;

class SeriesChart extends React.Component {
	constructor (props) {
		super(props);
		var days = parseInt(this.props.params.get("days") || "1");
		var lockedSeries = this.props.params.get("lockedSeries"); // "lockedSeries=state1,county1,state2,county2,..."
		lockedSeries = lockedSeries ? this.stringToLockedSeries(lockedSeries) : [];

		this.state = {
			type: this.props.params.get("type") || "linear",
			movingAverageDays: days,
			cumulative: this.props.params.get("cumulative") === "true",
			per100000: this.props.params.get("per100000") === "true",
			smooth: days > 1,
			lockedSeries: lockedSeries,
			showCases: true};

		this.chartRef = React.createRef();
		this.datasets = [];
		this.defaultSliderValue = this.state.movingAverageDays;

		URLUpdater.update("type", this.state.type, "linear");
		URLUpdater.update("cumulative", this.state.cumulative, false);
		URLUpdater.update("per100000", this.state.per100000, false);
		URLUpdater.update("days", this.state.movingAverageDays, 1);
		URLUpdater.update("lockedSeries", this.lockedSeriesAsString(), "");
	}

	lockedSeriesAsString() {
		if (!this.state.lockedSeries) return "";

		var result = "";
		var sep = "";
		for (var i = 0; i < this.state.lockedSeries.length; i += 1) {
			var item = this.state.lockedSeries[i];
			result += `${sep}${item.state},${item.county}`;
			sep = ",";
		}

		return result;
	}

	stringToLockedSeries(string) {
		var tokens = string.split(/,/);
		var result = [];
		for (var i = 0; i < tokens.length; i += 2) {
			var state = tokens[i];
			var county = tokens[i + 1];
			var seriesAndLabel = this.props.onFindSeries(state, county);
			var item = {state: state, county: county, label: seriesAndLabel.label, series: seriesAndLabel.series};
			result.push(item);
		}
		return result;
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
			var num = sum / number;
			result.push((num < 1) ? num : Math.floor(num));
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

	currentSeriesLocked() {
		for (var i = 0; i < this.state.lockedSeries.length; i += 1) {
			if (this.state.lockedSeries[i].label === this.props.label) return true;
		}
		return false;
	}

	createChartDataOneTrack (series, label, colors, highlight) {
		var datasets = [];
		var labels = [];
		var casesData = [];
		var deathsData = [];
		var cumulativeCasesData = [];
		var cumulativeDeathsData = [];
		var trimmedSeries = Utils.trimToStartDate(this.props.startDate, series, this.props.dateList);

		var populationDataMissing = false;
		var seriesPopulation = series.population;
		if (this.state.per100000 && !seriesPopulation) {
			seriesPopulation = 100000;
			//alert("Sorry, we have no population data for " + label);
			populationDataMissing = true;
		}
		var factor = this.state.per100000 ? (100000 / seriesPopulation) : 1;
		const fixupNumber = (number) => {
			var result = Math.max(0, Math.round(number * factor * 10) / 10);
			if (result < 0) {
				console.log("sdfadf");
			}
			return result;
		};

		for (var i = 0; i < trimmedSeries.timeline.length; i += 1) {
			var item = trimmedSeries.timeline[i];

			labels.push(item.date.replace(/2020-/, ""));
			casesData.push(fixupNumber(item.cases));
			deathsData.push(fixupNumber(item.deaths));
			cumulativeCasesData.push(fixupNumber(item.cumulativeCases));
			cumulativeDeathsData.push(fixupNumber(item.cumulativeDeaths));
		}

		const per = this.state.per100000 ? " per 100k" : "";
		const datasetLabels = [
			`Cumulative cases${per}`, `Cumulative deaths${per}`, `Daily cases${per}`, 
			`Cases${per} ${this.state.movingAverageDays}-day avg`, `Daily deaths${per}`,
			`Deaths${per} ${this.state.movingAverageDays}-day avg`];

		const showCases = (this.state.lockedSeries.length === 0) || this.state.showCases;
		const showDeaths = (this.state.lockedSeries.length === 0) || !this.state.showCases;
		const backgroundColor = highlight ? "#000000" : "#aaaaaa";
		const makeLabel = (n) => populationDataMissing
			? "Population data not available."
			: (datasetLabels[n] + ": " + (label || "??"));
		const makeColor = (num, a) => populationDataMissing ? "#ff0000" : colors[num] + a;

		if (this.state.cumulative) {
			showCases && datasets.push({
				myId: 0,
				label: makeLabel(0),
				backgroundColor: backgroundColor,
				borderColor: makeColor(0, "b0"), // 'rgba(75,75,192,0.5)',
				borderWidth: 2,
				fill: false,
				hidden: this.isHidden[0],
				data: cumulativeCasesData
			});

			showDeaths && datasets.push({
				myId: 1,
				label: makeLabel(1),
				backgroundColor: backgroundColor,
				borderColor: makeColor(1, "90"), // 'rgba(75,150,75,0.5)',
				borderWidth: 2,
				fill: false,
				hidden: this.isHidden[1],
				data: cumulativeDeathsData
			});

		} else if (this.state.smooth) {
			showCases && datasets.push({
				myId: 0,
				label: makeLabel(3),
				backgroundColor: backgroundColor,
				borderColor: makeColor(0, "50"), // 'rgba(75,75,192,0.3)',
				borderWidth: 4,
				fill: false,
				hidden: this.isHidden[0],
				data: this.calcMovingAverage(casesData, this.state.movingAverageDays),
				origData: casesData
			});

			showDeaths && datasets.push({
				myId: 1,
				label: makeLabel(5),
				backgroundColor: backgroundColor,
				borderColor: makeColor(1, "50"), // 'rgba(75,150,75,0.3)',
				borderWidth: 4,
				fill: false,
				hidden: this.isHidden[1],
				data: this.calcMovingAverage(deathsData, this.state.movingAverageDays),
				origData: deathsData
			});

			if (showCases && !this.isHidden[0]) {
				this.minY = Math.max(this.minY === undefined ? Number.MAX_VALUE : this.minY, Utils.findMin(casesData));
				this.maxY = Math.max(this.maxY === undefined ? Number.MIN_VALUE : this.maxY, Utils.findMax(casesData));
			}
			if (showDeaths && !this.isHidden[1]) {
				this.minY = Math.max(this.minY === undefined ? Number.MAX_VALUE : this.minY, Utils.findMin(deathsData));
				this.maxY = Math.max(this.maxY === undefined ? Number.MIN_VALUE : this.maxY, Utils.findMax(deathsData));
			}
		} else {
			showCases && datasets.push({
				myId: 0,
				label: makeLabel(2),
				backgroundColor: backgroundColor,
				borderColor: makeColor(0, "b0"), // 'rgba(75,75,192,0.7)',
				borderWidth: 2,
				fill: false,
				hidden: this.isHidden[0],
				data: casesData
			});

			showDeaths && datasets.push({
				myId: 1,
				label: makeLabel(4),
				backgroundColor: backgroundColor,
				borderColor: makeColor(1, "90"), // 'rgba(75,150,75,0.7)',
				borderWidth: 2,
				fill: false,
				hidden: this.isHidden[1],
				data: deathsData
			});
		}

		return {labels: labels, datasets: datasets};
	}

	createChartData () {
		this.minY = undefined;
		this.maxY = undefined;

		var result = this.currentSeriesLocked() ? {datasets: []} : this.createChartDataOneTrack(this.props.series, this.props.label, 
			(this.state.lockedSeries.length === 0) ? material500Colors[0] : ["#000000", "#888888"]);
		for (var j = 0; j < this.state.lockedSeries.length; j += 1) {
			var item = this.state.lockedSeries[j];
			var r = this.createChartDataOneTrack(item.series, item.label, material500Colors[j], item.label === this.props.label);
			result.datasets = result.datasets.concat(r.datasets);
			result.labels = r.labels;
		}
		this.datasets = result.datasets;
		return result;
	}

	handleLogChanged = () => {
		Analytics.linearLogToggleClicked();
		var newType = (this.state.type === "logarithmic") ? "linear" : "logarithmic";
		this.setState({type: newType});
		URLUpdater.update("type", newType, "linear");
	}

	handleCumulativeChanged = (event) => {
		this.setState({cumulative: event.target.checked});
		URLUpdater.update("cumulative", event.target.checked, false);
	}

	handlePer100000Changed = (event) => {
		this.setState({per100000: event.target.checked});
		URLUpdater.update("per100000", event.target.checked, false);
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
		URLUpdater.update("days", value, 1);
	}

	handleSmoothChanged = (event) => {
		this.setState({movingAverageDays: 5, smooth: event.target.checked});
		URLUpdater.update("days", 1, 1);
	}

	handleCompareButton = (event) => {
		if (this.state.lockedSeries.length >= lockMax) {
			return;
		}
		for (var i = 0; i < this.state.lockedSeries.length; i += 1) {
			var seriesInfo = this.state.lockedSeries[i];
			if (seriesInfo.label === this.props.label) {
				return;
			}
		}
		this.state.lockedSeries.push({label: this.props.label, series: this.props.series,
			state: this.props.state, county: this.props.county});
		this.setState({lockedSeries: this.state.lockedSeries});
		URLUpdater.update("lockedSeries", this.lockedSeriesAsString(), "");		
	}

	handleResetCompareButton = (event) => {
		this.setState({lockedSeries: []});
		URLUpdater.update("lockedSeries", "", "");		
	}

	handleCasesDeathsButton = (event) => {
		this.setState({showCases: !this.state.showCases});
	}

	render() {
		const chartData = this.props.series && this.createChartData();

	    const options = {
			animation: {
				duration: 0
			},
			responsive: true,
			maintainAspectRatio: true,
			aspectRatio: 1.5,
			onClick: this.handleChartClick, // FYI there is also onResize, onComplete, onHover, before/afterUpdate
			legend: {position: this.props.small ? "bottom" : "top"},
			title: {
				display: this.props.title !== "",
				text: (this.state.lockedSeries.length !== 0 && this.currentSeriesLocked()) ? "Comparing ..." : this.props.title,
				fontSize: "16"},
			layout: {
				padding: {
					left: 0,
					right: 0,
					top: 35,
					bottom: 85
				}
			},
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
		const checkboxSize = "medium"; // this.props.small ? "medium" : "small";

		return (<div className="chartRoot">
			<div className={this.props.small ? "smallChartControls" : "bigChartControls"}>
				<FormControlLabel labelPlacement={checkboxLabelPlacement} className="log" control={<Checkbox size={checkboxSize} color="default" checked={this.state.type === "logarithmic"}/>} label="Log" onChange={this.handleLogChanged}/>
				<FormControlLabel labelPlacement={checkboxLabelPlacement} className="cumulative" control={<Checkbox size={checkboxSize} color="default" checked={this.state.cumulative}/>} label="Cumulative" onChange={this.handleCumulativeChanged}/>
				<FormControlLabel labelPlacement={checkboxLabelPlacement} className="per100000" control={<Checkbox size={checkboxSize} color="default" checked={this.state.per100000}/>} label="Per 100k" onChange={this.handlePer100000Changed}/>

				{this.props.small && <Link className="appTitle" onClick={this.props.onTitleClick}><Typography variant="h6">{this.props.appTitle}</Typography></Link>}
				{this.props.small && <Typography variant="subtitle2" className="updateDate">Updated {this.props.updateDate}</Typography>}

				{this.props.small && <FormControlLabel
					labelPlacement={checkboxLabelPlacement}
					className="smooth"
					control={<Checkbox size="medium" color="default"/>} 
					value={this.state.smooth}
					label="Smooth"
					disabled={this.state.cumulative}
					onChange={this.handleSmoothChanged}/>}

				{!this.props.small && <Typography className="label" disabled={this.state.cumulative}>Smooth</Typography>}
				{!this.props.small && <Slider
					className="slider"
					disabled={this.state.cumulative}
					min={1}
					max={9}
					step={2}
					track="inverted"
					defaultValue={this.defaultSliderValue}
					onChange={this.handleSliderChanged}
				/>}
				{this.props.children}
			</div>
			{this.props.series && <Line ref={this.chartRef} options={options} data={chartData}/>}
			<div className={this.props.small ? "smallCompareButton" : "bigCompareButton"}>
				<Button size="small" variant="outlined" onClick={this.handleCompareButton} disabled={this.currentSeriesLocked() || this.state.lockedSeries.length >= lockMax}>
					Compare&nbsp;&nbsp;"{this.props.label.trim()}""
				</Button>
				&nbsp;
				<Button size="small" variant="outlined" onClick={this.handleCasesDeathsButton} disabled={this.state.lockedSeries.length === 0}>
					Cases/Deaths
				</Button>
				&nbsp;
				<Button size="small" variant="outlined" onClick={this.handleResetCompareButton} disabled={this.state.lockedSeries.length === 0}>
					Reset
				</Button>
			</div>
		</div>)
	}
}

export default SeriesChart;
