import { BrowserRouter, Route, Routes } from 'react-router';
import './App.css'
import HomePage from './components/pages/home-page';
import LoginPage from './components/pages/login-page';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
