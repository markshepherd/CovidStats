import React from 'react';
import EnhancedTable from './EnhancedTable';
import Button from '@material-ui/core/Button';

import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';

const stateNames = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
"Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine",
"Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
"New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma",
"Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
"Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

// trying to make the table entry height as small as possible. I got some ideas from
// https://stackoverflow.com/questions/39210565/material-ui-change-rows-height-and-padding-in-table
const slimStyle = {height: "0px", padding: "0px"};
const tableSizeStyle = {height: "500px", width: "250px", maxHeight: "500px"};

const HelloWorld = () => {
  
  function sayHello() {
    alert('Hello, World!');
  }
  
  function listItemClick(e) {

  }

  function makeTable() {
	return <TableContainer style={tableSizeStyle}>
				<Table style={slimStyle} size="small">
  					{stateNames.map((stateName) => {
				  		return <TableRow style={slimStyle} onClick={listItemClick}>
							<TableCell style={slimStyle} component="th" scope="row" padding="none">
				            	{stateName}
				            </TableCell>
							<TableCell style={slimStyle} align="right">{stateName.length}</TableCell>
							<TableCell style={slimStyle} align="right">{stateName.length * stateName.length}</TableCell>
				  		</TableRow>
				    })}
				</Table>
			</TableContainer>;
  }

  return (
  	<div>
  		{true || <EnhancedTable/>}
	    {true || <button onClick={sayHello}>xxxxClick me!</button>}
	    {true || <br/>}
	    {true || <Button variant="contained" color="primary">Hello World</Button>}

	    <div style={tableSizeStyle}>
		    {makeTable()}
		</div>
	</div>
  );
};

export default HelloWorld;