import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout";
import ChatPage from "./pages/chat/ChatPage";
import AlbumPage from "./pages/album/AlbumPage";
import SearchPage from "./pages/search/SearchPage";
import LibraryPage from "./pages/library/LibraryPage";
import SpotifyCallbackPage from "./pages/spotify-callback/SpotifyCallbackPage";


import { Toaster } from "react-hot-toast";
import AdminPage from "./pages/admin/AdminPage";


function App() {
	return (
		<>
			<Routes>
				<Route
					path='/sso-callback'
					element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"} />}
				/>
				<Route path='/auth-callback' element={<AuthCallbackPage />} />
				<Route path='/admin' element={<AdminPage/>} />
				<Route path='/spotify-callback' element={<SpotifyCallbackPage />} />

				<Route element={<MainLayout />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/chat' element={<ChatPage />} />
					<Route path='/search' element={<SearchPage />} />
					<Route path='/library' element={<LibraryPage />} />
					<Route path='/albums/:albumId' element={<AlbumPage />} />
					
				</Route>
			</Routes>
			<Toaster />
		</>
	);
}

export default App;