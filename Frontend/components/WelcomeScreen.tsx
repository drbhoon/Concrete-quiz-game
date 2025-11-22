
import React, { useState, useRef } from 'react';
import { Question } from '../types';

interface UploadScreenProps {
  onQuizStart: (questions: Question[]) => void;
  onBack: () => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onQuizStart, onBack }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processQuestions = (data: any) => {
    if (!Array.isArray(data) || data.length < 10) {
      setError('Invalid JSON format or less than 10 questions provided.');
      return false;
    }
    
    const isDataValid = data.every(q => 
        typeof q.question === 'string' &&
        typeof q.answer === 'string' &&
        Array.isArray(q.options) &&
        q.options.length > 1 &&
        q.options.every(opt => typeof opt === 'string') &&
        q.options.includes(q.answer)
    );

    if (!isDataValid) {
        setError('JSON data is malformed. Each question must have a question (string), options (array of strings), and an answer (string) that is present in the options.');
        return false;
    }

    setError(null);
    onQuizStart(data);
    return true;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setError('Invalid file type. Please upload a JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        processQuestions(data);
      } catch (err) {
        setError('Failed to parse JSON file. Please check the file content.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };
  
  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    setError(null);
    try {
        const response = await fetch('/questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        processQuestions(data);
    } catch (err) {
        setError('Failed to load the sample quiz. Please check your network connection.');
        console.error(err);
    } finally {
        setIsLoadingSample(false);
    }
  };

  const handleButtonClick = () => {
      fileInputRef.current?.click();
  }

  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center gap-6 animate-fade-in relative">
        <button onClick={onBack} className="absolute top-4 left-4 text-slate-400 hover:text-teal-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
        </button>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
            Start a New Concrete Quiz
        </h1>
        <p className="text-slate-400 max-w-md">
            Choose a quiz to begin. You can load the sample quiz about concrete or upload your own JSON file.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
            <button 
                onClick={handleLoadSample}
                disabled={isLoadingSample}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105 duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoadingSample ? 'Loading...' : 'Load Sample Quiz'}
            </button>
            <button 
                onClick={handleButtonClick}
                className="px-6 py-3 bg-teal-500 text-white font-bold rounded-lg shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-transform transform hover:scale-105 duration-300 ease-in-out"
            >
                Upload Custom JSON
            </button>
        </div>
        <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept=".json"
            className="hidden"
        />
      {error && <p className="mt-4 text-red-400 bg-red-900/50 px-4 py-2 rounded-md">{error}</p>}
    </div>
  );
};

export default UploadScreen;