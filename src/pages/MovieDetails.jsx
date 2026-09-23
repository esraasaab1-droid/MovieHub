import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_KEY from "../api";

function MovieDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");

        fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch movie");
                }

                return response.json();
            })
            .then((data) => {
                setMovie(data);
            })
            .catch(() => {
                setError("Something went wrong. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <p className="loading">Loading movie...</p>;
    }

    if (error) {
        return (
            <div className="error-message">
                <p>{error}</p>

                <button
                    className="back-button"
                    onClick={() => navigate("/")}
                >
                    ← Back to Movies
                </button>
            </div>
        );
    }

    return (
        <div className="movie-details">

            <button
                className="back-button"
                onClick={() => navigate("/")}
            >
                ← Back to Movies
            </button>

            <div className="movie-details-content">

                <div className="movie-details-image">
                    {movie.poster_path ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                        />
                    ) : (
                        <div className="no-poster">
                            No Poster Available
                        </div>
                    )}
                </div>

                <div className="movie-details-info">

                    <h1>{movie.title}</h1>

                    <p>
                        <strong>Release Date:</strong>{" "}
                        {movie.release_date || "N/A"}
                    </p>

                    <p>
                        <strong>Runtime:</strong>{" "}
                        {movie.runtime
                            ? `${movie.runtime} minutes`
                            : "N/A"}
                    </p>

                    <p>
                        <strong>Rating:</strong>{" "}
                        ⭐ {movie.vote_average ?? "N/A"}
                    </p>

                    <p className="details-overview">
                        <strong>Overview:</strong>{" "}
                        {movie.overview || "No overview available."}
                    </p>

                </div>

            </div>
        </div>
    );
}

export default MovieDetails;