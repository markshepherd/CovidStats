import React from 'react';
import HelloWorld from './HelloWorld';
import './App.css';
import Mortgage from './mortgage2';
import { List, ListItem, ListItemText } from '@material-ui/core';


function makeList(listItemClick) {
	const data = [{name: "abc", cases: 123}, {name: "defgh", cases: 55}, {name: "IUiasf", cases: 932}];
	return <List class="myList">
      	{data.map((datum) => {
      		return (<ListItem button key={datum.name} dense="true" onClick={listItemClick}>
    			<ListItemText key={datum.name} primary={datum.name} />
  			</ListItem>);
        })}
   </List>;
}

function calcOptions() {
	let mortgage = new Mortgage(99, 99, 99);
	return <React.Fragment>
				<option value="grapefruit">Grapefruit</option>
				<option value="lime">Lime</option>
				<option value="coconut">Coconut</option>
				<option value="mango">Mango</option>
			</React.Fragment>;
}

class BlahOld extends React.Component {
	constructor(props) {
		super(props);
		this.state = {county: "Marin"};
	}

	sayHello() {
		alert('Hello, World!');
	}
	  
	myListItemClick(e) {
		console.log(e);
	}

	render() {
		return (
			<div className="BlahOld">
				<HelloWorld />
				
		  		{/*true || <EnhancedTable/>*/}
			    {true || <button onClick={this.sayHello}>xxxxClick me!</button>}
			    {true || <br/>}
			    {/*true || <Button variant="contained" color="primary">Hello World</Button>*/}

				{true || <select className="mybutton3" defaultValue="mango">{calcOptions()}</select>}

				{true || <p>{this.state.county}</p>}

				{true || makeList(this.myListItemClick)}
			</div>
		);
	}
}

export default BlahOld;
