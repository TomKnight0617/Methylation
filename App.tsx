
import React, { useState, useCallback } from 'react';
import { AnalysisResult } from './types';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import Loader from './components/Loader';
import { Logo } from './components/Logo';

const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setResults(null);
        setError(null);
    };

    const handleAnalyze = useCallback(() => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setIsLoading(true);
        setResults(null);
        setError(null);

        // Web Worker to handle heavy processing without blocking the UI
        const worker = new Worker(new URL('./workers/parser.worker.ts', import.meta.url), { type: 'module' });

        worker.onmessage = (e: MessageEvent<AnalysisResult>) => {
            setResults(e.data);
            setIsLoading(false);
            worker.terminate();
        };

        worker.onerror = (e: ErrorEvent) => {
            console.error("Worker error:", e);
            setError(`An error occurred during analysis: ${e.message}`);
            setIsLoading(false);
            worker.terminate();
        };

        worker.postMessage(file);

    }, [file]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 md:p-8">
            <header className="w-full max-w-5xl mb-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-2">
                    <Logo />
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-400 to-purple-500">
                        Methylation Data Analyzer
                    </h1>
                </div>
                <p className="text-gray-400">
                    Upload your TSV data to visualize methylation level distributions across sample groups.
                </p>
            </header>

            <main className="w-full max-w-5xl flex flex-col gap-8">
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-100">1. Upload Data File</h2>
                    <FileUpload onFileSelect={handleFileSelect} />
                    {file && <p className="text-gray-400 mt-3">Selected file: <span className="font-medium text-green-400">{file.name}</span></p>}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={!file || isLoading}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        {isLoading ? 'Analyzing...' : '2. Run Analysis'}
                    </button>
                </div>

                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">{error}</div>}

                {isLoading && <Loader />}

                {results && !isLoading && (
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-gray-700">
                         <h2 className="text-2xl font-semibold mb-4 text-gray-100">3. Analysis Results</h2>
                        <ResultsDisplay results={results} />
                    </div>
                )}
            </main>
             <footer className="w-full max-w-5xl mt-12 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Methylation Analyzer. Built with React, TypeScript, and Tailwind CSS.</p>
            </footer>
        </div>
    );
};

export default App;
