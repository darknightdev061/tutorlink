import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Subjects from './pages/Subjects';
import HowItWorks from './pages/HowItWorks';
import BecomeTutor from './pages/BecomeTutor';
import Legal from './pages/Legal';
import NotFound from './pages/NotFound';

import StudentDashboard from './pages/student/Dashboard';
import StudentSearch    from './pages/student/Search';
import StudentRequests  from './pages/student/Requests';
import StudentProfile   from './pages/student/Profile';

import TutorDashboard from './pages/tutor/Dashboard';
import TutorApply     from './pages/tutor/Apply';
import TutorRequests  from './pages/tutor/Requests';

import AdminDashboard from './pages/admin/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route path="/"             element={<Landing />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/signup"       element={<Signup />} />
            <Route path="/subjects"     element={<Subjects />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/become-tutor" element={<BecomeTutor />} />

            {/* Legal / info pages (linked from footer) */}
            <Route path="/privacy"          element={<Legal />} />
            <Route path="/terms"            element={<Legal />} />
            <Route path="/refund-policy"    element={<Legal />} />
            <Route path="/child-safety"     element={<Legal />} />
            <Route path="/earnings"         element={<Legal />} />
            <Route path="/code-of-conduct"  element={<Legal />} />
            <Route path="/resources"        element={<Legal />} />

            <Route path="/find-tutors"  element={
              <ProtectedRoute roles={['student','admin']}><StudentSearch /></ProtectedRoute>} />

            {/* Student */}
            <Route path="/student"          element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/requests" element={<ProtectedRoute roles={['student']}><StudentRequests /></ProtectedRoute>} />
            <Route path="/student/profile"  element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />

            {/* Tutor */}
            <Route path="/tutor"          element={<ProtectedRoute roles={['tutor']}><TutorDashboard /></ProtectedRoute>} />
            <Route path="/tutor/apply"    element={<ProtectedRoute roles={['tutor']}><TutorApply /></ProtectedRoute>} />
            <Route path="/tutor/requests" element={<ProtectedRoute roles={['tutor']}><TutorRequests /></ProtectedRoute>} />

            {/* Admin (single tabbed panel) */}
            <Route path="/admin"        element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/tutors" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users"  element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
