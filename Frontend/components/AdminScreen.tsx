import React, { useMemo } from 'react';
import { User } from '../types';

interface AdminScreenProps {
    users: User[];
    onResetLeaderboard: () => void;
    onLogout: () => void;
    onStartQuiz: () => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ users, onResetLeaderboard, onLogout, onStartQuiz }) => {

    const sortedUsers = useMemo(() => {
        return [...users]
            .filter(u => u.username.toLowerCase() !== 'admin')
            .sort((a, b) => {
                if (b.crowns !== a.crowns) return b.crowns - a.crowns;
                if (b.stars !== a.stars) return b.stars - a.stars;
                if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
                return a.username.localeCompare(b.username);
            });
    }, [users]);

    return (
        <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl w-full animate-fade-in">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
                    Admin Panel
                </h1>
                <button onClick={onLogout} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors">
                    Logout
                </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">
                Managing all user data stored in the browser for this demo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                    onClick={onStartQuiz}
                    className="w-full sm:w-auto px-6 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-transform transform hover:scale-105"
                >
                    Start/Upload Quiz
                </button>
                <button
                    onClick={onResetLeaderboard}
                    className="w-full sm:w-auto px-6 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-transform transform hover:scale-105"
                >
                    Reset Leaderboard
                </button>
            </div>

            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-200 mb-4">Leaderboard</h2>
                <div className="overflow-x-auto bg-slate-900/50 rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700/50 text-slate-300 uppercase text-sm">
                            <tr>
                                <th className="p-4">Rank</th>
                                <th className="p-4">Username</th>
                                <th className="p-4 text-center">Crowns 👑</th>
                                <th className="p-4 text-center">Stars ⭐</th>
                                <th className="p-4 text-center">Best Score</th>
                                <th className="p-4 text-center">Quizzes Taken</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.length > 0 ? (
                                sortedUsers.map((user, index) => (
                                    <tr key={user.username} className="border-b border-slate-700 hover:bg-slate-700/30">
                                        <td className="p-4 font-bold">{index + 1}</td>
                                        <td className="p-4 font-semibold text-teal-400">{user.username}</td>
                                        <td className="p-4 text-center text-lg text-purple-400">{user.crowns || 0}</td>
                                        <td className="p-4 text-center text-lg text-yellow-400">{user.stars || 0}</td>
                                        <td className="p-4 text-center text-lg">{user.bestScore}</td>
                                        <td className="p-4 text-center text-lg">{user.attempts.length}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center text-slate-400 p-8">
                                        No player data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminScreen;