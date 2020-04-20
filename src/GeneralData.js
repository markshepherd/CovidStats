import CovidData from './CovidData';

export default class GeneralData {
	// This class reads a general states/counties data file, and parses
	// the file into the "generalData" data structure, which like this:
	//
	// generalData =
	// {
	// 	Alabama: {
	// 		" All counties": CountyInfo,
	// 		Alameda: CountyInfo,
	// 		Marin: CountyInfo,
	// 		etc...
	// 	},
	// 	Alaska ...,
	// 	etc...
	// 	" All states": { ... }
	// }
	//
	// "CountyInfo" is like this 
	// {
	// 		population: <n>,
	// 	    annualDeaths: <n>
	// }

	// The constructor starts loading the data file from the server.
	// Once the data is available, the "callback" function is called.
	// Callback parameters are (generalData)
	constructor(filepath, callback) {
		this.callback = callback;
		this.readDataFile(filepath);
	}

	// csv columns are: REGION,DIVISION,STATE,COUNTY,STNAME,CTYNAME,POPESTIMATE2019,DEATHS2019
	/*private*/ receivedDataFile(csvText) {
		var tokens;
		var lines = csvText.split(/[\n\r]+/);
		var linesArray = [];
		for (var i = 0; i < lines.length; i += 1) {
			tokens = lines[i].split(/,/);
			if (tokens.length !== 8) continue;
			if (tokens[0] === "REGION") continue;
			linesArray.push(tokens);
		}
		linesArray.sort((a, b) => {
			if (a[4] > b[4]) return 1;
			if (a[4] < b[4]) return -1;
			if (a[5] > b[5]) return 1;
			if (a[5] < b[5]) return -1;
			return 0;
		});

		var result = {};
		var populationTotal = 0;
		var annualDeathsTotal = 0;

		for (var j = 0; j < linesArray.length; j += 1) {
			tokens = linesArray[j];

			const stateName = tokens[4];
			var stateInfo = result[stateName];
			if (!stateInfo) {
				stateInfo = {};
				result[stateName] = stateInfo;
			}

			var countyName = tokens[5].replace(/ (Parish|County|Municipality)$/, "");
			var population = parseInt(tokens[6]);
			var annualDeaths = parseInt(tokens[7]);
			if (countyName === "All") {
				countyName = CovidData.allCounties;
				populationTotal += population;
				annualDeathsTotal += annualDeaths;
			}

			stateInfo[countyName] = {population: population, annualDeaths: parseInt(tokens[7])};
		}

		result[CovidData.allStates] = {[CovidData.allCounties]: {population: populationTotal, annualDeaths: annualDeathsTotal}};
		this.callback(result);
	}

	/*private*/ readDataFile(filepath) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if(xhr.readyState === XMLHttpRequest.DONE) {
				var status = xhr.status;
				if (status === 0 || (status >= 200 && status < 400)) {
					// The request has been completed successfully
					this.receivedDataFile(xhr.responseText);
				} else {
					alert("Couldn't fetch data file: status", status);
				}
			}
		};
		xhr.open("GET", filepath);
		xhr.send();
	}
}
