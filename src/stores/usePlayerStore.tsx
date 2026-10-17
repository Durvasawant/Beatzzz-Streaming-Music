import {create} from 'zustand';
import type { Song } from '../types';

interface PlayerStore {
  
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;

  initializeQueue: (songs: Song[], startIndex?: number) => void;
  playAlbum: (songs: Song[], startIndex?: number) => void;
  setcurrentSong: (song: Song | null) => void;
  togglePlay: () => void;
  playPrevious: () => void;
  playNext: () => void;
}
export const usePlayerStore = create<PlayerStore>((set,get) => ({
currentSong: null,
isPlaying: false,
queue: [],
currentIndex: -1,
initializeQueue: (songs:Song[]): void => {
    set({
        queue: songs,
        currentSong:get().currentSong || songs[0],
        currentIndex:get().currentIndex===-1 ? 0 : get().currentIndex})

},

playAlbum: (songs: Song[], startIndex=0 ): void => {
    if(songs.length === 0) return;
    set({
        queue: songs,
        currentSong: songs[startIndex],
        currentIndex: startIndex,
        isPlaying: true,
    })
},
setcurrentSong: (song: Song | null): void => {
    if(!song) return;
    const songIndex = get().queue.findIndex((s) => s._id === song._id);
    set({
        currentSong: song,
        currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
        isPlaying: true,
    })

},
togglePlay: (): void => {
    const willstartPlaying = !get().isPlaying;
    set({ isPlaying: willstartPlaying });
},
playPrevious: (): void => {
    const { currentIndex, queue } = get();
   const nextIndex = currentIndex-1
   //if there is a next sonf to play then kets play it
    if(nextIndex < queue.length){
        const nextSong = queue[nextIndex]
        set({currentSong:nextSong,
            currentIndex:nextIndex,
            isPlaying:true});
    }else{
        //no next song
        set({isPlaying:false})
    }
},
playNext: (): void => {

    const { currentIndex, queue } = get();
    const previousIndex = currentIndex+ 1;
/// if there is a previous song to play
    if (previousIndex >= 0) {
        const previousSong = queue[previousIndex];
        set({
            currentSong: previousSong,
            currentIndex: previousIndex,
            isPlaying: true,
        });
    } else {
        /// no previous song to play
        set({ isPlaying: false });
    }
},
}));

export default usePlayerStore;