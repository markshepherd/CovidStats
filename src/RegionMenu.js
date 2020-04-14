import React from 'react';
import { FormControl, Link, MenuItem, Select } from '@material-ui/core';
import './RegionMenu.css';
import Analytics from './Analytics';

export default class RegionMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selection: this.props.list.length > 0 ? this.props.list[0].name : ""};
	}


	listsEqual(a, b) {
		return (a.length === b.length) && (a.length === 0 || (a[0].name === b[0].name));
	}

	findSelectedIndex() {
		for (var i = 0; i < this.props.list.length; i += 1) {
			if (this.props.list[i].name === this.state.selection) {
				return i;
			}
 		}
	}

	select = (name) => {
		this.setState({selection: name});
		this.props.onSelected(name);
	}

	handleDownClick = (e) => {
		let index = this.findSelectedIndex();
		if (index < this.props.list.length - 1) {
			index += 1;
		}
		this.select(this.props.list[index].name);
		Analytics.arrowClicked();
	}

	handleUpClick = (e) => {
		let index = this.findSelectedIndex();
		if (index > 0) {
			index -= 1;
		}
		this.select(this.props.list[index].name);
		Analytics.arrowClicked();
	}

	handleSelectChanged = (e) => {
		this.select(e.currentTarget.textContent);
		Analytics.menuSelection();
	}

	componentDidMount = () => {
		this.props.onSelected(this.state.selection);
	}

	componentDidUpdate = (prevProps, prevState, snapshot) => {
		if (!this.listsEqual(prevProps.list, this.props.list)) {
			this.select(this.props.list[0].name);	
		}
	}

	render() {
		return (<div>
			<FormControl>
		        <Select
		        	className="regionMenu"
		        	labelId="demo-simple-select-label"
		        	id="demo-simple-select"
		        	value={this.state.selection}
		        	onChange={this.handleSelectChanged}
		        >
		        	{this.props.list.map((item) => {
						return <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>
				    })}
		        </Select>
		    </FormControl>
		    <div className="upDownButtons">
				<Link href="#" onClick={this.handleUpClick} className="upDownButton">▲</Link>
				<Link href="#" onClick={this.handleDownClick} className="upDownButton">▼</Link>
			</div>
		</div>);
	}
}
