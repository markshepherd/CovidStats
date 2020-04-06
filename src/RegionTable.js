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
	    this.handleClick = this.handleClick.bind(this);		
	    this.select = this.select.bind(this);		
	    this.nextStateClick = this.nextStateClick.bind(this);		
	    this.prevStateClick = this.prevStateClick.bind(this);		
	    // this.handleScroll = this.handleScroll.bind(this);	
	    this.selectedRef = React.createRef();
	    this.tableContainerRef = React.createRef();
	    this.selectedStateIndex = -1;
	}

	select(name) {
		this.setState({selection: name});
		for (var i = 0; i < this.props.list.length; i += 1) {
			if (this.props.list[i].name === name) {
				this.selectedStateIndex = i;
				return;
			}
		}	
	}

	handleKey(e) {
		alert(e);
	}

	handleClick(e, name) {
		this.select(name);
	}

	nextStateClick(e) {
		if (this.selectedStateIndex < this.props.list.length - 1) {
			this.selectedStateIndex += 1;
		}
		this.select(this.props.list[this.selectedStateIndex].name);	
	}

	prevStateClick(e) {
		if (this.selectedStateIndex > 0) {
			this.selectedStateIndex -= 1;
		}
		this.select(this.props.list[this.selectedStateIndex].name);	
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
			<TableContainer ref={this.tableContainerRef} onKeyDown={this.handleKey} style={regionTableStyle}>
				{/* onRowClicked={this.handleRowSelected} */}
				<Table stickyHeader style={slimStyle} size="small">
					<TableHead>
            			<TableRow style={slimStyle}>
              				<TableCell style={slimStyle} align="left">State</TableCell>
              				<TableCell style={slimStyle} align="right">Cases</TableCell>
            			</TableRow>            
     				</TableHead>

					<TableBody>
	  					{this.props.list.map((item) => {
	  						var selected = item.name === this.state.selection;

					  		return <TableRow ref={selected ? this.selectedRef : null} selected={selected} style={slimStyle} key={item.name} onClick={this.props.itemClick}>
								<TableCell style={slimStyle} align="left" onClick={(e) => this.handleClick(e, item.name)}>{item.name}</TableCell>
								<TableCell style={slimStyle} align="right" onClick={(e) => this.handleClick(e, item.name)}>{item.cases}</TableCell>
				  			</TableRow>
					    })}
					</TableBody>
				</Table>
			</TableContainer>
			<div style={buttonsStyle}>
				<Button onClick={this.prevStateClick}>◀</Button>
				<Button onClick={this.nextStateClick}>▶</Button>
			</div>
		</div>);
	}
}

export default RegionTable;