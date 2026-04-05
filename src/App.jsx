import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// STUDENT COMPONENTS
import Login from './pages/Login';
import StudentLayout from './components/student/StudentLayout';
import StudentHome from './pages/student/StudentHome';
import Subjects from './pages/student/Subjects';
import SubjectDetail from './pages/student/SubjectDetail';
import TopicDetail from './pages/student/TopicDetail';
import StudentQuiz from './pages/student/StudentQuiz';
import Leaderboard from './pages/student/Leaderboard';
import ProfileSettings from './pages/student/ProfileSettings';

// ADMIN COMPONENTS (Bularni ham qo'shdik)
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminGrades from './pages/admin/AdminGrades';
import AdminTopics from './pages/admin/AdminTopics';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminStudents from './pages/admin/AdminStudents';
import AdminProfile from './pages/admin/AdminProfile';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* 1. LOGIN */}
        <Route path="/login" element={<Login />} />
        
        
        {/* 2. STUDENT PANEL (O'sha biz qilgan ko'k dizayn) */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentHome />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="subjects/:id" element={<SubjectDetail />} />
          {/* TO'G'RILANGAN YO'L: /student yozish shartmas */}
          <Route path="subjects/:subjectId/topics/:topicId" element={<TopicDetail />} />
          <Route path="subjects/:subjectId/topics/:topicId/quiz" element={<StudentQuiz />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>

        {/* 3. ADMIN PANEL (Yangi boshlagan qismimiz) */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="grades" element={<AdminGrades />} />
          <Route path="topics" element={<AdminTopics />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="settings" element={<AdminProfile />} />
          {/* Kelajakda: grades, topics, students shunday qo'shiladi */}
        </Route>

        {/* 4. REDIRECTS */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;