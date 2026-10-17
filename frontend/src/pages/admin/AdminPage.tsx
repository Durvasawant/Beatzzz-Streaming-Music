import { useAuthStore } from "@/stores/useAuthStore";
import Header from "./components/Header";
import { Album, Music } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import DashboardStats from "./components/DashboardStats";
import { useEffect } from "react";
import { useMusicStore } from "@/stores/useMusicStore";

const AdminPage = () => {
	const { isAdmin, isLoading } = useAuthStore();

	const { fetchAlbums, fetchSongs, fetchStats } = useMusicStore();

	useEffect(() => {
		fetchAlbums();
		fetchSongs();
		fetchStats();
	}, [fetchAlbums, fetchSongs, fetchStats]);

	if (!isAdmin && !isLoading) return <div>Unauthorized</div>;

	return (
		<div
			className="
				relative min-h-screen text-zinc-100 p-8
				bg-gradient-to-b from-zinc-900 via-zinc-900 to-black

				/* 💚 PRIMARY GLOW (stronger bottom-left) */
				before:absolute before:inset-0
				before:bg-[radial-gradient(circle_at_20%_85%,rgba(34,197,94,0.18),transparent_60%)]

				/* 💚 SECONDARY BALANCE GLOW (top-right) */
				after:absolute after:inset-0
				after:bg-[radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.12),transparent_60%)]

				before:pointer-events-none after:pointer-events-none
			"
		>
			<Header />

			<DashboardStats />

			<Tabs defaultValue='songs' className='space-y-6'>

				{/* 💎 Enhanced Tabs */}
				<TabsList
					className="
						p-1 bg-zinc-800/60 backdrop-blur-md
						border border-zinc-700/50

						/* 💚 stronger glow */
						shadow-[0_0_15px_rgba(34,197,94,0.15),0_0_30px_rgba(34,197,94,0.05)]
					"
				>
					<TabsTrigger
						value='songs'
						className="
							data-[state=active]:bg-zinc-700
							data-[state=active]:shadow-[0_0_12px_rgba(34,197,94,0.25)]
							data-[state=active]:scale-[1.03]

							transition-all duration-200
						"
					>
						<Music className='mr-2 size-4' />
						Songs
					</TabsTrigger>

					<TabsTrigger
						value='albums'
						className="
							data-[state=active]:bg-zinc-700
							data-[state=active]:shadow-[0_0_12px_rgba(34,197,94,0.25)]
							data-[state=active]:scale-[1.03]

							transition-all duration-200
						"
					>
						<Album className='mr-2 size-4' />
						Albums
					</TabsTrigger>
				</TabsList>

				<TabsContent value='songs'>
					<SongsTabContent />
				</TabsContent>

				<TabsContent value='albums'>
					<AlbumsTabContent />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default AdminPage;