import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { useAuth } from '../context/useAuth';
import {api} from '../utils/api'; // Adjust the import path as necessary
import { useNotification } from '../context/NotificationContext';

const Preprocessing: React.FC<{ file_url: string; datasetName: string; numericalColumns: string[]; categoricalColumns: string[] }> = ({ file_url, datasetName, numericalColumns, categoricalColumns }) => {
	
    const { user } = useAuth();
    const  project_id = user?.project_id;;
    const show = useNotification();
    
    
    
    const [scaling, setScaling] = useState(
		numericalColumns.reduce((acc, column) => {
			acc[column] = 'standard';
			return acc;
		}, {} as Record<string, string>)
	);

	const [encoding, setEncoding] = useState(
		categoricalColumns.reduce((acc, column) => {
			acc[column] = 'onehot';
			return acc;
		}, {} as Record<string, string>)
	);

	const [showPreprocessing, setShowPreprocessing] = useState(true);

	const handleSubmit = async () => {
		const preprocessingConfig = {
			project_id,
			file_url,
			dataset_name: datasetName,
			preprocessing: {
				scaling: numericalColumns.map((column) => ({
					column,
					method: scaling[column],
				})),
				encoding: categoricalColumns.map((column) => ({
					column,
					method: encoding[column],
				})),
			},
		};
		console.log('Preprocessing Config:', preprocessingConfig);

		try {
			const response = await api.post('process/preprocess', preprocessingConfig);
			console.log('Response:', response.data);
            if(user){
                user.preprocess_id = response.data.preprocess_id;
            }
            
            show('Preprocessing Config Saved!', 'success');
		} catch (error) {
			console.error('Error:', error);
			show(error instanceof Error ? error.message : String(error), 'error');
		}
	};

	return (
		<Box sx={{ mt: 1, ml: 3, mr: 3,mb: 3 }}>
			<Paper elevation={3} sx={{ p: 2, mt: 2 }}>
				<Typography variant="h5" gutterBottom>Preprocessing</Typography>
				<Button
					variant="contained"
					color="primary"
					onClick={() => setShowPreprocessing(!showPreprocessing)}
					sx={{ mb: 2 }}
				>
					{showPreprocessing ? 'Hide Preprocessing' : 'Show Preprocessing'}
				</Button>
				{showPreprocessing && (
					<>
						<Grid container spacing={3}>
							{/* Scaling Section */}
							<Grid item xs={12}>
								<Typography variant="h6">Scaling (Numerical Columns)</Typography>
								{numericalColumns.map((column) => (
									<Box key={column} sx={{ mb: 2 }}>
										<Typography variant="subtitle1">{column}</Typography>
										<FormControl fullWidth sx={{ mt: 1 }}>
											<InputLabel>Method</InputLabel>
											<Select
												value={scaling[column]}
												onChange={(e) =>
													setScaling({
														...scaling,
														[column]: e.target.value,
													})
												}
											>
												<MenuItem value="standard">Standard</MenuItem>
												<MenuItem value="minmax">Min-Max</MenuItem>
												<MenuItem value="robust">Robust</MenuItem>
											</Select>
										</FormControl>
									</Box>
								))}
							</Grid>

							{/* Encoding Section */}
							<Grid item xs={12}>
								<Typography variant="h6">Encoding (Categorical Columns)</Typography>
								{categoricalColumns.map((column) => (
									<Box key={column} sx={{ mb: 2 }}>
										<Typography variant="subtitle1">{column}</Typography>
										<FormControl fullWidth sx={{ mt: 1 }}>
											<InputLabel>Method</InputLabel>
											<Select
												value={encoding[column]}
												onChange={(e) =>
													setEncoding({
														...encoding,
														[column]: e.target.value,
													})
												}
											>
												<MenuItem value="onehot">One-Hot</MenuItem>
												<MenuItem value="label">Label</MenuItem>
												<MenuItem value="ordinal">Ordinal</MenuItem>
											</Select>
										</FormControl>
									</Box>
								))}
							</Grid>

							{/* Submit Button */}
							<Grid item xs={12}>
								<Button variant="contained" color="primary" onClick={handleSubmit}>
									Submit
								</Button>
							</Grid>
						</Grid>
					</>
				)}
			</Paper>
		</Box>
	);
};

export default Preprocessing;
