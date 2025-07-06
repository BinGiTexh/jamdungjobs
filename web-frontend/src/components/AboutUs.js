import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
 
  Paper, 
  styled, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import FlagIcon from '@mui/icons-material/Flag';
import DevicesIcon from '@mui/icons-material/Devices';

// Styled components for Jamaican theme
const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    maxWidth: '1100px'
  },
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column'
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, #FFD700, #007E1B, #FFD700)'
  }
}));

// Background wrapper
const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#0A0A0A',
  position: 'relative',
  overflow: 'hidden',
  paddingBottom: theme.spacing(4)
}));

// Background image overlay
const BackgroundOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundImage: 'url("/images/generated/jamaican-design-1747273968.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: 0.3,
  zIndex: 1
});

const GoldText = styled(Typography)(({ theme: _theme }) => ({
  color: '#FFD700',
  fontWeight: 600
}));

const AboutUs = () => {
  return (
    <PageWrapper>
      <BackgroundOverlay />
      <StyledContainer>
        <StyledPaper>
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <GoldText variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
              About BingiTech & JamDung Jobs
            </GoldText>
            
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 500 }}>
                Our Mission
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
                <strong style={{ color: '#FFD700' }}>BingiTech</strong> is committed to creating technology solutions that are truly Jamaican at their core. 
                Through <strong style={{ color: '#FFD700' }}>JamDung Jobs</strong>, we're building more than just a job board – we're creating a platform that celebrates 
                our culture, empowers our people, and strengthens our economy.
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
                Our mission is to connect Jamaican talent with local opportunities through technology that understands and celebrates our unique identity. 
                We believe that by building solutions specifically designed for Jamaica, we can create a more efficient job market, reduce unemployment, 
                and help businesses find the qualified local talent they need to thrive.
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                JamDung Jobs is more than a name – it's a statement that this platform is built by Jamaicans, for Jamaicans, with our unique needs and culture at the forefront.
              </Typography>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(255, 215, 0, 0.3)', my: 4 }} />
            
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 500 }}>
                What Makes Us Different
              </Typography>
              
              <List>
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <LocationOnIcon sx={{ color: '#FFD700', fontSize: 30 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography variant="h6" sx={{ color: '#FFD700' }}>Jamaica-Specific Features</Typography>}
                    secondary={
                      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        From our parish-based location services to our understanding of local industries, every aspect of JamDung Jobs is built with Jamaica in mind.
                      </Typography>
                    }
                  />
                </ListItem>
                
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <WorkIcon sx={{ color: '#FFD700', fontSize: 30 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography variant="h6" sx={{ color: '#FFD700' }}>Local Economic Focus</Typography>}
                    secondary={
                      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        We're committed to strengthening Jamaica's economy by making it easier for local businesses to connect with qualified Jamaican talent.
                      </Typography>
                    }
                  />
                </ListItem>
                
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <PeopleIcon sx={{ color: '#FFD700', fontSize: 30 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography variant="h6" sx={{ color: '#FFD700' }}>Community-Centered Approach</Typography>}
                    secondary={
                      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        We see employers and job seekers as part of the same community, working together to build a stronger Jamaica.
                      </Typography>
                    }
                  />
                </ListItem>
                
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <SchoolIcon sx={{ color: '#FFD700', fontSize: 30 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography variant="h6" sx={{ color: '#FFD700' }}>Skills Development</Typography>}
                    secondary={
                      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        Our skills matching system helps identify gaps in the Jamaican workforce, guiding both job seekers and educational initiatives.
                      </Typography>
                    }
                  />
                </ListItem>
                
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <FlagIcon sx={{ color: '#FFD700', fontSize: 30 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography variant="h6" sx={{ color: '#FFD700' }}>Cultural Pride</Typography>}
                    secondary={
                      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        We proudly incorporate Jamaican cultural elements throughout our platform, celebrating our national identity in every aspect of our design.
                      </Typography>
                    }
                  />
                </ListItem>
                
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <DevicesIcon sx={{ color: '#FFD700', fontSize: 30 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography variant="h6" sx={{ color: '#FFD700' }}>Digital Inclusion</Typography>}
                    secondary={
                      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        We're making employment opportunities accessible to all Jamaicans through a user-friendly platform that works well on various devices.
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(255, 215, 0, 0.3)', my: 4 }} />
            
            <Box>
              <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 500 }}>
                Our Vision for Jamaica
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
                We envision a Jamaica where technology serves our unique needs, where local talent meets local opportunity, and where our digital 
                solutions reflect our cultural identity. JamDung Jobs is just the beginning of BingiTech's commitment to creating technology that is 
                not imported from elsewhere but truly designed for and by Jamaicans.
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                By choosing JamDung Jobs, you're not just using a job board – you're supporting a vision of Jamaica where our technological solutions 
                are as unique and vibrant as our culture. Together, we're building more than careers; we're building a stronger, more connected Jamaica.
              </Typography>
            </Box>
          </Box>
        </StyledPaper>
      </StyledContainer>
    </PageWrapper>
  );
};

export default AboutUs;
