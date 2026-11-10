# 🎬 Picture Flix — Cinema Lobby & Film Discovery

> A darkened cinema lobby streaming and film discovery web application inspired by Letterboxd editorial aesthetics. Built with pure semantic HTML5, modern CSS3 design tokens, and Vanilla JavaScript (ES6+).

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TMDB API](https://img.shields.io/badge/TMDB_API-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)

---

## ✨ Features

- **Letterboxd Aesthetic:** Dark cinema lobby UI theme with void black surfaces, graphite borders, and acid-green accent highlights.
- **Dynamic Film Rows:** Trending Cinema, Top-Rated Masterpieces, Now Playing In Theatres, and Curated Sci-Fi/Noir Deep Cuts.
- **High-Availability Offline Fallback:** Fully functional even without an internet connection or API credentials using a curated high-fidelity offline movie archive and editorial review journal.
- **Interactive Ratings & Watchlist:** Five-star grading system and slide-out watchlist drawer with client-side persistence via `localStorage`.
- **In-App Media Player:** Clean modal dialog featuring YouTube official trailer embeds (`youtube-nocookie.com`), complete cast lists, and film synopses.
- **Debounced Instant Search:** Real-time search with 280ms debounce and keyboard accessibility (`/` to focus search, `Esc` to close overlays).
- **Zero Dependencies:** Pure vanilla web technologies without build steps, bundlers, or external UI frameworks.

---

## 🛠️ Tech Stack & Architecture

- **Semantic HTML5:** Native dialogs, accessible ARIA roles, landmarks, and responsive image loading (`loading="lazy"`).
- **Modern CSS3:** CSS Custom Properties (Design Tokens), Flexbox, CSS Grid, and custom scrollbar styling.
- **Vanilla JavaScript (ES6+):** Asynchronous `fetch` APIs, state management, event delegation, and debounce timers.
- **Data Source:** [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api) with resilient local fallbacks.

---

## 🚀 Getting Started

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/pictureflix.git
   cd pictureflix
   ```
2. Open `index.html` directly in any modern browser, or run with VS Code Live Server:
   ```bash
   npx serve .
   ```

### Connecting Live TMDB API (Optional)
The application works immediately out-of-the-box using the built-in offline movie archive. To connect live TMDB real-time data:
1. Obtain a free API key from [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api).
2. Click the **"API"** button in the top navigation bar.
3. Paste your key. It is saved privately in your browser's `localStorage` and never exposed publicly.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
