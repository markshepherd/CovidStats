import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Analytics from './Analytics';

export default class AboutDialog extends React.Component {
	handleCloseButton = () =>{
		this.props.onCloseButton();
	}

	noop = (something) => {
		Analytics.aboutDialogOpened();
		return something;
	}

	render() {
		return (
			<Dialog onClose={this.handleCloseButton} open={this.noop(this.props.open)} aria-labelledby="customized-dialog-title">
				<DialogTitle id="customized-dialog-title" onClose={this.handleCloseButton}>
					Covid-19 Statistics for U.S. States & Counties 
				</DialogTitle>
				<DialogContent dividers>
					{this.props.children}
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={this.handleCloseButton} color="primary">
					Dismiss
					</Button>
				</DialogActions>
			</Dialog>
		)
	};
}
