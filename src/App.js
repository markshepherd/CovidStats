import React from 'react';
import RegionTable from './RegionTable';
import SeriesChart from './SeriesChart';
import CovidData from './CovidData';
import Link from '@material-ui/core/Link';
import './App.css';

class App extends React.Component {
	/* this.state = 
		{
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
		this.handleStateSelected = this.handleStateSelected.bind(this);		
		this.handleCountySelected = this.handleCountySelected.bind(this);		
	}

	calcStatesList(statesData) {
		const result = [];
		const keys = Object.keys(statesData).sort();
		for (var i = 0; i < keys.length; i += 1) {
			const stateName = keys[i];
			const stateData = statesData[stateName];
			result.push({name: stateName, cases: stateData.countiesData[CovidData.allCounties].cases});
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
		this.covidData = new CovidData("us-counties-4-7-20.csv", (data) => {
			data.statesList = this.calcStatesList(data.statesData);
			this.setState(data);
		});
	}

	handleStateSelected(stateName) {
		this.setState({selectedState: stateName});
	}

	handleCountySelected(countyName) {
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
	    height: "600px",
	    width: "1200px",
	    backgroundColor: "#ffffff"
	};

	notesStyle = {
	    position: "absolute",
	    top: "570px",
	    left: "20px",
		fontSize: "10px",
		textAlign: "left"
	}

	render() {
		var title = (this.state.selectedCounty === CovidData.allCounties) 
			? this.state.selectedState + "," + this.state.selectedCounty
			: this.state.selectedState + ", " + this.state.selectedCounty + " county";
		return (
			<div className="App">
				{this.state.statesList && <div style={this.stateStyle}>
					<RegionTable selectTopItem="true" backgroundColor="#ffffe0" title="State"
						list={this.state.statesList} onSelected={this.handleStateSelected}/></div>}
				{this.state.selectedState && <div style={this.countyStyle}>
					<RegionTable selectTopItem="true" backgroundColor="#fffff4" title="County"
						list={this.calcCountiesList(this.state.statesData, this.state.selectedState)}
						onSelected={this.handleCountySelected}/></div>}
				{this.state.selectedCounty && <div>
					<SeriesChart style={this.chartStyle}
						title={title}
						series={this.state.statesData[this.state.selectedState].countiesData[this.state.selectedCounty]}/></div>}
				<div style={this.notesStyle}>
					Page by <Link target="_blank" href="mailto:markcharts591@gmail.com"> Mark Shepherd</Link>.
					<br/>
					Thanks to the<Link target="_blank" href="https://github.com/nytimes/covid-19-data"> New York Times </Link>
					for the data. Last updated Apr 7, 2020.
					<br/>
					Like country, bluegrass, gospel, or sea chanties? Try
					<Link target="_blank" href="https://larkdales.com/"> The Larkdales</Link>.
				</div>
			</div>);
	}
}

export default App;
