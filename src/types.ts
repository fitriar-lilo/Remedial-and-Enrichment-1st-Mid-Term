export type TopicType =
  | 'Factorising quadratics'
  | 'Roots/solutions of quadratics'
  | 'Trigonometric ratios'
  | 'Scatter diagrams'
  | 'Managing money';

export type TopicKey = 'factorising' | 'roots' | 'trigonometry' | 'scatter' | 'money';

export interface Option {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  isCorrect: boolean;
  misconceptionExplanation?: string;
}

export interface Question {
  id: number;
  topic: TopicType;
  topicKey: TopicKey;
  title: string;
  questionText: string;
  mathPromptHtml?: string;
  diagramType?: 'triangle_3_4_5' | 'triangle_5_12_13' | 'triangle_def' | 'scatter_positive' | 'scatter_negative' | 'scatter_none' | 'scatter_best_fit' | 'scatter_rules';
  diagramCaption?: string;
  options: Option[];
  hints: [string, string, string]; // Exactly 3 progressive hints: 1st clue, 2nd clue, 3rd worked first step
  explanation: string;
}

export interface QuestionAnswerState {
  attemptsCount: number;
  selectedOptionIds: string[];
  pointsEarned: number;
  isCompleted: boolean;
  hintsRevealedCount: number;
}

export interface QuizProgress {
  currentQuestionIndex: number;
  answers: Record<number, QuestionAnswerState>;
  isFinished: boolean;
  studentName: string;
  startTime: number;
  finishTime?: number;
}
