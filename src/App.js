 import React from 'react';
import { FormControlLabel, Slider, Tooltip, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { useEffect, useRef } from "react";
import preval from 'preval.macro'

import AboutDialog from './AboutDialog';
import Analytics from './Analytics';
import CovidData from './CovidData';
import GeneralData from './GeneralData';

// import GestureHandler from './GestureHandler';
import LoadingDialog from './LoadingDialog';
import MyLink from './MyLink';
import RegionMenu from './RegionMenu';
import RegionTable from './RegionTable';
import SeriesChart from './SeriesChart';
import URLUpdater from './URLUpdater';
import Utils from './Utils';

import { version } from './Version';
import './App.css';

// county populations https://www.census.gov/data/datasets/time-series/demo/popest/2010s-counties-total.html

const versionString = version.split(/\./)[0].toString();
const development = window.location.toString().match(/(localhost|covid-test|192\.168)/)
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
	constructor(props) {	
		super(props);

		this.mql = window.matchMedia("(max-width: 999px)"); // https://medium.com/better-programming/how-to-use-media-queries-programmatically-in-react-4d6562c3bc97
		this.sliderRef = React.createRef();
		this.stateMenuRef = React.createRef();
		this.countyMenuRef = React.createRef();
		this.aboutRef = React.createRef();

		this.params = new URLSearchParams(window.location.search);
		const selectedCounty = this.params.get("county") || CovidData.allCounties;
		const selectedState = this.params.get("state") || CovidData.allStates;

		this.state = {
			aboutOpen: false,
			dateList: undefined,
			isLoading: true,
			latestDate: undefined,
			selectedCounty: selectedCounty,
			selectedState: selectedState,
			small: this.mql.matches,
			startDate: "2020-03-01",
			statesData: undefined,
			statesList: undefined,
			aboutTransparent: false,
			generalData: undefined,
			gotData: false
		};
	}

	calcStatesList = (statesData) => {
		const result = [];
		const keys = Object.keys(statesData).sort();
		for (var i = 0; i < keys.length; i += 1) {
			const stateName = keys[i];
			const stateData = statesData[stateName];
			result.push({name: stateName, cases: stateData.countiesData[CovidData.allCounties].cases});
		}
		return result;
	}

	/*
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
	*/

	calcCountiesList = (statesData, stateName) => {
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

	calcChartLabel(state, county) {
		var result;
		if (state === CovidData.allStates) {
			result = "USA";
		} else {
			if (county === CovidData.allCounties) {
				result = state;
			} else {
				result = county + " County, " + Utils.stateAbbreviation(state);
			}
		}
		return result;
	}

	componentDidMount() {
		const covidDataPath = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv";
		this.covidData = new CovidData(covidDataPath, (statesData, latestDate) => {
			var nationalTimeline =
				statesData[CovidData.allStates].countiesData[CovidData.allCounties].timeline;
			this.setState({
				dateList: nationalTimeline.map((item) => item.date),
				statesData: statesData,
				statesList: this.calcStatesList(statesData),
				latestDate: latestDate
			});
		});
		this.mql.addListener(() => {
			this.setState({small: this.mql.matches});
		});

		const generalDataPath = "co-est2019-alldata-trimmed.csv";
		this.generalData = new GeneralData(generalDataPath, (generalData) => {
			this.setState({generalData: generalData});
		});
	}

	handleStateSelected = (stateName) => {
		this.setState({selectedState: stateName, selectedCounty: CovidData.allCounties});
		URLUpdater.update("state", stateName, CovidData.allStates);
		URLUpdater.update("county", CovidData.allCounties, CovidData.allCounties);
	}

	handleCountySelected = (countyName) => {
		this.setState({selectedCounty: countyName});
		URLUpdater.update("county", countyName, CovidData.allCounties);
	}

	handleSliderChanged = (e, value) => {
		this.setState({startDate: this.state.dateList[value]});
		this.state.aboutOpen && this.setState({aboutTransparent: true});
	}

	handleSliderCommited = (e, value) => {
		Analytics.dateSliderUsed();
		this.state.aboutOpen && this.setState({aboutTransparent: false});
	}

	handleStateSelectChanged = (e) => {
		this.handleStateSelected(e.currentTarget.textContent);
	}

	handleCountySelectChanged = (e) => {
		this.handleCountySelected(e.currentTarget.textContent);
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

	handleAboutCloseButton = (e) => {
		this.setState({aboutOpen: false})
	}

	handleTitleClick = (e) => {
		this.setState({aboutOpen: true})
	}

	handleFindSeries = (state, county) => {
		return {
			label: this.calcChartLabel(state, county),
			series: this.state.statesData[state].countiesData[county]
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (this.state.statesData && this.state.generalData && !this.state.gotData) {
			var stateName, stateData, countyName, countyData;

			this.setState({gotData: true, isLoading: false});
			for (stateName in this.state.generalData) {
				var stateInfo = this.state.generalData[stateName];
				for (countyName in stateInfo) {
					var countyInfo = stateInfo[countyName];
					stateData = this.state.statesData[stateName];
					if (stateData) {
						countyData = stateData.countiesData[countyName];
						if (countyData) {
							for (var i in countyInfo) {
								countyData[i] = countyInfo[i];
							}
						}
					}
				}
			}

			// var regionsMissingData = [];
			// for (stateName in this.state.statesData) {
			// 	stateData = this.state.statesData[stateName];
			// 	for (countyName in stateData.countiesData) {
			// 		countyData = stateData.countiesData[countyName];
			// 		if (countyData.population === undefined) {
			// 			regionsMissingData.push([stateName, countyName]);
			// 		}
			// 	}
			// }
			// console.log("regionsMissingData", JSON.stringify(regionsMissingData, undefined, 2));
		}
	}

	// handleSwipeLeft = (e) => {
	// 	this.countyMenuRef.current.handleDownClick();
	// }

	// handleSwipeRight = (e) => {
	// 	this.countyMenuRef.current.handleUpClick();
	// }

	// handleSwipeDown = (e) => {
	// 	this.stateMenuRef.current.handleUpClick();
	// }

	// handleSwipeUp = (e) => {
	// 	this.stateMenuRef.current.handleDownClick();
	// }

	render() {
		const buildDate = preval`module.exports = new Date().toLocaleString();`;

		const aboutInfo = <React.Fragment>
			{this.state.dateList && 
				<div className="dateControl">
					<FormControlLabel
						className="dateFormControl"
						label="Start&nbsp;date&nbsp;&nbsp;"
						labelPlacement="start"
						control={<Slider
							ref={this.sliderRef}
							min={0}
							max={this.state.dateList.length - 1}
							track="inverted"
							defaultValue={Utils.findDateIndex("2020-03-01", this.state.dateList)}
							onChange={this.handleSliderChanged}
							onChangeCommitted={this.handleSliderCommited}
							valueLabelDisplay="auto"
							valueLabelFormat={(index) => this.state.dateList[index]}	
							ValueLabelComponent={FormatSliderValue}
						/>}
					/>
				</div>
			}

			<div className="notesText">
				<p>Created by
				Mark Shepherd. {/*<MyLink href="#" onClick={this.handleClickMe}> Mark Shepherd</MyLink>.*/}
				Data provided by the <MyLink target="_blank" href="https://github.com/nytimes/covid-19-data"> New York Times</MyLink>.
				Source code is <MyLink target="_blank" href="https://github.com/markshepherd/CovidStats"> here</MyLink>.
				</p>
			</div>

			<div className="lastRow">
				<MyLink target="_blank" href="https://twitter.com/MarkEShepherd">
				 	<img className="socialIconT"
				 		align="right"
				 		alt="Go to Mark's Twitter"
				  		src="Twitter_Social_Icon_Circle_Color.svg"/>
				</MyLink>
				<br/>
                <MyLink target="_blank" href="https://larkdales.com">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"
                    className="socialIconH" align="right" alt="Visit the Larkdales">
                         <path d="M26.451.526C12.155.526.565 12.116.565 26.412s11.59 25.886 25.886 25.886 25.886-11.59 25.886-25.886S40.748.526 26.451.526zM40.005 27.14h-2.689v9.918c0 .718-.026 1.299-1.014 1.299h-6.574V28.41h-6.554v9.947h-6.263c-1.295 0-1.326-.581-1.326-1.299V27.14h-2.689c-.96 0-1.206-.56-.547-1.244l12.903-12.915a1.659 1.659 0 012.399 0l12.902 12.915c.659.684.413 1.244-.548 1.244z"></path></svg>
                </MyLink>
				<MyLink target="_blank" href="https://facebook.com/mark.e.shepherd">
				 	<img className="socialIconF"
				 		align="right"
				 		alt="Visit Mark on Facebook"
				  		src="FB_logo_RGB-Black_1024.svg"/>
				</MyLink>
				<MyLink target="_blank" href="mailto:markcharts591@gmail.com">
				 	<img className="socialIconE"
				 		align="right"
				 		alt="Send email to Mark"
				  		src="email-seeklogo.svg"/>
				</MyLink>
                <Typography variant="caption">
					{development ? "DEV" : "PROD"} {versionString}, {buildDate}
				</Typography>
			</div>
		</React.Fragment>;

		const chartTitle = this.state.small
			? ""
			: (this.state.selectedCounty === CovidData.allCounties) 
				? this.state.selectedState + "," + this.state.selectedCounty
				: this.state.selectedState + ", " + this.state.selectedCounty + " County";

		if (this.state.statesData && this.state.selectedState) {
			this.countiesList = this.calcCountiesList(this.state.statesData, this.state.selectedState);
		}

		return (
			<div className="app"> 
				{!this.state.small && <div className="header">
					<span className="myheader">Covid-19 Statistics by U.S. State and County</span>
					<br/>
					Updated {this.state.latestDate}
				</div>}

				{!this.state.small && this.state.statesList && <div className="state">
					<RegionTable extra="color1" title="State"
						list={this.state.statesList}
						selection={this.state.selectedState} 
						onSelected={this.handleStateSelected}/></div>}

				{!this.state.small && this.state.statesData && this.state.selectedState && <div className="county">
					<RegionTable extra="color2" title="County"
						list={this.countiesList}
						selection={this.state.selectedCounty} 
						onSelected={this.handleCountySelected}/></div>}

				{this.state.selectedCounty && this.state.statesData && this.state.gotData && <div className="chart">
					<SeriesChart
						params={this.params}
						small={this.state.small}
						appTitle="Covid-19 by US State/County"
						onTitleClick={this.handleTitleClick}
						onFindSeries={this.handleFindSeries}
						updateDate={this.state.latestDate}
						title={chartTitle}
						startDate={this.state.startDate}
						dateList={this.state.dateList}
						label={this.calcChartLabel(this.state.selectedState, this.state.selectedCounty)}
						state={this.state.selectedState}
						county={this.state.selectedCounty}
						series={this.state.statesData[this.state.selectedState].countiesData[this.state.selectedCounty]}>

						{this.state.small && this.state.selectedState && this.state.statesData && <div className="stateSelector">
							<RegionMenu selection={this.state.selectedState} ref={this.stateMenuRef} list={this.state.statesList} onSelected={this.handleStateSelected}/>
						</div>}

						{this.state.small && this.state.selectedCounty && this.state.statesData && <div className="countySelector">
							<RegionMenu selection={this.state.selectedCounty} ref={this.countyMenuRef} list={this.countiesList} onSelected={this.handleCountySelected}/>
						</div>}
					</SeriesChart>
				</div>}

				{!this.state.small && <div className="notes notesContainer">
					{aboutInfo}					
				</div>}

				{this.state.isLoading && <LoadingDialog open={this.state.isLoading}/>}

				{this.state.aboutOpen && <AboutDialog transparent={this.state.aboutTransparent} open={this.state.aboutOpen} onCloseButton={this.handleAboutCloseButton}>
					<div className="notesContainer">
					{aboutInfo}
					</div>
				</AboutDialog>}

				{/*<GestureHandler enabled={this.state.small}
					onSwipeLeft={this.handleSwipeLeft} onSwipeRight={this.handleSwipeRight}
					onSwipeDown={this.handleSwipeDown} onSwipeUp={this.handleSwipeUp}
				/>*/}
			</div>);
	}
}

export default App;
