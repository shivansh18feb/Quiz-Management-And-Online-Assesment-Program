// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserResponse;
}

// User
export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_STUDENT';
  enabled: boolean;
  accountLocked: boolean;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Category
export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  quizCount?: number;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

// Quiz
export type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SINGLE_CORRECT';
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED' | 'ABANDONED';

export interface QuizResponse {
  id: number;
  title: string;
  description: string;
  category: CategoryResponse;
  difficulty: Difficulty;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status: QuizStatus;
  startDate?: string;
  endDate?: string;
  questionCount: number;
  attemptCount?: number;
  createdBy?: UserResponse;
  createdAt: string;
  updatedAt: string;
}

export interface QuizSummaryResponse {
  id: number;
  title: string;
  description: string;
  categoryName?: string;
  categoryId?: number;
  difficulty: Difficulty;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status: QuizStatus;
  questionCount: number;
  attemptCount?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  categoryId: number;
  difficulty: Difficulty;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status?: QuizStatus;
  startDate?: string;
  endDate?: string;
}

// Question
export interface OptionResponse {
  id: number;
  optionText: string;
  isCorrect?: boolean; // only visible to admin
}

export interface QuestionResponse {
  id: number;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  negativeMarks: number;
  explanation?: string;
  orderIndex: number;
  options: OptionResponse[];
}

export interface CreateOptionRequest {
  optionText: string;
  isCorrect: boolean;
}

export interface CreateQuestionRequest {
  questionText: string;
  questionType: QuestionType;
  marks: number;
  negativeMarks: number;
  explanation?: string;
  orderIndex: number;
  options: CreateOptionRequest[];
}

// Attempt
export interface StartAttemptResponse {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  totalQuestions: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  questions: QuestionResponse[];
}

export interface SaveAnswerRequest {
  questionId: number;
  selectedOptionId: number | null;
}

export interface SubmitAttemptRequest {
  answers: SaveAnswerRequest[];
}

// Result
export interface QuizResultResponse {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  studentName: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  isPassed: boolean;
  status: AttemptStatus;
  startTime: string;
  endTime: string;
  timeTakenSeconds: number;
}

export interface UserAnswerReview {
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  selectedOptionId: number | null;
  selectedOptionText: string | null;
  correctOptionId: number;
  correctOptionText: string;
  isCorrect: boolean;
  marksObtained: number;
  marks: number;
  negativeMarks: number;
  explanation: string | null;
  options: OptionResponse[];
}

export interface AttemptReviewResponse {
  attemptId: number;
  quizTitle: string;
  result: QuizResultResponse;
  questions: UserAnswerReview[];
}

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  studentName: string;
  quizTitle?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTakenSeconds: number;
  submittedAt: string;
}

// Pagination
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Dashboard
export interface StudentDashboardStats {
  totalAttempts: number;
  passedQuizzes: number;
  failedQuizzes: number;
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  recentAttempts: AttemptSummary[];
}

export interface UserStatusRequest {
  enabled?: boolean;
  accountLocked?: boolean;
}

export interface AttemptSummary {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  score: number;
  obtainedMarks?: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  status: AttemptStatus;
  createdAt: string;
  endTime?: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalQuizzes: number;
  publishedQuizzes: number;
  totalQuestions: number;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
}
