export default class CovidData {

	stateNames = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
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

	nationalSeries = {timeline: [], cases: 0, deaths: 0};
	// Series

	statesData = {};
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

	sortArrayBy(array, property, numeric, ascending) {
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

	// 	sortArrayBy(stateMenuModel, sortBy, sortBy != "name", sortBy == "name");

	addToSeries(series, item) {
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

	optimizeSeries(series) {
		var dates = Object.keys(series.timeline).sort();
		var newTimeline = [];
		for (var i = 0; i < dates.length; i += 1) {
			newTimeline.push(series.timeline[dates[i]]);
		}
		series.timeline = newTimeline;
	}

	receivedBigDataFile(text) {
		// alert("got it" + text.substring(0, 25));
		// date,county,state,fips,cases,deaths

		var previousCases;
		var previousDeaths;
		var previousCounty;
		var previousState;
		var stateData;

		var lines = text.split(/[\n\r]+/);
		for (var i = 0; i < lines.length; i += 1) {
			var tokens = lines[i].split(/,/);
			if (tokens.length !== 6) continue;
			const date = tokens[0];
			const countyName = tokens[1];
			const stateName = tokens[2];
			// we don't use fips which is tokens[3]
			var cases = parseInt(tokens[4], 10);
			var deaths = parseInt(tokens[5], 10);

			if (countyName !== previousCounty || stateName !== previousState) {
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

			var newItem = {date: date, cases: cases, deaths: deaths};

			this.addToSeries(this.nationalSeries, newItem);

			stateData = this.statesData[stateName];
			if (!stateData) {
				stateData = {series: {timeline: [], cases: 0, deaths: 0}, countyNames: [], countiesData: {}};
				this.statesData[stateName] = stateData;
			}
			this.addToSeries(stateData.series, newItem);

			var countySeries = stateData.countiesData[countyName];
			if (!countySeries) {
				countySeries = {timeline: [], cases: 0, deaths: 0};
				stateData.countiesData[countyName] = countySeries;
			}
			this.addToSeries(countySeries, newItem);
		}

		this.optimizeSeries(this.nationalSeries);
		for (var stateName in this.statesData) {
			stateData = this.statesData[stateName];
			this.optimizeSeries(stateData.series);
			stateData.countyNames = Object.keys(stateData.countiesData).sort();
			for (var b in stateData.countiesData) {
				this.optimizeSeries(stateData.countiesData[b]);
			}
		}
		this.callback({nationalSeries: this.nationalSeries, statesData: this.statesData});
	}

	readBigDataFile() {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if(xhr.readyState === XMLHttpRequest.DONE) {
				var status = xhr.status;
				if (status === 0 || (status >= 200 && status < 400)) {
					// The request has been completed successfully
					this.receivedBigDataFile(xhr.responseText);
				} else {
					alert("Couldn't fetch data file: status", status);
				}
			}
		};
		xhr.open("GET", "build/us-counties-4-4-sorted.csv");
		xhr.send();
	}

	constructor(callback) {
		this.callback = callback;
		this.readBigDataFile();
	}
}
