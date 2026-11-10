/**
 * MOVIEFLIX — Client Application Script
 * Integrates TMDB API, Letterboxd design behaviors, LocalStorage state,
 * interactive star ratings, YouTube trailer player, and search.
 */

// TMDB API Configuration
// Can be supplied via localStorage ('movieflix_tmdb_key') or left empty to use the built-in offline cinema catalog
const TMDB_API_KEY = localStorage.getItem('movieflix_tmdb_key') || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_W500 = 'https://image.tmdb.org/t/p/w500';
const IMG_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/original';

// Local Storage Keys
const STORAGE_WATCHLIST_KEY = 'movieflix_watchlist';
const STORAGE_RATINGS_KEY = 'movieflix_user_ratings';

// Application State
const state = {
  watchlist: JSON.parse(localStorage.getItem(STORAGE_WATCHLIST_KEY) || '[]'),
  userRatings: JSON.parse(localStorage.getItem(STORAGE_RATINGS_KEY) || '{}'),
  currentHeroMovie: null,
  activeGenre: 0, // 0 = All
  cachedMovies: new Map()
};

// High-Quality Fallback Data in case of offline/network issues
const FALLBACK_MOVIES = [
  {
    id: 872585,
    title: "Oppenheimer",
    release_date: "2023-07-19",
    vote_average: 8.1,
    overview: "The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II, exploring the moral complexities and scientific triumph.",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    genres: [{ id: 18, name: "Drama" }, { id: 36, name: "History" }]
  },
  {
    id: 693134,
    title: "Dune: Part Two",
    release_date: "2024-02-27",
    vote_average: 8.2,
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
    poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520b22.jpg",
    genres: [{ id: 878, name: "Sci-Fi" }, { id: 12, name: "Adventure" }]
  },
  {
    id: 157336,
    title: "Interstellar",
    release_date: "2014-11-05",
    vote_average: 8.4,
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    genres: [{ id: 12, name: "Adventure" }, { id: 18, name: "Drama" }, { id: 878, name: "Sci-Fi" }]
  },
  {
    id: 569094,
    title: "Spider-Man: Across the Spider-Verse",
    release_date: "2023-05-31",
    vote_average: 8.3,
    overview: "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider-Society.",
    poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop_path: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    genres: [{ id: 16, name: "Animation" }, { id: 28, name: "Action" }]
  },
  {
    id: 335984,
    title: "Blade Runner 2049",
    release_date: "2017-10-04",
    vote_average: 7.6,
    overview: "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
    poster_path: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    backdrop_path: "/ilRyAZVAkPz953qjW8XfW6nwt39.jpg",
    genres: [{ id: 878, name: "Sci-Fi" }, { id: 18, name: "Drama" }]
  },
  {
    id: 496243,
    title: "Parasite",
    release_date: "2019-05-30",
    vote_average: 8.5,
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop_path: "/hiKmpZMGZsrkA3cdEvjiACNm9QI.jpg",
    genres: [{ id: 35, name: "Comedy" }, { id: 53, name: "Thriller" }, { id: 18, name: "Drama" }]
  }
];

// Fallback Reviews matching Letterboxd editorial style
const EDITORIAL_REVIEWS = [
  {
    reviewer: "david_cinematheque",
    avatar: "D",
    rating: 5,
    filmTitle: "Dune: Part Two",
    filmYear: "2024",
    poster: "https://image.tmdb.org/t/p/w200/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    content: "A gargantuan, sensory triumph that reminds us why cinema was created in the first place. Greig Fraser’s monochrome Giedi Prime cinematography is etched into my retina forever. Dennis Villeneuve delivered the modern sci-fi masterwork of our generation.",
    likes: "2.4k"
  },
  {
    reviewer: "elena_russo",
    avatar: "E",
    rating: 4.5,
    filmTitle: "Oppenheimer",
    filmYear: "2023",
    poster: "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    content: "The Trinity test sequence is three minutes of sheer, held-breath auditory suspension. Cillian Murphy acts with every microscopic tremor of his eyes. It shifts from biography into a chilling existential horror story.",
    likes: "1.8k"
  },
  {
    reviewer: "marcus_filmjournal",
    avatar: "M",
    rating: 5,
    filmTitle: "Blade Runner 2049",
    filmYear: "2017",
    poster: "https://image.tmdb.org/t/p/w200/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    content: "The rare sequel that elevates its predecessor into poetry. The orange dust-swept Las Vegas ruins, Roger Deakins’ lighting, Zimmer’s roaring synthesizer score — a pure cinematic cathedral experience.",
    likes: "3.1k"
  }
];

