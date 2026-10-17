// OPTIONAL one-time job: asks Spotify about every imported song so all of them
// get a cover image and a playable id up front. Safe to stop (Ctrl+C) and run again - it resumes.
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Track } from "../models/track.model.js";
import { findTrack, spotifyConfigured } from "../lib/spotify.js";

dotenv.config();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const run = async () => {
	try {
		if (!process.env.MONGO_URI || process.env.MONGO_URI.includes("<")) throw new Error("MONGO_URI is missing in backened/.env");
		if (!spotifyConfigured()) throw new Error("SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET are missing in backened/.env");
		await mongoose.connect(process.env.MONGO_URI);

		const todo = await Track.find({ spotifyChecked: { $ne: true } });
		console.log(`${todo.length} songs still to look up on Spotify...`);
		let done = 0;

		for (const t of todo) {
			for (let attempt = 0; attempt < 5; attempt++) {
				try {
					const found = await findTrack(t.name, t.firstArtist);
					if (found) Object.assign(t, found);
					t.spotifyChecked = true;
					await t.save();
					done++;
					break;
				} catch (err) {
					if (err.fatal) throw err;
					if (err.retryAfter) {
						console.log(`Rate limited, waiting ${err.retryAfter}s...`);
						await sleep(err.retryAfter * 1000);
					} else {
						throw err;
					}
				}
			}
			if (done % 25 === 0) console.log(`${done}/${todo.length} done`);
			await sleep(300);
		}
		console.log(`Finished. ${done} songs looked up.`);
	} catch (error) {
		console.error("Enrich failed:", error.message);
		process.exitCode = 1;
	} finally {
		await mongoose.connection.close();
	}
};

run();
