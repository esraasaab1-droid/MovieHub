import "../App.css";

import { useState, useEffect } from "react";

import API_KEY from "../api";

import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [movieName, setMovieName] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [editMovieId, setEditMovieId] = useState(null);

  // Loading and Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get popular movies from TMDB
  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }

        return response.json();
      })
      .then(async (data) => {
        const moviesWithDetails = await Promise.all(
          data.results.map(async (movie) => {
            const response = await fetch(
              `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=en-US`
            );

            if (!response.ok) {
              throw new Error("Failed to fetch movie details");
            }

            const details = await response.json();

            return {
              ...movie,
              runtime: details.runtime,
            };
          })
        );

        setMovies(moviesWithDetails);
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Search movies
  function handleSearch() {
    if (!search.trim()) return;

    setLoading(true);
    setError("");

    fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        search
      )}&language=en-US`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to search movies");
        }

        return response.json();
      })
      .then((data) => {
        setMovies(data.results || []);
      })
      .catch(() => {
        setError("Something went wrong while searching. Please try again.");
        setMovies([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Clear search and get popular movies again
  function handleClear() {
    setSearch("");
    setLoading(true);
    setError("");

    fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }

        return response.json();
      })
      .then((data) => {
        setMovies(data.results || []);
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
        setMovies([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Generate a new ID for manually added movies
  function getNextId() {
    if (movies.length === 0) return 1;

    return Math.max(...movies.map((movie) => movie.id)) + 1;
  }

  // Add movie
  function handleAddMovie() {
    if (!movieName.trim()) return;

    const newMovie = {
      id: getNextId(),
      title: movieName,
      category: category,
      duration: duration,
    };

    setMovies([newMovie, ...movies]);

    setMovieName("");
    setCategory("");
    setDuration("");
  }

  // Delete movie
  function handleDeleteMovie(id) {
    const newMovies = movies.filter((movie) => movie.id !== id);

    setMovies(newMovies);
  }

  // Open movie details page
  function handleMovieClick(movie) {
    navigate(`/movie/${movie.id}`);
  }

  // Edit movie
  function handleEditMovie(id) {
    const newMovies = movies.map((movie) => {
      if (movie.id === id) {
        return {
          ...movie,
          title: movieName,
          category: category,
          duration: duration,
        };
      }

      return movie;
    });

    setMovies(newMovies);

    setEditMovieId(null);
    setMovieName("");
    setCategory("");
    setDuration("");
  }

  return (
    <div className="app">

      {/* ================= HERO ================= */}

      <section className="hero">
        <div className="hero-content">

          <div className="hero-line"></div>

          <h1>Cinema Manager</h1>

          <p>
            Discover movies. Explore stories. Enjoy cinema.
          </p>

          <button
            className="hero-button"
            onClick={() => {
              document
                .getElementById("movies-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Movies
          </button>

        </div>
      </section>


      {/* ================= MOVIES SECTION ================= */}

      <div className="movie-form" id="movies-section">

        {/* Search */}

        <div className="search-box">

          <input
            type="text"
            placeholder="Search for a movie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>

          <button onClick={handleClear} disabled={loading}>
            Clear
          </button>

        </div>


        {/* Add / Edit Form */}

        <h2>
          {editMovieId === null ? "Add Movie" : "Edit Movie"}
        </h2>

        <input
          type="text"
          placeholder="Movie Name"
          value={movieName}
          onChange={(e) => setMovieName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="number"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <button
          onClick={() => {
            if (editMovieId === null) {
              handleAddMovie();
            } else {
              handleEditMovie(editMovieId);
            }
          }}
        >
          {editMovieId === null ? "Add Movie" : "Save Changes"}
        </button>


        {/* Error */}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}


        {/* Loading */}

        {loading && (
          <p className="loading">
            Loading movies...
          </p>
        )}


        {/* No Results */}

        {!loading && !error && movies.length === 0 && (
          <p className="no-results">
            No movies found.
          </p>
        )}


        {/* Movies */}

        {!loading && !error && movies.length > 0 && (
          <div className="movies-container">

            {movies.map((movie) => (

              <div
                className="movie-card"
                key={movie.id}
                onClick={() => handleMovieClick(movie)}
              >

                {/* Poster */}

                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                  />
                ) : (
                  <div className="no-poster">
                    No Image
                  </div>
                )}


                {/* Movie title */}

                <h3>{movie.title}</h3>


                {/* Release date */}

                {movie.release_date && (
                  <p>{movie.release_date}</p>
                )}


                {/* Runtime */}

                {movie.runtime && (
                  <p>{movie.runtime} min</p>
                )}


                {/* Category */}

                {movie.category && (
                  <p>{movie.category}</p>
                )}


                {/* Manual movie duration */}

                {movie.duration && (
                  <p>{movie.duration} min</p>
                )}


                {/* Overview */}

                {movie.overview && (
                  <p className="overview">
                    {movie.overview}
                  </p>
                )}


                {/* Edit */}

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setEditMovieId(movie.id);
                    setMovieName(movie.title || "");
                    setCategory(movie.category || "");
                    setDuration(movie.duration || "");
                  }}
                >
                  Edit
                </button>


                {/* Delete */}

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    handleDeleteMovie(movie.id);
                  }}
                >
                  Delete
                </button>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Home;