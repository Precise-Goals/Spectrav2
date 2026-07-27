import React from 'react';
import MintConsole from '../components/mint/MintConsole';
import SEO from '../components/ui/SEO';

export default function Mint() {
  return (
    <main className="spectra-mint-page bg-grid">
      <SEO 
        title="Mint SaaS Membership Soulbound NFTs" 
        description="Mint non-transferable Soulbound NFTs for Spectra Alpha, Vector ($15/mo), and Nexus ($99/mo) SaaS membership tiers on Stellar Mainnet."
        keywords="Mint NFT, Soulbound NFT, SaaS Membership, Vector Tier, Nexus Tier, Stellar NFT, Crypto Membership"
      />
      <header className="spectra-mint-page-head">
        <h1 className="spectra-mint-page-title">SUBSCRIPTIVE NFT ENGINE</h1>
        <p className="spectra-mint-page-sub">
          Mint dynamic subscription badges. XLM is deducted per epoch based on selected tier.
        </p>
      </header>
      <MintConsole />
    </main>
  );
}
