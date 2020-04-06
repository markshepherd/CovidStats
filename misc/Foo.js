/**
 *  Material UI Table configuring of heights for dense display.
 *  The Checkboxes need disabling to enable use of smaller row heights.
 *  See the use of "displayRowCheckbox" and "adjustForCheckbox".
 *  TableRow and TableHeaderColumn (of both table header and body) both need
 *  a height value for a height change to have effect.
 *
 *  See https://github.com/callemall/material-ui/issues/1702#issuecomment-142653273
 *  and http://stackoverflow.com/questions/39210565/material-ui-change-rows-height-and-padding-in-table
 *
 **/

import React from 'react';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import { MuiThemeProvider } from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles';

// import MuiThemeProvider from '@material-ui/core/MuiThemeProvider';
// import getMuiTheme from '@material-ui/core/getMuiTheme';

class Example extends React.Component {
  render() {
    const gunnarStyle       = { height: "10px", padding: "0px"};
    
    return (
      <div>
        <Table>
          <TableBody displayRowCheckbox={false}>
            <TableRow style={gunnarStyle}>
              <TableCell style={gunnarStyle}>Ronald Montgomery the Third</TableCell>
              <TableCell style={gunnarStyle}>2</TableCell>
              <TableCell style={gunnarStyle}>3</TableCell>
            </TableRow>
            <TableRow style={gunnarStyle}>
              <TableCell style={gunnarStyle}>William Hearst III</TableCell>
              <TableCell style={gunnarStyle}>5</TableCell>
              <TableCell style={gunnarStyle}>6</TableCell>
            </TableRow>
            <TableRow style={gunnarStyle}>
              <TableCell style={gunnarStyle}>Ronald McDonald Triumphant</TableCell>
              <TableCell style={gunnarStyle}>8</TableCell>
              <TableCell style={gunnarStyle}>9</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
}

const Foo = () => (
  <MuiThemeProvider muiTheme={createMuiTheme()}>
    <Example />
  </MuiThemeProvider>
);

export default Foo;