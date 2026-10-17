# Beatzzz – Music Streaming App

Beatzzz is a full-stack music streaming application designed to provide an interactive music discovery, search, and playback experience. It combines a React-based frontend with a Node.js backend and MongoDB database, along with Spotify integration for music search and playback features.

## Features

- **Music Streaming Interface** – Browse and interact with music through a modern user interface.
- **Music Search** – Search for tracks and explore available music.
- **Spotify Integration** – Connect your Spotify account using Spotify OAuth.
- **Audio Player** – Integrated bottom player with playback controls.
- **Music Library** – Access and explore the music library.
- **MongoDB Database** – Store track and application data.
- **Responsive Interface** – Navigate music discovery and playback through the React frontend.

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose

**Integrations**
- Spotify Web API
- Spotify OAuth 2.0

## Project Structure

```text
Beatzzz-Streaming-Music/
├── backened/
│   ├── data/
│   ├── src/
│   │   ├── controller/
│   │   ├── lib/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seeds/
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── layout/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Prerequisites

Before running Beatzzz, install:

- [Node.js](https://nodejs.org/)
- npm
- A MongoDB database, such as [MongoDB Atlas](https://www.mongodb.com/atlas)
- A Spotify Developer account for Spotify integration

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Durvasawant/Beatzzz-Streaming-Music.git
cd Beatzzz-Streaming-Music
```

### 2. Configure the Backend

```bash
cd backened
npm install
```

Create a `.env` file inside the `backened/` directory using `.env.example` as a reference.

Configure the required environment variables:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

Add any other variables required by the backend configuration. Never commit your `.env` file or expose API secrets.

### 3. Configure Spotify

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
2. Create or select your Spotify application.
3. Copy the Client ID and Client Secret into `backened/.env`.
4. Add the following Redirect URI to your Spotify application settings:

```text
http://127.0.0.1:5001/api/spotify/callback
```

5. Save the configuration.

The redirect URI must match the URI configured in the backend OAuth implementation.

### 4. Start the Backend

From the `backened/` directory, run:

```bash
npm run dev
```

The backend is configured to use port `5001` by default.

### 5. Start the Frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Using Beatzzz

1. Open the application in your browser.
2. Explore the music library and search for tracks.
3. Select **Connect Spotify** to authorize your Spotify account.
4. Approve the requested permissions.
5. Select a track and use the bottom player to control playback.

Spotify playback availability depends on the implemented playback method, account eligibility, and Spotify's current API restrictions. Certain playback features may require a Spotify Premium subscription.

## Environment Variables

Keep credentials in `backened/.env` and never commit them to GitHub.

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `NODE_ENV` | Application environment |
| `MONGO_URI` | MongoDB connection string |
| `SPOTIFY_CLIENT_ID` | Spotify application identifier |
| `SPOTIFY_CLIENT_SECRET` | Spotify application secret |

Refer to `.env.example` for the complete list of variables required by your version.

## Development

Run the frontend and backend in separate terminals during local development. Check the terminal logs if the application cannot connect to MongoDB, Spotify OAuth fails, or playback does not start.

## Future Enhancements

- Personalized playlists and recommendations
- Improved music discovery
- Track and artist information
- Enhanced playback queue management
- Listening history and favorites
- User interface and accessibility improvements

## Contributors

- **Dhanya Manam**
- **Durva Sawant**

