import { Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"

import Sidebar from "./components/common/Sidebar"

// pages
import HomePage from "./pages/home/HomePage"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import LoginPage from "./pages/auth/login/LoginPage"
import NotificationPage from "./pages/notification/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"

function App() {
	return (
		<div className="flex max-w-6xl mx-auto">
			<Sidebar />

			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/signup" element={<SignUpPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/notifications" element={<NotificationPage />} />
				<Route path="/profile/:username" element={<ProfilePage />} />
			</Routes>

			<Toaster />
		</div>
	)
}

export default App
