import React from 'react';
import {Link} from '@material-ui/core';
import Analytics from './Analytics';

export default class MyLink extends React.Component {
	handleClick = (e) => {
		Analytics.reportOutboundLink(this.props.href);
		this.props.onClick && this.props.onClick(e);
	}

	render() {
		return <Link target={this.props.target} href={this.props.href} onClick={this.handleClick}>
			{this.props.children}
		</Link>
	}
}
