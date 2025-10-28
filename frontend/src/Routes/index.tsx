import { Route, Routes, Navigate } from "react-router-dom";
import { Chat, EditProfile, GroupChat, Home, Login, Register } from "../Pages";
import { ProtectedRoute } from "../Shared/Components";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            
            <Route path='/login' element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
            <Route path='/registro' element={<ProtectedRoute requireAuth={false}><Register /></ProtectedRoute>} />

            <Route path='/chat' element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path='/perfil' element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path='/grupos' element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />

            <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
    )
}