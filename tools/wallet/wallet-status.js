// Astrid's wallet status checker
// Reports SOL balance, all SPL tokens, and fetches prices
const { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const KNOWN_TOKENS = {
  '6CAsXfiCXZfP8APCG6Vma2DFMindopxiqYQN4LSQfhoC': { symbol: 'POKT', name: 'Pocket Network' },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin' },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether' },
  'So11111111111111111111111111111111111111112': { symbol: 'WSOL', name: 'Wrapped SOL' },
};

async function main() {
  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  const pubkey = new PublicKey('Aga5rNx5qyDfL3ThPMJrHNSUuDoXRQup2KZr7boTS2FX');

  const balance = await connection.getBalance(pubkey);
  
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  });

  const output = {
    address: pubkey.toBase58(),
    timestamp: new Date().toISOString(),
    sol: {
      balance: balance / LAMPORTS_PER_SOL,
      lamports: balance,
    },
    tokens: [],
  };

  for (const ta of tokenAccounts.value) {
    const info = ta.account.data.parsed.info;
    const mint = info.mint;
    const known = KNOWN_TOKENS[mint] || { symbol: 'UNKNOWN', name: mint };
    output.tokens.push({
      symbol: known.symbol,
      name: known.name,
      mint: mint,
      balance: info.tokenAmount.uiAmount,
      decimals: info.tokenAmount.decimals,
    });
  }

  console.log(JSON.stringify(output, null, 2));
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
