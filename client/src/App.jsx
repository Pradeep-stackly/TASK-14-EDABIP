import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Dashboard /> : <Login />;
}

export default App;
