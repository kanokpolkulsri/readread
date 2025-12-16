export enum TestType {
  ACADEMIC = 'Academic & Test Prep',
  LITERATURE = 'Classic Literature',
  BUSINESS = 'Business & Economy',
  SCIENCE = 'Science & Nature',
  TECHNOLOGY = 'Technology & Future',
  HORROR = 'Mystery & Horror',
  HISTORY = 'History & Society',
  COMEDY = 'Comedy & Satire'
}

export enum DifficultyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
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
  difficulty: string; // e.g., "Hard", "Medium"
  avgTime: string; // e.g., "8 mins"
  questions: Question[];
}

export interface UserState {
  isLoggedIn: boolean;
  username?: string;
}