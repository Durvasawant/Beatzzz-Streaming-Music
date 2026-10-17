import mongoose from "mongoose";

// One row of the Spotify dataset (spotify-2023.csv).
// The spotify* fields start empty and are filled in the first time a track is searched.
const trackSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		artists: { type: String, required: true }, // "Latto, Jung Kook"
		firstArtist: { type: String, required: true },
		releasedYear: Number,
		streams: Number,
		bpm: Number,
		key: String,
		mode: String,
		danceability: Number,
		energy: Number,
		valence: Number,

		spotifyId: String,
		spotifyName: String,
		spotifyArtists: String,
		coverUrl: String,
		spotifyUrl: String,
		spotifyChecked: { type: Boolean, default: false }, // true = we asked Spotify already
	},
	{ timestamps: true }
);

export const Track = mongoose.model("Track", trackSchema);
