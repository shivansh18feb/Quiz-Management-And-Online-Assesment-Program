export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Student
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    QUIZZES: '/student/quizzes',
    QUIZ_DETAIL: '/student/quizzes/:id',
    QUIZ_ATTEMPT: '/student/quiz/:id/attempt',
    QUIZ_RESULT: '/student/attempt/:attemptId/result',
    QUIZ_REVIEW: '/student/attempt/:attemptId/review',
    MY_ATTEMPTS: '/student/attempts',
    LEADERBOARD: '/student/leaderboard',
    PROFILE: '/student/profile',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    QUIZZES: '/admin/quizzes',
    QUIZ_CREATE: '/admin/quizzes/create',
    QUIZ_EDIT: '/admin/quizzes/:id/edit',
    QUESTIONS: '/admin/quizzes/:id/questions',
    CATEGORIES: '/admin/categories',
    ATTEMPTS: '/admin/attempts',
    RESULTS: '/admin/results',
    LEADERBOARD: '/admin/leaderboard',
    PROFILE: '/admin/profile',
  },
} as const;
