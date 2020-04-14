import React from 'react';
import { Slider, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { useEffect, useRef } from "react";

import CovidData from './CovidData';
import RegionMenu from './RegionMenu';
import RegionTable from './RegionTable';
import SeriesChart from './SeriesChart';
import Utils from './Utils';

import Analytics from './Analytics';
import MyLink from './MyLink';

import './App.css';

const development = true;
// for development=false, set package.json.homepage = "https://mark-shepherd.com/covid-stats" (formerly markshepherd.github.io)
// for development=true, set package.json.homepage = "http://localhost/covid/CovidStats/build"
const pathPrefix = development ? "build/" : "";
const dataDate = "4-12-20";
const uiDate = "Apr 12, 2020"
Analytics.enable(!development);

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
		this.calcStatesList = this.calcStatesList.bind(this);		
		this.calcCountiesList = this.calcCountiesList.bind(this);		
		this.handleStateSelected = this.handleStateSelected.bind(this);		
		this.handleCountySelected = this.handleCountySelected.bind(this);	
		this.handleSliderChanged = this.handleSliderChanged.bind(this);	
		this.handleSliderCommited = this.handleSliderCommited.bind(this);	
		this.trimToStartDate = this.trimToStartDate.bind(this);	
		this.mql = window.matchMedia("(max-width: 999px)"); // https://medium.com/better-programming/how-to-use-media-queries-programmatically-in-react-4d6562c3bc97
		this.mql.addListener(() => {
			this.setState({small: this.mql.matches});
		});
		var small = this.mql.matches;
		//var small = false;
		this.state = {startDate: "2020-03-01", small: small,
			selectedState: CovidData.allStates, selectedCounty: CovidData.allCounties};
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

	calcAllStatesCountiesList(statesData) {
		var result = {};
		for (const stateName in statesData) {
			const stateData = statesData[stateName];
			if (stateName === CovidData.allStates) continue;
			const countyNames = Object.keys(stateData.countiesData);
			for (var i = 0; i < countyNames.length; i += 1) {
				var countyName = countyNames[i];
				if (countyName !== CovidData.allCounties) {
					const cases = stateData.countiesData[countyName].cases;
					while (result[countyName]) {
						countyName = countyName + " 2";
					}
					result[countyName] = {name: countyName, cases: cases};
				}
			}
		}
		return Utils.sortArray(Object.values(result), "name", false, true);
	}

	calcCountiesList(statesData, stateName) {
		// if (stateName === CovidData.allStates) {
		// 	return this.calcAllStatesCountiesList(statesData);
		// }

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

	handleSliderCommited(e, value) {
		Analytics.dateSliderUsed();
	}

	handleStateSelectChanged = (e) => {
		this.handleStateSelected(e.currentTarget.textContent);
	}

	handleCountySelectChanged = (e) => {
		this.handleCountySelected(e.currentTarget.textContent);
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

	findSelectedCountyIndex() {
		for (var i = 0; i < this.countiesList.length; i += 1) {
			if (this.countiesList[i].name === this.state.selectedCounty) {
				return i;
			}
 		}
	}
	
	findSelectedStateIndex() {
		for (var i = 0; i < this.state.statesList.length; i += 1) {
			if (this.state.statesList[i].name === this.state.selectedState) {
				return i;
			}
 		}
	}

	handleCountyDownClick = (e) => {
		let index = this.findSelectedCountyIndex();
		if (index < this.countiesList.length - 1) {
			index += 1;
		}
		this.handleCountySelected(this.countiesList[index].name);
		Analytics.arrowClicked();
	}

	handleCountyUpClick = (e) => {
		let index = this.findSelectedCountyIndex();
		if (index > 0) {
			index -= 1;
		}
		this.handleCountySelected(this.countiesList[index].name);
		Analytics.arrowClicked();
	}

	handleStateDownClick = (e) => {
		let index = this.findSelectedStateIndex();
		if (index < this.state.statesList.length - 1) {
			index += 1;
		}
		this.handleStateSelected(this.state.statesList[index].name);
		Analytics.arrowClicked();
	}

	handleStateUpClick = (e) => {
		let index = this.findSelectedStateIndex();
		if (index > 0) {
			index -= 1;
		}
		this.handleStateSelected(this.state.statesList[index].name);
		Analytics.arrowClicked();
	}

	render() {
		const chartTitle = this.state.small
			? ""
			: (this.state.selectedCounty === CovidData.allCounties) 
				? this.state.selectedState + "," + this.state.selectedCounty
				: this.state.selectedState + ", " + this.state.selectedCounty + " county";

		if (this.state.statesData && this.state.selectedState) {
			this.countiesList = this.calcCountiesList(this.state.statesData, this.state.selectedState);
		}

		return (
			<div className="app"> 
				{!this.state.small && <div className="header">
					<span className="myheader">Covid-19 Statistics by U.S. State and County</span>
					<br/>
					Last updated {uiDate}.
				</div>}

				{!this.state.small && this.state.statesList && <div className="state">
					<RegionTable extra="color1" title="State"
						list={this.state.statesList} onSelected={this.handleStateSelected}/></div>}

				{!this.state.small && this.state.statesData && this.state.selectedState && <div className="county">
					<RegionTable extra="color2" title="County"
						list={this.countiesList}
						onSelected={this.handleCountySelected}/></div>}

				{this.state.selectedCounty && this.state.statesData && <div className="chart">
					<SeriesChart
						small={this.state.small}
						appTitle="U.S. Covid-19 Stats"
						updateDate={uiDate}
						title={chartTitle}
						series={this.trimToStartDate(this.state.startDate, this.state.statesData[this.state.selectedState].countiesData[this.state.selectedCounty])}/>

					{this.state.small && this.state.selectedState && this.state.statesData && <div className="stateSelector">
						<RegionMenu temp="state" list={this.state.statesList} onSelected={this.handleStateSelected}/>
					</div>}

					{this.state.small && this.state.selectedCounty && this.state.statesData && <div className="countySelector">
						<RegionMenu temp="county" list={this.countiesList} onSelected={this.handleCountySelected}/>
					</div>}
				</div>}


				{!this.state.small && <div className="notes">
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
                        <MyLink target="_blank" href="https://larkdales.com">
	                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"
	                        className="socialIcon" align="right" alt="Visit the Larkdales">
                                 <path d="M26.451.526C12.155.526.565 12.116.565 26.412s11.59 25.886 25.886 25.886 25.886-11.59 25.886-25.886S40.748.526 26.451.526zM40.005 27.14h-2.689v9.918c0 .718-.026 1.299-1.014 1.299h-6.574V28.41h-6.554v9.947h-6.263c-1.295 0-1.326-.581-1.326-1.299V27.14h-2.689c-.96 0-1.206-.56-.547-1.244l12.903-12.915a1.659 1.659 0 012.399 0l12.902 12.915c.659.684.413 1.244-.548 1.244z"></path></svg>
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
							onChangeCommitted={this.handleSliderCommited}
							valueLabelDisplay="auto"
  							valueLabelFormat={(index) => this.state.dateList[index]}	
  							ValueLabelComponent={FormatSliderValue}
						/>}
					</div>
				</div>}
			</div>);
	}
}

export default App;
