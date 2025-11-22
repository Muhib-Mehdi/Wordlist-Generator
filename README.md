# Quantum Whirl — Quantum Coinflip Playground

Welcome to Quantum Whirl — a playful, interactive qubit playground where you can spin a "quantum coin", tweak qubit parameters, and watch probabilities come to life on a Bloch sphere.

Why this is fun
- Tweak θ, φ, amplitudes and phase to see how a qubit behaves.
- Visualize superposition, measurement, and simple quantum noise.
- A lively UI with particle background, custom cursor, and responsive controls.

Live features
- Single-qubit Bloch sphere visualization
- Interactive sliders for `θ`, `φ`, `phase`, entanglement, decoherence, fidelity
- A clickable coin that performs a "quantum" measurement and shows probabilities

Quick start (copy-paste)

- Option A — open locally (fast):

```powershell
# from the project folder
start ./index.html
```

- Option B — local server (recommended for modern browsers):

```powershell
# Python 3 (built-in)
python -m http.server 8080

# or with Node (no global install required)
npx http-server . -p 8080

# Then open http://localhost:8080
```

About publishing
- This is a static site — drop these files on GitHub Pages (branch `main`, folder `root`) and it will serve automatically.

Contributing
- Found a bug or a way to make it more delightful? Send a PR or open an issue. Suggested ideas:
  - Add unit tests for the math in `quantum.js`
  - Add a small tutorial mode that walks new users through quantum basics
  - Bundle Three.js locally to avoid CDN dependencies

License
- MIT — see `LICENSE`

Enjoy! If you want, I can also add an automated GitHub Pages deploy workflow to publish `main` to `gh-pages` for you.
