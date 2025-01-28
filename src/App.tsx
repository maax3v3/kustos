import './App.css'
import { useNeedsAuth } from './hooks/needs-auth';

function App() {
    const needsAuth = useNeedsAuth();

    return (
        <>
            {needsAuth ? "needs auth" : "no needs auth"}
        </>
    )
}

export default App
