import React from 'react';
import RegionTable from './RegionTable';
import SeriesChart from './SeriesChart';
import CovidData from './CovidData';
import {Slider} from '@material-ui/core';
import MyLink from './MyLink';
import { withStyles } from '@material-ui/core/styles';
import { useEffect, useRef } from "react";
import Tooltip from "@material-ui/core/Tooltip";

const development = false;
// for development=false, set package.json.homepage = "https://mark-shepherd.com/covid-stats" (formerly markshepherd.github.io)
// for development=true, set package.json.homepage = "http://localhost/covid/CovidStats/build"
const pathPrefix = development ? "build/" : "";
const dataDate = "4-10-20";
const uiDate = "Apr 10, 2020"

const MyTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 15,
  },
}))(Tooltip);

// FormatSliderValue source code comes from https://github.com/mui-org/material-ui/issues/17905
const FormatSliderValue = props => {
  const { children, value, open } = props;

  const popperRef = useRef(null);
  useEffect(() => {
    if (popperRef.current) {
      popperRef.current.update();
    }
  });

  return (
    <MyTooltip
      open={open}
      title={value}
      placement="top"
      PopperProps={{ popperRef }}
    >
     	{children}
    </MyTooltip>
  );
};

class App extends React.Component {
	/* this.state = 
		{
			dateList,
			statesData,
			statesList,
			selectedState,
			selectedCounty
	 	}
	*/

	constructor(props) {	
		super(props);
		this.state = {startDate: "2020-03-01"};
		this.calcStatesList = this.calcStatesList.bind(this);		
		this.calcCountiesList = this.calcCountiesList.bind(this);		
		this.handleStateSelected = this.handleStateSelected.bind(this);		
		this.handleCountySelected = this.handleCountySelected.bind(this);	
		this.handleSliderChanged = this.handleSliderChanged.bind(this);	
		this.trimToStartDate = this.trimToStartDate.bind(this);	
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
		this.covidData = new CovidData(`${pathPrefix}us-counties-${dataDate}.csv`, (statesData) => {
			var nationalTimeline =
				statesData[CovidData.allStates].countiesData[CovidData.allCounties].timeline;
			this.setState({
				dateList: nationalTimeline.map((item) => item.date),
				statesData: statesData,
				statesList: this.calcStatesList(statesData)});
		});
	}

	handleStateSelected(stateName) {
		this.setState({selectedState: stateName});
	}

	handleCountySelected(countyName) {
		this.setState({selectedCounty: countyName});
	}

	sliderRef = React.createRef();

	handleSliderChanged(e, value) {
		this.setState({startDate: this.state.dateList[value]});
	}

	findDateIndex(date) {
		var result = this.state.dateList.findIndex((element) => { 
			var x = element === date;
			return x;
		});
		return result;
	}

	trimToStartDate(startDate, series) {
		if (!series || !series.timeline || series.timeline.length === 0) {
			return series;
		}
		for(var i = 0; i < series.timeline.length; i += 1) {
			if (startDate <= series.timeline[i].date) {
				var result = Object.assign({}, series);
				result.timeline = series.timeline.slice(i);
				var desiredIndex = this.findDateIndex(startDate);
				var currentIndex = this.findDateIndex(result.timeline[0].date);
				while(desiredIndex < currentIndex) {
					currentIndex -= 1;
					result.timeline.unshift(
						{date: this.state.dateList[currentIndex], cases: 0, deaths: 0});
				}
				return result;
			}
		}
		return series;
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
						series={this.trimToStartDate(this.state.startDate, this.state.statesData[this.state.selectedState].countiesData[this.state.selectedCounty])}/></div>}

				<div className="notes">
					<div className="notesText">
						<p>Created by 
						<MyLink target="_blank" href="mailto:markcharts591@gmail.com"> Mark Shepherd</MyLink>.
						Data provided by the <MyLink target="_blank" href="https://github.com/nytimes/covid-19-data"> New York Times</MyLink>.
						Source code is <MyLink target="_blank" href="https://github.com/markshepherd/CovidStats"> here</MyLink>.
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
                        <MyLink target="_blank" href="https://open.spotify.com/album/7eAJ5qb0vFuN2K7iBrjbOu">
                             <img className="socialIcon"
                                 align="right"
                                 alt="Go to The Larkdales on Spotify"
                                  src={`${pathPrefix}Spotify_Icon_RGB_Green.svg`}/>
                        </MyLink>
					</div>
					<div className="dateControl">
						<span>Choose starting date of graph...</span>
						{this.state.dateList && <Slider
							ref={this.sliderRef}
							min={0}
							max={this.state.dateList.length - 1}
							track="inverted"
							defaultValue={this.findDateIndex("2020-03-01")}
							onChange={this.handleSliderChanged}
							valueLabelDisplay="auto"
  							valueLabelFormat={(index) => this.state.dateList[index]}	
  							ValueLabelComponent={FormatSliderValue}
						/>}
					</div>
				</div>
			</div>);
	}
}

export default App;
