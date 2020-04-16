import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@material-ui/core/';
import CloseIcon from '@material-ui/icons/Close';
import Analytics from './Analytics';
import "./AboutDialog.css";

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
			<Dialog onClose={this.handleCloseButton} open={this.noop(this.props.open)} aria-labelledby="customized-dialog-title"
				PaperProps={{
    				style: {
      					backgroundColor: '#ffffffee'
    				}
  				}}>
				<DialogTitle class="dialogTitle" disableTypography id="customized-dialog-title" onClose={this.handleCloseButton}>
					<Typography variant="h6">Covid-19 Statistics for U.S. States & Counties</Typography>
					<div className="closeButton">
						<IconButton onClick={this.handleCloseButton}>
				          <CloseIcon />
				        </IconButton>
			        </div>
				</DialogTitle>
				<DialogContent dividers>
					{this.props.children}
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={this.handleCloseButton} color="primary">
					OK
					</Button>
				</DialogActions>
			</Dialog>
		)
	};
}
