import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';

const LogoWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  '& img': {
    height: '40px',
    width: 'auto',
  },
  '&.large img': {
    height: '60px',
  },
  '&.small img': {
    height: '32px',
  },
}));

const MotionLogo = motion(LogoWrapper);

const Logo = ({ size = 'medium', animate = true, onClick }) => {
  const variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <MotionLogo
      className={size}
      initial={animate ? "initial" : false}
      animate="animate"
      whileHover={onClick ? "hover" : false}
      whileTap={onClick ? "tap" : false}
      variants={variants}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <img
        src="/logo.png"
        alt="EDECS Business"
        onError={(e) => {
          e.target.src = '/default-logo.png';
        }}
      />
    </MotionLogo>
  );
};

export default Logo; 