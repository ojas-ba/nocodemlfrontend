import { Box, Container, Grid, Typography, IconButton } from "@mui/material";
import { Email, Phone, LocationOn } from "@mui/icons-material";
import { LinkedIn, Twitter, YouTube } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: "rgba(30, 41, 59, 0.9)",
        borderTop: "1px solid rgba(96, 165, 250, 0.2)",
        color: "#E2E8F0",
        paddingY: 4,
        textAlign: "center",
      }}
    >
      <Container>
        <Grid container spacing={4} justifyContent="center">
          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#60A5FA" }}>
              Contact Us
            </Typography>
            <Typography variant="body2" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, marginTop: 1 }}>
              <Email sx={{ color: "#60A5FA" }} /> support@nocodeml.com
            </Typography>
            <Typography variant="body2" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, marginTop: 1 }}>
              <Phone sx={{ color: "#60A5FA" }} /> +696969696969
            </Typography>
            <Typography variant="body2" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, marginTop: 1 }}>
              <LocationOn sx={{ color: "#60A5FA" }} /> Moon
            </Typography>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#60A5FA" }}>
              Follow Us
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", marginTop: 1 }}>
              <IconButton href="https://linkedin.com/in/ojasba" target="_blank" sx={{ color: "#E2E8F0" }}>
                <LinkedIn sx={{ fontSize: 28 }} />
              </IconButton>
              <IconButton href="https://twitter.com" target="_blank" sx={{ color: "#E2E8F0" }}>
                <Twitter sx={{ fontSize: 28 }} />
              </IconButton>
              <IconButton href="https://youtube.com" target="_blank" sx={{ color: "#E2E8F0" }}>
                <YouTube sx={{ fontSize: 28 }} />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body2" sx={{ marginTop: 3, color: "#94A3B8" }}>
          © {new Date().getFullYear()} NoCodeML. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;