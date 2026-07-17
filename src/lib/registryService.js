// Ponytail: Strictly pointing to testnet URLs for MVP execution.
export class RegistryService {
  constructor() {
    this.chains = [];
    this.tokens = {};
  }

  async initialize() {
    try {
      // Hard-locking to Li.Fi Testnet endpoints if available, otherwise mock / standard fetch
      const [chainsRes, tokensRes] = await Promise.all([
        fetch('https://li.quest/v1/chains'),
        fetch('https://li.quest/v1/tokens')
      ]);
      const chainsData = await chainsRes.json();
      const tokensData = await tokensRes.json();
      
      // Filter strictly for Testnets
      this.chains = chainsData.chains.filter(c => c.mainnet === false);
      
      // Keep only testnet tokens mapping
      const testnetChainIds = this.chains.map(c => c.id);
      Object.keys(tokensData.tokens).forEach(chainId => {
        if (testnetChainIds.includes(Number(chainId))) {
          this.tokens[chainId] = tokensData.tokens[chainId];
        }
      });
    } catch (e) {
      console.error('Testnet Registry Init Failed:', e);
    }
  }

  getChainByName(name) {
    return this.chains.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  getTokensByChain(chainId) {
    return this.tokens[chainId] || [];
  }
}

export const registryService = new RegistryService();
