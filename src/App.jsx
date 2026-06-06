import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// STUDENT COMPONENTS
import Login from './pages/Login';
import Register from './pages/Register';
import StudentLayout from './components/student/StudentLayout';
import StudentHome from './pages/student/StudentHome';
import Subjects from './pages/student/Subjects';
import SubjectDetail from './pages/student/SubjectDetail';
import TopicDetail from './pages/student/TopicDetail';
import StudentQuiz from './pages/student/StudentQuiz';
import Leaderboard from './pages/student/Leaderboard';
import ProfileSettings from './pages/student/ProfileSettings';

// GAMES (O'yinlar)
import GamesHome from './pages/student/games/GamesHome';
import AnagramList from './pages/student/games/AnagramList';
import AnagramPlay from './pages/student/games/AnagramPlay';
import QuizDifficulty from './pages/student/games/QuizDifficulty';
import QuizList from './pages/student/games/QuizList';
import QuizPlay from './pages/student/games/QuizPlay';

// ADMIN COMPONENTS (Bularni ham qo'shdik)
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminGrades from './pages/admin/AdminGrades';
import AdminTopics from './pages/admin/AdminTopics';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminGames from './pages/admin/AdminGames';
import AdminStudents from './pages/admin/AdminStudents';
import AdminProfile from './pages/admin/AdminProfile';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* 1. AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        
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

          {/* GAMES (O'yinlar) */}
          <Route path="games" element={<GamesHome />} />
          <Route path="games/anagram" element={<AnagramList />} />
          <Route path="games/anagram/:id" element={<AnagramPlay />} />
          <Route path="games/quiz" element={<QuizDifficulty />} />
          <Route path="games/quiz/:difficulty" element={<QuizList />} />
          <Route path="games/quiz/play/:id" element={<QuizPlay />} />
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
          <Route path="games" element={<AdminGames />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="leaderboard" element={<AdminLeaderboard />} />
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