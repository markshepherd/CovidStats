var chartType = "line";
var yAxisType = "logarithmic";

function doKeyDown(event, func) {
	if(event.keyCode == 39 || event.keyCode == 40) {
		func(1);
	}
	else if(event.keyCode == 38 || event.keyCode == 37) {
		func(-1);
	}
	event.stopPropagation();
}

function toggleScaleType() {
	yAxisType = (yAxisType === 'linear') ? 'logarithmic' : 'linear';
	window.myChart.options.scales.yAxes[0].type = yAxisType;
	window.myChart.update();
}

function toggleChartType() {
	chartType = chartType == "line" ? "bar" : "line";
  	myChart.destroy();
  	myChart = null;
	selectCounty(currentCountyName);
}

var currentStateName;
var currentCountyName;
var currentCounties;
var oldStatesData = {};
// {
//    california: {
//       marin: [{date: "3/1/20", cases: 123, deaths: 1}, ...],
//       sonoma: [{...}, ...]
//       "All counties": [...]
//    }, 
//
//    colorado: {...}
// }
var stateSummaries = {};
var stateTimelines = {};
// {carlifornmae: [{date: "3/1/20", cases: 123, deaths: 1}, ...],
//  alabdef: ....


/*
var currentStateName;
var currentCountyName;
var currentCounties;
var stateMenuModel: [{name: "Alabama", cases: nnn, deaths: nnn}, ...]
var countyMenuModel: [{name: "Alabama", cases: nnn, deaths: nnn}, ...]
*/


var stateNames = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
"Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine",
"Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
"New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma",
"Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
"Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

// Series = {
// 	timeline: [{date: ..., cases: ..., deaths: ...}, ...]
// 	cases: nnn
// 	deaths: nnn
// }

var nationalSeries = {timeline: [], cases: 0, deaths: 0};
// Series

var statesData = {};
// {
// 	Alabama: {
// 		series: Series,
// 		countyNames: ["Alameda", ...]
// 		countiesData: {
// 			Alameda: Series,
// 			Marin: Series,
// 			...
// 		}
// 	},
//  ...
// }

var stateMenuModel = []; // [{name: "Alabama", cases: nnn, deaths: nnn}, ...]
var countyMenuModel; // [{name: "Marin", cases: nnn, deaths: nnn}, ...]

const allCounties = "All counties";
const allStates = "All states";

function sortArrayBy(array, property, numeric, ascending) {
	if (!numeric) {
		array.sort(function(a, b) {
			if (a[property] < b[property]) {
				return ascending ? -1 : 1;
			} else if (a[property] > b[property]) {
				return ascending ? 1 : -1;
			} else {
				return 0;
			}
		});
	} else {
		array.sort(function(a, b) {
			return ascending ? a[property] - b[property] : b[property] - a[property];
		});
	}
}

function makeStateButtons(sortBy) { // name, cases, deaths
	stateMenuModel.push({name: allStates, cases: nationalSeries.cases, deaths: nationalSeries.deaths});
	for (var stateName in statesData) {
		var stateData = statesData[stateName];
		stateMenuModel.push({name: stateName, cases: stateData.series.cases, deaths: stateData.series.deaths});
	}

	sortArrayBy(stateMenuModel, sortBy, sortBy != "name", sortBy == "name");

	var stateButtons = "";
	for (var i = 0; i < stateMenuModel.length; i += 1) {
		var data = stateMenuModel[i];
		stateButtons += `<tr><td><span class="state" onClick="stateClick()">${data.name}</span></td><td class="num">${data.cases}</td><td class="num">${data.deaths}</td></tr>`;
	}

	document.getElementById('stateList').innerHTML = stateButtons;
	//stateList.innerHTML = stateButtons;
}

function makeCountyButtons(stateName, sortBy) { // name, cases, deaths
	var stateData = statesData[stateName];
	countyMenuModel = [];
	if (stateName != allStates) {
		countyMenuModel.push({name: allCounties, cases: stateData.series.cases, deaths: stateData.series.deaths});
		for (var countyName in stateData.countiesData) {
			var countyData = stateData.countiesData[countyName];
			countyMenuModel.push({name: countyName, cases: countyData.cases, deaths: countyData.deaths});
		}
	}
	sortArrayBy(countyMenuModel, sortBy, sortBy != "name", sortBy == "name");

	var countyButtons = "";
	for (var i = 0; i < countyMenuModel.length; i += 1) {
		var data = countyMenuModel[i];
		countyButtons += `<tr><td><span class="county" onClick="countyClick()">${data.name}</span></td><td class="num">${data.cases}</td><td class="num">${data.deaths}</td></tr>`;
	}

	document.getElementById('countyList').innerHTML = countyButtons;
	//countyList.innerHTML = stateButtons;
}

