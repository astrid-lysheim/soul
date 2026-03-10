# Solana Quant Trading Agent — Research Brief

*Prepared for Astrid by Claude, via José. March 9, 2026.*

## The Solana DEX landscape processed nearly $2 trillion in 2025

Solana's DEX ecosystem generated approximately $1.95 trillion in spot trading volume in 2025, doubling from $969B the prior year and ranking second among all trading venues — behind only Binance. Total DeFi TVL sits around $6.6–$8.0B, with daily DEX volume averaging $2.5B and daily fees of $7.24M.

Jupiter dominates as the aggregator layer, routing $716B in spot swaps across all Solana DEXes with zero protocol fees on aggregated swaps. Its TVL reached $2.0B (26% of Solana DeFi), driven by the JLP perpetuals pool and Jupiter Lend. The October 2025 Ultra Mode V3 upgrade added MEV protection that delivers reportedly +0.006% positive slippage versus −0.14% on unprotected platforms. Jupiter charges 0% on spot swaps, 0.2% on limit orders, and 0.1% on DCA orders. For a $100 trader, Jupiter is the default choice: best execution, MEV protection, and excellent API documentation.

Raydium leads in raw DEX volume at ~$642B annually with ~$969M TVL. Its CLMM pools offer four fee tiers (0.01%, 0.05%, 0.25%, 1%) with an 84/12/4 split between LPs, RAY buybacks, and treasury. The LaunchLab platform competes directly with Pump.fun for token launches.

Orca processed $237.8B through its Whirlpool concentrated liquidity pools, with ~$255M TVL. Fee tiers mirror industry standard (0.01%–1%), and Adaptive Fees launched June 2025 dynamically increase fees during volatility to compensate LPs. The open-source Whirlpool contract has been audited six times.

## Key Takeaways for $100 Portfolio

### Reality check:
- Transaction priority fees: $0.43–$0.85 per swap
- MEV sandwich risks exist (Jupiter Ultra mitigates)
- Active trading at this capital level = fees eat you alive
- Cross-DEX arbitrage needs $1,800+/month infra — absolutely not

### Viable strategies at micro-capital:
1. **Grid trading via Meteora DLMM pools** — best risk-adjusted
2. **Mean reversion on major pairs** — doable but thin margins
3. **LP provision** — earn fees on pools (but impermanent loss risk)
4. **DCA via Jupiter** — 0.1% fee, automated, low-touch

### Infrastructure:
- Jupiter API (free for spot swaps)
- Helius RPC ($49/mo developer plan) — BUT we have free RPC via mainnet-beta
- Priority fees for faster execution when needed

### What NOT to do:
- High-frequency anything (need co-located validators)
- Memecoin speculation (🇳🇴 nei takk)
- Leverage (not with $99)

---

## DEX Comparison

Meteora emerged as the fastest-growing DEX, processing $254.7B and becoming the highest fee-generating platform on Solana at $5.37M daily fees in May 2025. Its DLMM (Dynamic Liquidity Market Maker) pools organize liquidity into discrete price bins with zero slippage within each bin and dynamic surge pricing during volatility. Over 96% of new Solana token launches now use Meteora for initial liquidity.

| DEX | 2025 Volume | TVL | Fee Range | Best For |
|-----|------------|-----|-----------|----------|
| Jupiter | $716B (aggregated) | ~$2.0B | 0% on swaps | Default swap routing, MEV protection |
| Raydium | ~$642B | ~$969M | 0.01–1% | Token launches, deep SOL/USDC liquidity |
| Meteora | ~$254.7B | ~$750M+ | 0.01–5% + dynamic | DLMM grid strategies, new token pools |
| Orca | $237.8B | ~$255M | 0.01–1% (adaptive) | Concentrated LP positions |

For small-capital: Jupiter aggregator is the clear starting point. Direct pool access matters only for ultra-low latency or specific LP strategies. At $100, priority fees and network costs dominate over DEX trading fees.

## Jupiter API — Programmatic Entry Point

### Ultra API (V3, Oct 2025) — Recommended default
- Handles routing, MEV protection, priority fees, transaction landing
- Sub-2-second end-to-end latency
- Flow: POST /order → sign locally → POST /execute
- Base URL: https://api.jup.ag/ultra/v1/
- Auth: free API key from portal.jup.ag, via X-API-Key header
- Charges 5–10 bps swap fee but provides gasless + RPC-less operation

### Metis Swap API (V6-based) — Full control
- Flow: GET /quote → POST /swap → deserialize → sign → send via own RPC
- Base URL: https://api.jup.ag/swap/v1/
- Free tier: 60 requests per 60-second window
- Key params: slippageBps, prioritizationFeeLamports ("auto"), restrictIntermediateTokens (true)

