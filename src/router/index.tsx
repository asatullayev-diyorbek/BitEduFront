import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/layouts/AppLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Auth
import LoginPage from '@/pages/auth/LoginPage';

// Student pages
import DashboardPage from '@/pages/student/DashboardPage';
import SubjectsPage from '@/pages/student/SubjectsPage';
import SubjectDetailPage from '@/pages/student/SubjectDetailPage';
import TopicPage from '@/pages/student/TopicPage';
import BookPage from '@/pages/student/BookPage';
import TestPage from '@/pages/student/TestPage';
import LeaderboardPage from '@/pages/student/LeaderboardPage';
import ProfilePage from '@/pages/student/ProfilePage';

// Admin pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminGradesPage from '@/pages/admin/AdminGradesPage';
import AdminSubjectsPage from '@/pages/admin/AdminSubjectsPage';
import AdminTopicsPage from '@/pages/admin/AdminTopicsPage';
import AdminTestsPage from '@/pages/admin/AdminTestsPage';

// ============ Protected Route ============
function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: 'student' | 'admin' }) {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRole && user?.role !== allowedRole) {
        return <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />;
    }
    return <>{children}</>;
}

export default function AppRouter() {
    const { isAuthenticated, user } = useAuthStore();

    return (
        <BrowserRouter>
            <Routes>
                {/* Auth */}
                <Route
                    path="/login"
                    element={isAuthenticated
                        ? <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />
                        : <LoginPage />}
                />

                {/* Student Routes */}
                <Route path="/" element={
                    <ProtectedRoute allowedRole="student">
                        <AppLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<DashboardPage />} />
                    <Route path="subjects" element={<SubjectsPage />} />
                    <Route path="subjects/:id" element={<SubjectDetailPage />} />
                    <Route path="subjects/:subjectId/topics/:topicId" element={<TopicPage />} />
                    <Route path="subjects/:id/book" element={<BookPage />} />
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Test page (fullscreen outside layout) */}
                <Route path="/test/:topicId" element={
                    <ProtectedRoute allowedRole="student">
                        <TestPage />
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="grades" element={<AdminGradesPage />} />
                    <Route path="subjects" element={<AdminSubjectsPage />} />
                    <Route path="topics" element={<AdminTopicsPage />} />
                    <Route path="tests" element={<AdminTestsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
