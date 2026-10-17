import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import FriendActivity from "./components/FriendActivity";
import AudioPlayer from "./components/AudioPlayer";
import PlaybackControls from "./components/PlaybackControls";
import { useEffect, useState } from "react";

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<div
			className="
				relative h-screen text-white flex flex-col overflow-hidden

				/* 🎧 base */
				bg-black

				/* 💚 LEFT GLOW */
				before:absolute before:inset-0
				before:bg-[radial-gradient(circle_at_10%_80%,rgba(34,197,94,0.18),transparent_60%)]

				/* 💚 RIGHT GLOW */
				after:absolute after:inset-0
				after:bg-[radial-gradient(circle_at_90%_20%,rgba(34,197,94,0.14),transparent_60%)]

				before:pointer-events-none after:pointer-events-none
			"
		>
			<ResizablePanelGroup
				orientation='horizontal'
				className='flex-1 flex h-full overflow-hidden p-2'
			>
				<AudioPlayer />

				{/* left sidebar */}
				<ResizablePanel
					defaultSize={500}
					minSize={isMobile ? 0 : 10}
					maxSize={isMobile ? 0 : 300}
					className="relative"
				>
					<LeftSidebar />
				</ResizablePanel>

				{/* 💎 glowing divider */}
				<ResizableHandle
					className="
						w-2 rounded-lg transition-all
						bg-zinc-900

						/* 💚 subtle glow */
						shadow-[0_0_8px_rgba(34,197,94,0.2)]
						hover:shadow-[0_0_12px_rgba(34,197,94,0.4)]
					"
				/>

				{/* Main content */}
				<ResizablePanel className="relative">
					<Outlet />
				</ResizablePanel>

				{/* right sidebar */}
				<ResizablePanel
					defaultSize={20}
					minSize={250}
					maxSize={isMobile ? 0 : 250}
					className="relative"
				>
					<FriendActivity />
				</ResizablePanel>
			</ResizablePanelGroup>

			{/* 💚 subtle glow behind player */}
			<div className="relative">
				<PlaybackControls />
				<div className="absolute inset-0 pointer-events-none shadow-[0_-10px_40px_rgba(34,197,94,0.15)]" />
			</div>
		</div>
	);
};

export default MainLayout;