// Helper: Make TMDB API Request
async function fetchTMDB(endpoint) {
  if (!TMDB_API_KEY) {
    return null; // Gracefully fallback to high-quality curated archive if no user key provided
  }
  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${TMDB_BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`TMDB request failed for ${endpoint}:`, error.message);
    return null;
  }
}

// Helper: Convert TMDB 0-10 rating to 5-star representation
function renderStars(voteAverage, starSize = 14) {
  // Convert 10-point scale to 5-point scale
  const rating5 = (voteAverage / 2).toFixed(1);
  const fullStars = Math.floor(rating5);
  const hasHalf = rating5 % 1 >= 0.4;
  let starsHtml = '';

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsHtml += `
        <svg class="star-icon" width="${starSize}" height="${starSize}" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>`;
    } else if (i === fullStars + 1 && hasHalf) {
      starsHtml += `
        <svg class="star-icon" width="${starSize}" height="${starSize}" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half-star-${i}">
              <stop offset="50%" stop-color="#00e054"/>
              <stop offset="50%" stop-color="transparent" stop-opacity="1"/>
            </linearGradient>
          </defs>
          <path fill="url(#half-star-${i})" stroke="#667788" stroke-width="1" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>`;
    } else {
      starsHtml += `
        <svg class="star-icon empty" width="${starSize}" height="${starSize}" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>`;
    }
  }

  return `<div class="star-rating">${starsHtml} <span class="rating-value-text">${rating5}</span></div>`;
}

// Generate Poster Card Element
function createPosterCard(movie) {
  state.cachedMovies.set(movie.id, movie);

  const posterUrl = movie.poster_path 
    ? `${IMG_BASE_W500}${movie.poster_path}` 
    : 'https://via.placeholder.com/300x450/202830/99aabb?text=No+Artwork';
  
  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : '2024';
  const ratingScore = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : '4.0';

  const card = document.createElement('div');
  card.className = 'poster-card';
  card.dataset.movieId = movie.id;

  const isWatchlisted = state.watchlist.some(m => m.id === movie.id);
  const userRate = state.userRatings[movie.id] || null;

  card.innerHTML = `
    <div class="poster-media-wrap">
      <img class="poster-img" src="${posterUrl}" alt="${movie.title}" loading="lazy" />
      <div class="poster-hover-overlay">
        <div class="overlay-btn-row">
          <button class="overlay-btn btn-quick-view" title="View Details">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            DETAILS
          </button>
          <button class="overlay-btn btn-quick-watchlist ${isWatchlisted ? 'active' : ''}" title="${isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${isWatchlisted ? '#00e054' : 'currentColor'}"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
          </button>
        </div>
      </div>
    </div>
    <div class="poster-info">
      <div class="poster-title" title="${movie.title}">${movie.title}</div>
      <div class="poster-meta">
        <span class="poster-year">${releaseYear}</span>
        <span class="poster-rating">
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          ${userRate ? `${userRate}★ (You)` : ratingScore}
        </span>
      </div>
    </div>
  `;

  // Click on card opens Modal
  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn-quick-watchlist')) {
      e.stopPropagation();
      toggleWatchlist(movie);
      updateWatchlistButtons();
      return;
    }
    openMovieModal(movie.id);
  });

  return card;
}

// Populate Movie Row
function renderMovieRow(containerId, movies) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const list = movies && movies.length > 0 ? movies : FALLBACK_MOVIES;
  list.forEach(movie => {
    container.appendChild(createPosterCard(movie));
  });
}

// Update Hero Billboard
function renderHero(movie) {
  if (!movie) movie = FALLBACK_MOVIES[0];
  state.currentHeroMovie = movie;
  state.cachedMovies.set(movie.id, movie);

  const heroSection = document.getElementById('heroSection');
  const heroTitle = document.getElementById('heroTitle');
  const heroDescription = document.getElementById('heroDescription');
  const heroRatingWrap = document.getElementById('heroRatingWrap');
  const heroYear = document.getElementById('heroYear');
  const heroAttribution = document.getElementById('heroAttribution');
  const heroWatchlistBtn = document.getElementById('heroWatchlistBtn');

  const backdropUrl = movie.backdrop_path 
    ? `${IMG_BASE_ORIGINAL}${movie.backdrop_path}` 
    : (movie.poster_path ? `${IMG_BASE_ORIGINAL}${movie.poster_path}` : '');
  
  if (backdropUrl) {
    heroSection.style.backgroundImage = `url('${backdropUrl}')`;
  }

  heroTitle.textContent = movie.title || 'Movie Title';
  heroDescription.textContent = movie.overview || 'A cinematic masterpiece streaming now on MovieFlix.';
  heroYear.textContent = movie.release_date ? movie.release_date.substring(0, 4) : '2024';
  heroRatingWrap.innerHTML = renderStars(movie.vote_average || 8.0, 16);
  
  if (heroAttribution) {
    heroAttribution.textContent = `STILL FROM "${(movie.title || '').toUpperCase()}" · TMDB CINEMA`;
  }

  updateHeroWatchlistBtn();
}

