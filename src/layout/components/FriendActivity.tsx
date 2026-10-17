import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HeadphonesIcon, Music, Users } from "lucide-react";

import { useEffect } from "react";

function FriendActivity() {
    const { users, fetchUsers } = useChatStore();
    const { user } = useUser();

    useEffect(() => {
        if (user) fetchUsers();
    }, [fetchUsers, user]);

    const isPlaying = false;

    return (
        <div className='relative h-full bg-zinc-900 rounded-lg flex flex-col overflow-hidden'>

            {/* 🔥 ADVANCED FLOWING MUSIC WAVES */}
            <div className="pointer-events-none absolute right-0 bottom-0 h-full w-[140px] overflow-hidden">
                <svg
                    className="w-full h-full"
                    viewBox="0 0 100 400"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="waveGradient" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
                            <stop offset="50%" stopColor="#4ade80" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.9" />
                        </linearGradient>
                    </defs>

                   {/* Wave 1 */}

<path
  d="M 90 400 
     C 70 340, 85 300, 65 260 
     C 45 220, 70 200, 60 170"
  className="wave wave1"
/>

{/* 🌊 Smooth Crossing Wave 2 */}
<path
  d="M 95 400 
     C 85 350, 60 310, 80 270 
     C 100 230, 55 210, 70 170"
  className="wave wave2"
/> </svg>

                {/* ✨ FLOATING PARTICLES */}
                <div className="particle p1"></div>
                <div className="particle p2"></div>
                <div className="particle p3"></div>
                <div className="particle p4"></div>
            </div>

            {/* HEADER */}
            <div className='p-4 flex justify-between items-center border-b border-zinc-800'>
                <div className='flex items-center gap-2'>
                    <Users className='size-5 shrink-0' />
                    <h2 className='font-semibold'>What they're listening to</h2>
                </div>
            </div>

            {!user && <LoginPrompt />}

            {/* USERS */}
            <ScrollArea className='flex-1'>
                <div className='p-4 space-y-4'>
                    {users.map((user) => {
                        return (
                            <div
                                key={user._id}
                                className='cursor-pointer hover:bg-zinc-800/50 p-3 rounded-md transition-colors group'
                            >
                                <div className='flex items-start gap-3'>
                                    <div className='relative'>
                                        <Avatar className='size-10 border border-zinc-800'>
                                            <AvatarImage src={user.imageUrl} alt={user.fullName} />
                                            <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                                        </Avatar>

                                        {/* 🎵 MUSIC BARS */}
                                        <div className="absolute bottom-0 right-0 flex items-end gap-[2px] h-4">
                                            <span className="bar"></span>
                                            <span className="bar delay-1"></span>
                                            <span className="bar delay-2"></span>
                                        </div>
                                    </div>

                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-medium text-sm text-white'>{user.fullName}</span>
                                            {isPlaying && <Music className='size-3.5 text-emerald-400 shrink-0' />}
                                        </div>

                                        {isPlaying ? (
                                            <div className='mt-1'>
                                                <div className='mt-1 text-sm text-white font-medium truncate'>
                                                    Cardigan
                                                </div>
                                                <div className='text-xs text-zinc-400 truncate'>
                                                    Taylor Swift
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='mt-1 text-xs text-zinc-400'>Idle</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}

export default FriendActivity;

const LoginPrompt = () => (
    <div className='h-full flex flex-col items-center justify-center p-6 text-center space-y-4'>
        <div className='relative'>
            <div
                className='absolute -inset-1 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full blur-lg
                opacity-75 animate-pulse'
                aria-hidden='true'
            />
            <div className='relative bg-zinc-900 rounded-full p-4'>
                <HeadphonesIcon className='size-8 text-emerald-400' />
            </div>
        </div>

        <div className='space-y-2 max-w-[250px]'>
            <h3 className='text-lg font-semibold text-white'>See What Friends Are Playing</h3>
            <p className='text-sm text-zinc-400'>
                Login to discover what music your friends are enjoying right now
            </p>
        </div>
    </div>
);