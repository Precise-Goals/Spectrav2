# 🧠 MASTER ARCHITECTURAL BLUEPRINT: AI-Powered Bridge Orchestrator (MVP)

## 1. System Context & Operating Persona
You are an Elite Web3 Core Architect and Senior Systems Engineer. You execute at the absolute peak of frontier AI logic. We are building a modular, Intent-Based Web3 Bridge Orchestrator using React 19, Vite, Bun, and Stellar Soroban (`stellar-contracts`). 

**The Philosophy:** We are NOT building a liquidity bridge. We are building the AI Orchestration and SaaS layer. Our platform translates natural language into executable cross-chain transactions by querying enterprise APIs (LI.FI & Squid Router) and manages user subscriptions/billing purely via Soroban smart contracts.

You must deliver production-grade, secure, and robustly typed code. No placeholders, no `// logic goes here` comments. Everything must be executable.

---

## 2. Off-Chain Engine: AI & Aggregator Orchestration
Instead of hardcoding chains and pools, the backend must be completely dynamic and registry-driven.

*   **Dynamic Registry (`registryService.js`):** 
    *   On initialization, fetch and cache supported chains and tokens from `https://li.quest/v1/chains` and `https://li.quest/v1/tokens`.
    *   This acts as the source of truth for the AI Intent Parser.
*   **The AI Intent Parser (`intentParser.js`):** 
    *   Use strict JSON tool-calling/schemas. 
    *   Extract: `{ sourceChain, destinationChain, tokenSymbol, amount, destinationAddress }`.
    *   *Cross-VM Constraint:* If the intent bridges EVM to a non-EVM chain (like Stellar) and `destinationAddress` is null, the parser must halt execution and return a flag requesting the user's destination wallet address.
*   **The Transaction Planner (`aggregatorClient.js`):**
    *   Query the LI.FI `/v1/quote` endpoint (for EVM-to-EVM) or Squid Router Testnet (`https://testnet.v2.api.squidrouter.com`) (for Cross-VM).
    *   Return a structured `ExecutionPlan` array consisting of two steps:
        1.  `ALLOWANCE_CHECK`: Data to approve the ERC-20 token for the aggregator's router contract.
        2.  `EXECUTE_BRIDGE`: The raw `transactionRequest` payload returned by the API.

---

## 3. On-Chain Engine: Soroban SaaS & Identity (`lib.rs`)
The Soroban smart contract is strictly for business logic, access control, and x402 payments.
*   **NFT Subscription Tiers:** Implement minting logic for Bronze, Silver, and Gold NFT access tiers.
*   **Quota Tracking:** Map the user's Stellar Smart Account address to an integer tracking their remaining AI Orchestrator API queries.
*   **Cross-VM Identity:** Extend the user data struct with a `cross_chain_address` property to link their EVM wallet to their Soroban ledger profile.
*   **Protocol 27 Gasless Logic:** Implement the `delegate_account_auth` host function within the `__check_auth` routine so our backend treasury can cleanly sponsor (Fee-Bump) these SaaS transactions.

---

## 4. Frontend & Workspace Standards
The Vite/Bun workspace must be completely bulletproofed against standard Web3 errors.
*   **Environment & Testnet Lockdown:** Hardcode strict testnet parameters (Soroban Testnet, Base Sepolia, Avalanche Fuji). Ensure `vite.config.js` includes `vite-plugin-node-polyfills` for `Buffer`, `process`, and `stream` to prevent `@stellar/stellar-sdk` and Ethers v6 from crashing.
*   **WalletContext.jsx (Unified UX):** Implement a single context managing native Stellar wallets (via `window.freighterApi`) and EVM wallets (MetaMask).
*   **Silent Chart Degradation:** The AI terminal's TradingView widget must be wrapped in a rigorous conditional check. If a testnet token symbol isn't recognized, silently omit the chart from the DOM. Do NOT throw visible errors to the user.

---

## 5. Output Deliverables & Walkthrough Requirement

You must sequentially output the following code files, fully implemented:
1.  `vite.config.js` (with polyfills)
2.  `registryService.js` & `intentParser.js`
3.  `aggregatorClient.js` (The execution array planner)
4.  `WalletContext.jsx` (Freighter + EVM connection)
5.  `stellar-contracts/profile/src/lib.rs` (SaaS, NFT logic, and Cross-VM identity)

**CRITICAL REQUIREMENT - THE WALKTHROUGH:**
Immediately following the code blocks, you must generate a highly detailed, step-by-step section titled **"Testing & Execution Walkthrough"**. 
This walkthrough must instruct the human developer on:
1.  How to compile and deploy the updated Soroban testnet contract.
2.  How to verify the Node polyfills are working in the Vite server.
3.  How to test the AI Intent parsing using a dummy natural language prompt.
4.  How the 2-step EVM approval-then-execute flow will behave in MetaMask.
5.  How the Freighter gasless fee-bump will behave on the Stellar side.