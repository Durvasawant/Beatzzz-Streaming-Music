import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";

// The user's Spotify login (needed once, to play full songs in the bottom bar).
const KEY = "beatzzz_spotify";

interface Saved {
	access_token: string;
	refresh_token: string;
	expires_at: number; // ms
}

const read = (): Saved | null => {
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as Saved) : null;
	} catch {
		return null;
	}
};

export const isSpotifyConnected = () => Boolean(read()?.refresh_token);

export const saveSpotifyTokens = (access_token: string, refresh_token: string, expires_in: number) => {
	localStorage.setItem(
		KEY,
		JSON.stringify({ access_token, refresh_token, expires_at: Date.now() + expires_in * 1000 })
	);
	window.dispatchEvent(new Event("spotify-auth"));
};

export const disconnectSpotify = () => {
	localStorage.removeItem(KEY);
	window.dispatchEvent(new Event("spotify-auth"));
};

// Sends the browser to Spotify's login page (through our backend).
// It must start on 127.0.0.1 because Spotify only accepts that address for http redirects.
export const connectSpotify = () => {
	const api = (import.meta.env.VITE_API_URL || "http://localhost:5001/api") as string;
	const base = api.replace("localhost", "127.0.0.1");
	window.location.href = `${base}/spotify/login`;
};

// Returns a valid access token, refreshing it when it is about to expire.
export const getSpotifyToken = async (): Promise<string | null> => {
	const saved = read();
	if (!saved) return null;
	if (Date.now() < saved.expires_at - 60_000) return saved.access_token;
	try {
		const { data } = await axiosInstance.post("/spotify/refresh", { refresh_token: saved.refresh_token });
		saveSpotifyTokens(data.access_token, data.refresh_token, data.expires_in);
		return data.access_token as string;
	} catch {
		disconnectSpotify();
		return null;
	}
};

// React hook: re-renders when the user connects / disconnects Spotify
export const useSpotifyConnected = () => {
	const [connected, setConnected] = useState(isSpotifyConnected());
	useEffect(() => {
		const update = () => setConnected(isSpotifyConnected());
		window.addEventListener("spotify-auth", update);
		return () => window.removeEventListener("spotify-auth", update);
	}, []);
	return connected;
};
