
export enum TestType {
  BUSINESS = 'Business',
  ENTERTAINMENT = 'Fiction & Drama',
  QUICK_READ = 'Quick Read'
}

export enum Difficulty {
  STANDARD = 'Standard',
  CHALLENGE = 'Challenge'
}

export interface User {
  email: string;
  username: string;
  photoUrl?: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ReadingSession {
  title: string;
  passage: string;
  avgTime: string; 
  questions: Question[];
  summary?: string; 
}

// Global shared passage structure
export interface SharedPassage extends ReadingSession {
  id: string;
  testType: TestType;
  difficulty: Difficulty;
  createdAt: any;
}

// Record of a specific user's interaction with a shared passage
export interface UserSessionRecord {
  id: string;
  userId: string;
  passageId: string;
  status: 'in-progress' | 'completed';
  score?: number;
  totalQuestions?: number;
  userAnswers?: Record<number, number>;
  createdAt: any;
  // Denormalized data for easier history viewing
  passageTitle: string;
  testType: TestType;
  difficulty: Difficulty;
}

// Helper type for the landing page statistics
export interface TopicProgress {
  total: number;
  completed: number;
}
