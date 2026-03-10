const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');

async function main() {
  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  const pubkey = new PublicKey('Aga5rNx5qyDfL3ThPMJrHNSUuDoXRQup2KZr7boTS2FX');
  
  const balance = await connection.getBalance(pubkey);
  console.log(`Balance: ${balance / 1e9} SOL`);
  
  // Check for SPL token accounts (USDC etc)
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  });
  
  if (tokenAccounts.value.length === 0) {
    console.log('No SPL token accounts yet');
  } else {
    tokenAccounts.value.forEach(ta => {
      const info = ta.account.data.parsed.info;
      console.log(`Token: ${info.mint} | Balance: ${info.tokenAmount.uiAmount}`);
    });
  }
}

main().catch(console.error);
