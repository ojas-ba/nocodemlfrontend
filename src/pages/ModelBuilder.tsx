import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, IconButton, CircularProgress, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAuth } from '../context/useAuth';
import {api} from '../utils/api'; // Adjust the import path as necessary
import { useNotification } from '../context/NotificationContext';

type Hyperparameters = { [key: string]: string };

const modelOptions = {
	classification: {
		logistic_regression: [
			'penalty', 'C', 'solver', 'multi_class', 'max_iter', 'tol', 
			'fit_intercept', 'intercept_scaling', 'class_weight', 'random_state', 
			'verbose', 'n_jobs', 'l1_ratio'
		],
		random_forest: [
			'n_estimators', 'criterion', 'max_depth', 'min_samples_split', 'min_samples_leaf',
			'max_features', 'bootstrap', 'oob_score', 'n_jobs', 'random_state',
			'verbose', 'class_weight', 'max_samples'
		],
		xgb_classifier: [
			'booster', 'n_estimators', 'learning_rate', 'max_depth', 'min_child_weight',
			'subsample', 'colsample_bytree', 'colsample_bylevel', 'colsample_bynode', 
			'gamma', 'reg_alpha', 'reg_lambda', 'objective', 'num_class', 'eval_metric', 
			'random_state', 'n_jobs'
		],
		lightgbm: [
			'boosting_type', 'objective', 'num_class', 'metric', 'n_estimators', 'learning_rate', 
			'num_leaves', 'max_depth', 'min_child_samples', 'subsample', 'colsample_bytree', 
			'reg_alpha', 'reg_lambda', 'class_weight', 'is_unbalance', 'random_state', 'n_jobs', 
			'verbosity'
		]
	},
	regression: {
		linear_regression: [
			'fit_intercept', 'normalize', 'copy_X', 'n_jobs', 'positive'
		],
		random_forest: [
			'n_estimators', 'criterion', 'max_depth', 'min_samples_split', 'min_samples_leaf',
			'max_features', 'bootstrap', 'oob_score', 'n_jobs', 'random_state',
			'verbose', 'max_samples'
		],
		xgb_regressor: [
			'booster', 'n_estimators', 'learning_rate', 'max_depth', 'min_child_weight',
			'subsample', 'colsample_bytree', 'colsample_bylevel', 'colsample_bynode', 
			'gamma', 'reg_alpha', 'reg_lambda', 'objective', 'eval_metric', 'random_state', 
			'n_jobs'
		],
		lightgbm: [
			'boosting_type', 'objective', 'metric', 'n_estimators', 'learning_rate', 'num_leaves', 
			'max_depth', 'min_child_samples', 'subsample', 'colsample_bytree', 'reg_alpha', 
			'reg_lambda', 'random_state', 'n_jobs', 'verbosity'
		]
	}
};

