import React from 'react';
import RegionTable from './RegionTable';
import SeriesChart from './SeriesChart';
import CovidData from './CovidData';
import './App.css';

class App extends React.Component {
	/* this.state = 
		{
			nationalSeries,
			statesData,
			selectedState,
			selectedCounty
	 	}
	*/

	constructor(props) {
		super(props);
		this.state = {};
		this.calcStatesList = this.calcStatesList.bind(this);		
		this.calcCountiesList = this.calcCountiesList.bind(this);		
		this.stateSelected = this.stateSelected.bind(this);		
		this.countySelected = this.countySelected.bind(this);		
	}

	calcStatesList(statesData) {
		const result = [];
		const keys = Object.keys(statesData).sort();
		for (var i = 0; i < keys.length; i += 1) {
			const stateName = keys[i];
			const stateData = statesData[stateName];
			result.push({name: stateName, cases: stateData.series.cases});
		}
		return result;
	}

	calcCountiesList(statesData, stateName) {
		const stateData = statesData[stateName];
		const result = [];
		const keys = Object.keys(stateData.countiesData).sort();
		for (var i = 0; i < keys.length; i += 1) {
			const countyName = keys[i];
			const countyData = stateData.countiesData[countyName];
			result.push({name: countyName, cases: countyData.cases});
		}
		return result;
	}

	componentDidMount() {
		this.covidData = new CovidData((data) => {
			data.statesList = this.calcStatesList(data.statesData);
			this.setState(data);
		});
	}

	stateSelected(stateName) {
		this.setState({selectedState: stateName});
	}

	countySelected(countyName) {
		this.setState({selectedCounty: countyName});
	}

	stateStyle = {
	    position: "absolute",
	    top: "10px",
	    left: "20px"
	};

	countyStyle = {
	    position: "absolute",
	    top: "10px",
	    left: "200px"
	};

	chartStyle = {
	    position: "absolute",
	    top: "10px",
	    left: "400px",
	    height: "1200px",
	    width: "1200px",
	};

	render() {
		return (
			<div className="App">
				{this.state.statesList && <div style={this.stateStyle}><RegionTable backgroundColor="#ffffe0" title="State" list={this.state.statesList} selected={this.stateSelected}/></div>}
				{this.state.selectedState && <div style={this.countyStyle}><RegionTable backgroundColor="#fffff4" title="County" list={this.calcCountiesList(this.state.statesData, this.state.selectedState)} selected={this.countySelected}/></div>}
				{this.state.selectedCounty && <div style={this.chartStyle}>
					<SeriesChart series={this.state.statesData[this.state.selectedState].countiesData[this.state.selectedCounty]}/>
				</div>}
			</div>
		);
	}
}

export default App;
