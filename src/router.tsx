import { BrowserRouter, Route, Routes } from "react-router";
import HomePage from "./components/pages/home-page";
import LoginPage from "./components/pages/login-page";
import MainLayout from "./components/layouts/main-layout";
import RepositoryPage from "./components/pages/repository-page";
import TagPage from "./components/pages/tag-page";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/repositories/:repository" element={<RepositoryPage />} />
                    <Route path="/repositories/:repository/tags/:tag" element={<TagPage />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    )
}