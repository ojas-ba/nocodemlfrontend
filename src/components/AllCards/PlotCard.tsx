import { Card, CardContent, CardMedia, CardActions, Button, Typography } from '@mui/material';
import React from 'react';

export interface PlotCardProps {
	id: number;
	plotType: string;
	image: string; // base64 encoded
	onDelete: (id: number) => void;
}

const PlotCard: React.FC<PlotCardProps> = ({ id, plotType, image, onDelete }) => {
	return (
		<Card sx={{ maxWidth: 600, m: 2, maxHeight: 600 }}>
			<CardContent>
				<Typography variant="h6">{plotType}</Typography>
			</CardContent>
			<CardMedia component="img" image={image.startsWith("data:image") ? image : `data:image/png;base64,${image}`} alt={plotType} />
			<CardActions>
				<Button size="small" color="error" onClick={() => onDelete(id)}>Delete</Button>
			</CardActions>
		</Card>
	);
};

export default PlotCard;
