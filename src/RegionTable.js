import React from 'react';
import { 
	Link,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	TableContainer
} from '@material-ui/core';
import Analytics from './Analytics';
import './RegionTable.css';

const slimStyle = {height: "0px", padding: "0px"};

export default class RegionTable extends React.Component {
	constructor(props) {
		super(props);
		this.selectedIndex = 0;
		this.state = {
			selection: this.props.list[this.selectedIndex].name,
			list: this.createSortedList("cases", false), 
			sortBy: "cases",
			sortAscending: false
		};
	    this.handleCellClick = this.handleCellClick.bind(this);		
	    this.select = this.select.bind(this);		
	    this.handleNextClick = this.handleNextClick.bind(this);		
	    this.handlePrevClick = this.handlePrevClick.bind(this);		
	    this.toggleSort = this.toggleSort.bind(this);
	    this.selectedRef = React.createRef();
	    this.tableContainerRef = React.createRef();
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
		this.props.onSelected(name);
	}

	handleCellClick(e, name) {
		Analytics.itemSelected(this.props.title, name);
		this.select(name);
	}

	findSelectedIndex() {
		for (var i = 0; i < this.state.list.length; i += 1) {
			if (this.state.list[i].name === this.state.selection) {
				return i;
			}
 		}
 		// alert("error");
	}

	handleNextClick(e) {
		let index = this.findSelectedIndex();
		if (index < this.state.list.length - 1) {
			index += 1;
		}
		this.select(this.state.list[index].name);	
		Analytics.arrowClicked();
	}

	handlePrevClick(e) {
		let index = this.findSelectedIndex();
		if (index > 0) {
			index -= 1;
		}
		this.select(this.state.list[index].name);	
		Analytics.arrowClicked();
	}

	toggleSort() {
		if (this.state.sortBy === "cases") {
			this.setState({sortBy: "name", sortAscending: true});
		} else {
			this.setState({sortBy: "cases", sortAscending: false});
		}
	}

	createSortedList(sortBy, ascending) {
		if (sortBy === "cases") {
			return this.sortArray(this.props.list, "cases", true, ascending);
		} else {
			return this.sortArray(this.props.list, "name", false, ascending);
		}
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


	listsEqual(a, b) {
		return (a.length === b.length) && (a.length === 0 || (a[0].name === b[0].name));
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		var listChanged = !this.listsEqual(prevProps.list, this.props.list);
		if ((prevState.sortBy !== this.state.sortBy) || (prevState.sortAscending !== this.state.sortAscending) || listChanged) {
			this.setState({list: this.createSortedList(this.state.sortBy, this.state.sortAscending)});
		}
		if (listChanged) {
			this.selectedIndex = 0;
			this.select(this.state.list[this.selectedIndex].name);	
		}
		this.ensureSelectionVisible();
	}

	componentDidMount() {
		this.props.onSelected(this.state.selection);
	}

	render() {
		var tableClasses = `tableContainer ${this.props.extra}`;
		return (<div className="tableRoot">
			<div className="forwardBackButtons">
				<Link href="#" onClick={this.handlePrevClick}>◀</Link>
				&nbsp;
				<Link href="#" onClick={this.handleNextClick}>▶</Link>
			</div>
			<TableContainer ref={this.tableContainerRef} className={tableClasses}>
				<Table stickyHeader style={slimStyle} size="small">
					<TableHead>
            			<TableRow>
              				<TableCell style={slimStyle} onClick={this.toggleSort} align="left">{this.props.title}{this.state.sortBy === "name" ? "▲" : ""}</TableCell>
              				<TableCell style={slimStyle} onClick={this.toggleSort} align="right">{this.state.sortBy === "cases" ? "▼" : ""}Cases</TableCell>
            			</TableRow>            
     				</TableHead>

					<TableBody>
	  					{this.state.list.map((item) => {
	  						var selected = item.name === this.state.selection;

					  		return <TableRow ref={selected ? this.selectedRef : null} selected={selected} key={item.name} onClick={this.props.itemClick}>
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
