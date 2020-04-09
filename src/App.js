import React from 'react';
import RegionTable from './RegionTable';
import SeriesChart from './SeriesChart';
import CovidData from './CovidData';
import { Link } from '@material-ui/core/';
import './App.css';

const development = true;
const pathPrefix = development ? "build/" : "";
const dataDate = "4-8-20";
const uiDate = "Apr 8, 2020"

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
			<div className="MyApp"> 
				<div className="headerbar headerBox">
					<span className="myheader">Covid-19 Statistics by U.S. State and County</span>
					<br/>
					Last updated {uiDate}.
				</div>

				{this.state.statesList && <div className="state">
					<RegionTable selectTopItem="true" backgroundColor="#ffffe0" title="State"
						list={this.state.statesList} onSelected={this.handleStateSelected}/></div>}

				{this.state.selectedState && <div className="county">
					<RegionTable selectTopItem="true" backgroundColor="#fffff4" title="County"
						list={this.calcCountiesList(this.state.statesData, this.state.selectedState)}
						onSelected={this.handleCountySelected}/></div>}

				{this.state.selectedCounty && <div className="chart">
					<SeriesChart
						title={title}
						series={this.state.statesData[this.state.selectedState].countiesData[this.state.selectedCounty]}/></div>}
						
				<div className="notes">
					<div className="notesText">
						<p>This page created by 
						<Link target="_blank" href="mailto:markcharts591@gmail.com"> Mark Shepherd.</Link>
						</p>
						<p>
						Data provided by the <Link target="_blank" href="https://github.com/nytimes/covid-19-data"> New York Times</Link>.
						</p>
						<p>
						Do you like country music, gospel, or sea chanties?
						Try<Link target="_blank" href="https://larkdales.com/"> The&nbsp;Larkdales</Link>...
						</p>
					</div>

					<div className="socialIcons">
						<Link target="_blank" href="https://twitter.com/MarkEShepherd">
						 	<img className="socialIcon"
						 		align="right"
						 		alt="Go to Mark's Twitter"
						  		src={`${pathPrefix}Twitter_Social_Icon_Circle_Color.svg`}/>
						</Link>
						<br/>
						<br/>
						<br/>
						<Link target="_blank" href="https://open.spotify.com/album/7eAJ5qb0vFuN2K7iBrjbOu">
						 	<img className="socialIcon"
						 		align="right"
						 		alt="Go to The Larkdales on Spotify"
						  		src={`${pathPrefix}Spotify_Icon_RGB_Green.svg`}/>
						</Link>
					</div>
					{/*}
					<div>
						<span style={{textAlign: "left"}}>
						</span>
						<span style={{textAlign: "right"}}>
						</span>
					</div>
					*/}
				</div>
			</div>);
	}
}

export default App;

/*
Simport Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/styles';
...

<Icon classes={{root: classes.iconRoot}}>
  <img className={classes.imageIcon} src="/graphics/firebase-logo.svg"/>
</Icon>

Styles:

const useStyles = makeStyles({
  imageIcon: {
    height: '100%'
  },
  iconRoot: {
    textAlign: 'center'
  }
});
*/
