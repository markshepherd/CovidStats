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
    backgroundColor: "#fffff0"
};

class RegionTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selection: null};
	    this.handleCellClick = this.handleCellClick.bind(this);		
	    this.select = this.select.bind(this);		
	    this.handleNextClick = this.handleNextClick.bind(this);		
	    this.handlePrevClick = this.handlePrevClick.bind(this);		
	    this.selectedRef = React.createRef();
	    this.tableContainerRef = React.createRef();
	    this.selectedIndex = -1;
	}

	select(name) {
		this.setState({selection: name});
		for (var i = 0; i < this.props.list.length; i += 1) {
			if (this.props.list[i].name === name) {
				this.selectedIndex = i;
				return;
			}
		}	
	}

	handleCellClick(e, name) {
		this.select(name);
	}

	handleNextClick(e) {
		if (this.selectedIndex < this.props.list.length - 1) {
			this.selectedIndex += 1;
		}
		this.select(this.props.list[this.selectedIndex].name);	
	}

	handlePrevClick(e) {
		if (this.selectedIndex > 0) {
			this.selectedIndex -= 1;
		}
		this.select(this.props.list[this.selectedIndex].name);	
	}

	// handleScroll(msg, e) {
	// 	//console.log(msg, e);
	// }

	// handleRowSelected(e) {
	// 	//console.log("handleRowSelected", e);
	// }

	componentDidUpdate(prevProps, prevState, snapshot) {
		const container = this.tableContainerRef.current;
		const row = this.selectedRef.current;
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

	render() {
		return (<div>
			<TableContainer ref={this.tableContainerRef} style={regionTableStyle}>
				{/* onRowClicked={this.handleRowSelected} */}
				<Table stickyHeader style={slimStyle} size="small">
					<TableHead>
            			<TableRow style={slimStyle}>
              				<TableCell style={slimStyle} align="left">{this.props.title}</TableCell>
              				<TableCell style={slimStyle} align="right">Cases</TableCell>
            			</TableRow>            
     				</TableHead>

					<TableBody>
	  					{this.props.list.map((item) => {
	  						var selected = item.name === this.state.selection;

					  		return <TableRow ref={selected ? this.selectedRef : null} selected={selected} style={slimStyle} key={item.name} onClick={this.props.itemClick}>
								<TableCell style={slimStyle} align="left" onClick={(e) => this.handleCellClick(e, item.name)}>{item.name}</TableCell>
								<TableCell style={slimStyle} align="right" onClick={(e) => this.handleCellClick(e, item.name)}>{item.cases}</TableCell>
				  			</TableRow>
					    })}
					</TableBody>
				</Table>
			</TableContainer>
			<div style={buttonsStyle}>
				<Button onClick={this.handlePrevClick}>◀</Button>
				<Button onClick={this.handleNextClick}>▶</Button>
			</div>
		</div>);
	}
}

export default RegionTable;