# 🌌 Spectra — Unified Web3 Agentic Wallet & Exchange

> **Built by Team Falcons** · Universal Gas Framework (UGF) Hackathon  
> Deployed on **Base Sepolia Testnet** · Built with UGF and [Tychi Labs](https://tychilabs.com)

Spectra is a production-grade decentralised finance (DeFi) platform that eliminates the single largest barrier to Web3 adoption — **gas fees**. Every on-chain action (swaps, subscriptions, NFT minting) is executed completely gasless for the end user via the **Universal Gas Framework (UGF)**, settled in **TYI Mock USD** instead of native ETH.

---

## 📑 Table of Contents

1. [The Problem & Vision](#-the-problem--vision)
2. [Platform Overview](#-platform-overview)
3. [Application Architecture](#-application-architecture)
4. [Module Deep-Dives](#-module-deep-dives)
   - [AI Agentic Terminal](#1-ai-agentic-terminal--glassterminal)
   - [Exchange Engine](#2-exchange-engine)
   - [Subscriptive NFT Engine](#3-subscriptive-nft-engine--mint-console)
5. [Smart Contract Suite](#-smart-contract-suite)
6. [UGF Gasless Pipeline](#-ugf-gasless-pipeline)
7. [Agent Orchestration Architecture](#-agent-orchestration-architecture)
8. [End-to-End Workflow Walkthrough](#-end-to-end-workflow-walkthrough)
9. [Contract Addresses](#-deployed-contract-addresses-base-sepolia)
10. [Local Development Setup](#️-local-development-setup)
11. [Environment Variables](#-environment-variables)
12. [Tech Stack](#-tech-stack)
13. [Team](#-team-falcons)

---

## 🎯 The Problem & Vision

### Why Gas is Broken

In traditional Web3, every on-chain interaction requires ETH (or the chain's native token) in your wallet — even if you only want to swap stablecoins. This creates an absurd bootstrapping paradox: users need ETH to get started, but they need to get started before they can acquire ETH.

```
Normal Flow (Broken)                    Spectra Flow (Fixed)
─────────────────────                   ────────────────────
User wants to swap $10 USDC             User wants to swap $10 TYI
         ↓                                       ↓
"You need ETH for gas"                   Type: "swap 10 TYI for ETH"
         ↓                                       ↓
Buys ETH on a CEX                         AI Agent parses intent
         ↓                                       ↓
Sends ETH to wallet                       Sign EIP-712 payload
         ↓                                       ↓
Now pays gas to swap                  UGF deducts fee in TYI
         ↓                                       ↓
Still needs ETH for next tx           ✅ ETH arrives. 0 ETH spent.
```

### The Spectra Vision

Spectra is a fully vertically-integrated DeFi platform where:

- An **AI Agent** understands your financial intent in plain English
- A **gasless relayer network** executes it on-chain
- A **tiered SaaS subscription model** powers access control
- **Soulbound NFT badges** prove your membership on-chain

---

## 🏗️ Platform Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        SPECTRA PLATFORM                         │
├───────────────┬──────────────────┬──────────────────────────────┤
│  🤖 AI AGENT  │   💱 EXCHANGE    │    🎨 NFT MINT ENGINE        │
│               │                  │                              │
│ Sarvam AI NLP │ TYI ↔ ETH ↔ USDC│ Alpha / Vector / Nexus Tiers │
│ Intent Parser │ Live Quote Feed  │ Soulbound Badge Minting      │
│ EIP-712 Sign  │ Flexible Pairs   │ Spline 3D Interactive View   │
│ UGF Relay     │ UGF Gasless Swap │ Cancel & Burn NFT            │
└───────────────┴──────────────────┴──────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     UGF GASLESS LAYER                           │
│  Quote → Approve Forwarder → x402 Payment → Sponsor & Execute  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   BASE SEPOLIA (Chain 84532)                    │
│  SpectraExchange  │  SpectraSaaS  │  SpectraNFT  │  MockUSD    │
└─────────────────────────────────────────────────────────────────┘
```

### Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Cinematic landing with Spline 3D hero, live terminal preview |
| `/agent` | GlassTerminal | AI-powered conversational swap agent |
| `/exchange` | Exchange | Manual dual-asset swap console with TradingView charts |
| `/mint` | MintConsole | NFT subscription badge minting & management |
| `/about` | About | Platform docs, architecture, and team |
| `/journal` | Journal | Transaction history log |
| `/admin` | Admin | Admin-only panel for contract management |

---

## 🏛️ Application Architecture

```
spectra/
├── src/
│   ├── api/
│   │   └── sarvamAgent.js          ← AI intent parsing engine (Sarvam 30B)
│   ├── components/
│   │   ├── agent/
│   │   │   └── GlassTerminal.jsx   ← Full agentic wallet UI
│   │   ├── exchange/
│   │   │   └── SwapBox.jsx         ← Dual-asset swap component
│   │   ├── home/
│   │   │   ├── CinematicHero.jsx   ← 3D animated landing section
│   │   │   └── HeroDesign.jsx      ← Spline scene renderer
│   │   ├── mint/
│   │   │   └── MintConsole.jsx     ← NFT tier selection & minting
│   │   └── layout/
│   │       ├── FluidNav.jsx        ← Global navigation bar
│   │       └── MainLayout.jsx      ← App shell wrapper
│   ├── config/
│   │   └── contracts.js            ← All addresses, ABIs, and network config
│   ├── hooks/
│   │   └── useUGF.js               ← UGF SDK orchestration hook
│   ├── pages/                      ← Route-level page components
│   └── styles/
│       ├── spectra-parity.css      ← Design system tokens & components
│       └── final.css               ← Global imports
├── contracts/
│   └── src/
│       ├── SpectraExchange.sol     ← AMM-style exchange with quota enforcement
│       ├── SpectraSaaS.sol         ← Subscription management contract
│       └── SpectraNFT.sol          ← Soulbound ERC-721 badge contract
├── vite.config.js                  ← Vite + assetsInclude for .splinecode
└── index.html                      ← Spline viewer web-component loader
```

---

## 🔍 Module Deep-Dives

### 1. AI Agentic Terminal — GlassTerminal

The `GlassTerminal` is Spectra's flagship feature — a conversational, AI-powered wallet interface styled like a hacker's glass-morphism terminal.

#### How it Works

```
User types: "swap 100 TYI for ETH"
        ↓
sarvamAgent.parseDefiIntent(prompt)   ← Sarvam 30B LLM call
        ↓
Returns structured JSON intent:
{
  "action": "swap",
  "amount": "100",
  "token": "TYI"
}
        ↓
GlassTerminal renders IntentCard with:
  - Editable amount input
  - Route: TYI → ETH
  - Live quote from SpectraExchange.getQuote()
        ↓
User edits amount (optional) → clicks CONFIRM
        ↓
handleSignAndExecute():
  1. Approve SpectraExchange to spend tokenIn
  2. Encode swap() calldata via ethers.Interface
  3. Call useUGF().execute({ target, data, signer })
        ↓
Transaction confirmed on-chain gaslessly ✅
```

#### Sidebar Portfolio Value

The terminal sidebar shows a live **Total Asset Value (USD)** which aggregates across all holdings:

```
Total USD = (TYI balance × $1.00)
          + (USDC balance × $1.00)
          + (ETH balance × $3,500.00)
```

---

### 2. Exchange Engine

The Exchange page provides a fully manual swap interface with dual-asset dropdowns, live quotes, and TradingView price charts.

#### Quote Flow

```javascript
// Exchange.jsx — reactive quote fetching
useEffect(() => {
  const fetchQuote = async () => {
    const amountIn = ethers.parseUnits(payAmount, decimalsIn);   // TYI = 6 dec, ETH = 18 dec
    const tokenIn  = resolveTokenAddress(payAsset);
    const tokenOut = resolveTokenAddress(selectedAsset);

    // On-chain view call — no gas required
    const amountOut = await exchange.getQuote(tokenIn, tokenOut, amountIn);

    setReceiveAmount(ethers.formatUnits(amountOut, decimalsOut));
  };

  fetchQuote();
}, [payAmount, payAsset, selectedAsset]);
```

#### Supported Token Pairs

| Pay → Receive | Rate |
|--------------|------|
| TYI → ETH | 1 ETH = 3,500 TYI |
| ETH → TYI | 1 TYI = 0.000285 ETH |
| USDC → ETH | 1 ETH = 3,500 USDC |
| ETH → USDC | 1 USDC = 0.000285 ETH |
| TYI ↔ USDC | 1:1 (same decimals) |

---

### 3. Subscriptive NFT Engine — Mint Console

The MintConsole renders 3D interactive Spline badge previews for each subscription tier, supports gasless minting, and provides a cancel-and-burn flow.

#### Tier Matrix

| Tier | Price | Daily TXs | Badge | Spline Scene |
|------|-------|-----------|-------|-------------|
| **ALPHA** | Free | 20 | `/1.png` | `/1.splinecode` |
| **VECTOR** | $15/mo | 60 | `/2.png` | `/2.splinecode` |
| **NEXUS** | $49/mo | 100 | `/3.png` | `/3.splinecode` |

#### Mint Execution Flow

```
1. User selects tier (VECTOR or NEXUS)
2. Approve TYI allowance for SpectraSaaS
3. saas.subscribe(tier.plan) — sets on-chain tier
4. Encode mintVectorBadge() or mintNexusBadge() calldata
5. useUGF().execute() — gasless badge mint via UGF relayer
6. fetchBalances() — polls for updated NFT token ownership
```

#### Cancel / Burn Flow

If a user cancels their subscription, a two-step on-chain sequence executes:

```
1. saas.cancelSubscription()  → Resets tier to ALPHA on-chain
2. nft.burn(ownedTokenId)     → Burns the soulbound badge NFT
```

The user is shown a confirmation popup before this executes: _"Are you sure you want to cancel the NFT? This will remove the benefits too."_

---

## 📜 Smart Contract Suite

### `SpectraExchange.sol`

The core AMM-style exchange contract. Enforces daily transaction quotas via `SpectraSaaS` before every swap.

```solidity
// Decimal-aware pricing model
function getQuote(
    address tokenIn,
    address tokenOut,
    uint256 amountIn
) public view returns (uint256 amountOut) {
    // TYI/USDC = 6 decimals, ETH/WETH = 18 decimals
    // ETH price = $3500

    if (tokenIn == mockUSD && tokenOut == WETH) {
        // TYI(6dec) → ETH(18dec)
        return (amountIn * 10**12) / 3500;
    } else if (tokenIn == WETH && tokenOut == mockUSD) {
        // ETH(18dec) → TYI(6dec)
        return (amountIn * 3500) / 10**12;
    } else {
        return amountIn; // 1:1 for same-decimal stablecoins
    }
}
```

### `SpectraSaaS.sol`

Manages Web3-native monthly subscriptions. Records each transaction against daily limits and can auto-deduct renewal fees if allowance is set.

```solidity
enum PlanTier { ALPHA, VECTOR, NEXUS }

struct TierInfo {
    uint256 dailyTxLimit;
    uint256 monthlyFee;  // in TYI (6 decimals)
    bool    hasNFTAccess;
}

function subscribe(PlanTier _tier) external nonReentrant { ... }
function cancelSubscription() external { ... }
function renewSubscription(address _user) external nonReentrant { ... }
function recordTransaction(address _user) external { ... }
```

### `SpectraNFT.sol`

Soulbound ERC-721 contract. Badges cannot be transferred — only minted (by eligible subscribers) or burned (by the badge holder).

```solidity
// Soulbound enforcement — blocks all transfers except mint and burn
function _update(address to, uint256 tokenId, address auth)
    internal virtual override returns (address)
{
    address from = _ownerOf(tokenId);
    if (from != address(0) && to != address(0)) {
        revert NonTransferable();
    }
    return super._update(to, tokenId, auth);
}

// User-callable burn
function burn(uint256 tokenId) external {
    require(ownerOf(tokenId) == msg.sender, "Not the owner");
    _burn(tokenId);
}
```

---

## ⛽ UGF Gasless Pipeline

Spectra uses the `@tychilabs/ugf-testnet-js` SDK inside the `useUGF` custom hook to power all gasless executions.

### Pipeline Steps

```
INITIALIZING
    ↓
AUTHENTICATING     ← client.auth.login(signer)
    ↓
QUOTING            ← client.quote.get({ tx_object, payer, chain })
    ↓
CHECKING_ALLOWANCE ← tokenContract.allowance(user, forwarder)
    ↓
APPROVING_FORWARDER (if needed) ← tokenContract.approve(forwarder, MaxUint256)
    ↓
SUBMITTING_PAYMENT ← client.payment.x402.execute({ quote, signer })
    ↓
EXECUTING_ON_CHAIN ← client.chains.evm.sponsorAndExecute(digest, signer, txBuilder)
    ↓
SUCCESS ✅
```

### `useUGF` Hook — Core Execute Function

```javascript
// src/hooks/useUGF.js

const execute = useCallback(async ({ target, data, paymentToken, signer }) => {
  const client = new TestnetUGFClient();

  // 1. Authenticate with UGF network
  await client.auth.login(signer);

  // 2. Request a quote — UGF estimates the TYI cost of sponsoring gas
  const q = await client.quote.get({
    payment_coin: 'TYI_MOCK_USD',
    payer_address: address,
    payment_chain: '84532',        // Base Sepolia
    tx_object: JSON.stringify({
      from: address,
      to: target,
      data: data || '0x',
      value: '0x0'
    }),
    dest_chain_id: '84532',
  });

  // 3. Ensure UGF Forwarder has allowance for TYI payment
  const forwarder = await client.registry.getOption('TYI_MOCK_USD');
  if (allowance < q.payment_amount) {
    await tokenContract.approve(forwarder, MaxUint256);
  }

  // 4. Settle payment via x402 protocol
  await client.payment.x402.execute({ quote: q, signer, token: 'TYI_MOCK_USD' });

  // 5. Execute the sponsored transaction on-chain
  const result = await client.chains.evm.sponsorAndExecute(
    q.digest,
    signer,
    async (s) => ({ to: target, data, value: 0n })
  );

  return result; // { userTxHash, ... }
}, []);
```

---

## 🧠 Agent Orchestration Architecture

This is the full lifecycle of a single user command through the Spectra AI Agent system.

```
┌──────────────────────────────────────────────────────────────────┐
│  USER INPUT: "swap half my TYI for ETH"                          │
└──────────────────────────┬───────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 1 — SARVAM AI INTENT PARSER (sarvamAgent.js)             │
│                                                                  │
│  Model: sarvam-30b (OpenAI-compatible REST API)                  │
│  Temp:  0.1  (high determinism for structured output)            │
│  Mode:  json_object response_format                              │
│                                                                  │
│  System Prompt enforces strict output schema:                    │
│  { action, amount, token } OR { error: "clarify..." }            │
│                                                                  │
│  Retry:  3 attempts with exponential back-off (800ms base)       │
│  Timeout: 15,000ms per attempt                                   │
│                                                                  │
│  Output: { action: "swap", amount: "0.5", token: "TYI" }        │
└──────────────────────────┬───────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 2 — INTENT CARD RENDERER (GlassTerminal.jsx)             │
│                                                                  │
│  ┌─────────────────────────────────────┐                         │
│  │  INTENT DETECTED                    │                         │
│  │  Action:  SWAP                      │                         │
│  │  Amount:  [  50.00  ] ← editable   │                         │
│  │  Token:   TYI → ETH                │                         │
│  │  Quote:   ~0.01428 ETH             │                         │
│  │                                     │                         │
│  │  [CONFIRM & SIGN]  [DISMISS]        │                         │
│  └─────────────────────────────────────┘                         │
│                                                                  │
│  User can edit amount before executing                           │
└──────────────────────────┬───────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 3 — EIP-712 CRYPTOGRAPHIC HANDSHAKE                      │
│                                                                  │
│  MetaMask prompts user for signature                             │
│  Human-in-the-Loop safety: No automation without consent        │
│  Signature authorizes UGF Forwarder to deduct TYI               │
└──────────────────────────┬───────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 4 — UGF GASLESS RELAYER (useUGF.js hook)                 │
│                                                                  │
│  Auth → Quote → Allowance Check → x402 Payment → Execute        │
│                                                                  │
│  UGF sponsors 100% of native gas on Base Sepolia                │
│  User's ETH balance is never touched                             │
└──────────────────────────┬───────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 5 — ON-CHAIN EXECUTION (SpectraExchange.sol)             │
│                                                                  │
│  1. enforceQuota() — checks daily SaaS tier limit               │
│  2. transferFrom(user, exchange, amountIn)                       │
│  3. getQuote() — decimal-aware pricing                           │
│  4. transfer(user, amountOut)                                    │
│  5. emit SwapExecuted(...)                                       │
└──────────────────────────┬───────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 6 — POST-EXECUTION SYNC                                   │
│                                                                  │
│  Balance polling at 2s, 5s, 8s intervals                         │
│  Terminal sidebar updates Total Portfolio Value (USD)            │
│  Transaction hash displayed with BaseScan link                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 End-to-End Workflow Walkthrough

### Scenario: New User — Complete Journey

```
STEP 1: ONBOARDING
  User visits Spectra → connects MetaMask
  App detects Base Sepolia (chainId: 84532) — auto-switches if wrong chain
  Claims TYI Mock USD from faucet: universalgasframework.com/faucets

STEP 2: SUBSCRIBE
  Navigate to /mint
  Select VECTOR tier ($15/mo)
  Approve TYI allowance → saas.subscribe(1)
  Gasless mint: mintVectorBadge() via UGF
  Receive soulbound Vector Badge NFT + 60 daily tx quota

STEP 3: SWAP VIA AGENT
  Navigate to /agent
  Type: "swap 100 TYI for ETH"
  Sarvam AI returns: { action: swap, amount: 100, token: TYI }
  Edit amount if desired (e.g. 50)
  Click CONFIRM & SIGN → MetaMask EIP-712 signature prompt
  UGF relayer executes swap on-chain (0 ETH gas spent)
  ETH arrives in wallet; TYI deducted

STEP 4: MANUAL SWAP
  Navigate to /exchange
  Select Pay: ETH, Receive: USDC
  See live on-chain quote from SpectraExchange.getQuote()
  Click SWAP → MetaMask confirms approval + swap
  TradingView chart updates to selected pair

STEP 5: CANCEL SUBSCRIPTION
  Navigate to /mint
  Click CANCEL SUBSCRIPTION & BURN NFT
  Confirm popup: "Are you sure? This will remove the benefits too."
  Two on-chain txs:
    → saas.cancelSubscription() resets tier to ALPHA
    → nft.burn(tokenId) destroys the badge
```

---

## 📍 Deployed Contract Addresses (Base Sepolia)

| Contract | Address |
|----------|---------|
| **TYI Mock USD** | `0x27dc1c167aef232bb1e21073304b526726a8727e` |
| **SpectraSaaS** | `0x7ea1f8d6e7293e9e237a6e9f0a0fd667b1a89158` |
| **SpectraNFT** | `0xc069dfe82b454fd2631a519a1fb11fe9cbe54ecf` |
| **SpectraExchange** | `0x40b4195daa1ac703dfbe6f77de39b3ce70c1ac81` |

> 🔎 View on [Base Sepolia Explorer](https://sepolia.basescan.org)

---

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js** v18+ or **Bun** (recommended)
- **MetaMask** browser extension
- Base Sepolia network configured in MetaMask
- TYI Mock USD from the [UGF Faucet](https://universalgasframework.com/faucets)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/TychiWallet/spectra.git
cd spectra

# 2. Install frontend dependencies
bun install       # or: npm install

# 3. Install contract dependencies (for redeployment only)
cd contracts && npm install && cd ..
```

### Running Locally

```bash
bun run dev       # or: npm run dev
```

Open `http://localhost:5173` in your browser.

### Redeploying Contracts (Optional)

```bash
cd contracts

# Deploy all contracts
npx hardhat run scripts/deploy.cjs --network base-sepolia

# Seed exchange with test liquidity
npx hardhat run scripts/fundExchange.cjs --network base-sepolia
```

After redeployment, update addresses in `src/config/contracts.js`.

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# Required — Sarvam AI API key for the agentic intent parser
VITE_SARVAM_API_KEY=your_sarvam_api_key_here
```

Get your Sarvam AI key at [sarvam.ai](https://sarvam.ai).

---

## 🧰 Tech Stack

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| Blockchain | ethers.js v6 |
| Gasless Layer | `@tychilabs/ugf-testnet-js` |
| AI Engine | Sarvam AI (sarvam-30b via REST) |
| 3D Rendering | Spline Tool (`spline-viewer` web component) |
| Charts | TradingView React Widgets |
| Styling | Vanilla CSS + CSS variables design system |
| Animation | Framer Motion |

### Smart Contracts

| Layer | Technology |
|-------|-----------|
| Language | Solidity ^0.8.24 |
| Framework | Hardhat |
| Libraries | OpenZeppelin (ERC721, Ownable, ReentrancyGuard) |
| Network | Base Sepolia (Chain ID: 84532) |

---

## 👥 Team Falcons

- **Sarthak Patil** - sarthakpatil.ug@gmail.com
- **Utkarsh Vidwat** - utkarshvidwat@gmail.com
- **Jay Magar** - jaymagar310@gmail.com
- **Omkar Rane** - omkarrane0934@gmail.com
- **Sarthak Godse** - sarthakgodse03@gmail.com

---

## 🌟 Community & Interoperability

### Importance of Rise In Community
The **Rise In community** has been pivotal to the development of Spectra. By fostering an environment of collaboration, sharing resources, and providing continuous feedback, the community has empowered our team to overcome technical hurdles and accelerate our Web3 integration. We are deeply grateful for their support.

### Stellar XML Integration
To ensure robust data interchange and wide-ranging interoperability, Spectra incorporates **Stellar XML** standards. This allows our infrastructure to seamlessly communicate with various external services and maintain a high standard of data compliance.

---

## 🔗 References

| Resource | Link |
|----------|------|
| UGF Documentation | [universalgasframework.com/docs](https://universalgasframework.com/docs) |
| Testnet Quickstart | [universalgasframework.com/docs/testnet](https://universalgasframework.com/docs/testnet) |
| TYI Faucet | [universalgasframework.com/faucets](https://universalgasframework.com/faucets) |
| UGF Testnet JS SDK | [@tychilabs/ugf-testnet-js](https://www.npmjs.com/package/@tychilabs/ugf-testnet-js) |
| UGF React SDK | [@tychilabs/react-ugf](https://www.npmjs.com/package/@tychilabs/react-ugf) |
| Sarvam AI | [sarvam.ai](https://sarvam.ai) |
| Base Sepolia Explorer | [sepolia.basescan.org](https://sepolia.basescan.org) |

---

*Developed for the Universal Gas Framework (UGF) Hackathon. Built with UGF and [Tychi Labs](https://tychilabs.com).*
