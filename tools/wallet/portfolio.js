// Astrid's Portfolio Report — Full status of both wallets + prices via DexScreener
const { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const WALLETS = {
  cold: { name: 'Astrid Cold', address: 'Aga5rNx5qyDfL3ThPMJrHNSUuDoXRQup2KZr7boTS2FX' },
  hot:  { name: 'Trader Hot',  address: '6xHWy3dfc6Yt1HnX3sYhnKEPkp3ZpCrNZkXhRRrC7pi6' },
};

const KNOWN_TOKENS = {
  '6CAsXfiCXZfP8APCG6Vma2DFMindopxiqYQN4LSQfhoC': { symbol: 'POKT', name: 'Pocket Network' },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin', stablecoin: true },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether', stablecoin: true },
};

const SOL_MINT = 'So11111111111111111111111111111111111111112';

async function getDexScreenerPrice(mintAddress) {
  try {
    const resp = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);
    const data = await resp.json();
    if (!data.pairs || data.pairs.length === 0) return null;
    
    // Find the pair with highest 24h volume for best price
    const sorted = data.pairs
      .filter(p => p.priceUsd && parseFloat(p.volume?.h24 || 0) > 0)
      .sort((a, b) => parseFloat(b.volume?.h24 || 0) - parseFloat(a.volume?.h24 || 0));
    
    if (sorted.length === 0) return null;
    
    const best = sorted[0];
    return {
      price: parseFloat(best.priceUsd),
      pair: `${best.baseToken.symbol}/${best.quoteToken.symbol}`,
      dex: best.dexId,
      volume24h: parseFloat(best.volume?.h24 || 0),
      priceChange24h: best.priceChange?.h24 ? parseFloat(best.priceChange.h24) : null,
    };
  } catch (e) { return null; }
}

async function getWalletBalances(connection, address) {
  const pubkey = new PublicKey(address);
  const solBalance = await connection.getBalance(pubkey);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  });

  const tokens = [];
  for (const ta of tokenAccounts.value) {
    const info = ta.account.data.parsed.info;
    const mint = info.mint;
    const known = KNOWN_TOKENS[mint] || { symbol: 'UNKNOWN', name: mint.slice(0, 8) + '...' };
    if (info.tokenAmount.uiAmount > 0) {
      tokens.push({
        symbol: known.symbol,
        mint,
        balance: info.tokenAmount.uiAmount,
        decimals: info.tokenAmount.decimals,
        stablecoin: known.stablecoin || false,
      });
    }
  }

  return { sol: solBalance / LAMPORTS_PER_SOL, tokens };
}

async function main() {
  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  
  // Fetch prices via DexScreener
  const [solData, poktData] = await Promise.all([
    getDexScreenerPrice(SOL_MINT),
    getDexScreenerPrice('6CAsXfiCXZfP8APCG6Vma2DFMindopxiqYQN4LSQfhoC'),
  ]);

  const solPrice = solData?.price || 0;
  const poktPrice = poktData?.price || 0;

  const report = {
    timestamp: new Date().toISOString(),
    prices: {
      SOL: { usd: solPrice, change24h: solData?.priceChange24h, source: solData?.dex },
      POKT: { usd: poktPrice, change24h: poktData?.priceChange24h, source: poktData?.dex, volume24h: poktData?.volume24h },
    },
    wallets: {},
    totalUSD: 0,
  };

  for (const [key, wallet] of Object.entries(WALLETS)) {
    const balances = await getWalletBalances(connection, wallet.address);
    let walletUSD = balances.sol * solPrice;
    
    const tokenValues = [];
    for (const token of balances.tokens) {
      let price = null;
      if (token.stablecoin) price = 1.0;
      else if (token.symbol === 'POKT') price = poktPrice;
      else {
        const data = await getDexScreenerPrice(token.mint);
        price = data?.price || 0;
      }
      
      const usdValue = token.balance * price;
      walletUSD += usdValue;
      tokenValues.push({ ...token, priceUSD: price, valueUSD: Math.round(usdValue * 100) / 100 });
    }

    report.wallets[key] = {
      name: wallet.name,
      address: wallet.address,
      sol: balances.sol,
      solUSD: Math.round(balances.sol * solPrice * 100) / 100,
      tokens: tokenValues,
      totalUSD: Math.round(walletUSD * 100) / 100,
    };
    report.totalUSD += walletUSD;
  }

  report.totalUSD = Math.round(report.totalUSD * 100) / 100;
  console.log(JSON.stringify(report, null, 2));
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
