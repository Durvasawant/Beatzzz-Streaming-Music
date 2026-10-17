import { create } from "zustand";
import type { Song } from "../types";

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;
	currentTime: number; // seconds
	duration: number; // seconds

	initializeQueue: (songs: Song[], startIndex?: number) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setcurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playPrevious: () => void;
	playNext: () => void;
	updateSong: (id: string, patch: Partial<Song>) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,
	currentTime: 0,
	duration: 0,

	initializeQueue: (songs: Song[]): void => {
		set({
			queue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},

	playAlbum: (songs: Song[], startIndex = 0): void => {
		if (songs.length === 0) return;
		set({
			queue: songs,
			currentSong: songs[startIndex],
			currentIndex: startIndex,
			isPlaying: true,
			currentTime: 0,
			duration: 0,
		});
	},

	setcurrentSong: (song: Song | null): void => {
		if (!song) return;
		const songIndex = get().queue.findIndex((s) => s._id === song._id);
		set({
			currentSong: song,
			currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
			isPlaying: true,
			currentTime: 0,
			duration: 0,
		});
	},

	togglePlay: (): void => {
		set({ isPlaying: !get().isPlaying });
	},

	playPrevious: (): void => {
		const { currentIndex, queue } = get();
		const prev = currentIndex - 1;
		if (prev >= 0 && queue[prev]) {
			set({ currentSong: queue[prev], currentIndex: prev, isPlaying: true, currentTime: 0, duration: 0 });
		}
	},

	playNext: (): void => {
		const { currentIndex, queue } = get();
		const next = currentIndex + 1;
		if (next < queue.length) {
			set({ currentSong: queue[next], currentIndex: next, isPlaying: true, currentTime: 0, duration: 0 });
		} else {
			set({ isPlaying: false }); // end of the queue
		}
	},

	// e.g. after Spotify lookup finds the cover / id of the song that is playing
	updateSong: (id, patch) => {
		set((s) => ({
			currentSong: s.currentSong?._id === id ? { ...s.currentSong, ...patch } : s.currentSong,
			queue: s.queue.map((x) => (x._id === id ? { ...x, ...patch } : x)),
		}));
	},
}));

export default usePlayerStore;