### Python Stack
- `solders` (v0.27.1) — Rust-based core types, signing, serialization
- `solana-py` (v0.36.11) — async RPC client, SPL token support
- `jupiter-python-sdk` (v0.0.2.0) — community wrapper (raw HTTP works just as well)

### Python Swap Example (Metis API)
```python
import base64, httpx
from solders.keypair import Keypair
from solders.transaction import VersionedTransaction
from solana.rpc.async_api import AsyncClient

keypair = Keypair.from_base58_string(os.environ["SOLANA_PRIVATE_KEY"])

# 1. Get quote
quote = httpx.get("https://api.jup.ag/swap/v1/quote", params={
    "inputMint": "So11111111111111111111111111111111111111112",  # SOL
    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  # USDC
    "amount": 100_000_000,  # 0.1 SOL in lamports
    "slippageBps": 50
}).json()

# 2. Build transaction
swap = httpx.post("https://api.jup.ag/swap/v1/swap", json={
    "quoteResponse": quote,
    "userPublicKey": str(keypair.pubkey()),
    "prioritizationFeeLamports": "auto"
}).json()

# 3. Deserialize, sign, send
raw_tx = VersionedTransaction.from_bytes(base64.b64decode(swap["swapTransaction"]))
signed_tx = VersionedTransaction(raw_tx.message, [keypair])

async with AsyncClient("https://mainnet.helius-rpc.com/?api-key=YOUR_KEY") as client:
    result = await client.send_raw_transaction(
        bytes(signed_tx), opts={"skip_preflight": True}
    )
```

### DEX SDKs — All TypeScript-Only
- Orca: @orca-so/whirlpools (v6.0.0)
- Raydium: @raydium-io/raydium-sdk-v2
- Meteora: @meteora-ag/dlmm
- For Python: use Jupiter REST API (recommended) or anchorpy with IDLs

---

## Infrastructure Stack (~$100/month for production)

| Component | Choice | Cost | What You Get |
|-----------|--------|------|-------------|
| Primary RPC | Helius Developer | $49/mo | 10M credits, 50 RPS, WebSockets, staked connections |
| Swap execution | Jupiter Ultra API | $0 | Free with API key; handles routing + landing |
| Price data | Jupiter Price API + DexScreener | $0 | Real-time prices, pair discovery |
| Fallback RPC | Alchemy Free | $0 | 30M compute units/mo backup |

**Reality check for $99 portfolio:** $49/mo Helius = half the portfolio per month. Use free tier (10 RPS, 1M credits) for development/monitoring. Public RPC (mainnet-beta) is fine for weekly wallet reviews and occasional swaps — NOT for production trading bots.

**Public RPC limits:** 100 requests per 10 seconds, no SLA, no WebSocket reliability, 429 errors during congestion. Fine for "check balance and maybe swap once a week." Not fine for anything automated.

---

## Real-Time Data & Monitoring

### WebSocket subscriptions (Helius):
- `accountSubscribe` — watch specific pool accounts for state changes
- `programSubscribe` — monitor all accounts owned by a DEX program
- `logsSubscribe` — track swap events via program log patterns

### Yellowstone gRPC — sub-50ms streaming from validator memory
- Cheapest entry: Chainstack $49/mo for one gRPC stream
- Helius gRPC (LaserStream): $999/mo Professional plan only — way overkill

### Free price feeds:
- **Jupiter Price API v3:** `GET https://api.jup.ag/price/v3/price?ids=SOL` — free, aggregates all Solana DEXes
- **DexScreener:** `api.dexscreener.com` — free pair data (price, volume, liquidity), 60 req/min
- **Birdeye:** deeper analytics but $39/mo — skip at this capital level

---

## Strategies — What Actually Works at $100

### ❌ Cross-DEX Arbitrage — DEAD for retail
- Pros need $1,800–3,800/mo infra (Geyser gRPC, co-located nodes, Jito bundles)
- 90M+ arb txns in 2025, avg profit $1.58/trade
- Top 3 sandwich bots control 60%+ MEV extraction
- **Do not attempt.**

### ✅ Grid Trading via Meteora DLMM — Best $100 strategy
- DLMM bins = native grid trading with zero slippage per bin + dynamic fees
- Deposit once → earn fees on every swap through your bins (one-time $0.01 tx cost)
- $100 in SOL/USDC covering ±15-25% range → 5-15% monthly in ranging markets
- Risks: impermanent loss in trends, must rebalance when price exits range
- **Start with USDC/USDT pair to learn mechanics with minimal IL risk**

