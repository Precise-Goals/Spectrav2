import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";

const NavContainer = styled(motion.nav)`
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  border-radius: 9999px;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  gap: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  border: 2px solid blue;
  border-radius: 4rem;
  padding: 1.2% 4em;
  backdrop-filter: blur(10px) brightness(0.5);
  background: transparent;
  border: blue 2px solid;
  padding: 1% 4%;
  border-radius: 2px;
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.spectraWhite};
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.colors.neonPurple};
    text-shadow: 0 0 8px ${({ theme }) => theme.colors.neonPurple};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0%;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.neonPurple};
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
    box-shadow: 0 0 5px ${({ theme }) => theme.colors.neonPurple};
  }
`;

const Navigation = () => {
  return (
    <NavContainer
      initial={{ y: -100, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <StyledLink to="/">Home</StyledLink>
      <StyledLink to="/about">About</StyledLink>
      <StyledLink to="/agent">Agent</StyledLink>
      <StyledLink to="/exchange">Exchange</StyledLink>
      <StyledLink to="/mint">NFT Minting</StyledLink>
      <StyledLink to="/journal">Journal</StyledLink>
    </NavContainer>
  );
};

export default Navigation;
