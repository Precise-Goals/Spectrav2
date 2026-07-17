import { useEffect, useState } from "react";
import { ethers } from "ethers";
import SwapBox, { ASSET_OPTIONS } from "../components/exchange/SwapBox";
import { CONTRACT_ABIS, CONTRACT_ADDRESSES, NETWORK_INFO, resolveTokenDecimals, assertAddressFormat } from "../config/contracts.js";

const TRADING_VIEW_SYMBOL = {
  USDC: "BINANCE:USDCUSDT",
  XLM: "BINANCE:XLMUSDT",
  EURC: "KRAKEN:EURUSD",
};

const ASSET_NAME = {
  USDC: "USDC",
  XLM: "Stellar Lumens (XLM)",
  EURC: "Euro Coin (EURC)",
};

export default function Exchange() {
  const [payAmount, setPayAmount] = useState("100.00");
  const [payAsset, setPayAsset] = useState("XLM");
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [quoteState, setQuoteState] = useState("LIVE");

  const tradingSymbol =
    TRADING_VIEW_SYMBOL[selectedAsset] ?? TRADING_VIEW_SYMBOL.ETH;

  useEffect(() => {
    let cancelled = false;

    const fetchQuote = async () => {
      const parsed = Number(payAmount);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setReceiveAmount("");
        setQuoteState("WAITING_INPUT");
        return;
      }

      if (payAsset === selectedAsset) {
        setReceiveAmount(String(parsed));
        setQuoteState("LIVE");
        return;
      }

      try {
        setQuoteState("UPDATING");

        // Fetch LIVE quote from CoinGecko (Task 3)
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar,usd-coin&vs_currencies=usd');
        if (!res.ok) throw new Error("CoinGecko API failed");
        
        const data = await res.json();
        
        // Map Live Prices
        const priceXLM = data?.stellar?.usd || 0.10;
        const priceUSDC = data?.['usd-coin']?.usd || 1.00;
        
        // Determine conversion based on selected pairs
        let rate = 1;
        if (payAsset === 'XLM' && selectedAsset === 'USDC') {
           rate = priceXLM / priceUSDC;
        } else if (payAsset === 'USDC' && selectedAsset === 'XLM') {
           rate = priceUSDC / priceXLM;
        }

        if (cancelled) return;

        const calculatedAmount = parsed * rate;
        
        // Ensure strict decimal math capped at 7 decimal places (Task 3)
        setReceiveAmount(calculatedAmount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 7,
        }));
        setQuoteState("LIVE");
      } catch (quoteError) {
        if (cancelled) return;
        
        console.warn("Pricing Fetch Error:", quoteError);
        setReceiveAmount("");
        setQuoteState("UNAVAILABLE");
      }
    };

    fetchQuote();

    return () => {
      cancelled = true;
    };
  }, [payAmount, payAsset, selectedAsset]);

  const chartTitle = ASSET_NAME[selectedAsset] ?? selectedAsset;
  const selectedAssetLabel = ASSET_OPTIONS.find((asset) => asset.id === selectedAsset)?.label ?? selectedAsset;

  return (
    <main className="spectra-exchange-page bg-grid-overlay">
      <div className="spectra-exchange-header">
        <h1 className="spectra-exchange-title">[ EXCHANGE_NODE ]</h1>
        <p className="spectra-exchange-sub">
          Live market routing + wallet execution initialized. Quote status: {quoteState}.
        </p>
      </div>
      <div className="spectra-exchange-layout">
        <div className="spectra-exchange-left">
          <div className="spectra-chart-shell">
            <div className="spectra-chart-head">
              <span className="spectra-chart-label">Live Chart</span>
              <span className="spectra-chart-symbol">{chartTitle}</span>
            </div>
            <iframe
              className="spectra-chart-frame"
              title={`tradingview-${selectedAsset}`}
              src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(tradingSymbol)}&interval=60&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=0&saveimage=0&toolbarbg=0A0A0B&theme=dark&style=1&locale=en`}
            />
          </div>

          <div className="spectra-route-panel">
            <div className="spectra-route-row">
              <span className="spectra-route-key">Exchange Rate</span>
              <span className="spectra-route-value">
                1 {payAsset} = {(Number(receiveAmount) / (Number(payAmount) || 1)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {selectedAsset}
              </span>
            </div>
            <div className="spectra-route-row">
              <span className="spectra-route-key">Route</span>
              <span className="spectra-route-value">
                Spectra AMM → {selectedAssetLabel}
              </span>
            </div>
            <div className="spectra-route-row">
              <span className="spectra-route-key">Slippage Tolerance</span>
              <span className="spectra-route-value">0.5%</span>
            </div>
          </div>
        </div>

        <div className="spectra-exchange-right">
          <SwapBox
            payAmount={payAmount}
            onPayAmountChange={setPayAmount}
            receiveAmount={receiveAmount}
            selectedAsset={selectedAsset}
            onAssetChange={setSelectedAsset}
            payAsset={payAsset}
            onPayAssetChange={setPayAsset}
            onTxHashChange={setTxHash}
            onError={setError}
          />

          {txHash && (
            <div className="spectra-tx-panel">Swap submitted: {txHash}</div>
          )}
          {error && <div className="spectra-error-box">{error}</div>}
        </div>
      </div>
    </main>
  );
}
