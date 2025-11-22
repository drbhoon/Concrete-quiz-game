
import React from 'react';

interface ResultScreenProps {
    score: number;
    totalQuestions: number;
    onDone: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, totalQuestions, onDone }) => {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const getFeedback = () => {
        if (percentage >= 90) return "Outstanding! You're a quiz master!";
        if (percentage >= 70) return "Great job! You really know your stuff.";
        if (percentage >= 50) return "Not bad! A solid performance.";
        return "Keep practicing! You'll get there.";
    };
    
    return (
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center gap-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100">
                Quiz Complete!
            </h1>
            <p className="text-2xl text-slate-300">Your Final Score</p>
            <div className="relative flex items-center justify-center my-4">
                <svg className="w-40 h-40 transform -rotate-90">
                    <circle 
                        className="text-slate-700" 
                        strokeWidth="10" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="70" 
                        cx="80" 
                        cy="80"
                    />
                    <circle 
                        className="text-teal-400" 
                        strokeWidth="10" 
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * percentage) / 100}
                        strokeLinecap="round"
                        stroke="currentColor" 
                        fill="transparent" 
                        r="70" 
                        cx="80" 
                        cy="80"
                        style={{transition: 'stroke-dashoffset 1.5s ease-out'}}
                    />
                </svg>
                <span className="absolute text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">{percentage}%</span>
            </div>
            <p className="text-xl text-slate-300 font-semibold">{score} / {totalQuestions} correct</p>
            <p className="text-lg text-slate-400 italic mt-2">{getFeedback()}</p>

            <button
                onClick={onDone}
                className="mt-6 px-8 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-transform transform hover:scale-105 duration-300 ease-in-out"
            >
                Done
            </button>
        </div>
    );
};

export default ResultScreen;
