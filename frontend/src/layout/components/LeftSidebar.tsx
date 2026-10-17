import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton"
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { SignedIn } from "@clerk/clerk-react";
import { HomeIcon, Library, Music2, Search, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const LeftSidebar = () => {
	const { albums, fetchAlbums, isLoading } = useMusicStore();

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	return (
		<div className='relative h-full flex flex-col gap-2 overflow-hidden'>

			{/* 🌊 LEFT WAVES + DOTS */}
			<div className="pointer-events-none absolute left-0 bottom-0 h-full w-[140px] overflow-hidden">
				<svg viewBox="0 0 100 500" className="w-full h-full">
					<defs>
						<linearGradient id="leftWave" x1="0" y1="1" x2="0" y2="0">
							<stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
							<stop offset="40%" stopColor="#4ade80" />
							<stop offset="80%" stopColor="#22c55e" />
							<stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
						</linearGradient>
					</defs>

					{/* 🌊 TRUE bottom-left start */}
					<path
						d="M 0 500 
						   C 0 420, 40 360, 30 300 
						   S 20 240, 50 200"
						className="left-wave wave1"
					/>

					{/* 🌊 crossing wave */}
					<path
						d="M 0 500 
						   C 20 430, 60 380, 20 310 
						   S 70 260, 40 210"
						className="left-wave wave2"
					/>
				</svg>

				{/* 🟢 GLOW DOTS */}
				<div className="dot d1"></div>
				<div className="dot d2"></div>
				<div className="dot d3"></div>
				<div className="dot d4"></div>
				<div className="dot d4"></div>
				<div className="dot d6"></div>
				<div className="dot d7"></div>
			</div>

			{/* Navigation menu */}
			<div className='rounded-lg bg-zinc-900 p-4'>
				<div className='space-y-2'>
					<Link
						to={"/"}
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<HomeIcon className='mr-2 size-5' />
						<span className='hidden md:inline'>Home</span>
					</Link>

					<Link
						to={"/search"}
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<Search className='mr-2 size-5' />
						<span className='hidden md:inline'>Search</span>
					</Link>

					<SignedIn>
						<Link
							to={"/chat"}
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full justify-start text-white hover:bg-zinc-800",
								})
							)}
						>
							<TrendingUp className='mr-2 size-5' />
							<span className='hidden md:inline'>Share Trending Songs</span>
						</Link>
					</SignedIn>
				</div>
			</div>

			{/* Library section */}
			<div className='flex-1 rounded-lg bg-zinc-900 p-4'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center text-white px-2'>
						<Library className='size-5 mr-2' />
						<span className='hidden md:inline'>Playlists</span>
					</div>
				</div>

				<ScrollArea className='h-[calc(100vh-300px)]'>
					<div className='space-y-2'>
						<Link
							to='/library'
							className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
						>
							<div className='size-12 rounded-md shrink-0 bg-gradient-to-br from-emerald-400 to-green-700 flex items-center justify-center'>
								<Music2 className='size-5 text-black' />
							</div>
							<div className='flex-1 min-w-0 hidden md:block'>
								<p className='font-medium truncate'>Spotify Top Hits</p>
								<p className='text-sm text-zinc-400 truncate'>Playlist • all songs</p>
							</div>
						</Link>
						{isLoading ? (
							<PlaylistSkeleton />
						) : (
							albums.map((album) => (
								<Link
									to={`/albums/${album._id}`}
									key={album._id}
									className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
								>
									<img
										src={album.imageUrl}
										alt='Playlist img'
										className='size-12 rounded-md shrink-0 object-cover'
									/>

									<div className='flex-1 min-w-0 hidden md:block'>
										<p className='font-medium truncate'>{album.title}</p>
										<p className='text-sm text-zinc-400 truncate'>
											Album • {album.artist}
										</p>
									</div>
								</Link>
							))
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default LeftSidebar;