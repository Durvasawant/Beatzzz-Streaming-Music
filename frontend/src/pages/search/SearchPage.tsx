import { useEffect, useState } from "react";
import { Music, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { trackToSong, type TrackResult } from "@/lib/tracks";
import { usePlayerStore } from "@/stores/usePlayerStore";
import type { Song } from "@/types";

const formatStreams = (n?: number | null) => (n ? `${(n / 1_000_000).toFixed(0)}M streams` : "");

const SearchPage = () => {
	const [query, setQuery] = useState("");
	const [tracks, setTracks] = useState<TrackResult[]>([]);
	const [originals, setOriginals] = useState<Song[]>([]);
	const [loading, setLoading] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);

	const { currentSong, playAlbum } = usePlayerStore();

	// wait 400 ms after typing stops, then search
	useEffect(() => {
		if (query.trim().length < 2) {
			setTracks([]);
			setOriginals([]);
			setNotice(null);
			return;
		}
		const timer = setTimeout(async () => {
			setLoading(true);
			try {
				const res = await axiosInstance.get("/tracks/search", { params: { q: query.trim() } });
				setTracks(res.data.tracks);
				setOriginals(res.data.songs ?? []);
				setNotice(
					res.data.spotifyError
						? `Spotify lookup failed: ${res.data.spotifyError}`
						: !res.data.spotify
						? "Spotify keys are not set in backened/.env, so Spotify songs cannot be played yet."
						: null
				);
			} catch {
				setNotice("Could not reach the server. Is the backend running?");
			} finally {
				setLoading(false);
			}
		}, 400);
		return () => clearTimeout(timer);
	}, [query]);

	// the whole result list becomes the queue, so "next" in the bottom bar goes to the next result
	const queue: Song[] = [...originals.map((s) => ({ ...s, source: "local" as const })), ...tracks.map(trackToSong)];
	const play = (id: string) => playAlbum(queue, queue.findIndex((s) => s._id === id));

	const Row = ({ song, meta }: { song: Song; meta?: string }) => (
		<button
			onClick={() => play(song._id)}
			className={`w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-zinc-700/50 ${
				currentSong?._id === song._id ? "bg-zinc-700/60" : ""
			}`}
		>
			{song.imageUrl && !song.imageUrl.startsWith("data:") ? (
				<img src={song.imageUrl} alt='' className='size-12 rounded object-cover' />
			) : (
				<div className='size-12 rounded bg-zinc-700 flex items-center justify-center'>
					<Music className='size-5 text-zinc-400' />
				</div>
			)}
			<div className='min-w-0 flex-1'>
				<p className={`truncate font-medium ${currentSong?._id === song._id ? "text-green-400" : ""}`}>{song.title}</p>
				<p className='truncate text-sm text-zinc-400'>{song.artist}</p>
			</div>
			{meta && <span className='hidden sm:block text-xs text-zinc-500'>{meta}</span>}
		</button>
	);

	const nothing = !loading && query.trim().length >= 2 && tracks.length === 0 && originals.length === 0 && !notice;

	return (
		<div className='h-full rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-6 space-y-5'>
					<h1 className='text-2xl font-bold'>Search</h1>

					<div className='relative max-w-xl'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400' />
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder='Search a song or artist (e.g. Cruel Summer)'
							className='pl-9 bg-zinc-800 border-zinc-700'
							autoFocus
						/>
					</div>

					{notice && <p className='text-sm text-amber-400'>{notice}</p>}
					{loading && <p className='text-sm text-zinc-400'>Searching...</p>}
					{nothing && <p className='text-sm text-zinc-400'>No songs found for “{query}”.</p>}

					{originals.length > 0 && (
						<div className='space-y-1 max-w-3xl'>
							<h2 className='text-sm font-semibold text-zinc-300'>Beatzzz Originals</h2>
							{originals.map((s) => (
								<Row key={s._id} song={s} />
							))}
						</div>
					)}

					{tracks.length > 0 && (
						<div className='space-y-1 max-w-3xl'>
							<h2 className='text-sm font-semibold text-zinc-300'>Spotify Top Hits</h2>
							{tracks.map((t) => (
								<Row
									key={t._id}
									song={trackToSong(t)}
									meta={`${t.releasedYear ?? ""} ${formatStreams(t.streams) && `· ${formatStreams(t.streams)}`}`}
								/>
							))}
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

export default SearchPage;
