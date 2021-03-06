export default class CovidData {
    // This class reads a covid states/counties data file, and parses
    // the file into the "statesData" data structure, which like this:
    //
    // statesData =
    // {
    //  Alabama: {
    //      countiesData: {
    //          " All counties": Series,
    //          Alameda: Series,
    //          Marin: Series,
    //          etc...
    //      }
    //  },
    //  Alaska ...,
    //  etc...
    //  " All states": { ... }
    // }
    //
    // "Series" is like this 
    // {
    //      timeline: [{date: ..., cases: ..., deaths: ..., totalCases: ..., totalDeaths: ...}, ...]
    //      cases: nnn,
    //      deaths: nnn,
    //      population: nnn, // this is added in later, using data from GeneralData.js
    //      annualDeaths: nnn // this is added in later, using data from GeneralData.js
    // }

    static allCounties = " All counties"; // the leading space makes it sort first.
    static allStates = " All states";

    // The constructor starts loading the data file from the server.
    // Once the data is available, the "callback" function is called.
    // Callback parameters are (statesData, latestDate)
    constructor(filepath, callback) {
        this.callback = callback;
        this.readDataFile(filepath);
    }

    /*private*/ addToSeries(series, item) {
        series.deaths += item.deaths;
        series.cases += item.cases;
        var timelineItem = series.timeline[item.date];
        if (!timelineItem) {
            timelineItem = {date: item.date, cases: item.cases, deaths: item.deaths,
                cumulativeCases: item.cumulativeCases, cumulativeDeaths: item.cumulativeDeaths};
            series.timeline[item.date] = timelineItem;
        } else {
            timelineItem.deaths += item.deaths;
            timelineItem.cases += item.cases;
            timelineItem.cumulativeCases += item.cumulativeCases;
            timelineItem.cumulativeDeaths += item.cumulativeDeaths;
        }
    }

    /*private*/ optimizeSeries(series) {
        var dates = Object.keys(series.timeline).sort();
        var newTimeline = [];
        for (var i = 0; i < dates.length; i += 1) {
            newTimeline.push(series.timeline[dates[i]]);
        }
        series.timeline = newTimeline;
    }

    // csv columns are: date,county,state,fips,cases,deaths
    /*private*/ receivedDataFile(csvText) {
        var previousCases;
        var previousDeaths;
        var previousCounty;
        var previousState;
        var stateData;
        var nationalSeries = {timeline: [], cases: 0, deaths: 0};
        var statesData = {};
        var latestDate = "2020-01-01";
        var tokens;
        var lines = csvText.split(/[\n\r]+/);
        var linesArray = [];
        for (var i = 0; i < lines.length; i += 1) {
            tokens = lines[i].split(/,/);
            if (tokens.length !== 6) continue;
            if (tokens[0] === "date") continue;
            linesArray.push(tokens);
        }
        linesArray.sort((a, b) => {
            if (a[2] > b[2]) return 1;
            if (a[2] < b[2]) return -1;
            if (a[1] > b[1]) return 1;
            if (a[1] < b[1]) return -1;
            if (a[0] > b[0]) return 1;
            if (a[0] < b[0]) return -1;
            return 0;
        });

        for (var j = 0; j < linesArray.length; j += 1) {
            tokens = linesArray[j];
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

            if (date > latestDate) latestDate = date;

            var newItem = {date: date, cases: cases, deaths: deaths, cumulativeCases: previousCases, cumulativeDeaths: previousDeaths};

            this.addToSeries(nationalSeries, newItem);

            stateData = statesData[stateName];
            if (!stateData) {
                stateData = {series: {timeline: [], cases: 0, deaths: 0}, countiesData: {}};
                statesData[stateName] = stateData;
            }
            this.addToSeries(stateData.series, newItem);

            var countySeries = stateData.countiesData[countyName];
            if (!countySeries) {
                countySeries = {timeline: [], cases: 0, deaths: 0};
                stateData.countiesData[countyName] = countySeries;
            }
            this.addToSeries(countySeries, newItem);
        }

        for (var stateName in statesData) {
            stateData = statesData[stateName];
            stateData.countiesData[CovidData.allCounties] = stateData.series;
            delete stateData.series;
            for (var b in stateData.countiesData) {
                this.optimizeSeries(stateData.countiesData[b]);
            }
        }
        this.optimizeSeries(nationalSeries);
        statesData[CovidData.allStates] = {countiesData: {[CovidData.allCounties]: nationalSeries}};
        this.callback(statesData, latestDate);
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
