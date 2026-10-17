import { Track } from "../models/track.model.js";
import { findTrack, spotifyConfigured } from "../lib/spotify.js";

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toClient = (t) => ({
	_id: t._id,
	title: t.spotifyName || t.name,
	artists: t.spotifyArtists || t.artists,
	releasedYear: t.releasedYear,
	streams: t.streams,
	coverUrl: t.coverUrl || null,
	spotifyId: t.spotifyId || null,
	spotifyUrl: t.spotifyUrl || null,
});

// GET /api/tracks/search?q=blinding
export const searchTracks = async (req, res, next) => {
	try {
		const q = String(req.query.q || "").trim();
		if (q.length < 2) return res.json({ tracks: [], spotify: spotifyConfigured() });

		// 1) find it in OUR database (the 953 imported songs)
		const rx = new RegExp(escapeRegExp(q), "i");
		const tracks = await Track.find({ $or: [{ name: rx }, { artists: rx }] })
			.sort({ streams: -1 })
			.limit(10);

		// 2) ask Spotify for each match we have not looked up yet, then remember the answer in MongoDB
		let spotifyError = null;
		if (spotifyConfigured()) {
			await Promise.all(
				tracks.map(async (t) => {
					if (t.spotifyChecked || spotifyError) return;
					try {
						const found = await findTrack(t.name, t.firstArtist);
						if (found) Object.assign(t, found);
						t.spotifyChecked = true;
						await t.save();
					} catch (err) {
						spotifyError = err.message;
					}
				})
			);
			if (spotifyError) console.error("[spotify]", spotifyError);
		}

		res.json({
			tracks: tracks.map(toClient),
			spotify: spotifyConfigured() && !spotifyError,
			spotifyError,
		});
	} catch (error) {
		next(error);
	}
};
