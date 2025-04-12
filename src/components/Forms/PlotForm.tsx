import React, { useState, useEffect } from 'react';
import { Paper, Typography, Button, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';

export interface PlotFormData {
	plotType: string;
	x?: string;
	y?: string;
	hue?: string;
	aggregation?: string;
}

export interface PlotFormProps {
	columns: string[];
	onSubmit: (data: PlotFormData) => void;
}

const plotConfig: Record<string, any> = {
	scatter: { use_case: "Two continuous variables", args: ["x", "y", "hue"], hue: true, agg_needed: false },
	line: { use_case: "Time series or trends", args: ["x", "y", "hue"], hue: true, agg_needed: false },
	bar: { use_case: "Category vs Value", args: ["x", "y", "hue"], hue: true, agg_needed: true, allowed_aggs: ["sum", "mean", "count", "median"] },
	box: { use_case: "Distribution by category", args: ["x", "y", "hue"], hue: true, agg_needed: false },
	violin: { use_case: "Smoothed distribution by category", args: ["x", "y", "hue"], hue: true, agg_needed: false },
	hist: { use_case: "Distribution of a single variable", args: ["x", "hue"], hue: true, agg_needed: false },
	kde: { use_case: "Density estimation of a variable", args: ["x", "hue"], hue: true, agg_needed: false },
	pie: { use_case: "Proportion of categories", args: ["x", "y"], hue: false, agg_needed: true, allowed_aggs: ["sum", "count"] },
	pairplot: { use_case: "Pairwise variable relationships", args: ["df"], hue: true, agg_needed: false },
	swarm: { use_case: "Categorical scatter distribution", args: ["x", "y", "hue"], hue: true, agg_needed: false },
	strip: { use_case: "Jittered categorical scatter", args: ["x", "y", "hue"], hue: true, agg_needed: false },
	count: { use_case: "Frequency of categorical values", args: ["x", "hue"], hue: true, agg_needed: false },
};

const PlotForm: React.FC<PlotFormProps> = ({ columns, onSubmit }) => {
	const [plotType, setPlotType] = useState<string>('');
	const [x, setX] = useState<string>('');
	const [y, setY] = useState<string>('');
	const [hue, setHue] = useState<string>('');
	const [aggregation, setAggregation] = useState<string>('');
	
	const selectedConfig = plotType ? plotConfig[plotType] : null;
	
	useEffect(() => {
		// reset inputs when plotType changes
		setX('');
		setY('');
		setHue('');
		setAggregation('');
	}, [plotType]);

	const handleSubmit = () => {
		const data: PlotFormData = { plotType };
		if(selectedConfig?.args.includes('x')) data.x = x;
		if(selectedConfig?.args.includes('y')) data.y = y;
		if(selectedConfig?.args.includes('hue')) data.hue = hue;
		if(selectedConfig?.agg_needed) data.aggregation = aggregation;
		onSubmit(data);
		// reset form fields
		setPlotType('');
		setX('');
		setY('');
		setHue('');
		setAggregation('');
	};

	return (
		<Paper sx={{ p: 2, mb: 2 }}>
			<Typography variant="h6">Create Plot</Typography>
			<Grid container spacing={2} sx={{ mt: 1 }}>
				<Grid item xs={12} sm={6} md={4}>
					<FormControl fullWidth>
						<InputLabel>Plot Type</InputLabel>
						<Select value={plotType} label="Plot Type" onChange={(e) => setPlotType(e.target.value)}>
							{Object.keys(plotConfig).map((key) => (
								<MenuItem key={key} value={key}>{key}</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				{selectedConfig && selectedConfig.args.includes('x') && (
					<Grid item xs={12} sm={6} md={4}>
						<FormControl fullWidth>
							<InputLabel>X Axis</InputLabel>
							<Select value={x} label="X Axis" onChange={(e) => setX(e.target.value)}>
								{columns.map((col) => (
									<MenuItem key={col} value={col}>{col}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
				)}
				{selectedConfig && selectedConfig.args.includes('y') && (
					<Grid item xs={12} sm={6} md={4}>
						<FormControl fullWidth>
							<InputLabel>Y Axis</InputLabel>
							<Select value={y} label="Y Axis" onChange={(e) => setY(e.target.value)}>
								{columns.map((col) => (
									<MenuItem key={col} value={col}>{col}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
				)}
				{selectedConfig && selectedConfig.args.includes('hue') && (
					<Grid item xs={12} sm={6} md={4}>
						<FormControl fullWidth>
							<InputLabel>Hue</InputLabel>
							<Select value={hue} label="Hue" onChange={(e) => setHue(e.target.value)}>
								{columns.map((col) => (
									<MenuItem key={col} value={col}>{col}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
				)}
				{selectedConfig && selectedConfig.agg_needed && (
					<Grid item xs={12} sm={6} md={4}>
						<FormControl fullWidth>
							<InputLabel>Aggregation</InputLabel>
							<Select value={aggregation} label="Aggregation" onChange={(e) => setAggregation(e.target.value)}>
								{selectedConfig.allowed_aggs.map((agg: string) => (
									<MenuItem key={agg} value={agg}>{agg}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
				)}
				<Grid item xs={12}>
					<Button variant="contained" onClick={handleSubmit} disabled={!plotType}>
						Generate Plot
					</Button>
				</Grid>
			</Grid>
		</Paper>
	);
};

export default PlotForm;
