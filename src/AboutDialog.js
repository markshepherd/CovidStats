import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

export default class AboutDialog extends React.Component {
	handleCloseButton = () =>{
		this.props.onCloseButton();
	}

	render() {
		return (
			<Dialog onClose={this.handleCloseButton} open={this.props.open} aria-labelledby="customized-dialog-title">
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
