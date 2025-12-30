import React, { useState, useEffect, createContext, useContext } from 'react';

// Layout & Dashboard (root level)
import Layout from "./Layout.jsx";
import Dashboard from "./Dashboard";
import Notifications from "./Notifications";
import GovernmentSearch from "./GovernmentSearch";

// Auth pages
import Login from "./auth/Login";

// Contract pages
import Current from "./contracts/Current";
import Contracts from "./contracts/Contracts";
import ContractCreate from "./contracts/ContractCreate";
import ContractDetail from "./contracts/ContractDetail";
import SignContract from "./contracts/SignContract";
import SigningRequests from "./contracts/SigningRequests";
import SigningRequestDetail from "./contracts/SigningRequestDetail";

// Template pages
import Templates from "./templates/Templates";
import TemplateBuilder from "./templates/TemplateBuilder";
import TemplateDetail from "./templates/TemplateDetail";
import BlueprintGallery from "./templates/BlueprintGallery";

// Analytics pages
import Analytics from "./analytics/Analytics";
import PlatformAnalytics from "./analytics/PlatformAnalytics";

// Settings pages
import Settings from "./settings/Settings";
import UserManagement from "./settings/UserManagement";
import APIKeys from "./settings/APIKeys";
import AuditLogs from "./settings/AuditLogs";
import PlatformAuditLogs from "./settings/PlatformAuditLogs";
import Billing from "./settings/Billing";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { getCurrentUser, logout as logoutUser, isAuthenticated } from '@/utils/userStorage';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { clientsApi } from '@/services/api';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

