import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Download,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  TrendingUp,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  Zap,
  Star,
  User
} from 'lucide-react';
import { QUESTIONS } from './data/questions';
import { DiagramRenderer } from './components/DiagramRenderer';
import { MathText } from './components/MathText';
import { QuizProgress, QuestionAnswerState, TopicType } from './types';
import { exportQuizPDF } from './utils/pdfExport';

const LOCAL_STORAGE_KEY = 'igcse_math_0580_progress_v2';

const INITIAL_PROGRESS: QuizProgress = {
  currentQuestionIndex: 0,
  answers: {},
  isFinished: false,
  studentName: '',
  startTime: Date.now(),
};

// Encouraging greeting messages based on points/attempts
const CELEBRATION_MESSAGES = {
  firstTry: [
    { title: '⭐ Bullseye on First Try!', subtitle: 'Flawless deduction! You secured maximum 4 points.' },
    { title: '✨ Mathematical Precision!', subtitle: 'Outstanding intuition! Top marks on your first attempt.' },
    { title: '🏆 Pure Brilliance!', subtitle: 'You solved that with complete confidence. 4/4 points!' },
    { title: '🎯 Perfect Calculation!', subtitle: 'Masterclass understanding of this IGCSE concept.' },
    { title: '🌟 First-Attempt Mastery!', subtitle: 'Sharp analytical thinking! Full 4 points earned.' },
  ],
  secondTry: [
    { title: '👏 Brilliant Adjustment!', subtitle: 'Great problem-solving! You adapted immediately for +3 points.' },
    { title: '💡 Sharp Recovery!', subtitle: 'You processed the clue and nailed the correct answer.' },
    { title: '⚡ Excellent Work!', subtitle: 'Smart math skills in action. +3 points secured!' },
  ],
  thirdTry: [
    { title: '💪 Perseverance Pays Off!', subtitle: 'Determination is key to mathematical mastery. +2 points!' },
    { title: '🧠 Great Learning Moment!', subtitle: 'You worked through the steps and got the right answer.' },
  ],
  laterTry: [
    { title: '🎯 Mission Accomplished!', subtitle: 'You saw it through to the end! Never give up. +1 point.' },
    { title: '📘 Concept Unlocked!', subtitle: 'Now you know the complete worked method for exam day.' },
  ],
};

