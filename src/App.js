import React from 'react';
import RegionTable from './RegionTable';
import CovidData from './CovidData';
import './App.css';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	calcStatesList(statesData) {
		const result = [];
		const keys = Object.keys(statesData).sort();
		for (var i = 0; i < keys.length; i += 1) {
			const stateName = keys[i];
			const stateData = statesData[stateName];
			result.push({name: stateName, cases: stateData.series.cases});
		}
		return result;
	}

	componentDidMount() {
		this.covidData = new CovidData((data) => {
			data.statesList = this.calcStatesList(data.statesData);
			this.setState(data);
		});
	}

	render() {
		return (
			<div className="App">
				{this.state.statesList && <RegionTable list={this.state.statesList}/>}
			</div>
		);
	}
}

export default App;
