import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  Paper,
  Fade,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { keyframes } from "@mui/material/styles";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

// Animations

const underlineExpand = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

const RoleCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: "100%",
  backgroundColor: "rgba(10, 10, 10, 0.8)",
  border: "1px solid rgba(255, 215, 0, 0.1)",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    backgroundColor: "rgba(10, 10, 10, 0.9)",
    "& .card-icon": {
      transform: "scale(1.1)",
    },
    "& .card-background": {
      opacity: 0.15,
    },
  },
  "& .card-background": {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(44, 85, 48, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)",
    opacity: 0.1,
    transition: "opacity 0.3s ease-in-out",
  },
}));

const BackgroundImage = styled("div")`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('/images/generated/jamaican-design-1747273968.png');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  z-index: 1;
`;

const StyledContainer = styled(Container)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minHeight: "70vh",
  padding: theme.spacing(4),
  [theme.breakpoints.up("md")]: {
    maxWidth: "1100px",
  },
}));

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setShowContent(true);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0A0A0A",
      }}
    >
      <Box sx={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Navigation */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 3, 
            pt: 4, 
            position: "relative", 
            zIndex: 10, 
            justifyContent: "center", 
            backgroundColor: "#0A0A0A" 
          }}
        >
          <Button
            variant="contained"
            onClick={() => navigate(user ? (user.role === 'JOBSEEKER' ? "/candidate/dashboard" : "/employer/dashboard") : "/jobs")}
            sx={{
              background: "linear-gradient(90deg, #2C5530, #FFD700)",
              color: "#000",
              "&:hover": {
                background: "linear-gradient(90deg, #FFD700, #2C5530)",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)"
              },
              transition: "all 0.3s ease",
              textTransform: "none",
              fontSize: "1.1rem",
              fontWeight: 600,
              padding: "12px 32px",
              borderRadius: "8px",
              minWidth: "180px"
            }}
          >
            {user ? (user.role === 'JOBSEEKER' ? "My Dashboard" : "Employer Dashboard") : "Find Your Next Job"}
          </Button>
          
          {!user && (
            <Button
              variant="outlined"
              onClick={() => navigate("/login")}
              sx={{
                color: "#FFD700",
                borderColor: "#FFD700",
                borderWidth: "2px",
                "&:hover": {
                  borderColor: "#2C5530",
                  color: "#2C5530",
                  background: "rgba(255, 215, 0, 0.1)",
                  borderWidth: "2px"
                },
                transition: "all 0.3s ease",
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 500,
                padding: "12px 32px",
                borderRadius: "8px",
                minWidth: "140px"
              }}
            >
              Sign In
            </Button>
          )}
          
          {user ? (
            user.role === 'JOBSEEKER' ? (
              <Button
                variant="contained"
                onClick={() => navigate("/jobs")}
                sx={{
                  background: "linear-gradient(90deg, #FFD700, #2C5530)",
                  color: "#000",
                  "&:hover": {
                    background: "linear-gradient(90deg, #2C5530, #FFD700)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(44, 85, 48, 0.3)"
                  },
                  transition: "all 0.3s ease",
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  padding: "12px 32px",
                  borderRadius: "8px",
                  minWidth: "140px"
                }}
              >
                Find Jobs
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => navigate("/employer/post-job")}
                sx={{
                  background: "linear-gradient(90deg, #FFD700, #2C5530)",
                  color: "#000",
                  "&:hover": {
                    background: "linear-gradient(90deg, #2C5530, #FFD700)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(44, 85, 48, 0.3)"
                  },
                  transition: "all 0.3s ease",
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  padding: "12px 32px",
                  borderRadius: "8px",
                  minWidth: "140px"
                }}
              >
                Post a Job
              </Button>
            )
          ) : (
            <Button
              variant="contained"
              onClick={() => navigate("/login", { state: { employerRedirect: true } })}
              sx={{
                background: "linear-gradient(90deg, #FFD700, #2C5530)",
                color: "#000",
                "&:hover": {
                  background: "linear-gradient(90deg, #2C5530, #FFD700)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(44, 85, 48, 0.3)"
                },
                transition: "all 0.3s ease",
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 600,
                padding: "12px 32px",
                borderRadius: "8px",
                minWidth: "140px"
              }}
            >
              Post a Job
            </Button>
          )}
        </Box>
        
        {/* Hero Section with Role Cards */}
        <Box
          sx={{
            minHeight: "90vh",
            position: "relative",
            backgroundColor: "#0A0A0A",
          }}
        >
          <BackgroundImage />
          <div className="hero-accent" />
          <StyledContainer>
            <Fade in={showContent} timeout={1000}>
              <Box sx={{ maxWidth: "900px", mx: "auto" }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "5rem" },
                    fontWeight: 900,
                    mb: 3,
                    color: "#FFFFFF",
                    textAlign: "center",
                    position: "relative",
                    textShadow: "0 2px 30px rgba(255, 215, 0, 0.3)",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "100px",
                      height: "4px",
                      background: "linear-gradient(90deg, #2C5530, #FFD700)",
                      borderRadius: "2px",
                      animation: `${underlineExpand} 1s ease-out forwards`,
                      boxShadow: "0 2px 8px rgba(255, 215, 0, 0.3)",
                    }
                  }}
                >
                  Welcome to JamDung Jobs
                </Typography>

                <Typography variant="h5" sx={{ mb: 4, color: "#FFFFFF", opacity: 0.9 }}>
                  Where Opportunities Flow Like Island Rhythms
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: "#FFFFFF",
                    opacity: 0.8,
                    mb: 6,
                    textAlign: "center",
                    maxWidth: "800px",
                    mx: "auto",
                  }}
                >
                  Join thousands of <strong>successful professionals</strong> and <strong>businesses</strong> in Jamaica
                </Typography>

                {/* Role Cards */}
                <Grid container spacing={4} sx={{ mb: 6 }}>
                  {/* Job Seekers Card */}
                  <Grid item xs={12} md={6}>
                    <RoleCard elevation={3}>
                      <div className="card-background" />
                      <Box sx={{ position: "relative", zIndex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                            gap: 2,
                          }}
                        >
                          <WorkIcon
                            className="card-icon"
                            sx={{
                              fontSize: "2.5rem",
                              color: "#FFD700",
                              transition: "transform 0.3s ease-in-out",
                            }}
                          />
                          <Typography variant="h5" sx={{ color: "#FFD700", fontWeight: 600 }}>
                            Job Seekers
                          </Typography>
                        </Box>
                        <List sx={{ mb: 3 }}>
                          {["Find your dream job", "Easy application process", "Career resources"].map((text, index) => (
                            <ListItem key={index} sx={{ p: 0, mb: 2 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckCircleIcon sx={{ color: "#2C5530" }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={text}
                                sx={{ "& .MuiListItemText-primary": { color: "#FFFFFF" } }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => navigate("/register")}
                          sx={{
                            mt: 2,
                            background: "linear-gradient(90deg, #2C5530, #FFD700)",
                            color: "#000",
                            "&:hover": {
                              background: "linear-gradient(90deg, #FFD700, #2C5530)",
                              transform: "translateY(-2px)",
                            },
                            textTransform: "none",
                            fontSize: "1.1rem",
                          }}
                        >
                          Get Started
                        </Button>
                      </Box>
                    </RoleCard>
                  </Grid>

                  {/* Employers Card */}
                  <Grid item xs={12} md={6}>
                    <RoleCard elevation={3}>
                      <div className="card-background" />
                      <Box sx={{ position: "relative", zIndex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                            gap: 2,
                          }}
                        >
                          <BusinessIcon
                            className="card-icon"
                            sx={{
                              fontSize: "2.5rem",
                              color: "#FFD700",
                              transition: "transform 0.3s ease-in-out",
                            }}
                          />
                          <Typography variant="h5" sx={{ color: "#FFD700", fontWeight: 600 }}>
                            Employers
                          </Typography>
                        </Box>
                        <Typography sx={{
                          mb: 2,
                          color: "rgba(255, 255, 255, 0.9)",
                          fontSize: "1.1rem",
                          lineHeight: 1.6,
                          maxWidth: "600px"
                        }}>
                          Find the perfect candidates for your company. Post jobs and connect with
                          Jamaica's growing tech talent pool.
                        </Typography>
                        <List>
                          {[
                            "Post job opportunities",
                            "Find top talent",
                            "Company branding",
                          ].map((text, index) => (
                            <ListItem key={index} sx={{ p: 0, mb: 1 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckCircleIcon sx={{ color: "#FFD700" }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={text}
                                sx={{ ".MuiListItemText-primary": { color: "rgba(255, 255, 255, 0.85)" } }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => navigate("/login", { state: { employerRedirect: true } })}
                          sx={{
                            mt: 2,
                            background: "linear-gradient(90deg, #2C5530, #FFD700)",
                            color: "#000",
                            "&:hover": {
                              background: "linear-gradient(90deg, #FFD700, #2C5530)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)"
                            },
                            transition: "all 0.3s ease",
                            textTransform: "none",
                            fontSize: "1.1rem",
                            fontWeight: 600,
                          }}
                        >
                          Start Hiring
                        </Button>
                      </Box>
                    </RoleCard>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          </StyledContainer>
        </Box>

        {/* Footer Section */}
        <Box
          component="footer"
          sx={{
            position: "relative",
            zIndex: 2,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            borderTop: "1px solid rgba(255, 215, 0, 0.1)",
            py: 4,
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" sx={{ color: "#FFD700", mb: 2, fontWeight: 600 }}>
                  Partner with Us
                </Typography>
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <Button
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": { color: "#FFD700" },
                        textTransform: "none",
                      }}
                      onClick={() => navigate("/employers")}
                    >
                      For Employers
                    </Button>
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <Button
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": { color: "#FFD700" },
                        textTransform: "none",
                      }}
                      onClick={() => navigate("/about")}
                    >
                      About Us
                    </Button>
                  </ListItem>
                  <ListItem sx={{ p: 0 }}>
                    <Button
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": { color: "#FFD700" },
                        textTransform: "none",
                      }}
                      onClick={() => navigate("/contact")}
                    >
                      Contact Us
                    </Button>
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="h6" sx={{ color: "#FFD700", mb: 2, fontWeight: 600 }}>
                  Company
                </Typography>
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <Button
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": { color: "#FFD700" },
                        textTransform: "none",
                      }}
                      onClick={() => navigate("/careers")}
                    >
                      Careers
                    </Button>
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <Button
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": { color: "#FFD700" },
                        textTransform: "none",
                      }}
                      onClick={() => navigate("/blog")}
                    >
                      Blog
                    </Button>
                  </ListItem>
                  <ListItem sx={{ p: 0 }}>
                    <Button
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": { color: "#FFD700" },
                        textTransform: "none",
                      }}
                      onClick={() => navigate("/press")}
                    >
                      Press
                    </Button>
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="h6" sx={{ color: "#FFD700", mb: 2, fontWeight: 600 }}>
                  Legal
                </Typography>
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <Button
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": { color: "#FFD700" },
                        textTransform: "none",
                      }}
                      onClick={() => navigate("/privacy")}
                    >
                      Privacy Policy
                    </Button>
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <Button
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": { color: "#FFD700" },
                        textTransform: "none",
                      }}
                      onClick={() => navigate("/terms")}
                    >
                      Terms of Use
                    </Button>
                  </ListItem>
                  <ListItem sx={{ p: 0 }}>
                    <Button
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": { color: "#FFD700" },
                        textTransform: "none",
                      }}
                      onClick={() => navigate("/accessibility")}
                    >
                      Accessibility
                    </Button>
                  </ListItem>
                </List>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, pt: 4, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.5)", textAlign: "center" }}>
                © {new Date().getFullYear()} JamDung Jobs. A BinGiTech Company. All rights reserved.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
