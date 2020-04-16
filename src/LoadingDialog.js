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
					<Loader type="TailSpin" color="#00BFFF" height={80} width={80}/>
					{/* https://mhnpd.github.io/react-loader-spinner
					    https://www.npmjs.com/package/react-loader-spinner 
						TailSpin Puff Grid ThreeDots */}
					<Typography variant="body2">Fetching data...</Typography>
				</DialogContent>
			</Dialog>
		)
	};
}
