import React from 'react';
import Loader from 'react-loader-spinner';
import { Dialog, DialogContent, Typography } from '@material-ui/core';

export default class LoadingDialog extends React.Component {
	render() {
		return (
			<Dialog open={this.props.open}
				PaperProps={{
    				style: {
      					backgroundColor: 'transparent',
      					boxShadow: 'none',
    				}
  				}}>
				<DialogContent>
					<Loader type="ThreeDots" color="#00BFFF" height={80} width={80}/>
					<Typography variant="paragraph">Fetching data...</Typography>
				</DialogContent>
			</Dialog>
		)
	};
}
