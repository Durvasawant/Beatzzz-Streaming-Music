import { useCallback, useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { axiosInstance } from "@/lib/axios";
import { PLACEHOLDER_COVER, trackToSong, type TrackResult } from "@/lib/tracks";
import { usePlayerStore } from "@/stores/usePlayerStore";
import type { Song } from "@/types";

const PAGE = 50;
const fmt = (s: number) => (s ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "");

// "Spotify Top Hits" = all imported songs. "Beatzzz Originals" = the songs you uploaded.
const LibraryPage = () => {
	const [tab, setTab] = useState<"spotify" | "originals">("spotify");
	const [spotifySongs, setSpotifySongs] = useState<Song[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [originals, setOriginals] = useState<Song[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

	const loadMore = useCallback(async () => {
		setLoading(true);
		try {
			const { data } = await axiosInstance.get("/tracks", { params: { page: page + 1, limit: PAGE } });
			setSpotifySongs((prev) => [...prev, ...(data.tracks as TrackResult[]).map(trackToSong)]);
			setTotal(data.total);
			setPage(page + 1);
		} catch (e: any) {
			setError(e.response?.data?.message ?? e.message);
		} finally {
			setLoading(false);
		}
	}, [page]);

	useEffect(() => {
		loadMore();
		axiosInstance.get("/songs/library").then((r) => setOriginals(r.data)).catch(() => {});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const songs = tab === "spotify" ? spotifySongs : originals;
	const playingHere = isPlaying && songs.some((s) => s._id === currentSong?._id);

	const handlePlayAll = () => {
		if (playingHere) togglePlay();
		else playAlbum(songs, 0);
	};

	return (
		<div className='h-full rounded-lg bg-gradient-to-b from-emerald-900/50 via-zinc-900 to-zinc-900'>
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-6 space-y-5'>
					<div>
						<p className='text-sm font-medium'>Playlist</p>
						<h1 className='text-4xl sm:text-5xl font-bold my-2'>{tab === "spotify" ? "Spotify Top Hits" : "Beatzzz Originals"}</h1>
						<p className='text-sm text-zinc-300'>
							{tab === "spotify" ? `${total || spotifySongs.length} songs` : `${originals.length} songs`}
						</p>
					</div>

					<div className='flex items-center gap-4'>
						<Button
							onClick={handlePlayAll}
							disabled={songs.length === 0}
							size='icon'
							className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 hover:scale-105 transition-all'
						>
							{playingHere ? <Pause className='h-7 w-7 text-black' /> : <Play className='h-7 w-7 text-black' />}
						</Button>
						{(["spotify", "originals"] as const).map((t) => (
							<Button
								key={t}
								variant={tab === t ? "secondary" : "ghost"}
								onClick={() => setTab(t)}
								className='rounded-full'
							>
								{t === "spotify" ? "Spotify Top Hits" : "Beatzzz Originals"}
							</Button>
						))}
					</div>

					{error && <p className='text-sm text-amber-400'>{error}</p>}

					<div className='space-y-1'>
						{songs.map((song, i) => {
							const isCurrent = currentSong?._id === song._id;
							return (
								<div
									key={song._id}
									onClick={() => (isCurrent ? togglePlay() : playAlbum(songs, i))}
									className='grid grid-cols-[24px_1fr_48px] gap-4 items-center px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer group text-sm text-zinc-400'
								>
									<div className='text-center'>
										{isCurrent && isPlaying ? (
											<Pause className='h-4 w-4 text-green-500' />
										) : (
											<>
												<span className='group-hover:hidden'>{i + 1}</span>
												<Play className='h-4 w-4 hidden group-hover:block' />
											</>
										)}
									</div>
									<div className='flex items-center gap-3 min-w-0'>
										<img src={song.imageUrl || PLACEHOLDER_COVER} alt='' className='size-10 rounded object-cover' />
										<div className='min-w-0'>
											<p className={`truncate font-medium ${isCurrent ? "text-green-400" : "text-white"}`}>{song.title}</p>
											<p className='truncate'>{song.artist}</p>
										</div>
									</div>
									<div>{fmt(song.duration)}</div>
								</div>
							);
						})}
					</div>

					{tab === "spotify" && spotifySongs.length < total && (
						<Button variant='outline' onClick={loadMore} disabled={loading}>
							{loading ? "Loading..." : `Load more (${spotifySongs.length} of ${total})`}
						</Button>
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

export default LibraryPage;
