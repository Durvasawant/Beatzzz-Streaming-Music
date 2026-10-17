// The bottom bar (PlaybackControls) calls these; AudioPlayer fills them in
// depending on whether the current song is an audio file or a Spotify track.
export const playerControls = {
	seek: (_seconds: number) => {},
	setVolume: (_percent: number) => {},
};
