import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Items from './pages/Items.jsx'
import ItemForm from './pages/ItemForm.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Sidebar from './components/Sidebar.jsx'

export default function App() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />

      {/* min-w-0 lets the content shrink next to the sidebar instead of overflowing */}
      <main className="flex-1 min-w-0">
        <div className="container py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/items" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/items" element={<Items />} />
            <Route path="/items/new" element={
              <ProtectedRoute><ItemForm /></ProtectedRoute>
            } />
            <Route path="/items/:id" element={
              <ProtectedRoute><ItemForm /></ProtectedRoute>
            } />
            <Route path="*" element={<div>Not Found</div>} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
