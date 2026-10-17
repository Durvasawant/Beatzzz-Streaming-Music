import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";
import { playerControls } from "@/lib/playerControls";
import { getSpotifyToken, useSpotifyConnected } from "@/lib/spotifyAuth";
import { PLACEHOLDER_COVER } from "@/lib/tracks";
import { usePlayerStore } from "@/stores/usePlayerStore";

declare global {
	interface Window {
		Spotify?: any;
		onSpotifyWebPlaybackSDKReady?: () => void;
	}
}

const loadSpotifySdk = () =>
	new Promise<void>((resolve) => {
		if (window.Spotify) return resolve();
		window.onSpotifyWebPlaybackSDKReady = () => resolve();
		if (!document.getElementById("spotify-sdk")) {
			const s = document.createElement("script");
			s.id = "spotify-sdk";
			s.src = "https://sdk.scdn.co/spotify-player.js";
			document.body.appendChild(s);
		}
	});

const stop = () => usePlayerStore.setState({ isPlaying: false });

// Plays the current song in the bottom bar:
//  - your original songs  -> normal <audio> file
//  - Spotify-dataset songs -> Spotify Web Playback SDK (browser becomes a Spotify player; needs Premium)
const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const playerRef = useRef<any>(null);
	const prevAudioRef = useRef<string | null>(null);
	const loadedRef = useRef<string | null>(null); // Spotify track currently loaded in the SDK
	const loadingRef = useRef<string | null>(null);
	const [deviceId, setDeviceId] = useState<string | null>(null);

	const connected = useSpotifyConnected();
	const { currentSong, isPlaying, playNext, updateSong } = usePlayerStore();
	const isSpotifySong = currentSong?.source === "spotify";

	// --- controls used by the bottom bar (seek + volume) ---
	useEffect(() => {
		if (audioRef.current) audioRef.current.volume = 0.75;
		playerControls.seek = (s) => {
			usePlayerStore.setState({ currentTime: s });
			if (usePlayerStore.getState().currentSong?.source === "spotify") playerRef.current?.seek(s * 1000);
			else if (audioRef.current) audioRef.current.currentTime = s;
		};
		playerControls.setVolume = (pct) => {
			if (audioRef.current) audioRef.current.volume = pct / 100;
			playerRef.current?.setVolume(pct / 100);
		};
	}, []);

	// --- Spotify SDK: create the in-browser player once the user is connected ---
	useEffect(() => {
		if (!connected) return;
		let cancelled = false;
		let player: any;

		loadSpotifySdk().then(() => {
			if (cancelled) return;
			player = new window.Spotify.Player({
				name: "Beatzzz",
				volume: 0.75,
				getOAuthToken: (cb: (t: string) => void) => {
					getSpotifyToken().then((t) => t && cb(t));
				},
			});
			playerRef.current = player;

			player.addListener("ready", ({ device_id }: { device_id: string }) => setDeviceId(device_id));
			player.addListener("not_ready", () => setDeviceId(null));
			player.addListener("account_error", () => {
				toast.error("Spotify Premium is required to play full songs here.");
				stop();
			});
			player.addListener("authentication_error", () => toast.error("Spotify login expired. Click Connect Spotify again."));
			player.addListener("initialization_error", () => toast.error("This browser cannot play Spotify. Try Chrome or Edge."));
			player.addListener("playback_error", ({ message }: { message: string }) => toast.error(`Spotify: ${message}`));

			player.addListener("player_state_changed", (state: any) => {
				if (!state) return;
				const cur = state.track_window.current_track;
				usePlayerStore.setState({ currentTime: state.position / 1000, duration: state.duration / 1000 });
				// a finished track shows up as: paused, back at 0, and listed in "previous tracks"
				const ended =
					state.paused &&
					state.position === 0 &&
					state.track_window.previous_tracks.some((t: any) => t.id === cur.id);
				if (ended && loadedRef.current === cur.id && usePlayerStore.getState().isPlaying) {
					loadedRef.current = null;
					usePlayerStore.getState().playNext();
				}
			});

			player.connect();
		});

		return () => {
			cancelled = true;
			player?.disconnect();
			playerRef.current = null;
			loadedRef.current = null;
			setDeviceId(null);
		};
	}, [connected]);

	// --- start / pause / resume the Spotify song ---
	useEffect(() => {
		if (!isSpotifySong || !currentSong) return;
		const song = currentSong;

		if (!isPlaying) {
			if (loadedRef.current === song.spotifyId) playerRef.current?.pause();
			return;
		}
		if (!connected) {
			toast("Click “Connect Spotify” in the bottom bar to play this song.", { icon: "🎧" });
			stop();
			return;
		}

		// not looked up on Spotify yet -> ask the backend (it saves the answer in MongoDB)
		if (!song.spotifyId) {
			let cancelled = false;
			axiosInstance
				.post(`/tracks/${song._id}/resolve`)
				.then(({ data }) => {
					if (cancelled) return;
					if (!data.spotifyId) {
						toast.error(`“${song.title}” was not found on Spotify.`);
						stop();
						return;
					}
					updateSong(song._id, {
						spotifyId: data.spotifyId,
						title: data.title,
						artist: data.artists,
						imageUrl: data.coverUrl || PLACEHOLDER_COVER,
						duration: data.durationMs ? Math.round(data.durationMs / 1000) : song.duration,
					});
				})
				.catch((err) => {
					if (cancelled) return;
					toast.error(err.response?.data?.message ?? err.message);
					stop();
				});
			return () => {
				cancelled = true;
			};
		}

		if (!deviceId) return; // SDK still starting up
		if (loadedRef.current === song.spotifyId) {
			playerRef.current?.resume();
			return;
		}
		if (loadingRef.current === song.spotifyId) return;

		loadingRef.current = song.spotifyId;
		(async () => {
			const token = await getSpotifyToken();
			if (!token) return;
			const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
				method: "PUT",
				headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
				body: JSON.stringify({ uris: [`spotify:track:${song.spotifyId}`] }),
			});
			loadingRef.current = null;
			if (res.ok) {
				loadedRef.current = song.spotifyId!;
				if (!usePlayerStore.getState().isPlaying) playerRef.current?.pause();
			} else if (res.status === 403) {
				toast.error("Spotify Premium is required to play full songs here.");
				stop();
			} else {
				toast.error(`Spotify could not play this song (${res.status}).`);
				stop();
			}
		})().catch(() => {
			loadingRef.current = null;
		});
	}, [currentSong?._id, currentSong?.spotifyId, isSpotifySong, isPlaying, connected, deviceId]); // eslint-disable-line react-hooks/exhaustive-deps

	// switching back to an audio-file song: stop Spotify
	useEffect(() => {
		if (!isSpotifySong) {
			playerRef.current?.pause();
			loadedRef.current = null;
		}
	}, [isSpotifySong]);

	// Spotify only sends updates on changes, so ask for the position twice a second while playing
	useEffect(() => {
		if (!isSpotifySong || !isPlaying) return;
		const id = setInterval(async () => {
			const st = await playerRef.current?.getCurrentState();
			if (st) usePlayerStore.setState({ currentTime: st.position / 1000, duration: st.duration / 1000 });
		}, 500);
		return () => clearInterval(id);
	}, [isSpotifySong, isPlaying]);

	// --- your original songs: plain <audio> ---
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		if (isSpotifySong || !currentSong) {
			audio.pause();
			prevAudioRef.current = null; // so coming back to the same song restarts it
			return;
		}
		if (prevAudioRef.current !== currentSong.audioUrl) {
			audio.src = currentSong.audioUrl;
			audio.currentTime = 0;
			prevAudioRef.current = currentSong.audioUrl;
		}
		if (isPlaying) audio.play().catch(() => {});
		else audio.pause();
	}, [currentSong?.audioUrl, isPlaying, isSpotifySong]); // eslint-disable-line react-hooks/exhaustive-deps

	const fromAudio = (fn: (a: HTMLAudioElement) => void) => () => {
		if (usePlayerStore.getState().currentSong?.source === "spotify") return;
		if (audioRef.current) fn(audioRef.current);
	};

	return (
		<audio
			ref={audioRef}
			onTimeUpdate={fromAudio((a) => usePlayerStore.setState({ currentTime: a.currentTime }))}
			onLoadedMetadata={fromAudio((a) => usePlayerStore.setState({ duration: a.duration }))}
			onEnded={fromAudio(() => playNext())}
		/>
	);
};
export default AudioPlayer;
