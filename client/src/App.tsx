import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Onboarding } from './views/Onboarding';
import { Dashboard } from './views/Dashboard';
import { Transactions } from './views/Transactions';
import { Accounts } from './views/Accounts';
import { Categories } from './views/Categories';
import { Budgets } from './views/Budgets';
import { Reports } from './views/Reports';
import { Settings } from './views/Settings';
import './App.css';

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Onboarding View */}
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* App views */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
