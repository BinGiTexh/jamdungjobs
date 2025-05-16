import React, { useState, useEffect } from 'react';
import { Box, Typography, Tooltip, IconButton, Collapse } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { formatSalaryWithJMD } from '../../utils/currencyUtils';

/**
 * Component to display salary in both USD and JMD
 * @param {Object} salary - Salary object with min and max properties in USD
 */
export const SalaryDisplay = ({ salary }) => {
  const [showJMD, setShowJMD] = useState(false);
  const [formattedSalary, setFormattedSalary] = useState({
    usd: '',
    jmd: '',
    rate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormattedSalary = async () => {
      if (!salary || typeof salary !== 'object') {
        setFormattedSalary({
          usd: 'Salary not specified',
          jmd: '',
          rate: 0
        });
        setLoading(false);
        return;
      }

      try {
        const formatted = await formatSalaryWithJMD(salary);
        setFormattedSalary(formatted);
      } catch (error) {
        console.error('Error formatting salary:', error);
        setFormattedSalary({
          usd: `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()} USD`,
          jmd: 'JMD conversion unavailable',
          rate: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFormattedSalary();
  }, [salary]);

  if (loading) {
    return (
      <Typography variant="subtitle1" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
        Loading salary...
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
          {formattedSalary.usd}
        </Typography>
        
        <Tooltip title="Toggle JMD conversion">
          <IconButton 
            size="small" 
            onClick={() => setShowJMD(!showJMD)}
            sx={{ 
              ml: 1, 
              color: showJMD ? '#FFD700' : 'rgba(255, 215, 0, 0.5)',
              '&:hover': {
                color: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            <CurrencyExchangeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={`Exchange rate: 1 USD = ${formattedSalary.rate.toFixed(2)} JMD. Rates updated hourly.`}>
          <IconButton 
            size="small" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Collapse in={showJMD}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 215, 0, 0.8)', 
            mt: 0.5,
            fontStyle: 'italic',
            backgroundColor: 'rgba(44, 85, 48, 0.2)',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            display: 'inline-block'
          }}
        >
          {formattedSalary.jmd}
        </Typography>
      </Collapse>
    </Box>
  );
};

export default SalaryDisplay;