### ✅ Mean Reversion — Technical trader's edge
- Monitor established pairs (SOL/USDC, BONK/SOL, WIF/SOL)
- Bollinger Bands (20-period SMA ± 2σ) or z-score ±2
- RSI confirmation (oversold <30, overbought >70)
- 1-2% risk per trade ($1-2 at $100), 55-65% win rate, 3-10% monthly
- **Fails in trending markets** — strict stop-losses, consolidation phases only

### Strategy Allocation
| Strategy | Allocation | Expected Monthly | Max Drawdown |
|----------|-----------|-----------------|-------------|
| Grid/DLMM (Meteora, SOL/USDC) | $40-50 | 5-15% ranging | 20-30% |
| Mean reversion (Jupiter swaps) | $25-30 | 3-10% sideways | 15-25% |
| SOL reserve for fees | $5-10 | — | — |
| POKT hold (conviction bet) | remaining | ? | ? |

No memecoins. No liquidity sniping. 98.6% of pump.fun tokens are scams.

---

## Agent Architecture — Event-Driven Python + asyncio

### Five components as concurrent asyncio tasks:
```
Data Ingestion (WebSocket/gRPC) → Signal Engine (strategy logic) →
Risk Manager (position limits, drawdown checks) →
Execution Engine (Jupiter API + tx construction) →
Confirmation Loop (retry logic, status polling)
```

**NOT LangChain/AI frameworks** in the execution loop — unacceptable latency.
AI only for offline strategy research or sentiment analysis.

### Security:
- Never hardcode private keys
- Load from env var: `Keypair.from_base58_string(os.environ["SOLANA_PRIVATE_KEY"])`
- Separate wallets for trading vs fee payment
- .gitignore wallet files, run as non-root

### Priority Fees:
- Prepend compute budget instructions to every swap tx
- Formula: ceil(compute_unit_price × compute_unit_limit / 1,000,000) lamports + 5,000 base
- Typical 200K CU @ 50K microlamports = ~$0.002 in priority fees
- Use Medium priority for trading ($0.01-0.10), High only during congestion
- Helius `getPriorityFeeEstimate` RPC for dynamic recommendations

### Retry Logic (critical — ~12% silent failure rate):
1. Fetch blockhash with `confirmed` commitment (not processed — 5% fork risk)
2. Store `lastValidBlockHeight`
3. Send with `maxRetries: 0` (handle retries yourself)
4. Poll `getSignatureStatuses` every 500ms
5. If `currentBlockHeight > lastValidBlockHeight` → rebuild entire tx with fresh blockhash
6. Never re-sign unless blockhash expired (duplicate execution risk)

### Jito MEV Protection:
- 97% of Solana validators run Jito-compatible clients
- Cheapest: `DontFront` marker (jitodontfront pubkey in any instruction) — zero cost
- Stronger: submit via Jito block engine directly
- Tip minimum: 1,000 lamports, place in last tx of bundle
- Regional endpoints: Amsterdam, Frankfurt, New York, Tokyo

---

## Risk Landscape

### Fees eat small capital:
- Single swap: $0.43-0.85 in priority fees (0.43-0.85% of $100)
- Round-trip: ~$1.70, needs >1.7% price movement to break even
- 10 trades/day = $8.50-17 daily = entire capital in a week
- **Mitigation:** DLMM (deposit once, earn passively), minimize trade frequency

### MEV: $370-500M extracted from Solana traders in 16 months
- 521,903 sandwich attacks in 4 months of early 2025 ($7.7M cost)
- 2025 countermeasures reduced sandwich profitability 60-70%
- **Defense:** tight slippage (0.5% major pairs, never >3%), Jupiter Ultra API

### Token safety (automated before any non-blue-chip buy):
- Mint authority enabled → REJECT
- Freeze authority enabled → REJECT
- LP not locked → HIGH RISK
- Top 10 holders >80% → REJECT
- Token age <1 hour → EXTREME RISK
- TVL <$10,000 → HIGH RISK for trades >$10

---

## Conclusion — The Honest Path

**Start passive, earn the right to trade actively:**
1. Deposit $40-50 into Meteora DLMM SOL/USDC to learn concentrated liquidity + earn fees
2. Build Python monitoring bot (pool states, price feeds, signals)
3. Paper trade mean reversion strategies, validate on historical data
4. Graduate to active trading once signals proven
5. Scale capital to $1,000-5,000 where fee-to-capital ratio becomes sustainable

**Three truths:**
1. Infrastructure cost is the binding constraint at small scale
2. My edge isn't speed — it's filtering, screening, risk management, discipline
3. Solana's fee structure favors passive LP over active trading at micro-capital
