import { useEffect, useRef, useState, useMemo } from "react";
import styled from "styled-components";
import { X, Search } from "lucide-react";
import { SAC_MAP } from "../../config/contracts";

/* ─── Static Data ─────────────────────────────────────────────────────────── */

export const CHAINS = [
  { id: "all", label: "All Networks", icon: "🌐" },
  { id: "stellar", label: "Stellar Soroban", icon: "⭐" },
];

export const CHAIN_TOKEN_MAP = {
  stellar: [
    {
      id: "XLM",
      label: "Stellar Lumens",
      symbol: "XLM",
      network: "Testnet",
      address: SAC_MAP["XLM"],
    },
    {
      id: "USDC",
      label: "USD Coin",
      symbol: "USDC",
      network: "Testnet",
      address: SAC_MAP["USDC"],
    },
    {
      id: "EURC",
      label: "Euro Coin",
      symbol: "EURC",
      network: "Testnet",
      address: SAC_MAP["EURC"],
    },
  ],
};

const ALL_TOKENS = Object.values(CHAIN_TOKEN_MAP).flat();

/* ─── Styled Components ───────────────────────────────────────────────────── */

const Dialog = styled.dialog`
  border: 4px solid white; /* Neo-brutalist blue border */
  padding: 0;
  background: #0a0a0c;
  border-radius: 0; /* Square edges */
  box-shadow: 12px 12px 0px #1d4ed8;
  width: min(700px, 94vw);
  max-height: 80vh;
  color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &::backdrop {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #1d4ed8;
  color: #fff;
  border-bottom: 4px solid #0a0a0c;
`;

const Title = styled.h2`
  font-family: "Geist Mono", monospace;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0;
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  background: #0a0a0c;
  border: 2px solid #fff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fff;
    color: #0a0a0c;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  height: calc(80vh - 80px);
  gap: 0;
  background: #0a0a0c;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:first-child {
    border-right: 4px solid #1d4ed8;
  }
`;

const SearchBar = styled.div`
  padding: 12px;
  border-bottom: 4px solid #1d4ed8;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: #0a0a0c;
  font-family: "Geist Mono", monospace;
  font-size: 14px;
  font-weight: 700;
  outline: none;

  &::placeholder {
    color: #1d4ed8;
    opacity: 0.6;
  }
`;

const List = styled.ul`
  flex: 1;
  overflow-y: auto;
  list-style: none;
  padding: 12px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #1d4ed8;
  }
`;

const ChainItem = styled.li`
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Geist Mono", monospace;
  font-size: 14px;
  font-weight: 700;
  background: ${({ $active }) => ($active ? "#1D4ED8" : "#0A0A0C")};
  border: 2px solid ${({ $active }) => ($active ? "#1D4ED8" : "#333")};
  color: ${({ $active }) => ($active ? "#fff" : "#fff")};
  text-transform: uppercase;
  transition: all 0.1s;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #1d4ed8;
  }
`;

const TokenItem = styled.li`
  padding: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #0a0a0c;
  border: 2px solid #fff;
  transition: all 0.1s;

  &:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
    color: #fff;
    transform: translate(-4px, -4px);
    box-shadow: 6px 6px 0px #fff;
  }
`;

const TokenTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TokenLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: #fff;
  border: 2px solid #0a0a0c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Geist Mono", monospace;
  font-size: 12px;
  font-weight: 800;
  color: #1d4ed8;
  flex-shrink: 0;
`;

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TokenSymbol = styled.span`
  font-family: "Geist Mono", monospace;
  font-size: 16px;
  font-weight: 800;
`;

const TokenLabel = styled.span`
  font-family: "Geist Mono", monospace;
  font-size: 12px;
`;

const AddressLabel = styled.div`
  font-family: "Geist Mono", monospace;
  font-size: 10px;
  color: #a1a1aa;
  word-break: break-all;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 6px;
`;

const EmptyMsg = styled.li`
  padding: 32px 16px;
  text-align: center;
  font-family: "Geist Mono", monospace;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
`;

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function CrossChainSelector({
  isOpen,
  onClose,
  onSelect,
  title = "Select Asset",
}) {
  const dialogRef = useRef(null);
  const [selectedChain, setSelectedChain] = useState("all");
  const [chainSearch, setChainSearch] = useState("");
  const [tokenSearch, setTokenSearch] = useState("");

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (isOpen && !el.open) {
      el.showModal();
    } else if (!isOpen && el.open) {
      el.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClick = (e) => {
      const rect = el.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        onClose();
      }
    };
    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, [onClose]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", handleCancel);
    return () => el.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const filteredChains = useMemo(
    () =>
      CHAINS.filter((c) =>
        c.label.toLowerCase().includes(chainSearch.toLowerCase()),
      ),
    [chainSearch],
  );

  const filteredTokens = useMemo(() => {
    const pool =
      selectedChain === "all"
        ? ALL_TOKENS
        : CHAIN_TOKEN_MAP[selectedChain] || [];
    return pool.filter(
      (t) =>
        t.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
        t.label.toLowerCase().includes(tokenSearch.toLowerCase()),
    );
  }, [selectedChain, tokenSearch]);

  const handleTokenClick = (token) => {
    const chain = CHAINS.find((c) => c.id === selectedChain) || CHAINS[0];
    onSelect?.({ chain, token });
    onClose();
  };

  return (
    <Dialog ref={dialogRef}>
      <Header>
        <Title>{title}</Title>
        <CloseBtn onClick={onClose}>
          <X size={18} strokeWidth={3} />
        </CloseBtn>
      </Header>

      <Grid>
        <Column>
          <SearchBar>
            <Search size={16} color="#1D4ED8" strokeWidth={3} />
            <SearchInput
              placeholder="SEARCH NETWORKS"
              value={chainSearch}
              onChange={(e) => setChainSearch(e.target.value)}
            />
          </SearchBar>
          <List>
            {filteredChains.map((chain) => (
              <ChainItem
                key={chain.id}
                $active={selectedChain === chain.id}
                onClick={() => {
                  setSelectedChain(chain.id);
                  setTokenSearch("");
                }}
              >
                <span>{chain.icon}</span>
                {chain.label}
              </ChainItem>
            ))}
          </List>
        </Column>

        <Column>
          <SearchBar>
            <Search size={16} color="#1D4ED8" strokeWidth={3} />
            <SearchInput
              placeholder="SEARCH ASSETS"
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
            />
          </SearchBar>
          <List>
            {filteredTokens.length === 0 ? (
              <EmptyMsg>NO ASSETS FOUND</EmptyMsg>
            ) : (
              filteredTokens.map((token, i) => (
                <TokenItem
                  key={`${token.id}-${i}`}
                  onClick={() => handleTokenClick(token)}
                >
                  <TokenTop>
                    <TokenLeft>
                      <TokenAvatar>{token.symbol.slice(0, 3)}</TokenAvatar>
                      <TokenInfo>
                        <TokenSymbol>{token.symbol}</TokenSymbol>
                        <TokenLabel>{token.label}</TokenLabel>
                      </TokenInfo>
                    </TokenLeft>
                    <span
                      style={{
                        fontSize: "10px",
                        background: "rgba(255,255,255,0.2)",
                        padding: "4px 8px",
                        fontFamily: "Geist Mono",
                      }}
                    >
                      {token.network}
                    </span>
                  </TokenTop>
                  {token.address && (
                    <AddressLabel>SAC: {token.address}</AddressLabel>
                  )}
                </TokenItem>
              ))
            )}
          </List>
        </Column>
      </Grid>
    </Dialog>
  );
}
