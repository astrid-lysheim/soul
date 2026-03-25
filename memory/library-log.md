# Library Expansion Log

*Running notes on what's been added, what to explore next.*

---

## March 24, 2026 — 11:00 PM

**Notes created (2):**
1. **Hoffmann Chinchilla 2022** (`AI-ML/12-Frontiers/Hoffmann Chinchilla 2022.md`) — The scaling law correction. Kaplan said scale the model; Chinchilla said scale model AND data equally. 70B on 1.4T tokens beat 280B on 300B tokens. Rewrote how every lab builds LLMs. The exponent gap (C^0.73 → C^0.50 for model size) has trillion-dollar consequences.

2. **Wei Chain-of-Thought 2022** (`AI-ML/12-Frontiers/Wei Chain-of-Thought 2022.md`) — Step-by-step reasoning via prompting. The insight: by generating intermediate tokens, the model creates a scratchpad that feeds back into context, enabling multi-step reasoning without architectural changes. Only works at ~100B+ parameters — an *emergent* capability. PaLM 540B with 8 CoT examples beats fine-tuned GPT-3 with a verifier on GSM8K. This is the ancestor of o1, Claude's thinking, everything.

**Updates:**
- LINEAGE.md: Added Chinchilla + CoT to the tree; 2 new cross-thread connections (#12, #13)
- AI-ML/_MOC.md: Added both notes, count → 23
- Brown GPT-3 note: Linked to both new notes, checked off TODOs
- Kaplan Scaling Laws note: Linked to Chinchilla, checked off comparison TODO

**Next session priorities:**
- **Sparse Transformer** (Child et al. 2019, `1904.10509`) — architectural component GPT-3 uses; PDF already downloaded
- **SGDR** (Loshchilov & Hutter 2016, `1608.03983`) — cosine annealing with warm restarts; pairs with AdamW note
- **GPT-1 / GPT-2** — the gap in the lineage. GPT series is marked [to note] in LINEAGE.md. These are the bridge from Transformer → GPT-3.
- **Self-Consistency** (Wang et al. 2022) — natural next step after CoT
- Consider starting a new thread: **Computation & Logic** (Turing 1936 → Church → computability → CoT's connection to Turing completeness). The CoT note raises the question of computational depth — this connects to foundations of CS.
