import { Card, CardContent, Typography, Box } from "@mui/material";
import { JSX } from "react";

type Cardstuff = {
  id: number;
  name: string;
  description: string;
  icon: JSX.Element;
};

type CardStuffProps = {
  cardstuff: Cardstuff;
};

export const FeaturesCard = ({ cardstuff }: CardStuffProps) => {
  return (
    <Card
      sx={{
        width: { xs: "100%", sm: "45%", md: "30%" },
        height: "100%",
        background: 'rgba(30, 41, 59, 0.6)',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid rgba(96, 165, 250, 0.1)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 15px rgba(96, 165, 250, 0.2)',
          border: '1px solid rgba(96, 165, 250, 0.3)',
          background: 'rgba(30, 41, 59, 0.8)'
        }
      }}
    >
      <CardContent sx={{ height: '100%', p: 3 }}>
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2,
            mb: 2
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              background: 'rgba(96, 165, 250, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {cardstuff.icon}
          </Box>
          <Typography 
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#60A5FA'
            }}
          >
            {cardstuff.name}
          </Typography>
        </Box>

        <Typography 
          variant="body1"
          sx={{
            color: '#94A3B8',
            lineHeight: 1.6
          }}
        >
          {cardstuff.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeaturesCard;