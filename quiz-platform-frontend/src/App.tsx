import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import { QuizListPage } from './pages/student/QuizListPage';
import { QuizDetailPage } from './pages/student/QuizDetailPage';
import QuizAttemptPage from './pages/student/QuizAttemptPage';
import QuizResultPage from './pages/student/QuizResultPage';
import QuizReviewPage from './pages/student/QuizReviewPage';
import { MyAttemptsPage } from './pages/student/MyAttemptsPage';
import { LeaderboardPage } from './pages/student/LeaderboardPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import { QuizzesPage } from './pages/admin/QuizzesPage';
import { CreateQuizPage } from './pages/admin/CreateQuizPage';
import { EditQuizPage } from './pages/admin/EditQuizPage';
import { QuestionsPage } from './pages/admin/QuestionsPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { AttemptsPage } from './pages/admin/AttemptsPage';
import { AdminLeaderboardPage } from './pages/admin/AdminLeaderboardPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Student Fullscreen Assessment (No Sidebar) */}
        <Route element={<ProtectedRoute allowedRole="ROLE_STUDENT" />}>
          <Route path="/student/quiz/:id/attempt" element={<QuizAttemptPage />} />
          <Route path="/student/attempt/:id" element={<QuizAttemptPage />} />
        </Route>

        {/* Student Layout Routes */}
        <Route element={<ProtectedRoute allowedRole="ROLE_STUDENT" />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/quizzes" element={<QuizListPage />} />
            <Route path="/student/quiz/:id" element={<QuizDetailPage />} />
            <Route path="/student/result/:id" element={<QuizResultPage />} />
            <Route path="/student/attempt/:attemptId/result" element={<QuizResultPage />} />
            <Route path="/student/review/:attemptId" element={<QuizReviewPage />} />
            <Route path="/student/attempt/:attemptId/review" element={<QuizReviewPage />} />
            <Route path="/student/attempts" element={<MyAttemptsPage />} />
            <Route path="/student/leaderboard" element={<LeaderboardPage />} />
            <Route path="/student/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin Layout Routes */}
        <Route element={<ProtectedRoute allowedRole="ROLE_ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/quizzes" element={<QuizzesPage />} />
            <Route path="/admin/quizzes/create" element={<CreateQuizPage />} />
            <Route path="/admin/quizzes/:id/edit" element={<EditQuizPage />} />
            <Route path="/admin/quizzes/:id/questions" element={<QuestionsPage />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/attempts" element={<AttemptsPage />} />
            <Route path="/admin/leaderboard" element={<AdminLeaderboardPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
          </Route>
        </Route>

        {/* Default & 404 Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