function addToSeries(series, item) {
	series.deaths += item.deaths;
	series.cases += item.cases;
	var timelineItem = series.timeline[item.date];
	if (!timelineItem) {
		timelineItem = {date: item.date, cases: item.cases, deaths: item.deaths};
		series.timeline[item.date] = timelineItem;
	} else {
		timelineItem.deaths += item.deaths;
		timelineItem.cases += item.cases;
	}
}

function optimizeSeries(series) {
	var dates = Object.keys(series.timeline).sort();
	var newTimeline = [];
	for (var i = 0; i < dates.length; i += 1) {
		newTimeline.push(series.timeline[dates[i]]);
	}
	series.timeline = newTimeline;
}

function receivedBigDataFile(text) {
	// alert("got it" + text.substring(0, 25));
	// date,county,state,fips,cases,deaths

	var previousCases;
	var previousDeaths;
	var previousCounty;
	var previousState;

	var lines = text.split(/[\n\r]+/);
	for (var i = 0; i < lines.length; i += 1) {
		var tokens = lines[i].split(/,/);
		if (tokens.length != 6) continue;
		const date = tokens[0];
		const countyName = tokens[1];
		const stateName = tokens[2];
		// we don't use fips which is tokens[3]
		var cases = parseInt(tokens[4], 10);
		var deaths = parseInt(tokens[5], 10);

		if (countyName != previousCounty || stateName != previousState) {
			previousCounty = countyName;
			previousState = stateName;
			previousCases = 0;
			previousDeaths = 0;
		}
		var pc = previousCases;
		var pd = previousDeaths;
		previousCases = cases;
		previousDeaths = deaths;
		cases -= pc;
		deaths -= pd;

		// ---- NEW -----
		var newItem = {date: date, cases: cases, deaths: deaths};

		addToSeries(nationalSeries, newItem);

		var stateData = statesData[stateName];
		if (!stateData) {
			stateData = {series: {timeline: [], cases: 0, deaths: 0}, countyNames: [], countiesData: {}};
			statesData[stateName] = stateData;
		}
		addToSeries(stateData.series, newItem);

		var countySeries = stateData.countiesData[countyName];
		if (!countySeries) {
			countySeries = {timeline: [], cases: 0, deaths: 0};
			stateData.countiesData[countyName] = countySeries;
		}
		addToSeries(countySeries, newItem);

		// ---- OLD -----

		var countiesData = oldStatesData[stateName];
		if (!countiesData) {
			countiesData = {};
			oldStatesData[stateName] = countiesData;
		}

		var countyData = countiesData[countyName]; 
		if (!countyData) {
			countyData = [];
			countiesData[countyName] = countyData;
		}

		countyData.push({date: date, cases: cases, deaths: deaths});

		var stateTimeline = stateTimelines[stateName];
		if (!stateTimeline) {
			stateTimeline = [];
			stateTimelines[stateName] = stateTimeline;
		}

		var stateThisDate = stateTimeline[date];
		if (!stateThisDate) {
			stateThisDate = {date: date, cases: cases, deaths: deaths};
			stateTimeline[date] = stateThisDate;
		} else {
			stateThisDate.cases += cases;
			stateThisDate.deaths += deaths;
		}

		var stateSummary = stateSummaries[stateName];
		if (!stateSummary) {
			stateSummary = {cases: 0, deaths: 0, countySummaries: {}, daily: {}};
			stateSummaries[stateName] = stateSummary;
		}
		var countySummary = stateSummary.countySummaries[countyName];
		if (!countySummary) {
			countySummary = {cases: 0, deaths: 0};
			stateSummary.countySummaries[countyName] = countySummary;
		}
		stateSummary.deaths += deaths;
		stateSummary.cases += cases;
		countySummary.deaths += deaths;
		countySummary.cases += cases;
	}

	for (var k = 0; k < stateNames.length; k += 1) {
		var stateName = stateNames[k];
		var stateTimeline = stateTimelines[stateName];
		var dates = Object.keys(stateTimeline).sort();
		var temp = [];
		for (var j = 0; j < dates.length; j += 1) {
			temp.push(stateTimeline[dates[j]]);
		}
		stateTimelines[stateName] = temp;
	}

	optimizeSeries(nationalSeries);
	for (var stateName in statesData) {
		var stateData = statesData[stateName];
		optimizeSeries(stateData.series);
		stateData.countyNames = Object.keys(stateData.countiesData).sort();
		for (var b in stateData.countiesData) {
			optimizeSeries(stateData.countiesData[b]);
		}
	}

	makeStateButtons("cases"); // name, , deaths
	selectState(allStates);
}

