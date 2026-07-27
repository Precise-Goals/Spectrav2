import React from 'react';
import CinematicHero from '../components/home/CinematicHero';
import FeedbackSection from '../components/home/FeedbackSection';
import SEO from '../components/ui/SEO';

export default function Home() {
  return (
    <main className="bg-grid-overlay">
      <SEO 
        title="Unified Web3 Agentic Wallet & Exchange on Stellar"
        description="Spectra is the next-generation Web3 Agentic Wallet & DEX on Stellar Mainnet. Experience gasless transactions, autonomous AI agents, and Soroban-powered DeFi."
        keywords="Spectra Wallet, Web3 Agentic Wallet, Stellar Mainnet, Soroban Smart Contracts, Decentralized Exchange, DEX, AI Agent, Gasless Transactions, DeFi"
      />
      <CinematicHero />
      <FeedbackSection />
    </main>
  );
}
