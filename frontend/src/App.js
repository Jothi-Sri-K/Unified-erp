import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import StaffManagement from './pages/StaffManagement';
import Layout from './components/Layout';

const PrivateRoute = ({ children, roles }) => {
    const { token, user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;
    if (!token) return <Navigate to="/login" />;

    if (roles && !roles.includes(user?.role)) {
        return <Navigate to="/dashboard" />; // Unauthorized
    }

    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />

                    <Route path="/inventory" element={
                        <PrivateRoute>
                            <Inventory />
                        </PrivateRoute>
                    } />

                    <Route path="/orders" element={
                        <PrivateRoute roles={['Admin', 'Manager', 'Sales', 'Warehouse']}>
                            <Orders />
                        </PrivateRoute>
                    } />

                    <Route path="/staff" element={
                        <PrivateRoute roles={['Admin']}>
                            <StaffManagement />
                        </PrivateRoute>
                    } />

                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;