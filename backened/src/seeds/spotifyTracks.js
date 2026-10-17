// Imports data/spotify-2023.csv into the "tracks" collection.
// Only touches "tracks" - your songs, albums and users are left alone.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Track } from "../models/track.model.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, "../../data/spotify-2023.csv");

const num = (v) => {
	const n = Number(v);
	return v !== undefined && v !== "" && Number.isFinite(n) ? n : null;
};

const seed = async () => {
	try {
		if (!process.env.MONGO_URI || process.env.MONGO_URI.includes("<")) {
			throw new Error("MONGO_URI is missing in backened/.env");
		}
		await mongoose.connect(process.env.MONGO_URI);

		// The file is Latin-1 and some accented letters are already destroyed ("ï¿½" / "ý"); strip that junk.
		const text = fs.readFileSync(CSV_PATH, "latin1").replace(/[\u00ef\u00bf\u00bd\u00fd]+/g, "");
		const rows = parse(text, { columns: true, skip_empty_lines: true, relax_column_count: true });

		const docs = rows
			.filter((r) => /[A-Za-z0-9]/.test(r.track_name) && r["artist(s)_name"]) // skips 2 rows whose titles are unreadable
			.map((r) => ({
				name: r.track_name.trim(),
				artists: r["artist(s)_name"].trim(),
				firstArtist: r["artist(s)_name"].split(",")[0].trim(),
				releasedYear: num(r.released_year),
				streams: num(r.streams), // one row in this dataset has a broken value -> null
				bpm: num(r.bpm),
				key: r.key || null,
				mode: r.mode || null,
				danceability: num(r["danceability_%"]),
				energy: num(r["energy_%"]),
				valence: num(r["valence_%"]),
			}));

		await Track.deleteMany({});
		await Track.insertMany(docs);
		console.log(`Imported ${docs.length} of ${rows.length} rows into MongoDB (rows with unreadable titles are skipped).`);
	} catch (error) {
		console.error("Import failed:", error.message);
		process.exitCode = 1;
	} finally {
		await mongoose.connection.close();
	}
};

seed();
