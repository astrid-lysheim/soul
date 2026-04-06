// Usage: node send-spl-token.js <mint> <recipient> <amount>
const { Connection, PublicKey, Keypair, clusterApiUrl } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount, transfer, getAssociatedTokenAddress } = require('@solana/spl-token');
const fs = require('fs');

async function main() {
  const mint = process.argv[2];
  const recipient = process.argv[3];
  const amount = parseFloat(process.argv[4]);

  if (!mint || !recipient || !amount) {
    console.log('Usage: node send-spl-token.js <mint> <recipient> <amount>');
    process.exit(1);
  }

  // Load wallet
  const wallet = JSON.parse(fs.readFileSync('../../secrets/solana-wallet-v2.json'));
  const bs58 = require('bs58');
  const decoded = (bs58.default || bs58).decode(wallet.privateKey);
  const from = Keypair.fromSecretKey(decoded);

  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  const mintPubkey = new PublicKey(mint);
  const recipientPubkey = new PublicKey(recipient);

  console.log(`From: ${from.publicKey.toBase58()}`);
  console.log(`To: ${recipient}`);
  console.log(`Token: ${mint}`);
  console.log(`Amount: ${amount}`);

  // Get sender's token account
  const senderATA = await getAssociatedTokenAddress(mintPubkey, from.publicKey);
  const senderBalance = await connection.getTokenAccountBalance(senderATA);
  const decimals = senderBalance.value.decimals;
  console.log(`Sender token balance: ${senderBalance.value.uiAmount}`);
  console.log(`Decimals: ${decimals}`);

  if (senderBalance.value.uiAmount < amount) {
    console.error('Insufficient token balance');
    process.exit(1);
  }

  // Get or create recipient's token account
  console.log('Getting/creating recipient token account...');
  const recipientATA = await getOrCreateAssociatedTokenAccount(
    connection, from, mintPubkey, recipientPubkey
  );

  // Transfer
  const amountRaw = BigInt(Math.round(amount * (10 ** decimals)));
  console.log(`Sending ${amountRaw} raw units...`);

  const sig = await transfer(
    connection, from, senderATA, recipientATA.address, from, amountRaw
  );

  console.log(`✅ Transaction confirmed: https://solscan.io/tx/${sig}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
