import { AppBar, Button, Stack, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

const NavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  console.log(user)
  const handleLogout = async () => {
    await logout();
  };

  return (
    <AppBar 
      position="fixed"
      sx={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(96, 165, 250, 0.2)',
        cursor: 'pointer'
      }}
    >
      <Toolbar sx={{ padding: { xs: '0.5rem 1rem', md: '0.5rem 2rem' } }}>
        <Typography 
          onClick={() => navigate("/")}
          variant="h4" 
          component="div"
          sx={{
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
          NoCodeML
        </Typography>

        <Stack 
          direction="row" 
          spacing={{ xs: 1, md: 2 }} 
          sx={{ marginLeft: 'auto' }}
        >
          {user ? (

            <>
              <Button 
                variant='contained'
                onClick={() => navigate("/Dashboard")}
                sx={{
                  background: 'linear-gradient(45deg, #60A5FA 30%, #93C5FD 90%)',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: { xs: 2, md: 3 },
                  py: 1,
                  fontSize: '0.95rem',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #3B82F6 30%, #60A5FA 90%)',
                    boxShadow: '0 0 20px rgba(96, 165, 250, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}> Dashboard </Button>

             <Button 
              variant="outlined"
              onClick={handleLogout}
              sx={{
                color: 'white',
                borderColor: 'rgba(96, 165, 250, 0.3)',
                '&:hover': {
                  borderColor: '#60A5FA',
                  background: 'rgba(96, 165, 250, 0.1)',
                  color: '#60A5FA',
                },
                textTransform: 'none',
                borderRadius: '12px',
                px: { xs: 2, md: 3 },
                py: 1,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease'
              }}
            >
              Logout
            </Button>
             


            </>


          ) : (
            <>
              <Button 
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  color: '#94A3B8',
                  borderColor: 'rgba(96, 165, 250, 0.3)',
                  '&:hover': {
                    borderColor: '#60A5FA',
                    background: 'rgba(96, 165, 250, 0.1)',
                    color: '#60A5FA'
                  },
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: { xs: 2, md: 3 },
                  py: 1,
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </Button>
              <Button 
                variant="contained"
                onClick={() => navigate("/register")}
                sx={{
                  background: 'linear-gradient(45deg, #60A5FA 30%, #93C5FD 90%)',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: { xs: 2, md: 3 },
                  py: 1,
                  fontSize: '0.95rem',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #3B82F6 30%, #60A5FA 90%)',
                    boxShadow: '0 0 20px rgba(96, 165, 250, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Register
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;