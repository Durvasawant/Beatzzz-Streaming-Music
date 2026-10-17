import { useEffect, useState } from "react";
import { Music, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";

interface TrackResult {
	_id: string;
	title: string;
	artists: string;
	releasedYear?: number;
	streams?: number | null;
	coverUrl: string | null;
	spotifyId: string | null;
	spotifyUrl: string | null;
}

const formatStreams = (n?: number | null) => (n ? `${(n / 1_000_000).toFixed(0)}M streams` : "");

const SearchPage = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<TrackResult[]>([]);
	const [selected, setSelected] = useState<TrackResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);

	// wait 400 ms after typing stops, then search
	useEffect(() => {
		if (query.trim().length < 2) {
			setResults([]);
			setNotice(null);
			return;
		}
		const timer = setTimeout(async () => {
			setLoading(true);
			try {
				const res = await axiosInstance.get("/tracks/search", { params: { q: query.trim() } });
				setResults(res.data.tracks);
				setNotice(
					res.data.spotifyError
						? `Spotify lookup failed: ${res.data.spotifyError}`
						: !res.data.spotify
						? "Spotify keys are not set in backened/.env, so songs cannot be played yet."
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

					{selected && (
						<div className='max-w-xl space-y-2'>
							{selected.spotifyId ? (
								<iframe
									key={selected.spotifyId}
									title={selected.title}
									src={`https://open.spotify.com/embed/track/${selected.spotifyId}?utm_source=generator&theme=0`}
									width='100%'
									height='152'
									style={{ borderRadius: 12, border: 0 }}
									allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
									loading='lazy'
								/>
							) : (
								<a
									className='text-emerald-400 underline text-sm'
									target='_blank'
									rel='noreferrer'
									href={`https://open.spotify.com/search/${encodeURIComponent(`${selected.title} ${selected.artists}`)}`}
								>
									Not linked to Spotify yet - open a Spotify search for "{selected.title}"
								</a>
							)}
							<p className='text-xs text-zinc-500'>
								Log in to Spotify in this browser to hear the full song; otherwise you get a 30-second preview.
							</p>
						</div>
					)}

					{loading && <p className='text-sm text-zinc-400'>Searching...</p>}
					{!loading && query.trim().length >= 2 && results.length === 0 && !notice && (
						<p className='text-sm text-zinc-400'>No songs found in the database for "{query}".</p>
					)}

					<div className='space-y-1 max-w-3xl'>
						{results.map((t) => (
							<button
								key={t._id}
								onClick={() => setSelected(t)}
								className={`w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-zinc-700/50 ${
									selected?._id === t._id ? "bg-zinc-700/60" : ""
								}`}
							>
								{t.coverUrl ? (
									<img src={t.coverUrl} alt='' className='size-12 rounded object-cover' />
								) : (
									<div className='size-12 rounded bg-zinc-700 flex items-center justify-center'>
										<Music className='size-5 text-zinc-400' />
									</div>
								)}
								<div className='min-w-0 flex-1'>
									<p className='truncate font-medium'>{t.title}</p>
									<p className='truncate text-sm text-zinc-400'>{t.artists}</p>
								</div>
								<span className='hidden sm:block text-xs text-zinc-500'>
									{t.releasedYear} {formatStreams(t.streams) && `· ${formatStreams(t.streams)}`}
								</span>
							</button>
						))}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default SearchPage;
