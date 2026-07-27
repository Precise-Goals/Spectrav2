import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_SEO = {
  title: 'Spectra — Unified Web3 Agentic Wallet & DEX on Stellar',
  description: 'Experience Spectra: A modern Web3 Agentic Wallet, real-time decentralized exchange (DEX), gasless transactions, SaaS tiered membership, and autonomous AI trading on Stellar Mainnet powered by Soroban.',
  keywords: 'Spectra, Web3 Wallet, Crypto Wallet, Decentralized Exchange, DEX, AI Agent, Gasless Transactions, Soroban, Stellar Mainnet, Smart Contracts, DeFi, SaaS Membership, Vector Tier, Nexus Tier, Automated Crypto Trading, Real-Time Analytics',
  image: 'https://i.ibb.co/VWfjNZCX/Spectra.jpg',
  siteUrl: 'https://falcons-spectra.vercel.app',
  author: 'Precise-Goals'
};

export default function SEO({
  title,
  description,
  keywords,
  image,
  type = 'website',
  canonicalUrl,
  noindex = false,
  structuredData = null
}) {
  const location = useLocation();

  const finalTitle = title ? `${title} | Spectra Web3` : DEFAULT_SEO.title;
  const finalDesc = description || DEFAULT_SEO.description;
  const finalKeywords = keywords ? `${keywords}, ${DEFAULT_SEO.keywords}` : DEFAULT_SEO.keywords;
  const finalImage = image || DEFAULT_SEO.image;
  const currentUrl = canonicalUrl || `${DEFAULT_SEO.siteUrl}${location.pathname}`;

  useEffect(() => {
    // 1. Update document Title
    document.title = finalTitle;

    // Helper to set or create <meta> tags
    const setMetaTag = (attrName, attrValue, contentValue) => {
      let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', contentValue);
    };

    // Helper to set or create <link> tags
    const setLinkTag = (relValue, hrefValue) => {
      let tag = document.querySelector(`link[rel="${relValue}"]`);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', relValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', hrefValue);
    };

    // 2. Standard SEO Meta Tags
    setMetaTag('name', 'description', finalDesc);
    setMetaTag('name', 'keywords', finalKeywords);
    setMetaTag('name', 'author', DEFAULT_SEO.author);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 3. Open Graph (Facebook / LinkedIn)
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDesc);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:image', finalImage);
    setMetaTag('property', 'og:site_name', 'Spectra Web3 Platform');

    // 4. Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDesc);
    setMetaTag('name', 'twitter:image', finalImage);
    setMetaTag('name', 'twitter:creator', '@spectra_falcons');

    // 5. Canonical URL
    setLinkTag('canonical', currentUrl);

    // 6. JSON-LD Structured Data
    const scriptId = 'spectra-seo-jsonld';
    let scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const jsonLdPayload = structuredData || {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": finalTitle,
      "url": currentUrl,
      "description": finalDesc,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "author": {
        "@type": "Organization",
        "name": "Spectra Falcons Team",
        "url": DEFAULT_SEO.siteUrl
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "0",
        "highPrice": "99",
        "offerCount": "3"
      }
    };

    scriptEl.textContent = JSON.stringify(jsonLdPayload);
  }, [finalTitle, finalDesc, finalKeywords, finalImage, currentUrl, noindex, type, structuredData]);

  return null;
}
