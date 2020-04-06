import React from 'react';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
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
const tableSizeStyle = {height: "500px", width: "150px", maxHeight: "500px", backgroundColor: "#fffff0"};

const HelloWorld = () => {
  
  function listItemClick(e) {

  }

  function makeTable() {
	return <TableContainer style={tableSizeStyle}>
				<Table style={slimStyle} size="small">
					<TableBody>
	  					{stateNames.map((stateName) => {
					  		return <TableRow style={slimStyle} key={stateName} onClick={listItemClick}>
								<TableCell style={slimStyle} component="th" scope="row" padding="none">
					            	{stateName}
					            </TableCell>
								<TableCell style={slimStyle} align="right">{stateName.length * stateName.length}</TableCell>
					  		</TableRow>
					    })}
					</TableBody>
				</Table>
			</TableContainer>;
  }

  return (
  	<div>
	    <div style={tableSizeStyle}>
		    {makeTable()}
		</div>
	</div>
  );
};

export default HelloWorld;