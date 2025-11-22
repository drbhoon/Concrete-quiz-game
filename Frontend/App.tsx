
import React, { useState, useCallback, useEffect } from 'react';
import { Question, User, QuizAttempt } from './types';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import UploadScreen from './components/WelcomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import AdminScreen from './components/AdminScreen';
import * as api from './services/api';

// Helper to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

type GameState = 'login' | 'profile' | 'upload' | 'playing' | 'finished' | 'admin';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('login');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load all users for the admin leaderboard on initial load
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const allUsers = await api.getUsers();
        setUsers(allUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Could not connect to the server. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = useCallback(async (username: string) => {
    try {
        setIsLoading(true);
        setError(null);
        if (username.toLowerCase() === 'admin') {
            const adminUser = { username: 'admin', bestScore: 0, attempts: [], stars: 0, crowns: 0, consecutivePerfectScores: 0 };
            setCurrentUser(adminUser);
            setGameState('admin');
            const allUsers = await api.getUsers(); // Refresh user list for admin
            setUsers(allUsers);
            return;
        }

        const user = await api.login(username);
        setCurrentUser(user);
        setGameState('profile');
    } catch (err) {
        console.error("Login failed:", err);
        setError("Login failed. The server might be down.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setGameState('login');
  }, []);
  
  const handleStartQuiz = useCallback(async () => {
    try {
        const response = await fetch('/questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        handleQuizLoaded(data);
    } catch (err) {
        alert('Failed to load the quiz. Please check your network connection.');
        console.error(err);
    }
  }, []);

  const handleAdminStartQuiz = useCallback(() => {
    setGameState('upload');
  }, []);

  const handleQuizLoaded = useCallback((allQuestions: Question[]) => {
    if (allQuestions.length < 10) {
        alert("The quiz must contain at least 10 questions.");
        return;
    }
    const selectedQuestions = shuffleArray(allQuestions).slice(0, 10);
    setQuizQuestions(selectedQuestions);
    setGameState('playing');
  }, []);

  const handleQuizEnd = useCallback(async (score: number) => {
    setFinalScore(score);
    setGameState('finished');

    if (!currentUser || currentUser.username.toLowerCase() === 'admin') return;

    try {
      const updatedUser = await api.saveAttempt(currentUser.username, {
        score,
        totalQuestions: quizQuestions.length,
      });
      setCurrentUser(updatedUser);
      // Refresh user list for admin leaderboard
      const allUsers = await api.getUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to save quiz attempt:", err);
      alert("There was an error saving your score. Please check your connection.");
    }
  }, [currentUser, quizQuestions.length]);

  const handleGoBack = useCallback(() => {
    if (currentUser?.username.toLowerCase() === 'admin') {
      setGameState('admin');
    } else {
      setGameState('profile');
    }
  }, [currentUser]);

  const handleResetLeaderboard = useCallback(async () => {
    if (!window.confirm("Are you sure you want to reset all user scores and rewards? This action cannot be undone.")) {
      return;
    }
    try {
        await api.resetLeaderboard();
        const refreshedUsers = await api.getUsers();
        setUsers(refreshedUsers);
        alert("Leaderboard has been reset.");
    } catch (err) {
        console.error("Failed to reset leaderboard:", err);
        alert("Could not reset leaderboard. The server might be down.");
    }
  }, []);

  const renderContent = () => {
    if (isLoading && gameState === 'login') {
        return (
            <div className="text-center">
                <p className="text-2xl text-slate-400">Connecting to server...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center">
                <h2 className="text-2xl text-red-400 font-bold mb-4">Connection Error</h2>
                <p className="text-slate-300">{error}</p>
            </div>
        );
    }

    switch (gameState) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'admin':
        return <AdminScreen users={users} onResetLeaderboard={handleResetLeaderboard} onLogout={handleLogout} onStartQuiz={handleAdminStartQuiz} />;
      case 'profile':
        return currentUser && <ProfileScreen user={currentUser} onStartQuiz={handleStartQuiz} onLogout={handleLogout} />;
      case 'upload':
        return <UploadScreen onQuizStart={handleQuizLoaded} onBack={handleGoBack} />;
      case 'playing':
        return <QuizScreen questions={quizQuestions} onQuizEnd={handleQuizEnd} />;
      case 'finished':
        return <ResultScreen score={finalScore} totalQuestions={quizQuestions.length} onDone={handleGoBack} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
        <main className="w-full max-w-4xl mx-auto">
            {renderContent()}
        </main>
    </div>
  );
};

export default App;
