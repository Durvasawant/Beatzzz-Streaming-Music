import mongoose from "mongoose";

export const connectDB = async () => {
	const uri = process.env.MONGO_URI;

	if (!uri || uri.includes("<")) {
		console.error("\nMONGO_URI is missing or still a placeholder in backened/.env");
		console.error("See README.md -> 'Database setup' for the two-minute fix.\n");
		process.exit(1);
	}

	try {
		const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
		console.log(`Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
	} catch (error) {
		console.error("\nCould not connect to MongoDB:", error.message);
		console.error("Common causes:");
		console.error("  1. Atlas: your IP is not in Network Access (add 0.0.0.0/0 for development)");
		console.error("  2. Wrong username/password (special characters must be URL-encoded)");
		console.error("  3. The cluster was paused or deleted -> create a new one");
		console.error("  4. Local Mongo: the mongod service/container is not running\n");
		process.exit(1);
	}
};

export default connectDB;
