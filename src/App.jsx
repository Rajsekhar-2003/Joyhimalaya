import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Spinner } from './components/common/ui';
import ProtectedRoute from './routes/ProtectedRoute';
import Home from './pages/Home';

const lz = (f) => lazy(f);
const About = lz(() => import('./pages/About'));
const Contact = lz(() => import('./pages/Contact'));
const TrekCategory = lz(() => import('./pages/TrekCategory'));
const TrekDetails = lz(() => import('./pages/TrekDetails'));
const Privacy = lz(() => import('./pages/PrivacyPolicy'));
const Terms = lz(() => import('./pages/Terms'));
const Cancellation = lz(() => import('./pages/CancellationPolicy'));
const NotFound = lz(() => import('./pages/NotFound'));
const AdminLogin = lz(() => import('./admin/pages/Login'));
const AdminLayout = lz(() => import('./admin/layouts/AdminLayout'));
const Dashboard = lz(() => import('./admin/pages/Dashboard'));
const Treks = lz(() => import('./admin/pages/Treks'));
const TrekForm = lz(() => import('./admin/pages/TrekForm'));
const Settings = lz(() => import('./admin/pages/Settings'));
const Messages = lz(() => import('./admin/pages/Messages'));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="treks" element={<TrekCategory />} />
          <Route path="treks/season/:season" element={<TrekCategory />} />
          <Route path="treks/:slug" element={<TrekDetails />} />
          <Route path="privacy-policy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="cancellation-policy" element={<Cancellation />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="treks" element={<Treks />} />
          <Route path="treks/new" element={<TrekForm />} />
          <Route path="treks/:id" element={<TrekForm />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