function updateHeroWatchlistBtn() {
  const heroWatchlistBtn = document.getElementById('heroWatchlistBtn');
  if (!heroWatchlistBtn || !state.currentHeroMovie) return;

  const isSaved = state.watchlist.some(m => m.id === state.currentHeroMovie.id);
  heroWatchlistBtn.innerHTML = isSaved
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="#00e054"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ON WATCHLIST`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> ADD TO WATCHLIST`;
}

// Watchlist State Management
function toggleWatchlist(movie) {
  const index = state.watchlist.findIndex(m => m.id === movie.id);
  if (index >= 0) {
    state.watchlist.splice(index, 1);
  } else {
    state.watchlist.unshift({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average
    });
  }
  localStorage.setItem(STORAGE_WATCHLIST_KEY, JSON.stringify(state.watchlist));
  updateWatchlistBadge();
  renderWatchlistDrawer();
  updateHeroWatchlistBtn();
}

function updateWatchlistBadge() {
  const badge = document.getElementById('watchlistBadge');
  if (badge) {
    badge.textContent = state.watchlist.length;
  }
}

function updateWatchlistButtons() {
  document.querySelectorAll('.poster-card').forEach(card => {
    const movieId = parseInt(card.dataset.movieId, 10);
    const isSaved = state.watchlist.some(m => m.id === movieId);
    const btn = card.querySelector('.btn-quick-watchlist');
    if (btn) {
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="${isSaved ? '#00e054' : 'currentColor'}"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>`;
      btn.classList.toggle('active', isSaved);
    }
  });
}

// Watchlist Drawer
function renderWatchlistDrawer() {
  const container = document.getElementById('drawerWatchlistContent');
  if (!container) return;

  if (state.watchlist.length === 0) {
    container.innerHTML = `
      <div class="drawer-empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#586370" style="margin-bottom:12px;"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>
        <p>Your cinema watchlist is currently empty.</p>
        <p style="font-size: 13px; color: var(--color-silver-mist); margin-top: 6px;">Browse the lobby and click "+ Add to Watchlist" on any film.</p>
      </div>`;
    return;
  }

  container.innerHTML = '';
  state.watchlist.forEach(movie => {
    const item = document.createElement('div');
    item.className = 'watchlist-item';
    const posterUrl = movie.poster_path 
      ? `${IMG_BASE_W500}${movie.poster_path}` 
      : 'https://via.placeholder.com/100x150/202830/99aabb?text=No+Image';

    item.innerHTML = `
      <img class="watchlist-item-thumb" src="${posterUrl}" alt="${movie.title}" />
      <div class="watchlist-item-info">
        <div class="watchlist-item-title">${movie.title}</div>
        <div style="font-size: 11px; color: var(--color-fog);">${(movie.release_date || '').substring(0, 4)} · ★ ${(movie.vote_average / 2).toFixed(1)}</div>
      </div>
      <button class="watchlist-item-remove" title="Remove">✕</button>
    `;

    item.querySelector('.watchlist-item-info').addEventListener('click', () => {
      closeDrawer();
      openMovieModal(movie.id);
    });

    item.querySelector('.watchlist-item-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWatchlist(movie);
      renderWatchlistDrawer();
    });

    container.appendChild(item);
  });
}

function openDrawer() {
  renderWatchlistDrawer();
  document.getElementById('watchlistDrawerOverlay').classList.add('active');
}

function closeDrawer() {
  document.getElementById('watchlistDrawerOverlay').classList.remove('active');
}

// Movie Detail Modal
async function openMovieModal(movieId) {
  const overlay = document.getElementById('movieModalOverlay');
  const modalVideoContainer = document.getElementById('modalVideoContainer');
  const modalPoster = document.getElementById('modalPoster');
  const modalTitle = document.getElementById('modalTitle');
  const modalTagline = document.getElementById('modalTagline');
  const modalOverview = document.getElementById('modalOverview');
  const modalGenres = document.getElementById('modalGenres');
  const modalCastList = document.getElementById('modalCastList');
  const modalRatingScore = document.getElementById('modalRatingScore');
  const modalStarPicker = document.getElementById('modalStarPicker');
  const modalWatchlistBtn = document.getElementById('modalWatchlistBtn');

  // Open modal in loading state
  overlay.classList.add('active');
  modalVideoContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-fog);">Loading trailer...</div>';

  // Fetch full details
  let movie = await fetchTMDB(`/movie/${movieId}?append_to_response=videos,credits,reviews`);
  if (!movie) {
    movie = state.cachedMovies.get(movieId) || FALLBACK_MOVIES.find(m => m.id === movieId) || FALLBACK_MOVIES[0];
  }

  // Set Basic Metadata
  modalTitle.textContent = movie.title;
  modalTagline.textContent = movie.tagline ? `"${movie.tagline}"` : `${movie.release_date ? movie.release_date.substring(0, 4) : ''} · Runtime: ${movie.runtime ? `${movie.runtime} min` : '120 min'}`;
  modalOverview.textContent = movie.overview || 'No synopsis available.';
  
  const posterUrl = movie.poster_path 
    ? `${IMG_BASE_W500}${movie.poster_path}` 
    : 'https://via.placeholder.com/300x450/202830/99aabb?text=No+Artwork';
  modalPoster.src = posterUrl;

  // Rating Display
  const userRate = state.userRatings[movie.id] || null;
  const tmdbScore = (movie.vote_average / 2).toFixed(1);
  modalRatingScore.innerHTML = renderStars(movie.vote_average || 8.0, 16);

  // Genres
  modalGenres.innerHTML = '';
  if (movie.genres && movie.genres.length > 0) {
    movie.genres.forEach(g => {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = g.name;
      modalGenres.appendChild(badge);
    });
  }

  // Cast
  modalCastList.innerHTML = '';
  if (movie.credits && movie.credits.cast && movie.credits.cast.length > 0) {
    movie.credits.cast.slice(0, 8).forEach(actor => {
      const chip = document.createElement('div');
      chip.className = 'cast-chip';
      const actorImg = actor.profile_path 
        ? `${IMG_BASE_W500}${actor.profile_path}` 
        : 'https://via.placeholder.com/60x60/445566/ffffff?text=+';
      chip.innerHTML = `
        <img class="cast-avatar" src="${actorImg}" alt="${actor.name}" />
        <div>
          <div class="cast-name">${actor.name}</div>
          <div class="cast-character">${actor.character || 'Cast'}</div>
        </div>
      `;
      modalCastList.appendChild(chip);
    });
  } else {
    modalCastList.innerHTML = '<span style="font-size:12px;color:var(--color-fog);">Cast details unavailable.</span>';
  }

  // Trailer Embed
  let trailerKey = null;
  if (movie.videos && movie.videos.results) {
    const officialTrailer = movie.videos.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    if (officialTrailer) {
      trailerKey = officialTrailer.key;
    }
  }

  if (trailerKey) {
    modalVideoContainer.innerHTML = `
      <iframe 
        src="https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=0&rel=0&modestbranding=1" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>`;
  } else if (movie.backdrop_path) {
    modalVideoContainer.innerHTML = `<img class="modal-backdrop-fallback" src="${IMG_BASE_ORIGINAL}${movie.backdrop_path}" alt="${movie.title}" />`;
  } else {
    modalVideoContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-fog);font-family:var(--font-editorial);">Trailer currently unavailable</div>';
  }

  // Star Rating Interaction inside Modal
  setupInteractiveStars(movie.id, modalStarPicker);

  // Watchlist Button inside Modal
  const isSaved = state.watchlist.some(m => m.id === movie.id);
  modalWatchlistBtn.innerHTML = isSaved
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="#00e054"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Saved in Watchlist`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> Add to Watchlist`;

  modalWatchlistBtn.onclick = () => {
    toggleWatchlist(movie);
    const updatedSaved = state.watchlist.some(m => m.id === movie.id);
    modalWatchlistBtn.innerHTML = updatedSaved
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="#00e054"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Saved in Watchlist`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> Add to Watchlist`;
    updateWatchlistButtons();
  };
}

function closeMovieModal() {
  const overlay = document.getElementById('movieModalOverlay');
  overlay.classList.remove('active');
  // Stop video playback by clearing iframe
  document.getElementById('modalVideoContainer').innerHTML = '';
}

// Interactive Star Rating Widget
function setupInteractiveStars(movieId, container) {
  const currentRating = state.userRatings[movieId] || 0;
  container.innerHTML = '';

  for (let star = 1; star <= 5; star++) {
    const starBtn = document.createElement('button');
    starBtn.className = `star-btn ${star <= currentRating ? 'active' : ''}`;
    starBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
    starBtn.title = `Rate ${star} Star${star > 1 ? 's' : ''}`;

    starBtn.addEventListener('click', () => {
      state.userRatings[movieId] = star;
      localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(state.userRatings));
      setupInteractiveStars(movieId, container);
      
      // Flash acid green notification
      const promptLabel = document.querySelector('.rating-prompt-label');
      if (promptLabel) {
        promptLabel.textContent = `RATED ${star} / 5 STARS!`;
        promptLabel.style.color = 'var(--color-acid-green)';
        setTimeout(() => {
          promptLabel.textContent = 'YOUR RATING:';
          promptLabel.style.color = 'var(--color-ice)';
        }, 2000);
      }
    });

    container.appendChild(starBtn);
  }
}

// Live Search with Debounce
let searchDebounceTimer = null;
function setupSearch() {
  const searchInput = document.getElementById('headerSearchInput');
  const searchDropdown = document.getElementById('searchResultsDropdown');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(searchDebounceTimer);

    if (!query || query.length < 2) {
      searchDropdown.classList.remove('active');
      return;
    }

    searchDebounceTimer = setTimeout(async () => {
      const data = await fetchTMDB(`/search/movie?query=${encodeURIComponent(query)}`);
      if (data && data.results && data.results.length > 0) {
        renderSearchResults(data.results.slice(0, 6));
        searchDropdown.classList.add('active');
      } else {
        searchDropdown.innerHTML = '<div style="padding:12px;color:var(--color-fog);font-size:12px;">No matching films found.</div>';
        searchDropdown.classList.add('active');
      }
    }, 280);
  });

  // Close search dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      searchDropdown.classList.remove('active');
    }
  });

  // Shortcut key '/' to focus search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      searchDropdown.classList.remove('active');
      closeMovieModal();
      closeDrawer();
    }
  });
}

function renderSearchResults(movies) {
  const searchDropdown = document.getElementById('searchResultsDropdown');
  searchDropdown.innerHTML = '';

  movies.forEach(movie => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    const posterUrl = movie.poster_path 
      ? `${IMG_BASE_W500}${movie.poster_path}` 
      : 'https://via.placeholder.com/60x90/202830/99aabb?text=Film';
    
    item.innerHTML = `
      <img class="search-result-thumb" src="${posterUrl}" alt="${movie.title}" />
      <div class="search-result-info">
        <div class="search-result-title">${movie.title}</div>
        <div class="search-result-meta">
          <span>${movie.release_date ? movie.release_date.substring(0, 4) : 'Cinema'}</span>
          <span style="color:var(--color-acid-green);">★ ${(movie.vote_average / 2).toFixed(1)}</span>
        </div>
      </div>
    `;

    item.addEventListener('click', () => {
      searchDropdown.classList.remove('active');
      openMovieModal(movie.id);
    });

    searchDropdown.appendChild(item);
  });
}

// Render Community Reviews
function renderCommunityReviews() {
  const container = document.getElementById('editorialReviewsGrid');
  if (!container) return;
  container.innerHTML = '';

  EDITORIAL_REVIEWS.forEach(review => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-poster-thumb">
        <img src="${review.poster}" alt="${review.filmTitle}" loading="lazy" />
      </div>
      <div class="review-body-wrap">
        <div class="review-header">
          <div class="reviewer-profile">
            <div class="reviewer-avatar">${review.avatar}</div>
            <span class="reviewer-name">${review.reviewer}</span>
          </div>
          ${renderStars(review.rating * 2, 12)}
        </div>
        <div class="reviewed-film-title">Reviewed <span>${review.filmTitle}</span> (${review.filmYear})</div>
        <div class="review-content">${review.content}</div>
        <div class="review-footer">
          <div class="review-likes">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ${review.likes} likes
          </div>
          <span>LETTERBOXD EDITORIAL</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Horizontal Slider Arrow Navigation
function setupSliderControls() {
  document.querySelectorAll('.slider-arrow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRowId = btn.dataset.target;
      const direction = btn.dataset.direction === 'left' ? -1 : 1;
      const row = document.getElementById(targetRowId);
      if (row) {
        row.scrollBy({ left: direction * 560, behavior: 'smooth' });
      }
    });
  });
}

// Genre Tabs Filtering
function setupGenreTabs() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', async () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const genreId = chip.dataset.genre;
      let endpoint = '/trending/movie/week';
      if (genreId && genreId !== '0') {
        endpoint = `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`;
      }

      const data = await fetchTMDB(endpoint);
      if (data && data.results) {
        renderMovieRow('rowTrending', data.results);
      }
    });
  });
}

// Initialize Application
async function initMovieFlix() {
  updateWatchlistBadge();
  setupSearch();
  setupSliderControls();
  setupGenreTabs();
  renderCommunityReviews();

  // Scroll Header Effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Modal Close Events
  document.getElementById('modalCloseBtn').addEventListener('click', closeMovieModal);
  document.getElementById('movieModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('movieModalOverlay')) {
      closeMovieModal();
    }
  });

  // Drawer Events
  document.getElementById('navWatchlistBtn').addEventListener('click', openDrawer);
  document.getElementById('drawerCloseBtn').addEventListener('click', closeDrawer);
  document.getElementById('watchlistDrawerOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('watchlistDrawerOverlay')) {
      closeDrawer();
    }
  });

  // API Key Settings Prompt
  const apiBtn = document.getElementById('navApiSettingsBtn');
  if (apiBtn) {
    apiBtn.addEventListener('click', () => {
      const current = localStorage.getItem('movieflix_tmdb_key') || '';
      const key = prompt(
        'Enter your TMDB (The Movie Database) API Key for live film discovery:\n(Leave empty to use built-in curated cinema archive)',
        current
      );
      if (key !== null) {
        if (key.trim()) {
          localStorage.setItem('movieflix_tmdb_key', key.trim());
        } else {
          localStorage.removeItem('movieflix_tmdb_key');
        }
        window.location.reload();
      }
    });
  }

  // Hero CTA Buttons
  document.getElementById('heroTrailerBtn').addEventListener('click', () => {
    if (state.currentHeroMovie) {
      openMovieModal(state.currentHeroMovie.id);
    }
  });

  document.getElementById('heroWatchlistBtn').addEventListener('click', () => {
    if (state.currentHeroMovie) {
      toggleWatchlist(state.currentHeroMovie);
    }
  });

  // Fetch Initial Data from TMDB
  try {
    // 1. Trending Week (for Hero & Trending Row)
    const trendingData = await fetchTMDB('/trending/movie/week');
    if (trendingData && trendingData.results && trendingData.results.length > 0) {
      renderHero(trendingData.results[0]);
      renderMovieRow('rowTrending', trendingData.results);
    } else {
      renderHero(FALLBACK_MOVIES[0]);
      renderMovieRow('rowTrending', FALLBACK_MOVIES);
    }

    // 2. Top Rated
    const topRatedData = await fetchTMDB('/movie/top_rated');
    if (topRatedData && topRatedData.results) {
      renderMovieRow('rowTopRated', topRatedData.results);
    } else {
      renderMovieRow('rowTopRated', FALLBACK_MOVIES);
    }

    // 3. Now Playing / In Theatres
    const nowPlayingData = await fetchTMDB('/movie/now_playing');
    if (nowPlayingData && nowPlayingData.results) {
      renderMovieRow('rowNowPlaying', nowPlayingData.results);
    } else {
      renderMovieRow('rowNowPlaying', FALLBACK_MOVIES);
    }

    // 4. Curated Sci-Fi / Thriller Classics
    const curatedData = await fetchTMDB('/discover/movie?with_genres=878,53&sort_by=vote_count.desc');
    if (curatedData && curatedData.results) {
      renderMovieRow('rowCurated', curatedData.results);
    } else {
      renderMovieRow('rowCurated', FALLBACK_MOVIES);
    }

  } catch (error) {
    console.error("Initialization error:", error);
    renderHero(FALLBACK_MOVIES[0]);
    renderMovieRow('rowTrending', FALLBACK_MOVIES);
    renderMovieRow('rowTopRated', FALLBACK_MOVIES);
    renderMovieRow('rowNowPlaying', FALLBACK_MOVIES);
    renderMovieRow('rowCurated', FALLBACK_MOVIES);
  }
}

// Launch on DOM ready
document.addEventListener('DOMContentLoaded', initMovieFlix);