function readBigDataFile() {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState === XMLHttpRequest.DONE) {
			var status = xhr.status;
			if (status === 0 || (status >= 200 && status < 400)) {
				// The request has been completed successfully
				receivedBigDataFile(xhr.responseText);
			} else {
				alert("Couldn't fetch data file: status", status);
			}
		}
	};
	xhr.open("GET", "us-counties-4-4-sorted.csv");
	xhr.send();
}

var chartData = {
	labels: ['January', 'February'],
	datasets: [{
		label: 'Daily New Cases',
		backgroundColor: Chart.helpers.color(window.chartColors.green).alpha(0.5).rgbString(),
		borderColor: window.chartColors.green,
		borderWidth: 2,
		fill: false,
		data: [123, 456]
	},
	{
		label: 'Daily Deaths',
		backgroundColor: Chart.helpers.color(window.chartColors.blue).alpha(0.5).rgbString(),
		borderColor: window.chartColors.blue,
		borderWidth: 2,
		fill: false,
		data: [123, 456]
	}]
};

function createChart(title) {
	if (!window.myChart) {
		var settings = {
			type: chartType,
			data: chartData,
			options: {
				animation: {
					duration: 300
				},
				responsive: true,
				legend: {position: 'top'},
				title: {display: true, text: title},
				scales: {
					xAxes: [{
						display: true
					}],
					yAxes: [{
						display: true,
						type: yAxisType,
						ticks: {
							callback: function(value, index, values) {
								return value;
							}
						}
					}]
				}
			}
		};
		var context = document.getElementById('canvas').getContext('2d');
		window.myChart = new Chart(context, settings);
		document.getElementById('container').style.visibility = "visible";
	} else {
		window.myChart.options.title.text = title;
		window.myChart.update();
	}
}

window.onload = function() {
	readBigDataFile();
};

function selectState(stateName) {
	displayStateName.innerHTML = `<b>${stateName}</b>`;
	currentStateName = stateName;
	if (stateName == allStates) {
		displayStateStats.innerHTML = `${nationalSeries.cases} cases, ${nationalSeries.deaths} deaths.`;
	} else {
		var stateData = statesData[stateName];
		displayStateStats.innerHTML = `${stateData.series.cases} cases, ${stateData.series.deaths} deaths.`;
	}
	makeCountyButtons(stateName, "cases");
	selectCounty(countyMenuModel[0] ? countyMenuModel[0].name : "");
}

function stateClick() {
	selectState(event.srcElement.innerHTML);
}

function countyClick() {
	selectCounty(event.srcElement.innerHTML);
}

function selectCounty(countyName) {
	var timeline; // array of {date: xx, cases: xx, deaths: xx}
	if (currentStateName == allStates) {
		timeline = nationalSeries.timeline;
	} else {
		timeline = countyName == allCounties 
			? stateTimelines[currentStateName]
			: oldStatesData[currentStateName][countyName];
	};

	var labels = [];
	var casesData = [];
	var deathsData = [];
	for (var i = 0; i < timeline.length; i += 1) {
		var item = timeline[i];
		labels.push(item.date.replace(/2020-/, ""));
		casesData.push(item.cases);
		deathsData.push(item.deaths);
	}

	chartData.labels = labels;
	chartData.datasets[0].data = casesData;
	chartData.datasets[1].data = deathsData;
	document.getElementById('container').style.visibility = "visible";
	var title = (currentStateName == allStates)
		? currentStateName
		: countyName + ((countyName != allCounties) ? " county, " : ", ") + currentStateName;
	createChart(title);
	currentCountyName = countyName;
	displayCountyName.innerHTML = (countyName == allCounties) ? "" : `<b>${countyName}</b> county`;
	if (currentStateName != allStates) {
		var countySummary = stateSummaries[currentStateName].countySummaries[countyName];  
		displayCountyStats.innerHTML = (countyName == allCounties) ? "" : `${countySummary.cases} cases, ${countySummary.deaths} deaths.`;
	}
}

function findNext(direction, menuModel, current) {
	for (var i = 0; i < menuModel.length; i += 1) {
		var name = menuModel[i].name;
		if (name == current) {
			var newIndex = i + direction;
			if (newIndex >= 0 && newIndex < menuModel.length) {
				return menuModel[newIndex].name;
			}
		}
	}
	return null;
}

function nextCounty(direction) {
	var next = findNext(direction, countyMenuModel, currentCountyName);
	if (next) {
		selectCounty(next);
	}
}

function nextState(direction) {
	var next = findNext(direction, stateMenuModel, currentStateName);
	if (next) {
		selectState(next);
	}
}
