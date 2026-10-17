import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

const Topbar = () => {
	const isAdmin = useAuthStore();

	return (
		<div
			className="
				relative flex items-center justify-between p-4 sticky top-0 z-10

				bg-zinc-900

				/* 💚 subtle clean depth */
				border-b border-emerald-400/10
				shadow-[0_2px_12px_rgba(0,0,0,0.6)]
			"
		>
			{/* LEFT: Logo */}
			<div className='flex items-center'>
				<img
					src="/Beatzzz.png"
					alt="Beatzzz logo"
					className="
						size-10 rounded-full object-cover

						border border-emerald-400/25
						shadow-[0_0_6px_rgba(34,197,94,0.15)]

						transition-all duration-300
						hover:shadow-[0_0_10px_rgba(34,197,94,0.25)]
						hover:scale-[1.03]
					"
				/>
			</div>

			{/* CENTER: Title */}
			<div className='absolute left-1/2 -translate-x-1/2'>
				<h1 className="beatzzz-text text-3xl font-semibold tracking-[3px]">
					Beatzzz
				</h1>
			</div>

			{/* RIGHT */}
			<div className='flex items-center gap-4'>
				{isAdmin && (
					<Link
						to={"/admin"}
						className={cn(
							buttonVariants({ variant: "outline" }),
							`
							border-emerald-400/20
							text-emerald-300

							hover:border-emerald-400/40
							hover:bg-emerald-400/5
							hover:text-emerald-200

							transition-all duration-200
						`
						)}
					>
						<LayoutDashboardIcon className='size-4 mr-2' />
						Admin Dashboard
					</Link>
				)}

				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>

				<UserButton />
			</div>
		</div>
	);
};

export default Topbar;