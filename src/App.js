import React from 'react';
import RegionTable from './RegionTable';
import SeriesChart from './SeriesChart';
import CovidData from './CovidData';
import MyLink from './MyLink';
import './App.css';

const development = false;
// for development=false, set package.json.homepage = "https://mark-shepherd.com/covid-stats" (formerly markshepherd.github.io)
// for development=true, set package.json.homepage = ""
const pathPrefix = development ? "build/" : "";
const dataDate = "4-9-20";
const uiDate = "Apr 9, 2020"


class App extends React.Component {
	/* this.state = 
		{
			statesData,
			statesList,
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
		this.covidData = new CovidData(`${pathPrefix}us-counties-${dataDate}.csv`, (data) => {
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

	render() {
		var title = (this.state.selectedCounty === CovidData.allCounties) 
			? this.state.selectedState + "," + this.state.selectedCounty
			: this.state.selectedState + ", " + this.state.selectedCounty + " county";

		return (
			<div className="app"> 
				<div className="header">
					<span className="myheader">Covid-19 Statistics by U.S. State and County</span>
					<br/>
					Last updated {uiDate}.
				</div>

				{this.state.statesList && <div className="state">
					<RegionTable backgroundColor="#ffffe0" title="State"
						list={this.state.statesList} onSelected={this.handleStateSelected}/></div>}

				{this.state.selectedState && <div className="county">
					<RegionTable backgroundColor="#fffff4" title="County"
						list={this.calcCountiesList(this.state.statesData, this.state.selectedState)}
						onSelected={this.handleCountySelected}/></div>}

				{this.state.selectedCounty && <div className="chart">
					<SeriesChart
						title={title}
						series={this.state.statesData[this.state.selectedState].countiesData[this.state.selectedCounty]}/></div>}

				<div className="notes">
					<div className="notesText">
						<p>Created by 
						<MyLink target="_blank" href="mailto:markcharts591@gmail.com"> Mark Shepherd</MyLink>.
						The source code is <MyLink target="_blank" href="https://github.com/markshepherd/CovidStats"> here</MyLink>.
						Data is provided by the <MyLink target="_blank" href="https://github.com/nytimes/covid-19-data"> New York Times</MyLink>.
						</p>
						<p>
						For the finest blend of country, gospel, and sea chanties,
						try<MyLink target="_blank" href="https://larkdales.com/"> The&nbsp;Larkdales</MyLink>...
						</p>
					</div>

					<div className="socialIcons">
						<MyLink target="_blank" href="https://twitter.com/MarkEShepherd">
						 	<img className="socialIcon"
						 		align="right"
						 		alt="Go to Mark's Twitter"
						  		src={`${pathPrefix}Twitter_Social_Icon_Circle_Color.svg`}/>
						</MyLink>
						<br/>
						<br/>
						<br/>
						<MyLink target="_blank" href="https://open.spotify.com/album/7eAJ5qb0vFuN2K7iBrjbOu">
						 	<img className="socialIcon"
						 		align="right"
						 		alt="Go to The Larkdales on Spotify"
						  		src={`${pathPrefix}Spotify_Icon_RGB_Green.svg`}/>
						</MyLink>
					</div>
				</div>
			</div>);
	}
}

export default App;
