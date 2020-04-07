import React from 'react';
import { 
	Button,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	TableContainer
} from '@material-ui/core';
import './App.css';

// trying to make the table entry height as small as possible. I got some ideas from
// https://stackoverflow.com/questions/39210565/material-ui-change-rows-height-and-padding-in-table
const slimStyle = {height: "0px", padding: "0px"};
const buttonsStyle = {position: "relative", left: "0px", width: "150px"};
const regionTableStyle = {
    height: "500px",
    width: "150px",
    maxHeight: "500px",
};

class RegionTable extends React.Component {
	constructor(props) {
		super(props);
		this.style = Object.assign({backgroundColor: props.backgroundColor}, regionTableStyle);
		this.state = {selection: null, list: props.list};
	    this.handleCellClick = this.handleCellClick.bind(this);		
	    this.select = this.select.bind(this);		
	    this.handleNextClick = this.handleNextClick.bind(this);		
	    this.handlePrevClick = this.handlePrevClick.bind(this);		
	    this.sortByName = this.sortByName.bind(this);		
	    this.sortByCases = this.sortByCases.bind(this);
	    this.sortBy = "cases";	
	    this.selectedRef = React.createRef();
	    this.tableContainerRef = React.createRef();
	    this.selectedIndex = -1;
	}

	sortArray(array, property, numeric, ascending) {
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

	select(name) {
		this.setState({selection: name});
		for (var i = 0; i < this.state.list.length; i += 1) {
			if (this.state.list[i].name === name) {
				this.selectedIndex = i;
				break;
			}
		}
		this.props.selected(name);
	}

	handleCellClick(e, name) {
		this.select(name);
	}

	handleNextClick(e) {
		if (this.selectedIndex < this.state.list.length - 1) {
			this.selectedIndex += 1;
		}
		this.select(this.state.list[this.selectedIndex].name);	
	}

	handlePrevClick(e) {
		if (this.selectedIndex > 0) {
			this.selectedIndex -= 1;
		}
		this.select(this.state.list[this.selectedIndex].name);	
	}

	sortByName() {
		this.setState({sortBy: "name"});
	}

	sortByCases() {
		this.setState({sortBy: "cases"});
	}

	createSortedList() {
		var list;
		if (this.state.sortBy === "cases") {
			list = this.sortArray(this.props.list, "cases", true, false);
		} else {
			list = this.sortArray(this.props.list, "name", false, true);
		}
		this.setState({list: list});
	}

	ensureSelectionVisible() {
		const container = this.tableContainerRef.current;
		const row = this.selectedRef.current;
		if (!row) return;
		const containerVisibleHeight = container.scrollHeight - container.scrollTopMax;
		const rowBottom = row.offsetTop + row.offsetHeight;
		if (rowBottom < (container.scrollTop + containerVisibleHeight) && (row.offsetTop - row.offsetHeight) > container.scrollTop) {
			return;
		}

		this.selectedRef.current.scrollIntoView();
		if (container.scrollTop < (row.offsetTop + 100) && container.scrollTop !== container.scrollTopMax) {
			this.tableContainerRef.current.scrollBy(0, -100);
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		this.ensureSelectionVisible();
		if (prevState.sortBy != this.state.sortBy || prevProps.list !== this.props.list) {
			this.createSortedList();
		}
	}

	render() {
		return (<div>
			<div style={buttonsStyle}>
				<Button onClick={this.handlePrevClick}>◀</Button>
				<Button onClick={this.handleNextClick}>▶</Button>
			</div>
			<TableContainer ref={this.tableContainerRef} style={this.style}>
				{/* onRowClicked={this.handleRowSelected} */}
				<Table stickyHeader style={slimStyle} size="small">
					<TableHead>
            			<TableRow style={slimStyle}>
              				<TableCell style={slimStyle} onClick={this.sortByName} align="left">{this.props.title}</TableCell>
              				<TableCell style={slimStyle} onClick={this.sortByCases} align="right">Cases</TableCell>
            			</TableRow>            
     				</TableHead>

					<TableBody>
	  					{this.state.list.map((item) => {
	  						var selected = item.name === this.state.selection;

					  		return <TableRow ref={selected ? this.selectedRef : null} selected={selected} style={slimStyle} key={item.name} onClick={this.props.itemClick}>
								<TableCell style={slimStyle} align="left" onClick={(e) => this.handleCellClick(e, item.name)}>{item.name}</TableCell>
								<TableCell style={slimStyle} align="right" onClick={(e) => this.handleCellClick(e, item.name)}>{item.cases}</TableCell>
				  			</TableRow>
					    })}
					</TableBody>
				</Table>
			</TableContainer>
		</div>);
	}
}

export default RegionTable;