const PAGES = {
    Dashboard: Dashboard,
    Current: Current,
    Contracts: Contracts,
    ContractCreate: ContractCreate,
    ContractDetail: ContractDetail,
    SigningRequests: SigningRequests,
    Templates: Templates,
    TemplateBuilder: TemplateBuilder,
    SignContract: SignContract,
    Analytics: Analytics,
    Notifications: Notifications,
    Settings: Settings,
    UserManagement: UserManagement,
    TemplateDetail: TemplateDetail,
    SigningRequestDetail: SigningRequestDetail,
    APIKeys: APIKeys,
    AuditLogs: AuditLogs,
    Billing: Billing,
    GovernmentSearch: GovernmentSearch,
    PlatformAnalytics: PlatformAnalytics,
    PlatformAuditLogs: PlatformAuditLogs,
    BlueprintGallery: BlueprintGallery,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Protected Route Component
function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

// Main content with authentication
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    const { user, handleLogout, selectedClient, handleClientSelect, handleBackToPlatform, isPlatformAdmin } = useAuth();

    // If on login page and already authenticated, redirect based on selectedClient
    if (location.pathname === '/login' && user) {
        return <Navigate to="/" replace />;
    }

    // If not on login page and not authenticated, redirect to login
    if (location.pathname !== '/login' && !user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Routes>
            <Route path="/login" element={<Login onLogin={(user) => window.location.reload()} />} />

            <Route path="/" element={
                <ProtectedRoute>
                    {selectedClient ? (
                        <Navigate to="/Dashboard" replace />
                    ) : (
                        <Navigate to="/PlatformAnalytics" replace />
                    )}
                </ProtectedRoute>
            } />

            <Route path="/Dashboard" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <Dashboard selectedClient={selectedClient} />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Current" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <Current />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Contracts" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <Contracts />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/ContractCreate" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <ContractCreate />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/ContractDetail" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <ContractDetail />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/SigningRequests" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <SigningRequests />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Templates" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <Templates />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/TemplateBuilder" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <TemplateBuilder />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/SignContract" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <SignContract />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Analytics" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <Analytics />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Notifications" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <Notifications />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Settings" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <Settings />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/UserManagement" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <UserManagement />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/TemplateDetail" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <TemplateDetail />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/SigningRequestDetail" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <SigningRequestDetail />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/APIKeys" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <APIKeys />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/AuditLogs" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <AuditLogs />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/Billing" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <Billing />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/GovernmentSearch" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <GovernmentSearch />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/PlatformAnalytics" element={
                <ProtectedRoute>
                    {/* Only platform admins can access - redirect clients to Dashboard */}
                    {!isPlatformAdmin ? (
                        <Navigate to="/Dashboard" replace />
                    ) : (
                        <Layout
                            currentPageName={currentPage}
                            user={user}
                            onLogout={handleLogout}
                            selectedClient={selectedClient}
                            onClientSelect={handleClientSelect}
                            onBackToPlatform={handleBackToPlatform}
                        >
                            <PlatformAnalytics />
                        </Layout>
                    )}
                </ProtectedRoute>
            } />

            <Route path="/PlatformAuditLogs" element={
                <ProtectedRoute>
                    {/* Only platform admins can access - redirect clients to Dashboard */}
                    {!isPlatformAdmin ? (
                        <Navigate to="/Dashboard" replace />
                    ) : (
                        <Layout
                            currentPageName={currentPage}
                            user={user}
                            onLogout={handleLogout}
                            selectedClient={selectedClient}
                            onClientSelect={handleClientSelect}
                            onBackToPlatform={handleBackToPlatform}
                        >
                            <PlatformAuditLogs />
                        </Layout>
                    )}
                </ProtectedRoute>
            } />

            <Route path="/BlueprintGallery" element={
                <ProtectedRoute>
                    <Layout
                        currentPageName={currentPage}
                        user={user}
                        onLogout={handleLogout}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                        onBackToPlatform={handleBackToPlatform}
                    >
                        <BlueprintGallery />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default function Pages() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        const initializeAuth = async () => {
            // Check for existing session
            const currentUser = getCurrentUser();
            setUser(currentUser);

            if (currentUser) {
                // If user has a clientId (is a client user), auto-set their client
                if (currentUser.clientId) {
                    try {
                        const clients = await clientsApi.getAll();
                        const userClient = clients.find(c => c.id === currentUser.clientId);
                        if (userClient) {
                            setSelectedClient(userClient);
                            localStorage.setItem('selectedClient', JSON.stringify(userClient));
                        }
                    } catch (error) {
                        console.error('Failed to fetch client:', error);
                        // Fallback: create a minimal client object from user data
                        const fallbackClient = { id: currentUser.clientId, name: 'Client' };
                        setSelectedClient(fallbackClient);
                    }
                } else {
                    // Root/platform admin - restore selected client from localStorage if any
                    const savedClient = localStorage.getItem('selectedClient');
                    if (savedClient) {
                        try {
                            setSelectedClient(JSON.parse(savedClient));
                        } catch (e) {
                            localStorage.removeItem('selectedClient');
                        }
                    }
                }
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        logoutUser();
        setUser(null);
        setSelectedClient(null);
        // Clear selected client on logout
        localStorage.removeItem('selectedClient');
        window.location.href = '/login';
    };

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        // Save to localStorage for persistence
        localStorage.setItem('selectedClient', JSON.stringify(client));
        // Navigate to Dashboard when client is selected
        window.location.href = '/Dashboard';
    };

    const handleBackToPlatform = () => {
        // Only allow root/platform users to go back to platform view
        if (user?.clientId) {
            // Client users cannot go back to platform - they stay in their client context
            return;
        }
        setSelectedClient(null);
        // Clear from localStorage
        localStorage.removeItem('selectedClient');
        // Navigate to PlatformAnalytics when going back to platform
        window.location.href = '/PlatformAnalytics';
    };

    // Check if user is a platform admin (no clientId)
    const isPlatformAdmin = user && !user.clientId;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <LanguageProvider>
            <AuthContext.Provider value={{
                user,
                handleLogin,
                handleLogout,
                selectedClient,
                handleClientSelect,
                handleBackToPlatform,
                isPlatformAdmin
            }}>
                <Router>
                    <PagesContent />
                </Router>
            </AuthContext.Provider>
        </LanguageProvider>
    );
}
