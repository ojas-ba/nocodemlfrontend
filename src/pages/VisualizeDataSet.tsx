import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Button } from '@mui/material';
import PlotForm, { PlotFormData } from '../components/Forms/PlotForm';
import PlotCard from '../components/AllCards/PlotCard';
import { api } from '../utils/api';
import { useAuth } from '../context/useAuth';

interface Visualization {
	id: number;
	plotType: string;
	image: string;
}

const VisualizeDataSet: React.FC<{ columns: string[] }> = ({ columns }) => {
	const [visualizations, setVisualizations] = useState<Visualization[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [showVisualization, setShowVisualization] = useState<boolean>(true); // new state to toggle display
	const auth_obj = useAuth(); // Assuming you have a useAuth hook to get user info
	const user_id = auth_obj.user?.user_id; 
	const project_id = auth_obj.user?.project_id;

	const pollPlotStatus = async (taskId: string) => {
		try {
			let status = "pending";
			while (status === "pending") {
				const response = await api.get(`/process/plot_status`, { params: { plot_id: taskId } });
				status = response.data.status;

				if (status === "success") {
					const newViz: Visualization = {
						id: Date.now(),
						plotType: "Generated Plot", // Replace with actual plot type if available
						image: response.data.image, // Ensure the image is properly retrieved
					};
					setVisualizations((prev) => [...prev, newViz]);
					break;
				} else if (status === "failed") {
					setError(response.data.message || "Failed to generate plot");
					break;
				}

				await new Promise((resolve) => setTimeout(resolve, 2000)); // Poll every 2 seconds
			}
		} catch (err) {
			setError("Error while polling plot status");
			console.error(err);
		}
	};

	const handleFormSubmit = async (data: PlotFormData) => {
		setLoading(true);
		setError('');
		try {
			const response = await api.post("/process/plot", { ...data, user_id, project_id });
			console.log({ ...data, user_id, project_id });
			console.log(response.data); // Debugging line to check the response

			if (response.data.task_id) {
				await pollPlotStatus(response.data.task_id);
			}
		} catch (err) {
			setError('Failed to generate plot');
			console.error(err); // Log the error for debugging
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (id: number) => {
		setVisualizations((prev) => prev.filter(viz => viz.id !== id));
	};

	return (
		<Box sx={{ mt: 1, ml: 3, mr: 3 }}>
			<Paper elevation={3} sx={{ p: 2, mt: 2 }}>
				<Typography variant="h5" gutterBottom>Visualization</Typography>
				<Button 
					variant="contained" 
					color="primary" 
					onClick={() => setShowVisualization(!showVisualization)} 
					sx={{ mb: 2 }}
				>
					{showVisualization ? 'Hide Visualization' : 'Show Visualization'}
				</Button>
				{showVisualization && (
					<>
						<PlotForm columns={columns} onSubmit={handleFormSubmit} />
						{loading && <CircularProgress />}
						{error && <Typography color="error">{error}</Typography>}
						<Grid container spacing={2}>
							{visualizations.map((viz) => (
								<Grid item key={viz.id} xs={12} sm={6} md={4}>
									<PlotCard 
										id={viz.id} 
										plotType={viz.plotType} 
										image={`data:image/png;base64,${viz.image}`} // Ensure proper image rendering
										onDelete={handleDelete} 
									/>
								</Grid>
							))}
						</Grid>
					</>
				)}
			</Paper>
		</Box>
	);
};

export default VisualizeDataSet;
