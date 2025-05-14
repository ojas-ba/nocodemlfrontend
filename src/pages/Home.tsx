import { Stack, Typography, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DataObjectIcon from "@mui/icons-material/DataObject";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import InsightsIcon from "@mui/icons-material/Insights";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import DownloadIcon from "@mui/icons-material/Download";
import Footer from "../components/Footer/Footer";
import FeaturesCard from "../components/AllCards/FeaturesCard";



const featuresList = [
  { 
    id: 1, 
    name: "Dataset Upload & Preview", 
    description: "Easily upload datasets and view the first few rows before proceeding with analysis.", 
    icon: <CloudUploadIcon sx={{ fontSize: 28, color: '#2196F3' }} />
  },
  { 
    id: 2, 
    name: "Data Exploration & Visualization", 
    description: "Create Visualization to Explore and Understand your data.", 
    icon: <DataObjectIcon sx={{ fontSize: 28, color: '#2196F3' }} />
  },
  { 
    id: 3, 
    name: "Train Machine Learning Models", 
    description: "Train the best suited ML Model for your Dataset with Full Control.", 
    icon: <AutoGraphIcon sx={{ fontSize: 28, color: '#2196F3' }} />
  },
  { 
    id: 4, 
    name: "Model Status Tracking", 
    description: "Get Training Status Updates in real-time, Uses Google's Vertex AI.", 
    icon: <InsightsIcon sx={{ fontSize: 28, color: '#2196F3' }} />
  },
  { 
    id: 5, 
    name: "Results & Feature Importance", 
    description: "Get All Metrics and Visualize the Model Performance.", 
    icon: <LightbulbIcon sx={{ fontSize: 28, color: '#2196F3' }} />
  },
  { 
    id: 6, 
    name: "Model Download & Deployment", 
    description: "Download trained models for further use or deployment in external applications using Endpoints in GCP.", 
    icon: <DownloadIcon sx={{ fontSize: 28, color: '#2196F3' }} />
  },
];

export const Home = () => {
  return (
    <>
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0F172A, #1E293B)',
      color: 'white',
      paddingBottom:'5%'
    }}>
      <Stack 
        spacing={2} 
        alignItems="center" 
        sx={{ 
          paddingTop: { xs: "20%", md: "8%" },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Typography 
          variant="h2" 
          component="div"
          sx={{
            padding:'2%',
            fontWeight: 600,
            fontSize: { xs: '1.5rem', md: '2rem' },
            background: 'linear-gradient(45deg, #60A5FA 30%, #93C5FD 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#60A5FA',
              right: '-12px',
              top: '25%',
              boxShadow: '0 0 10px #60A5FA'
            }
          }}
        >
          Build Machine Learning Models Without any CODE!!! 
        </Typography>
        <Box 
          sx={{
            width: { xs: '90%', md: '80%', lg: '70%' },
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(20px)',
            padding: { xs: '5vh', md: '8vh' },
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(96, 165, 250, 0.2)'
          }}
        >
          
          <Typography 
            variant="h4" 
            sx={{
              color: '#60A5FA',
              fontWeight: 600,
              marginBottom: '4vh',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: 0,
                width: '60px',
                height: '4px',
                background: 'linear-gradient(45deg, #60A5FA 30%, #93C5FD 90%)',
                borderRadius: '2px'
              }
            }}
          >
            What We Offer
          </Typography>
          
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: { xs: '3vh', md: '4vh' },
              justifyContent: 'center',
              alignItems: 'stretch'
            }}
          >
            {featuresList.map((feature) => (
              <FeaturesCard key={feature.id} cardstuff={feature} />
            ))}
          </Box>
        </Box>
      </Stack>
    </Box>
    <Footer/>
  </>
  );
};

export default Home;