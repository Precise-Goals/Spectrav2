import MintConsole from '../components/mint/MintConsole';

export default function Mint() {
  return (
    <main className="spectra-mint-page bg-grid">
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
