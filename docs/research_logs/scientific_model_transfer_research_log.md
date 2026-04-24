# Research Log — scientific_model_transfer

*April 2026 — Federation D: Mathematical Transfer*

## Fixture Grounding

**Classification: hybrid — historical transfer cases are well-documented; formal transfer theory is speculative/frontier**

The historical cases of scientific model transfer (Black-Scholes from physics to finance; Ising model to social science; logistic growth to epidemiology; neural network from neuroscience to machine learning) are documented and specific. The claim that there is a general, formalizable theory of scientific model transfer — that one can characterize when and why a model from domain A transfers to domain B — is an active research area with contested answers. The KOS framing (category theory as the language of transfer) is design intent rather than implemented infrastructure. The fixture should be honest about this distinction.

---

## Domain Overview

Scientific model transfer is the phenomenon of a formal model, developed to explain phenomena in one domain, being successfully applied in a different domain — often without the original developers anticipating the application. It is the domain most directly aligned with KOS's core mission. The questions: what properties of a model make it transferable? What is lost in transfer? What is gained? Is there a principled way to identify transfer opportunities before the accidental cross-domain encounter?

---

## Key Named Cases and Grounding Examples

### Black-Scholes — Physics to Finance (1973)

Fischer Black, Myron Scholes, and Robert Merton derived the Black-Scholes option pricing formula (1973) using a no-arbitrage argument mathematically equivalent to the heat equation in physics. The connection was not coincidental: Scholes and Merton were familiar with Bachelier's earlier work (1900) on Brownian motion in financial prices, which itself borrowed from physics. The result — that the same partial differential equation describing heat diffusion describes option price evolution — is one of the clearest cases of physical mathematics transferring to economics. Black-Scholes became the foundation of modern derivatives markets, an industry valued in the hundreds of trillions of dollars.

Real literature: Black, F. & Scholes, M. (1973), "The Pricing of Options and Corporate Liabilities," Journal of Political Economy; Merton, R.C. (1973), "Theory of Rational Option Pricing," Bell Journal of Economics.

### Ising Model — Statistical Physics to Social Science (1920s → 1990s–)

The Ising model (Ernst Ising, 1925) was developed to model ferromagnetic phase transitions: spins on a lattice align or anti-align based on neighbor interactions and temperature. The model was subsequently applied to binary opinion dynamics in social science (Galam 1986; Sznajd-Weron 2000), voter models, and cultural transmission. The mathematical structure — agents with binary states, local interactions, phase transitions — appeared in an entirely different empirical context. The legitimacy of this transfer is contested: social science "spins" do not literally have the same properties as magnetic spins, and the mapping involves idealizations that are debated.

Real literature: Ising, E. (1925), "Beitrag zur Theorie des Ferromagnetismus," Zeitschrift für Physik; Galam, S. (1986), "Majority rule, hierarchical structures, and democratic totalitarianism," Journal of Mathematical Psychology.

### Logistic Growth — Verhulst to Ecology to Epidemiology (1838 → 20th century)

Pierre-François Verhulst's logistic equation (1838), originally a model of population growth with a carrying capacity, transferred to ecology (Lotka-Volterra predator-prey systems derive from it), epidemiology (the SIR model uses logistic-family dynamics), and technology diffusion (Bass diffusion model, 1969). The mathematical form dN/dt = rN(1 - N/K) appeared independently in multiple contexts, or was explicitly borrowed. The logistic equation is the simplest and most widely transferred differential equation in biology and social science.

Real literature: Verhulst, P.F. (1838), "Notice sur la loi que la population poursuit dans son accroissement"; Bass, F.M. (1969), "A new product growth for model consumer durables," Management Science.

### Artificial Neural Networks — Neuroscience to Machine Learning (1940s → 1980s → 2010s)

The perceptron (Rosenblatt, 1958) was explicitly modeled on simplified neuron behavior following McCulloch & Pitts (1943). The backpropagation algorithm (Rumelhart, Hinton & Williams, 1986) was independently developed and rediscovered multiple times. Deep learning in the 2010s used architectures (convolutional neural networks, recurrent networks) inspired by visual cortex organization (Hubel & Wiesel, 1962). The transfer from neuroscience to machine learning is real but involves significant idealization: artificial neurons do not work like biological neurons in most important respects. The transfer is structural/inspirational, not mechanistic.

Real literature: McCulloch, W.S. & Pitts, W. (1943), "A Logical Calculus of the Ideas Immanent in Nervous Activity," Bulletin of Mathematical Biophysics; Rosenblatt, F. (1958), "The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain," Psychological Review; Rumelhart, D.E., Hinton, G.E. & Williams, R.J. (1986), "Learning representations by back-propagating errors," Nature.

### Renormalization Group — Physics to Biology (Wilson, 1971 → Mora & Bialek, 2011)

The renormalization group (Wilson, 1971; Nobel Prize 1982) is a framework for understanding how physical systems behave at different scales — how microscale interactions produce macroscale behavior near critical phase transitions. Mora and Bialek (2011) applied renormalization group ideas to biological neural and flocking systems, arguing that certain biological networks operate near criticality. This is a frontier application: the mathematical framework is rigorous; whether biological systems are literally near critical points is debated.

Real literature: Wilson, K.G. (1971), "Renormalization Group and Critical Phenomena," Physical Review B; Mora, T. & Bialek, W. (2011), "Are Biological Systems Poised at Criticality?" Journal of Statistical Physics.

---

## What Was Synthesized vs. What Could Be Extracted

**Synthesized from training knowledge:**
- Black-Scholes / heat equation connection characterization (accurate; this is standard financial mathematics)
- Ising model social science transfer characterization (accurate; includes appropriate caveat about contested legitimacy)
- Logistic equation transfer history (accurate; Verhulst dates and Bass model are real)
- Neural network / neuroscience connection (accurate; appropriate about idealization)

**Could be extracted from specific sources:**
- Black & Scholes (1973), Merton (1973) — primary papers, available
- Rumelhart, Hinton & Williams (1986) Nature — primary backpropagation paper
- Mora & Bialek (2011) Journal of Statistical Physics — frontier application, available
- Bass (1969) Management Science — available

---

## Notable Gaps

1. No fixture file — V6 new domain stub needed.
2. This is the domain most central to KOS's mission statement and should be given priority in fixture development.
3. The formal theory of model transfer — what makes a model transferable — is genuinely unsettled. The fixture should honestly represent this: we have a catalog of successful transfers (Black-Scholes, logistic growth, Ising) but not yet a predictive theory of when transfer will work.
4. The category theory framing (a transfer is a functor between domain categories) is the KOS design intent but is not implemented. The fixture should note this distinction.
5. Bridge to mathematics_category_theory: the natural transformations between competing transfer candidates is the formal language for comparing model transfers.
6. Bridge to information_theory: the Shannon/Boltzmann formal identity is the most precise single example of model transfer (same mathematical object, two physical interpretations).
7. Bridge to algebraic_structures: Noether's theorem (symmetry → conservation laws) is a transfer from abstract algebra to physics.
8. Bridge to optimization_and_control: Bellman equation in dynamic programming → reinforcement learning is a documented transfer with known mechanism.
9. The contested cases (Ising → social science, RG → biology) should be marked as "frontier-speculative" in the fixture rather than presented with the same confidence as Black-Scholes.
10. No decisions array; no district data; no bridges defined.
