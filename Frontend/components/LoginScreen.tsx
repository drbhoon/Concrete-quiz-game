import React, { useState } from 'react';

interface LoginScreenProps {
    onLogin: (username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            return;
        }
        onLogin(trimmedUsername);
    };

    return (
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center gap-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                Welcome to the Concrete Quiz Challenge
            </h1>
            <p className="text-slate-400 max-w-md">
                Enter a username to save your progress. Type 'admin' to access the admin panel.
            </p>
             <p className="text-xs text-slate-500 -mt-4">
                (Note: This demo saves data in your browser's local storage.)
            </p>
            <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4 mt-4">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 bg-slate-700 text-slate-100 border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                    aria-label="Username"
                    required
                />
                <button
                    type="submit"
                    className="px-8 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-transform transform hover:scale-105 duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!username.trim()}
                >
                    Login / Register
                </button>
            </form>
        </div>
    );
};

export default LoginScreen;