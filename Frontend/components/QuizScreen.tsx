import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Question } from '../types';

interface QuizScreenProps {
  questions: Question[];
  onQuizEnd: (finalScore: number) => void;
}

const TIME_LIMIT = 30;

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, onQuizEnd }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentQuestion = questions[currentQuestionIndex];

  const handleNextStep = useCallback((updatedScore: number) => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(TIME_LIMIT);
    } else {
      onQuizEnd(updatedScore);
    }
  }, [currentQuestionIndex, questions.length, onQuizEnd]);


  const handleAnswerSelect = useCallback((answer: string | null) => {
    if (isAnswered) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsAnswered(true);
    setSelectedAnswer(answer);
    
    const isCorrect = answer === currentQuestion.answer;
    const updatedScore = score + (isCorrect ? 1 : 0);
    setScore(updatedScore);

    setTimeout(() => handleNextStep(updatedScore), 2000);
  }, [isAnswered, currentQuestion, score, handleNextStep]);

  useEffect(() => {
    if (!isAnswered) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAnswerSelect(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnswered, handleAnswerSelect]);

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return 'bg-slate-700 hover:bg-slate-600';
    }
    if (option === currentQuestion.answer) {
      return 'bg-green-600 scale-105';
    }
    if (option === selectedAnswer && option !== currentQuestion.answer) {
      return 'bg-red-600';
    }
    return 'bg-slate-700 opacity-50';
  };
  
  if (!currentQuestion) {
    // This is a safeguard against rendering with no questions, which would crash the app.
    return null;
  }

  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl w-full animate-fade-in">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-slate-400">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-linear" 
            style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-100">{currentQuestion.question}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            disabled={isAnswered}
            className={`w-full p-4 rounded-lg text-left font-semibold text-lg transition-all duration-300 ease-in-out transform disabled:cursor-not-allowed ${getButtonClass(option)}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizScreen;