import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/authStore"
import Login from "./pages/Login"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Alerts from "./pages/Alerts"
import Transactions from "./pages/Transactions"
import Rules from "./pages/Rules"
import Simulator from "./pages/Simulator"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="rules" element={<Rules />} />
        <Route path="simulator" element={<Simulator />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
