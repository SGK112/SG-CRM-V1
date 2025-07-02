import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import { TrendingUp, TrendingDown, Info } from '@mui/icons-material';

const MarketingMetricCard = ({ 
  title, 
  value, 
  unit = '', 
  trend, 
  trendValue, 
  target,
  color = 'primary',
  icon: Icon,
  subtitle,
  details = {},
  onClick
}) => {
  const progress = target ? (parseFloat(value) / target) * 100 : 0;
  const isPositiveTrend = trend === 'up' || (trendValue && trendValue > 0);
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {Icon && <Icon sx={{ fontSize: 24, color: `${color}.main` }} />}
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          {Object.keys(details).length > 0 && (
            <Tooltip title={
              <Box>
                {Object.entries(details).map(([key, val]) => (
                  <Typography key={key} variant="caption" display="block">
                    {key}: {val}
                  </Typography>
                ))}
              </Box>
            }>
              <IconButton size="small">
                <Info sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Typography 
          variant="h4" 
          color={`${color}.main`} 
          gutterBottom 
          sx={{ fontWeight: 700, lineHeight: 1 }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}{unit}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}

        {target && (
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress to target ({target}{unit})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(progress, 100)} 
              sx={{ 
                borderRadius: 1, 
                height: 6,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progress >= 100 ? 'success.main' : `${color}.main`,
                }
              }}
            />
          </Box>
        )}

        {(trend || trendValue) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            {isPositiveTrend ? (
              <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Chip
              label={trendValue ? `${trendValue > 0 ? '+' : ''}${trendValue}%` : trend}
              size="small"
              color={isPositiveTrend ? 'success' : 'error'}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketingMetricCard;
