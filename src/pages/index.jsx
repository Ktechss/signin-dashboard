import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Contracts from "./Contracts";

import ContractDetail from "./ContractDetail";

import Journeys from "./Journeys";

import Templates from "./Templates";

import TemplateBuilder from "./TemplateBuilder";

import SignContract from "./SignContract";

import Analytics from "./Analytics";

import Notifications from "./Notifications";

import Settings from "./Settings";

import UserManagement from "./UserManagement";

import TemplateDetail from "./TemplateDetail";

import JourneyDetail from "./JourneyDetail";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Contracts: Contracts,
    
    ContractDetail: ContractDetail,
    
    Journeys: Journeys,
    
    Templates: Templates,
    
    TemplateBuilder: TemplateBuilder,
    
    SignContract: SignContract,
    
    Analytics: Analytics,
    
    Notifications: Notifications,
    
    Settings: Settings,
    
    UserManagement: UserManagement,
    
    TemplateDetail: TemplateDetail,
    
    JourneyDetail: JourneyDetail,
    
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

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Contracts" element={<Contracts />} />
                
                <Route path="/ContractDetail" element={<ContractDetail />} />
                
                <Route path="/Journeys" element={<Journeys />} />
                
                <Route path="/Templates" element={<Templates />} />
                
                <Route path="/TemplateBuilder" element={<TemplateBuilder />} />
                
                <Route path="/SignContract" element={<SignContract />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
                <Route path="/TemplateDetail" element={<TemplateDetail />} />
                
                <Route path="/JourneyDetail" element={<JourneyDetail />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}