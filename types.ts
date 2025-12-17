export enum TestType {
  BUSINESS = 'Business',
  ENTERTAINMENT = 'Fiction & Drama',
  QUICK_READ = 'Quick Read'
}

export enum Difficulty {
  STANDARD = 'Standard',
  CHALLENGE = 'Challenge'
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