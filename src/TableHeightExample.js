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
 const {
  Table,
  TableHeader,
  TableHeaderColumn,
  TableBody,
  TableRow,
  TableRowColumn,
  MuiThemeProvider,
  getMuiTheme,
} = MaterialUI;

 class Example extends React.Component {
  render() {
    const gunnarStyle       = { height: "10px", padding: "0px"};
    
    return (
      <div>
        <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow style={gunnarStyle}>
              <TableHeaderColumn style={gunnarStyle}>President</TableHeaderColumn>
              <TableHeaderColumn style={gunnarStyle}>Incidents that got recorded</TableHeaderColumn>
              <TableHeaderColumn style={gunnarStyle}>Number of people killed in riots</TableHeaderColumn>
            </TableRow>            
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            <TableRow style={gunnarStyle}>
              <TableRowColumn style={gunnarStyle}>Ronald Montgomery the Third</TableRowColumn>
              <TableRowColumn style={gunnarStyle}>2</TableRowColumn>
              <TableRowColumn style={gunnarStyle}>3</TableRowColumn>
            </TableRow>
            <TableRow style={gunnarStyle}>
              <TableRowColumn style={gunnarStyle}>William Hearst III</TableRowColumn>
              <TableRowColumn style={gunnarStyle}>5</TableRowColumn>
              <TableRowColumn style={gunnarStyle}>6</TableRowColumn>
            </TableRow>
            <TableRow style={gunnarStyle}>
              <TableRowColumn style={gunnarStyle}>Ronald McDonald Triumphant</TableRowColumn>
              <TableRowColumn style={gunnarStyle}>8</TableRowColumn>
              <TableRowColumn style={gunnarStyle}>9</TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
}

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    <Example />
  </MuiThemeProvider>
);

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
