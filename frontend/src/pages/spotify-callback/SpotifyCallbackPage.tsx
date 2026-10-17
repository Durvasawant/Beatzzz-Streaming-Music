import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { saveSpotifyTokens } from "@/lib/spotifyAuth";

// Spotify -> backend -> here. The tokens arrive in the URL #fragment.
const SpotifyCallbackPage = () => {
	const navigate = useNavigate();

	useEffect(() => {
		const p = new URLSearchParams(window.location.hash.slice(1));
		const access = p.get("access_token");
		const refresh = p.get("refresh_token");
		if (access && refresh) {
			saveSpotifyTokens(access, refresh, Number(p.get("expires_in")) || 3600);
			toast.success("Spotify connected. Click any song to play it!");
		} else {
			toast.error(`Spotify login failed: ${p.get("error") ?? "unknown error"}`);
		}
		navigate("/", { replace: true });
	}, [navigate]);

	return <div className='h-screen flex items-center justify-center bg-black text-white'>Connecting Spotify...</div>;
};

export default SpotifyCallbackPage;
