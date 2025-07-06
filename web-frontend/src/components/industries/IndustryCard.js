import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Tooltip
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Agriculture as AgricultureIcon,
  Factory as FactoryIcon,
  LocalShipping as ShippingIcon,
  PrecisionManufacturing as ManufacturingIcon,
  Construction as ConstructionIcon,
  AccountBalance as GovernmentIcon,
  Hotel as HotelIcon,
  AccountBalanceWallet as FinanceIcon,
  Power as UtilitiesIcon,
  BusinessCenter as ServicesIcon,
  HomeWork as RealEstateIcon,
  Storefront as RetailIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatGrowthRate, getPriorityLabel } from '../../data/industryStats';

const IndustryCard = ({ industry, showJobCount = false, compact = false }) => {
  const navigate = useNavigate();

  const getIndustryIcon = (iconName) => {
    const iconMap = {
      computer: ComputerIcon,
      agriculture: AgricultureIcon,
      factory: FactoryIcon,
      local_shipping: ShippingIcon,
      precision_manufacturing: ManufacturingIcon,
      construction: ConstructionIcon,
      account_balance: GovernmentIcon,
      hotel: HotelIcon,
      account_balance_wallet: FinanceIcon,
      power: UtilitiesIcon,
      business_center: ServicesIcon,
      home_work: RealEstateIcon,
      storefront: RetailIcon
    };
    
    const IconComponent = iconMap[iconName] || ServicesIcon;
    return <IconComponent />;
  };

  const getTrendIcon = (trend, priority) => {
    if (priority === 'declining') return <TrendingDownIcon />;
    if (trend === 'up') return <TrendingUpIcon />;
    return <TrendingFlatIcon />;
  };

  const handleViewJobs = (e) => {
    e.stopPropagation();
    navigate(`/jobs?industry=${industry.id}`);
  };

  const handleCardClick = () => {
    navigate(`/industries/${industry.id}`);
  };

  if (compact) {
    return (
      <Card
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(40, 40, 40, 0.9) 100%)',
          border: `1px solid ${industry.color}40`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 25px ${industry.color}30`,
            border: `1px solid ${industry.color}80`
          }
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `${industry.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: industry.color
                }}
              >
                {getIndustryIcon(industry.icon)}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                  {industry.shortName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatGrowthRate(industry.growth)}
                </Typography>
              </Box>
            </Box>
            <Chip
              size="small"
              label={getPriorityLabel(industry.priority)}
              sx={{
                backgroundColor: `${industry.color}20`,
                color: industry.color,
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(40, 40, 40, 0.9) 100%)',
        border: `1px solid ${industry.color}40`,
        borderRadius: 3,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 30px ${industry.color}30`,
          border: `1px solid ${industry.color}80`
        }
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: `${industry.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: industry.color
            }}
          >
            {getIndustryIcon(industry.icon)}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={`${industry.trend === 'up' ? 'Growing' : industry.trend === 'down' ? 'Declining' : 'Stable'}`}>
              <Box sx={{ color: industry.color }}>
                {getTrendIcon(industry.trend, industry.priority)}
              </Box>
            </Tooltip>
            <Typography
              variant="h6"
              sx={{
                color: industry.color,
                fontWeight: 700,
                fontSize: '1.25rem'
              }}
            >
              {formatGrowthRate(industry.growth)}
            </Typography>
          </Box>
        </Box>

        {/* Priority Badge */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={getPriorityLabel(industry.priority)}
            size="small"
            sx={{
              background: industry.bgColor,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24
            }}
          />
        </Box>

        {/* Industry Name */}
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            color: 'white',
            fontWeight: 600,
            lineHeight: 1.3,
            mb: 1
          }}
        >
          {industry.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            lineHeight: 1.5,
            flexGrow: 1
          }}
        >
          {industry.description}
        </Typography>

        {/* Job Types */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Popular Roles:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {industry.jobTypes.slice(0, 3).map((jobType, index) => (
              <Chip
                key={index}
                label={jobType}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: `${industry.color}40`,
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            ))}
            {industry.jobTypes.length > 3 && (
              <Chip
                label={`+${industry.jobTypes.length - 3} more`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: `${industry.color}40`,
                  color: industry.color,
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            )}
          </Box>
        </Box>

        {/* Salary Range */}
        {industry.averageSalary && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Salary Range: ${industry.averageSalary.min.toLocaleString()} - ${industry.averageSalary.max.toLocaleString()} {industry.averageSalary.currency}
            </Typography>
          </Box>
        )}

        {/* Job Count */}
        {showJobCount && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color={industry.color} sx={{ fontWeight: 600 }}>
              {Math.floor(Math.random() * 50) + 10} active jobs
            </Typography>
          </Box>
        )}

        {/* Action Button */}
        <Button
          variant="outlined"
          fullWidth
          endIcon={<ArrowIcon />}
          onClick={handleViewJobs}
          sx={{
            borderColor: industry.color,
            color: industry.color,
            fontWeight: 600,
            mt: 'auto',
            '&:hover': {
              backgroundColor: `${industry.color}20`,
              borderColor: industry.color
            }
          }}
        >
          View Jobs
        </Button>
      </CardContent>
    </Card>
  );
};

export default IndustryCard;