export default function App() {
  const [progress, setProgress] = useState<QuizProgress>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.currentQuestionIndex === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage load error', e);
    }
    return INITIAL_PROGRESS;
  });

  const [studentNameInput, setStudentNameInput] = useState<string>(progress.studentName || '');
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [, setActiveHintTab] = useState<number | null>(null);
  const [reviewExpanded, setReviewExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [activeCelebration, setActiveCelebration] = useState<{ title: string; subtitle: string; points: number } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play synthetic harmonic chord chime on success
  const playSuccessChime = (points: number) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Elegant arpeggiated pentatonic chord (C5, E5, G5, C6)
      const frequencies = points === 4
        ? [523.25, 659.25, 783.99, 1046.50]
        : points === 3
        ? [523.25, 659.25, 783.99]
        : [523.25, 783.99];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.07 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.75);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [progress]);

  // Current question data
  const currentQ = QUESTIONS[progress.currentQuestionIndex] || QUESTIONS[0];
  const currentAnswerState: QuestionAnswerState = progress.answers[currentQ.id] || {
    attemptsCount: 0,
    selectedOptionIds: [],
    pointsEarned: 0,
    isCompleted: false,
    hintsRevealedCount: 0,
  };

  // Trigger celebration confetti when quiz completes
  useEffect(() => {
    if (progress.isFinished) {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#10B981', '#34D399', '#F59E0B', '#FCD34D', '#38BDF8'],
        });
      } catch {
        // ignore in mock environments
      }
    }
  }, [progress.isFinished]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Option selection handler
  const handleSelectOption = (optionId: string) => {
    if (currentAnswerState.isCompleted) return;
    if (currentAnswerState.selectedOptionIds.includes(optionId)) return;

    const opt = currentQ.options.find((o) => o.id === optionId);
    if (!opt) return;

    const newAttemptsCount = currentAnswerState.attemptsCount + 1;
    const newSelectedIds = [...currentAnswerState.selectedOptionIds, optionId];

    if (opt.isCorrect) {
      // Calculate tiered points
      let points = 1;
      let msgCategory = CELEBRATION_MESSAGES.laterTry;
      if (newAttemptsCount === 1) {
        points = 4;
        msgCategory = CELEBRATION_MESSAGES.firstTry;
      } else if (newAttemptsCount === 2) {
        points = 3;
        msgCategory = CELEBRATION_MESSAGES.secondTry;
      } else if (newAttemptsCount === 3) {
        points = 2;
        msgCategory = CELEBRATION_MESSAGES.thirdTry;
      }

      const randomMsg = msgCategory[Math.floor(Math.random() * msgCategory.length)];
      setActiveCelebration({
        title: randomMsg.title,
        subtitle: randomMsg.subtitle,
        points,
      });

      // Update streak
      setCurrentStreak((prev) => prev + 1);

      // Play audio chime
      playSuccessChime(points);

      // Launch golden/emerald sparkle burst
      try {
        confetti({
          particleCount: points === 4 ? 45 : 25,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#10B981', '#34D399', '#F59E0B', '#FCD34D'],
        });
      } catch {
        // ignore
      }

      setProgress((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentQ.id]: {
            ...currentAnswerState,
            attemptsCount: newAttemptsCount,
            selectedOptionIds: newSelectedIds,
            pointsEarned: points,
            isCompleted: true,
          },
        },
      }));
      showToast(`+${points} Point${points > 1 ? 's' : ''}! ${randomMsg.title}`);
    } else {
      // Incorrect attempt: reset streak, unlock next hint
      setCurrentStreak(0);
      setActiveCelebration(null);
      const nextHintsCount = Math.min(3, Math.max(currentAnswerState.hintsRevealedCount, newAttemptsCount));
      setProgress((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentQ.id]: {
            ...currentAnswerState,
            attemptsCount: newAttemptsCount,
            selectedOptionIds: newSelectedIds,
            hintsRevealedCount: nextHintsCount,
          },
        },
      }));
      setActiveHintTab(nextHintsCount - 1);
    }
  };

  // Voluntary hint request
  const handleRevealNextHint = () => {
    if (currentAnswerState.hintsRevealedCount < 3) {
      const nextCount = currentAnswerState.hintsRevealedCount + 1;
      setProgress((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentQ.id]: {
            ...currentAnswerState,
            hintsRevealedCount: nextCount,
          },
        },
      }));
      setActiveHintTab(nextCount - 1);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    setActiveCelebration(null);
    if (progress.currentQuestionIndex < QUESTIONS.length - 1) {
      setProgress((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
      setActiveHintTab(null);
    } else {
      setProgress((prev) => ({
        ...prev,
        isFinished: true,
        finishTime: Date.now(),
      }));
    }
  };

  const handlePrevious = () => {
    setActiveCelebration(null);
    if (progress.currentQuestionIndex > 0) {
      setProgress((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
      setActiveHintTab(null);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setActiveCelebration(null);
    setProgress((prev) => ({
      ...prev,
      currentQuestionIndex: index,
    }));
    setActiveHintTab(null);
  };

  const handleNameChange = (name: string) => {
    setStudentNameInput(name);
    setProgress((prev) => ({
      ...prev,
      studentName: name,
    }));
  };

  const handleRestartQuiz = () => {
    const fresh: QuizProgress = {
      ...INITIAL_PROGRESS,
      studentName: studentNameInput,
      startTime: Date.now(),
    };
    setProgress(fresh);
    setShowRestartModal(false);
    setActiveHintTab(null);
    setActiveCelebration(null);
    setCurrentStreak(0);
    showToast('Quiz reset successfully');
  };

  // Summary Metrics
  const summaryMetrics = useMemo<{
    totalScore: number;
    questionsCompleted: number;
    topicStats: Record<TopicType, { earned: number; totalPossible: number; count: number; attempts: number }>;
    strongest: { topic: TopicType; pct: number } | null;
    weakest: { topic: TopicType; pct: number } | null;
    percentage: number;
  }>(() => {
    let totalScore = 0;
    let questionsCompleted = 0;
    const topicStats: Record<
      TopicType,
      { earned: number; totalPossible: number; count: number; attempts: number }
    > = {
      'Factorising quadratics': { earned: 0, totalPossible: 20, count: 5, attempts: 0 },
      'Roots/solutions of quadratics': { earned: 0, totalPossible: 20, count: 5, attempts: 0 },
      'Trigonometric ratios': { earned: 0, totalPossible: 12, count: 3, attempts: 0 },
      'Scatter diagrams': { earned: 0, totalPossible: 20, count: 5, attempts: 0 },
      'Managing money': { earned: 0, totalPossible: 28, count: 7, attempts: 0 },
    };

    QUESTIONS.forEach((q) => {
      const ans = progress.answers[q.id];
      if (ans && ans.isCompleted) {
        questionsCompleted++;
        totalScore += ans.pointsEarned;
        topicStats[q.topic].earned += ans.pointsEarned;
        topicStats[q.topic].attempts += ans.attemptsCount;
      }
    });

    // Determine strongest & weakest topic
    let strongest: { topic: TopicType; pct: number } | null = null;
    let weakest: { topic: TopicType; pct: number } | null = null;

    Object.entries(topicStats).forEach(([t, s]) => {
      const pct = Math.round((s.earned / s.totalPossible) * 100);
      if (!strongest || pct > (strongest as { topic: TopicType; pct: number }).pct) {
        strongest = { topic: t as TopicType, pct };
      }
      if (!weakest || pct < (weakest as { topic: TopicType; pct: number }).pct) {
        weakest = { topic: t as TopicType, pct };
      }
    });

    return {
      totalScore,
      questionsCompleted,
      topicStats,
      strongest,
      weakest,
      percentage: Math.round((totalScore / 100) * 100),
    };
  }, [progress.answers]);

  const handleDownloadPDF = () => {
    const updated = {
      ...progress,
      studentName: studentNameInput,
    };
    setProgress(updated);
    exportQuizPDF(updated, studentNameInput);
    showToast('PDF Report generated & downloaded');
  };

  return (
    <div className="min-h-screen bg-[#0A1211] text-[#F1F5F9] flex flex-col font-sans selection:bg-[#10B981] selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(10,18,17,0))] -z-10" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#122A22] text-[#A7F3D0] border border-[#10B981]/40 text-sm px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-[#FCD34D]" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {showRestartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#12221E] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#23453A] space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-full bg-amber-950/60 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Restart Quiz from Question 1?</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              This will clear your saved answers, attempts, and points so you can practice afresh. Are you sure you want to restart?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRestartModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-[#1A312B] transition-colors"
              >
                Keep Progress
              </button>
              <button
                type="button"
                onClick={handleRestartQuiz}
                className="px-4 py-2 text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors shadow-lg shadow-emerald-950"
              >
                Yes, Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0E1A18]/90 backdrop-blur-md border-b border-[#1C362F] px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-950">
              ∑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  IGCSE Mathematics (0580)
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#16352B] text-[#34D399] border border-[#235343] rounded-md">
                  Core Diagnostic
                </span>
                {studentNameInput.trim() && (
                  <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold bg-[#0E2E20] text-[#6EE7B7] border border-[#10B981]/30 rounded-md">
                    Candidate: {studentNameInput.trim()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Interactive Practice with Tiered Rewards · 25 Questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            {currentStreak > 1 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{currentStreak} Streak!</span>
              </div>
            )}

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#182F2A] transition-colors border border-[#1C362F]"
              title={soundEnabled ? 'Mute Celebration Sound' : 'Enable Celebration Sound'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#34D399]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Score Tracker */}
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Score</span>
              <span className="text-sm sm:text-base font-extrabold text-[#34D399]">
                {summaryMetrics.totalScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowRestartModal(true)}
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#182F2A] rounded-lg transition-colors flex items-center gap-1.5 border border-[#1C362F]"
              title="Reset quiz and start over"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start over</span>
            </button>
          </div>
        </div>

        {/* Global Progress Line with luminous emerald shine */}
        <div className="max-w-4xl mx-auto mt-2.5">
          <div className="w-full h-2 bg-[#12221E] rounded-full overflow-hidden border border-[#1C362F]">
            <div
              className="h-full bg-gradient-to-r from-[#059669] to-[#34D399] transition-all duration-300 ease-out shadow-sm shadow-emerald-400"
              style={{
                width: `${((progress.currentQuestionIndex + (currentAnswerState.isCompleted ? 1 : 0)) / QUESTIONS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-start">
        {!progress.isFinished ? (
          /* ========================================== */
          /* QUESTION VIEW */
          /* ========================================== */
          <div className="space-y-6">
            {/* Student Name Input Strip */}
            <div className="bg-[#111F1D] rounded-2xl p-4 sm:p-5 border border-[#1E3A33] shadow-lg shadow-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#142B23] border border-[#21473A] text-[#34D399] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="student-name-input" className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                      Student Name / Candidate
                    </label>
                    {studentNameInput.trim() && (
                      <span className="text-[10px] text-[#34D399] bg-[#0E2E20] border border-[#10B981]/40 px-1.5 py-0.5 rounded-md font-semibold">
                        Auto-Saved
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {studentNameInput.trim()
                      ? `Candidate: ${studentNameInput.trim()} (will appear on your PDF diagnostic report)`
                      : 'Enter your name to personalize your diagnostic report'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:max-w-xs w-full">
                <input
                  id="student-name-input"
                  type="text"
                  value={studentNameInput}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Type your name here..."
                  className="flex-1 px-3.5 py-2 text-sm bg-[#0E1A18] border border-[#24453C] rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-[#34D399] focus:ring-1 focus:ring-[#34D399] transition-all"
                />
              </div>
            </div>

            {/* Quick Question Navigator (Top of Questions Page) */}
            <div className="bg-[#111F1D] rounded-2xl p-4 sm:p-5 border border-[#1E3A33] shadow-lg shadow-black/25 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase tracking-wider text-slate-200">
                    Question Navigator
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[#34D399] font-bold">
                    {summaryMetrics.questionsCompleted} of {QUESTIONS.length} Solved
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" /> Solved
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#34D399] ring-2 ring-[#34D399]/40 inline-block" /> Current
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#224037] inline-block" /> Upcoming
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-25 gap-1.5 sm:gap-2">
                {QUESTIONS.map((q, idx) => {
                  const state = progress.answers[q.id];
                  const isCurrent = idx === progress.currentQuestionIndex;
                  const isDone = state?.isCompleted;

                  let itemClass = 'bg-[#142622] text-slate-400 border-[#224037] hover:bg-[#1A312B] hover:text-white';
                  if (isDone) {
                    itemClass = 'bg-[#0E3524] text-[#A7F3D0] border-[#10B981]/50 font-bold';
                  }
                  if (isCurrent) {
                    itemClass = 'ring-2 ring-[#34D399] bg-[#16382E] text-white font-extrabold border-[#34D399] shadow-md shadow-emerald-950';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-8 sm:h-9 text-xs rounded-xl border flex items-center justify-center transition-all ${itemClass}`}
                      title={`Q${q.id}: ${q.topic}`}
                    >
                      {q.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Top Question Info Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#34D399]">
                  Question {progress.currentQuestionIndex + 1} of {QUESTIONS.length}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-300 font-medium">{currentQ.topic}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {currentAnswerState.attemptsCount > 0 && (
                  <span className="text-slate-400">
                    Attempt: {currentAnswerState.attemptsCount}
                  </span>
                )}
                {currentAnswerState.isCompleted && (
                  <span className="font-bold text-[#A7F3D0] bg-[#0E3524] px-2.5 py-0.5 rounded-md border border-[#10B981]/40 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Earned: +{currentAnswerState.pointsEarned} pts</span>
                  </span>
                )}
              </div>
            </div>

            {/* Special Celebration Greeting Banner on Success */}
            {activeCelebration && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0C3825] via-[#10422D] to-[#0A291C] border border-[#10B981]/60 shadow-xl shadow-emerald-950/50 flex items-center gap-4 animate-fade-in animate-emerald-pulse">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shrink-0 shadow-md shadow-emerald-900">
                  {activeCelebration.points === 4 ? (
                    <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
                  ) : (
                    <Award className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      {activeCelebration.title}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-bold bg-[#175239] text-[#6EE7B7] border border-[#227251] rounded-md">
                      +{activeCelebration.points} Points
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#A7F3D0] mt-0.5 leading-snug">
                    {activeCelebration.subtitle}
                  </p>
                </div>
              </div>
            )}

            {/* Question Card */}
            <section className="bg-[#111F1D] rounded-3xl p-5 sm:p-7 shadow-xl shadow-black/20 border border-[#1E3A33] transition-all">
              <h2 className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
                <MathText text={currentQ.questionText} />
              </h2>

              {/* Optional Inline Diagram */}
              {currentQ.diagramType && (
                <DiagramRenderer
                  type={currentQ.diagramType}
                  caption={currentQ.diagramCaption}
                />
              )}

              {/* Multiple Choice Options */}
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select your answer:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.options.map((option) => {
                    const isSelected = currentAnswerState.selectedOptionIds.includes(option.id);
                    const isCorrectAnswer = option.isCorrect;
                    const isCompleted = currentAnswerState.isCompleted;

                    let btnStyle = 'bg-[#142622] border-[#224037] text-[#E2E8F0] hover:border-[#34D399] hover:bg-[#1A312B]';
                    let badgeBg = 'bg-[#1B352E] text-[#34D399] border border-[#2B5247]';

                    if (isSelected && isCorrectAnswer) {
                      btnStyle = 'bg-[#0E3524] border-[#10B981] text-[#A7F3D0] ring-2 ring-[#10B981]/50 font-semibold shadow-lg shadow-emerald-950/40';
                      badgeBg = 'bg-[#10B981] text-white border-transparent';
                    } else if (isSelected && !isCorrectAnswer) {
                      btnStyle = 'bg-[#2A1517] border-[#882525] text-[#FECDD3] opacity-80 cursor-not-allowed';
                      badgeBg = 'bg-[#4C1D24] text-[#FCA5A5] border-[#7F1D1D]';
                    } else if (isCompleted && isCorrectAnswer) {
                      btnStyle = 'bg-[#0E3524] border-[#10B981] text-[#A7F3D0]';
                      badgeBg = 'bg-[#10B981] text-white border-transparent';
                    } else if (isCompleted) {
                      btnStyle = 'bg-[#142622]/50 border-[#1B322B] text-slate-500 opacity-40 cursor-not-allowed';
                    }

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(option.id)}
                        disabled={isSelected || isCompleted}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#34D399] min-h-[64px] ${btnStyle}`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${badgeBg}`}>
                          {isSelected && isCorrectAnswer ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : isSelected && !isCorrectAnswer ? (
                            '✕'
                          ) : (
                            option.id
                          )}
                        </span>
                        <div className="flex-1">
                          <span className="text-base sm:text-lg block">
                            <MathText text={option.text} />
                          </span>
                          {isSelected && !isCorrectAnswer && option.misconceptionExplanation && (
                            <span className="text-xs text-[#FCA5A5] mt-1 block font-medium">
                              {option.misconceptionExplanation}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Incorrect feedback banner & auto-revealed hint nudge */}
              {!currentAnswerState.isCompleted && currentAnswerState.attemptsCount > 0 && (
                <div className="mt-5 p-4 rounded-xl bg-[#2D1C12] border border-[#7C3E1D] text-[#FED7AA] flex items-start gap-2.5 text-sm animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Not quite right yet, give it another go! </span>
                    <span className="text-[#FFEDD5]">
                      Review the progressive hint below to help you identify the correct step.
                    </span>
                  </div>
                </div>
              )}

              {/* Worked Explanation on Correct Answer */}
              {currentAnswerState.isCompleted && (
                <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#0B251B] border border-[#165039] text-[#D1FAE5] space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#34D399]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Worked Solution & Core Concept</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#A7F3D0]">
                    <MathText text={currentQ.explanation} />
                  </p>
                </div>
              )}
            </section>

            {/* Progressive Hints Section */}
            <section className="bg-[#111F1D] rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/20 border border-[#1E3A33] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#34D399]" />
                  <h3 className="font-bold text-sm text-white">
                    Progressive Hints ({currentAnswerState.hintsRevealedCount} of 3 available)
                  </h3>
                </div>

                {!currentAnswerState.isCompleted && currentAnswerState.hintsRevealedCount < 3 && (
                  <button
                    type="button"
                    onClick={handleRevealNextHint}
                    className="text-xs font-bold text-[#34D399] hover:text-[#6EE7B7] hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>Need a hint? Reveal next step</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {currentAnswerState.hintsRevealedCount === 0 ? (
                <p className="text-xs text-slate-400 italic py-1">
                  Hints unlock automatically after any incorrect guess, or you can click &ldquo;Need a hint?&rdquo; above.
                </p>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {currentQ.hints.slice(0, currentAnswerState.hintsRevealedCount).map((hintText, idx) => {
                    const isWorkedStep = idx === 2;
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-sm transition-all ${
                          isWorkedStep
                            ? 'bg-[#0E2C22] border-[#1D5E47] text-[#D1FAE5]'
                            : 'bg-[#142622] border-[#224037] text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#34D399]">
                            {idx === 0 && 'Hint 1 · Guiding Clue'}
                            {idx === 1 && 'Hint 2 · Method & Setup'}
                            {idx === 2 && 'Hint 3 · Worked First Step'}
                          </span>
                        </div>
                        <p className="leading-relaxed">
                          <MathText text={hintText} />
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={progress.currentQuestionIndex === 0}
                className="px-4 py-2.5 text-sm font-medium text-slate-300 bg-[#111F1D] border border-[#1E3A33] hover:bg-[#1A312B] hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {currentAnswerState.isCompleted ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#059669] rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center gap-2 animate-bounce-subtle"
                  >
                    <span>
                      {progress.currentQuestionIndex === QUESTIONS.length - 1
                        ? 'Finish & View Results'
                        : 'Next Question'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic pr-1">
                    Select the correct answer to unlock next question
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================== */
          /* END-OF-QUIZ SUMMARY VIEW */
          /* ========================================== */
          <div className="space-y-8 animate-fade-in">
            {/* Top Celebratory Header Card */}
            <div className="bg-[#111F1D] rounded-3xl p-6 sm:p-9 shadow-2xl border border-[#1E3A33] text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#047857] text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-950">
                <Award className="w-11 h-11" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Congratulations, Quiz Completed!
                </h2>
                <p className="text-sm text-slate-300 mt-1 max-w-lg mx-auto">
                  You successfully solved all 25 questions in the IGCSE Mathematics (0580) Diagnostic Review. Here is your comprehensive diagnostic report.
                </p>
              </div>

              {/* Big Score Callout */}
              <div className="inline-flex flex-col items-center justify-center p-6 bg-[#0E2820] border border-[#1A4F3C] rounded-2xl my-2 min-w-[260px] shadow-inner">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#34D399]">
                  Total Final Score
                </span>
                <div className="text-5xl sm:text-6xl font-black text-white my-1">
                  {summaryMetrics.totalScore}
                  <span className="text-2xl font-bold text-slate-400"> / 100</span>
                </div>
                <span className="text-sm font-semibold text-[#A7F3D0]">
                  {summaryMetrics.percentage}% Overall Accuracy
                </span>
              </div>

              {/* Student Name & PDF Export Box */}
              <div className="pt-4 max-w-md mx-auto border-t border-[#1C362F] space-y-3">
                <label className="text-xs font-bold text-slate-300 block text-left">
                  Student Name for Official PDF Report (Optional):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={studentNameInput}
                    onChange={(e) => setStudentNameInput(e.target.value)}
                    placeholder="Enter candidate name (e.g. Alex Tan)"
                    className="flex-1 px-3.5 py-2.5 text-sm bg-[#0E1A18] border border-[#24453C] rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-[#34D399] focus:ring-1 focus:ring-[#34D399]"
                  />
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#059669] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center gap-2 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Strengths and Growth Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summaryMetrics.strongest && (
                <div className="bg-[#111F1D] rounded-2xl p-5 border border-[#1E3A33] space-y-2">
                  <div className="flex items-center gap-2 text-[#34D399] font-bold text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Key Strength: {summaryMetrics.strongest.topic}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Great job! You achieved high accuracy ({summaryMetrics.strongest.pct}%) in this topic. Your understanding of core patterns and first-try intuition is very strong here.
                  </p>
                </div>
              )}

              {summaryMetrics.weakest && (
                <div className="bg-[#111F1D] rounded-2xl p-5 border border-[#1E3A33] space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>Target for Revision: {summaryMetrics.weakest.topic}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Review this topic carefully ({summaryMetrics.weakest.pct}% score). Spend 10 minutes reviewing the worked explanations and key steps in your PDF report to secure full marks.
                  </p>
                </div>
              )}
            </div>

            {/* Topic Breakdown Card */}
            <div className="bg-[#111F1D] rounded-2xl p-6 border border-[#1E3A33] space-y-4">
              <h3 className="text-base font-bold text-white">
                Score Breakdown by Topic
              </h3>
              <div className="space-y-4">
                {Object.entries(summaryMetrics.topicStats).map(([topicName, stat]) => {
                  const pct = Math.round((stat.earned / stat.totalPossible) * 100);
                  return (
                    <div key={topicName} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-slate-200">{topicName}</span>
                        <span className="font-medium text-[#34D399]">
                          {stat.earned} / {stat.totalPossible} pts ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#0D1716] rounded-full overflow-hidden border border-[#1A312B]">
                        <div
                          className="h-full bg-gradient-to-r from-[#059669] to-[#34D399] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attempt Analysis Table */}
            <div className="bg-[#111F1D] rounded-2xl p-6 border border-[#1E3A33] space-y-4 overflow-hidden">
              <div>
                <h3 className="text-base font-bold text-white">
                  Question Attempt Analysis Table
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive log of attempts and points earned per question
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#1E3A33] text-slate-400 uppercase tracking-wider text-[11px] bg-[#0E1A18]">
                      <th className="py-2.5 px-3">Q#</th>
                      <th className="py-2.5 px-3">Topic</th>
                      <th className="py-2.5 px-3 text-center">Attempts</th>
                      <th className="py-2.5 px-3 text-center">Points Earned</th>
                      <th className="py-2.5 px-3 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C362F]">
                    {QUESTIONS.map((q) => {
                      const ans = progress.answers[q.id];
                      const attempts = ans?.attemptsCount || 0;
                      const points = ans?.pointsEarned || 0;

                      return (
                        <tr key={q.id} className="hover:bg-[#142622]/60 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-white">Q{q.id}</td>
                          <td className="py-2.5 px-3 text-slate-300">{q.topic}</td>
                          <td className="py-2.5 px-3 text-center font-medium">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                attempts === 1
                                  ? 'bg-[#0E3524] text-[#34D399] border border-[#10B981]/40'
                                  : attempts === 2
                                  ? 'bg-[#0E2A38] text-[#38BDF8] border border-[#0284C7]/40'
                                  : 'bg-[#331C0C] text-[#FBBF24] border border-[#D97706]/40'
                              }`}
                            >
                              {attempts} {attempts === 1 ? 'try' : 'tries'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#34D399]">
                            +{points} / 4
                          </td>
                          <td className="py-2.5 px-3 text-right text-xs text-slate-400">
                            {attempts === 1 ? '1st Attempt' : `${attempts} Attempts`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Collapsible Answer Review Section */}
            <div className="bg-[#111F1D] rounded-2xl border border-[#1E3A33] overflow-hidden">
              <button
                type="button"
                onClick={() => setReviewExpanded(!reviewExpanded)}
                className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-[#142622]/50 transition-colors"
              >
                <div>
                  <h3 className="text-base font-bold text-white">
                    Review All Questions & Worked Solutions
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click to browse the complete step-by-step solution guide for all 25 questions
                  </p>
                </div>
                {reviewExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {reviewExpanded && (
                <div className="p-5 sm:p-6 pt-0 border-t border-[#1E3A33] space-y-4">
                  {QUESTIONS.map((q) => {
                    const ans = progress.answers[q.id];
                    const correctOption = q.options.find((o) => o.isCorrect);

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl border border-[#23453A] bg-[#0E1A18] space-y-2 text-xs sm:text-sm"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="font-bold text-[#34D399]">
                            Q{q.id}. {q.topic}
                          </span>
                          <span className="text-slate-400 text-xs">
                            Attempts: {ans?.attemptsCount || 0} · Points: {ans?.pointsEarned || 0}/4
                          </span>
                        </div>
                        <p className="text-slate-100 font-medium">
                          <MathText text={q.questionText} />
                        </p>
                        <div className="text-[#34D399] font-bold">
                          Correct Answer: <MathText text={correctOption?.text || ''} />
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed border-t border-[#1C362F] pt-2 mt-1">
                          <span className="font-semibold text-slate-400">Solution: </span>
                          <MathText text={q.explanation} />
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Final Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-4">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#059669] text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Report</span>
              </button>

              <button
                type="button"
                onClick={handleRestartQuiz}
                className="px-6 py-3 bg-[#111F1D] hover:bg-[#1A312B] text-slate-200 border border-[#224037] font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Again</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1C362F] bg-[#0E1A18] py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Cambridge IGCSE Mathematics (0580) Diagnostic Tool</span>
          <span className="text-slate-400">Whole integer arithmetic · Progressive hints · Tiered scoring</span>
        </div>
      </footer>
    </div>
  );
}
