
import React from 'react';
import { User } from '../types';

interface ProfileScreenProps {
    user: User;
    onStartQuiz: () => void;
    onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onStartQuiz, onLogout }) => {
    return (
        <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl w-full animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
                        Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">{user.username}</span>
                    </h1>
                    <p className="text-slate-400">Here's your quiz journey so far.</p>
                </div>
                <button onClick={onLogout} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors">
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-900/50 p-6 rounded-xl text-center">
                    <p className="text-slate-400 text-lg">Best Score</p>
                    <p className="text-5xl font-bold text-teal-400">{user.bestScore}</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl text-center">
                    <p className="text-slate-400 text-lg">Quizzes Taken</p>
                    <p className="text-5xl font-bold text-blue-400">{user.attempts.length}</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl text-center">
                    <p className="text-slate-400 text-lg">Stars ⭐</p>
                    <p className="text-5xl font-bold text-yellow-400">{user.stars || 0}</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl text-center">
                    <p className="text-slate-400 text-lg">Crowns 👑</p>
                    <p className="text-5xl font-bold text-purple-400">{user.crowns || 0}</p>
                </div>
            </div>
            
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-200 mb-4">Quiz History</h2>
                <div className="max-h-60 overflow-y-auto pr-2 rounded-lg bg-slate-900/50">
                    {user.attempts.length > 0 ? (
                        <ul className="space-y-3 p-4">
                            {user.attempts.map((attempt, index) => (
                                <li key={index} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-slate-300">
                                        {new Date(attempt.date).toLocaleDateString()} - {new Date(attempt.date).toLocaleTimeString()}
                                    </p>
                                    <p className="font-semibold text-lg">
                                        <span className="text-teal-400">{attempt.score}</span>
                                        <span className="text-slate-400"> / {attempt.totalQuestions}</span>
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-400 p-6">You haven't taken any quizzes yet. Time to start!</p>
                    )}
                </div>
            </div>

            <button
                onClick={onStartQuiz}
                className="w-full px-8 py-4 bg-teal-500 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-transform transform hover:scale-105 duration-300 ease-in-out"
            >
                Start New Quiz
            </button>
        </div>
    );
};

export default ProfileScreen;