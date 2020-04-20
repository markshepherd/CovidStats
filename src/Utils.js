
export default class Utils {
	static sortArray(array, property, numeric, ascending) {
		var newArray = [];
		for (var i = 0; i < array.length; i += 1) {
			newArray.push(Object.assign({}, array[i]));
		}

		if (!numeric) {
			newArray.sort(function(a, b) {
				if (a[property] < b[property]) {
					return ascending ? -1 : 1;
				} else if (a[property] > b[property]) {
					return ascending ? 1 : -1;
				} else {
					return 0;
				}
			});
		} else {
			newArray.sort(function(a, b) {
				return ascending ? a[property] - b[property] : b[property] - a[property];
			});
		}
		return newArray;
	}

	static findIndex(list, name) {
		for (var i = 0; i < list.length; i += 1) {
			if (list[i].name === name) {
				return i;
			}
 		}
 		return -1;
 		// alert("error");
	}

	static listsEqual(a, b) {
		return (a.length === b.length) && (a.length === 0 || (a[0].name === b[0].name));
	}


	static findDateIndex(date, dateList) {
		var result = dateList.findIndex((element) => { 
			var x = element === date;
			return x;
		});
		return result;
	}

	static trimToStartDate (startDate, series, dateList) {
		if (!series || !series.timeline || series.timeline.length === 0) {
			return series;
		}
		for(var i = 0; i < series.timeline.length; i += 1) {
			if (startDate <= series.timeline[i].date) {
				var result = Object.assign({}, series);
				result.timeline = series.timeline.slice(i);
				var desiredIndex = Utils.findDateIndex(startDate, dateList);
				var currentIndex = Utils.findDateIndex(result.timeline[0].date, dateList);
				while(desiredIndex < currentIndex) {
					currentIndex -= 1;
					result.timeline.unshift(
						{date: dateList[currentIndex], cases: 0, deaths: 0});
				}
				return result;
			}
		}
		return series;
	}

	static findMin(array) {
		let min = Number.POSITIVE_INFINITY;
		for (let i = 0; i < array.length; i += 1) {
			min = Math.min(min, array[i]);
		}
		return min;
	}

	static findMax(array) {
		let max = Number.NEGATIVE_INFINITY;
		for (let i = 0; i < array.length; i += 1) {
			max = Math.max(max, array[i]);
		}
		return max;
	}

	static stateAbbreviations = {
		"alabama": "AL",
		"alaska": "AK",
		"arizona": "AZ",
		"arkansas": "AR",
		"california": "CA",
		"colorado": "CO",
		"connecticut": "CT",
		"delaware": "DE",
		"district of columbia": "DC",
		"florida": "FL",
		"georgia": "GA",
		"hawaii": "HI",
		"idaho": "ID",
		"illinois": "IL",
		"indiana": "IN",
		"iowa": "IA",
		"kansas": "KS",
		"kentucky": "KY",
		"louisiana": "LA",
		"maine": "ME",
		"maryland": "MD",
		"massachusetts": "MA",
		"michigan": "MI",
		"minnesota": "MN",
		"mississippi": "MS",
		"missouri": "MO",
		"montana": "MT",
		"nebraska": "NE",
		"nevada": "NV",
		"new hampshire": "NH",
		"new jersey": "NJ",
		"new mexico": "NM",
		"new york": "NY",
		"north carolina": "NC",
		"north dakota": "ND",
		"ohio": "OH",
		"oklahoma": "OK",
		"oregon": "OR",
		"pennsylvania": "PA",
		"rhode island": "RI",
		"south carolina": "SC",
		"south dakota": "SD",
		"tennessee": "TN",
		"texas": "TX",
		"utah": "UT",
		"vermont": "VT",
		"virginia": "VA",
		"washington": "WA",
		"west virginia": "WV",
		"wisconsin": "WI",
		"wyoming": "WY",
		"puerto rico": "PR",
	};

	static stateAbbreviation(stateName) {
		return Utils.stateAbbreviations[stateName.toLowerCase()] || stateName.substring(0,2).toUpperCase();
	}
}
