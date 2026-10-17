import type { Song } from "@/types";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

const PlayButton = ({ song }: { song: Song }) => {
  const { setcurrentSong, currentSong, isPlaying, togglePlay } = usePlayerStore();

  const isCurrentSong = currentSong?._id === song._id;

  const handlePlay = () => {
    if (isCurrentSong) togglePlay();
    else setcurrentSong(song);
  };

  return (
    <Button
      size="icon"
      onClick={handlePlay}
      className={`
        absolute bottom-3 right-2

        /* 💎 glassy + gradient */
        bg-gradient-to-br from-emerald-400/90 to-green-600/90
        backdrop-blur-md
        border border-emerald-300/30

        /* ✨ layered glow */
        shadow-[0_0_10px_rgba(34,197,94,0.5),0_0_25px_rgba(34,197,94,0.2)]

        /* 🎧 smooth motion */
        transition-all duration-300 ease-out
        hover:scale-110 
        hover:shadow-[0_0_18px_rgba(34,197,94,0.9),0_0_35px_rgba(34,197,94,0.4)]

        active:scale-95

        /* 🎵 entry animation */
        opacity-0 translate-y-3
        group-hover:opacity-100 group-hover:translate-y-0

        /* keep visible when playing */
        ${isCurrentSong ? "opacity-100 translate-y-0" : ""}

        /* 🟢 custom pulse */
        ${isCurrentSong && isPlaying ? "play-pulse" : ""}
      `}
    >
      {isCurrentSong && isPlaying ? (
        <Pause className="size-5 text-black drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]" />
      ) : (
        <Play className="size-5 text-black ml-[1px] drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]" />
      )}
    </Button>
  );
};

export default PlayButton;