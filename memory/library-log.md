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

---

### March 25, 2026 — 11:00 PM

**Focus:** Filling the Mathematics post-Newton gap — the Analysis era.

**Notes created (2):**
1. **Euler Infinite Series 1748** → `Mathematics/04-Analysis/Euler Infinite Series 1748.md`
   - Three paradigm shifts: functions replace geometry, infinite series as computation, fundamental constants (e, π)
   - Most prolific mathematician in history (850+ papers)
   - Created the notation we still use: f(x), e, i, Σ, π
   - Left open: when can you trust infinite processes to converge?

2. **Cauchy Limits 1821** → `Mathematics/04-Analysis/Cauchy Limits 1821.md`
   - Dual contribution: formalized limits (1821) AND invented gradient descent (1847)
   - The most important cross-thread node: his 3-page 1847 paper is the ancestor of Adam, AdamW, and every optimizer training LLMs today
   - 172-year lineage: Cauchy → Robbins-Monro → Widrow → SGD → Adam → AdamW
   - Also: convergence criterion, rigorous integration, continuity definition

**Mathematics thread now:** 8 notes (was 6). Analysis era fills the gap between Newton/Leibniz and the modern formalization.

**Structural:** Created `Mathematics/04-Analysis/` directory. Updated `Mathematics/_MOC.md`.

**Next session priorities:**
- **Weierstrass** — completes the Euler→Cauchy→Weierstrass formalization trilogy
- **Cantor** — set theory, actual infinity, continuum hypothesis (the endpoint of the Math thread)
- **Fourier (1807)** — bridge between Euler's series and modern signal processing (also connects to CNNs via frequency analysis)
- Consider starting a **Physics thread** — Boltzmann (statistical mechanics → Boltzmann machines) and the thermodynamics connection

**Cross-thread observation:** The Math thread is now properly feeding the AI/ML optimization lineage. Cauchy (1847) → Widrow (1960) is the math-to-ML bridge. The lineage map in LINEAGE.md already documents this, but now both endpoints have substantive notes.

## 2026-03-26 — Late Night Session

**Added:** 2 notes, 2 PDFs

1. **Hopfield 1982** — "Neural Networks and Physical Systems with Emergent Collective Computational Abilities." The paper that bridged physics and neural networks. Energy functions, content-addressable memory, attractors. Won Hopfield the 2024 Nobel Prize in Physics. Placed in `AI-ML/10-Backpropagation/`.

2. **Rumelhart, Hinton & Williams 1986** — "Learning Representations by Back-Propagating Errors." The fulcrum of the entire AI/ML lineage tree. Chain rule applied to multi-layer networks. Only 4 pages, published in Nature. Every modern DL system trains with this algorithm.

**Why these two:** The lineage tree had a 17-year gap — Minsky-Papert 1969 to Dropout 2012 — with no notes for the critical revival period. Hopfield (1982) restarted interest; Backpropagation (1986) provided the training algorithm.

**Cross-thread insight:** Hinton's 1982-1986 trajectory (Hopfield → Boltzmann → Backprop) mirrors the optimization thread's physics → calculus bridge. Consider opening a Physics thread to trace Ising model → spin glasses → Hopfield → Boltzmann machines.

**Next:** Boltzmann Machines (1983), LeCun CNNs (1989), LSTM (1997), or begin Physics thread with Ising model.

## March 27, 2026 — 11:00 PM

**Notes created:** 2 (Boltzmann Machines 1983, LeCun CNNs 1989)
**PDFs downloaded:** 2 (ackley-hinton-sejnowski1985.pdf, lecun1989.pdf)
**Total notes:** 27 in AI-ML thread

Filled the 1982–1989 gap: Hopfield → Boltzmann → Backprop → CNNs. Hinton's full 80s career arc is now mapped. The generative (Boltzmann) vs discriminative (backprop) split happened here and reconverges in the 2010s with Deep Belief Nets and VAEs.

**Next:** LSTM (1997), Deep Belief Nets (2006), Sparse Transformer (1904.10509). Also considering a Neuroscience thread — Hubel & Wiesel (1962) as the biological source for CNNs.