const ModelBuilder: React.FC<{columns: string[]}> = ({ columns }) => {
	const [target, setTarget] = useState('');
	const [problemType, setProblemType] = useState('');
	const [modelName, setModelName] = useState('');
	const [hyperparameters, setHyperparameters] = useState<Hyperparameters>({});
	const { user } = useAuth();
	const project_id = user?.project_id;
	const user_id = user?.user_id;
	const preprocess_id = user?.preprocess_id; // Assuming this is set somewhere in your context
	const show = useNotification();
	
	const [showModelBuilder, setShowModelBuilder] = useState(true);
	const [showOptionalParams, setShowOptionalParams] = useState(true);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<{rmse?: number, mse?: number, mae?: number, message?: string} | null>(null);

	const handleParamChange = (param: string, value: string) => {
		setHyperparameters(prev => ({ ...prev, [param]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		const payload = {
			target,
			problem_type: problemType,
			model: modelName,
			hyperparameters,
			project_id,
			preprocess_id,
			user_id
		};
		console.log("Payload:", payload);

		try {
			const response = await api.post('/process/train_model', payload);
			console.log("Response:", response.data);
			show('Model training initiated successfully!');
			setResult(response.data);
		} catch (error) {
			console.error("Error:", error);
			show('Failed to initiate model training. Please try again.');
			setResult({ message: 'Failed to initiate model training' });
		} finally {
			setLoading(false);
		}
	};

	const modelsForProblem = problemType ? Object.keys(modelOptions[problemType]) : [];
	const paramsForModel = problemType && modelName ? modelOptions[problemType][modelName] : [];

	return (
		<Box sx={{ mt: 1, ml: 3, mr: 3 }}>
			<Paper elevation={3} sx={{ p: 2, mt: 2 }}>
				<Typography variant="h5" gutterBottom>
					Model Builder
				</Typography>
				<Button 
					variant="contained" 
					onClick={() => setShowModelBuilder(!showModelBuilder)}
					sx={{ mb: 2 }}
				>
					{showModelBuilder ? 'Hide Model Builder' : 'Show Model Builder'}
				</Button>
				{showModelBuilder && (
					<form onSubmit={handleSubmit}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<FormControl fullWidth>
									<InputLabel id="target-label">Target</InputLabel>
									<Select
										labelId="target-label"
										label="Target"
										value={target}
										onChange={e => setTarget(e.target.value)}
									>
										<MenuItem value=""><em>Select Target Column</em></MenuItem>
										{columns.map(column => (
											<MenuItem key={column} value={column}>{column}</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12}>
								<FormControl fullWidth>
									<InputLabel id="problem-type-label">Problem Type</InputLabel>
									<Select
										labelId="problem-type-label"
										value={problemType}
										label="Problem Type"
										onChange={e => {
											setProblemType(e.target.value);
											setModelName('');
											setHyperparameters({});
										}}
									>
										<MenuItem value=""><em>Select Problem Type</em></MenuItem>
										<MenuItem value="classification">Classification</MenuItem>
										<MenuItem value="regression">Regression</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							{problemType && (
								<Grid item xs={12}>
									<FormControl fullWidth>
										<InputLabel id="model-name-label">Model</InputLabel>
										<Select
											labelId="model-name-label"
											value={modelName}
											label="Model"
											onChange={e => {
												setModelName(e.target.value);
												setHyperparameters({});
											}}
										>
											<MenuItem value=""><em>Select Model</em></MenuItem>
											{modelsForProblem.map(model => (
												<MenuItem key={model} value={model}>{model}</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>
							)}
							{paramsForModel && paramsForModel.length > 0 && (
								<>
									<Grid item xs={12} container alignItems="center" justifyContent="space-between">
										<Typography variant="h6">
											Hyperparameters (optional):
										</Typography>
										<IconButton onClick={() => setShowOptionalParams(!showOptionalParams)}>
											{showOptionalParams ? <ExpandLessIcon /> : <ExpandMoreIcon />}
										</IconButton>
									</Grid>
									{showOptionalParams && paramsForModel.map(param => (
										<Grid item xs={12} key={param}>
											<TextField 
												label={param} 
												fullWidth 
												value={hyperparameters[param] || ''}
												onChange={e => handleParamChange(param, e.target.value)}
												placeholder={`Enter ${param} (optional)`}
											/>
										</Grid>
									))}
								</>
							)}
							<Grid item xs={12}>
								<Button type="submit" variant="contained" color="primary" fullWidth>
									Submit
								</Button>
							</Grid>
							<Grid item xs={12}>
								{loading && <CircularProgress />}
							</Grid>
						</Grid>
					</form>
				)}
				{/* Display results table when available */}
				{result && (
					<TableContainer component={Paper} sx={{ mt: 2 }}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Metric</TableCell>
									<TableCell>Value</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
									{Object.entries(result).map(([key, value]) => (
										<TableRow key={key}>
											<TableCell>{key}</TableCell>
											<TableCell>{value}</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</Paper>
		</Box>
	);
};

export default ModelBuilder;