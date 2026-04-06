// Usage: node send-sol.js <recipient_address> <amount_in_sol>
const { Connection, PublicKey, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction, clusterApiUrl, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58');

async function main() {
  const recipient = process.argv[2];
  const amount = parseFloat(process.argv[3]);
  
  if (!recipient || !amount) {
    console.log('Usage: node send-sol.js <recipient_address> <amount_in_sol>');
    process.exit(1);
  }

  const secretKey = process.env.SOL_SECRET_KEY;
  if (!secretKey) {
    console.error('Set SOL_SECRET_KEY env var');
    process.exit(1);
  }

  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  const decoded = (bs58.default || bs58).decode(secretKey);
  const from = Keypair.fromSecretKey(decoded);
  
  console.log(`From: ${from.publicKey.toBase58()}`);
  console.log(`To: ${recipient}`);
  console.log(`Amount: ${amount} SOL`);
  
  const balance = await connection.getBalance(from.publicKey);
  console.log(`Current balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  
  if (balance < amount * LAMPORTS_PER_SOL + 5000) {
    console.error('Insufficient balance (need amount + ~0.000005 SOL for fee)');
    process.exit(1);
  }

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: new PublicKey(recipient),
      lamports: Math.round(amount * LAMPORTS_PER_SOL),
    })
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [from]);
  console.log(`✅ Transaction confirmed: https://solscan.io/tx/${sig}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
