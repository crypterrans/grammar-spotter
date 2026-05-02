import React, { useState, useEffect } from 'react';
import dictionary from './grammarDictionary.json';

function App() {
  // Phase: 'setup', 'playing', 'turnOver', 'gameOver'
  const [phase, setPhase] = useState('setup');
  
  // Game Settings
  const [groups, setGroups] = useState([
    { id: 1, name: 'Group 1', score: 0 },
    { id: 2, name: 'Group 2', score: 0 }
  ]);
  const [turnTimerLimit, setTurnTimerLimit] = useState(60);
  const [level, setLevel] = useState('Elementary');
  
  // Active Game State
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTurnActive, setIsTurnActive] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  
  // Animations
  const [animatingWordIndex, setAnimatingWordIndex] = useState(null);
  const [animState, setAnimState] = useState(null); // 'correct' | 'incorrect'
  const [addedTimeKey, setAddedTimeKey] = useState(0); // Triggers the +2s animation

  const currentLevelData = dictionary[level];
  const currentSentenceData = currentLevelData[currentIndex % currentLevelData.length]; // Loop safely
  const currentGroup = groups[currentGroupIndex];

  // Global Timer
  useEffect(() => {
    if (!isTurnActive) return;

    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else {
      handleTurnOver();
    }
  }, [timeLeft, isTurnActive]);

  const handleTurnOver = () => {
    setIsTurnActive(false);
    setPhase('turnOver');
  };

  // Setup Handlers
  const addGroup = () => {
    if (groups.length < 10) {
      setGroups([...groups, { id: Date.now(), name: `Group ${groups.length + 1}`, score: 0 }]);
    }
  };

  const removeGroup = (id) => {
    if (groups.length > 1) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  const updateGroupName = (id, newName) => {
    setGroups(groups.map(g => g.id === id ? { ...g, name: newName } : g));
  };

  const startGame = () => {
    setGroups(groups.map(g => ({ ...g, score: 0 })));
    setCurrentGroupIndex(0);
    setCurrentIndex(0);
    setGameHistory([]);
    setTimeLeft(turnTimerLimit);
    setPhase('playing');
    setIsTurnActive(false); // Wait for them to click "Start Turn"
  };

  const stripPunctuation = (word) => {
    return word.replace(/[.,!?]/g, '');
  };

  const handleWordClick = (wordRaw, index) => {
    if (!isTurnActive || animatingWordIndex !== null) return; // Prevent double clicks

    const cleanedWord = stripPunctuation(wordRaw);
    const isCorrect = cleanedWord.toLowerCase() === currentSentenceData.errorWord.toLowerCase();

    setAnimatingWordIndex(index);
    setAnimState(isCorrect ? 'correct' : 'incorrect');

    // Update score immediately so they feel the impact
    setGroups(prev => {
      const newGroups = [...prev];
      newGroups[currentGroupIndex].score += isCorrect ? 10 : -5;
      return newGroups;
    });

    if (isCorrect) {
      setTimeLeft(prev => prev + 2);
      setAddedTimeKey(prev => prev + 1); // trigger animation
    }

    // Record history for the review phase
    setGameHistory(prev => [...prev, {
      groupName: currentGroup.name,
      sentence: currentSentenceData.sentence,
      errorWord: currentSentenceData.errorWord,
      guessedWord: cleanedWord,
      correction: currentSentenceData.correction,
      explanation: currentSentenceData.explanation,
      isCorrect
    }]);

    // Auto-advance after 1 second
    setTimeout(() => {
      setAnimatingWordIndex(null);
      setAnimState(null);
      setCurrentIndex(prev => prev + 1);
    }, 800);
  };

  const nextTurn = () => {
    if (currentGroupIndex + 1 < groups.length) {
      setCurrentGroupIndex(prev => prev + 1);
      setTimeLeft(turnTimerLimit);
      setPhase('playing');
      setIsTurnActive(false);
    } else {
      setPhase('gameOver');
    }
  };

  // Render Setup
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8 mt-10">
          Grammar Spotter Setup
        </h1>
        
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 w-full max-w-3xl space-y-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="flex-1">
              <label className="block text-gray-400 uppercase tracking-widest text-sm font-bold mb-2">Difficulty Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-gray-700 text-white text-lg font-semibold py-3 px-4 rounded-xl border border-gray-600 focus:ring-2 focus:ring-purple-500 cursor-pointer">
                <option value="Elementary">Elementary</option>
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-400 uppercase tracking-widest text-sm font-bold mb-2">Seconds Per Group</label>
              <input type="number" value={turnTimerLimit} onChange={e => setTurnTimerLimit(Number(e.target.value))} className="w-full bg-gray-700 text-white text-lg font-semibold py-3 px-4 rounded-xl border border-gray-600 focus:ring-2 focus:ring-purple-500" min="10" max="300" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-gray-400 uppercase tracking-widest text-sm font-bold">Groups ({groups.length}/10)</label>
              {groups.length < 10 && (
                <button onClick={addGroup} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">+ Add Group</button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group, idx) => (
                <div key={group.id} className="flex items-center space-x-2 bg-gray-700 p-2 rounded-xl">
                  <span className="font-black text-gray-400 pl-2">#{idx + 1}</span>
                  <input type="text" value={group.name} onChange={e => updateGroupName(group.id, e.target.value)} className="flex-grow bg-transparent text-white font-bold p-2 focus:outline-none focus:ring-1 focus:ring-purple-400 rounded" />
                  {groups.length > 1 && (
                    <button onClick={() => removeGroup(group.id)} className="text-red-400 hover:text-red-300 p-2 font-bold">X</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button onClick={startGame} className="w-full mt-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-2xl font-black py-4 rounded-xl shadow-lg transform transition-transform hover:scale-105 active:scale-95">
            START GAME!
          </button>
        </div>
      </div>
    );
  }

  // Render Game Over & Review
  if (phase === 'gameOver') {
    const sortedGroups = [...groups].sort((a, b) => b.score - a.score);
    const winner = sortedGroups[0];

    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6 py-12">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4 text-center">
          Game Over!
        </h1>
        <h2 className="text-3xl font-black text-white mb-12">Winner: {winner.name} ({winner.score} pts)</h2>

        <div className="w-full max-w-4xl bg-gray-800 rounded-3xl p-8 shadow-2xl mb-12 border border-gray-700">
          <h3 className="text-2xl font-bold text-gray-400 mb-6 uppercase tracking-widest text-center border-b border-gray-700 pb-4">Final Leaderboard</h3>
          <div className="grid gap-4">
            {sortedGroups.map((g, i) => (
              <div key={g.id} className={`flex justify-between items-center p-4 rounded-xl ${i === 0 ? 'bg-yellow-900/50 border border-yellow-600' : 'bg-gray-700'}`}>
                <span className="text-2xl font-black">{i + 1}. {g.name}</span>
                <span className="text-3xl font-bold text-green-400">{g.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-5xl bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700">
          <h3 className="text-2xl font-bold text-gray-400 mb-8 uppercase tracking-widest text-center border-b border-gray-700 pb-4">Activity Review & Explanations</h3>
          <div className="space-y-6">
            {gameHistory.map((h, i) => (
              <div key={i} className={`p-6 rounded-2xl border-l-8 ${h.isCorrect ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-2xl font-medium">{h.sentence}</p>
                  <span className="text-sm font-bold text-gray-400 ml-4 bg-gray-900 px-3 py-1 rounded-full">{h.groupName}</span>
                </div>
                
                <div className="flex items-center space-x-4 mb-4 bg-gray-900/50 p-4 rounded-xl inline-block">
                  <span className={`text-xl font-bold line-through decoration-4 ${h.isCorrect ? 'text-green-300 decoration-green-600' : 'text-rose-400 decoration-rose-600'}`}>
                    {h.guessedWord}
                  </span>
                  <span className="text-gray-500 text-xl">➔</span>
                  <span className="text-green-400 text-2xl font-black">
                    {h.correction}
                  </span>
                </div>
                
                <p className="text-lg text-blue-200">{h.explanation}</p>
              </div>
            ))}
          </div>
        </div>
        
        <button onClick={() => setPhase('setup')} className="mt-12 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-10 rounded-full transition-all">
          Back to Setup
        </button>
      </div>
    );
  }

  // Render Playing & Turn Over
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mt-4 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-700 rounded-t-2xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-linear" 
            style={{ width: `${(timeLeft / turnTimerLimit) * 100}%` }}
          />
        </div>

        <div className="flex flex-col">
          <span className="text-gray-400 uppercase tracking-widest text-sm font-bold">Current Turn</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">{currentGroup.name}</h2>
        </div>
        
        <div className="flex items-center space-x-8 mt-4 md:mt-0">
          <div className="flex flex-col items-end">
            <span className="text-gray-400 uppercase tracking-widest text-sm font-bold">Group Score</span>
            <span className={`text-4xl font-black ${currentGroup.score < 0 ? 'text-red-400' : 'text-green-400'}`}>{currentGroup.score}</span>
          </div>

          <div className="flex flex-col items-end relative">
            <span className="text-gray-400 uppercase tracking-widest text-sm font-bold">Time Left</span>
            <span className={`text-5xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>{timeLeft}s</span>
            {/* +2s Animation */}
            {addedTimeKey > 0 && (
              <span key={addedTimeKey} className="absolute -top-6 -right-8 text-green-400 font-black text-2xl animate-bounce-fade-up pointer-events-none drop-shadow-md">
                +2s
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-5xl my-10 relative">
        
        {phase === 'turnOver' ? (
          <div className="text-center animate-fade-in-up bg-gray-800 p-12 rounded-3xl border border-gray-700 shadow-2xl">
            <h2 className="text-6xl font-black text-rose-500 mb-6">Time's Up!</h2>
            <p className="text-3xl text-gray-300 mb-10">{currentGroup.name} scored <span className="font-bold text-white">{currentGroup.score}</span> points.</p>
            <button 
              onClick={nextTurn}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-3xl font-black py-5 px-16 rounded-full shadow-lg transform transition-transform hover:scale-105"
            >
              Next Group ➔
            </button>
          </div>
        ) : !isTurnActive ? (
          <div className="text-center animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-300 mb-8">Get ready, {currentGroup.name}!</h2>
            <button 
              onClick={() => setIsTurnActive(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-4xl font-black py-6 px-20 rounded-full shadow-2xl transform transition-transform hover:scale-110 pulse"
            >
              Start Turn
            </button>
          </div>
        ) : (
          <div className="text-center w-full animate-fade-in-up">
            <h2 className="text-gray-400 uppercase tracking-widest text-xl font-bold mb-12">Find the Error:</h2>
            
            <div className="flex flex-wrap justify-center gap-4">
              {currentSentenceData.sentence.split(' ').map((word, index) => {
                const isAnimating = animatingWordIndex === index;
                let btnColor = 'bg-gray-800 text-white border-2 border-gray-700 hover:bg-gray-700 hover:border-purple-500 hover:scale-110';
                
                if (isAnimating) {
                  btnColor = animState === 'correct' 
                    ? 'bg-green-500 text-white border-2 border-green-400 scale-110 shadow-[0_0_20px_rgba(34,197,94,0.6)]' 
                    : 'bg-rose-600 text-white border-2 border-rose-500 scale-95 shadow-[0_0_20px_rgba(225,29,72,0.6)]';
                }

                return (
                  <button
                    key={`${currentIndex}-${index}`} // Force re-render on new sentence
                    onClick={() => handleWordClick(word, index)}
                    disabled={animatingWordIndex !== null}
                    className={`text-5xl md:text-7xl font-black py-5 px-8 rounded-3xl shadow-xl transition-all duration-200 cursor-pointer active:scale-95 ${btnColor}`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Leaderboard Sidebar/Bottom depending on screen */}
      <div className="fixed bottom-6 right-6 hidden xl:block bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-700 w-64">
        <h3 className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-4 border-b border-gray-700 pb-2">Leaderboard</h3>
        <div className="space-y-3">
          {[...groups].sort((a,b) => b.score - a.score).map((g, i) => (
            <div key={g.id} className={`flex justify-between items-center ${g.id === currentGroup.id ? 'text-white font-bold' : 'text-gray-400'}`}>
              <span className="truncate pr-2">{i+1}. {g.name}</span>
              <span className={g.score > 0 ? 'text-green-400' : g.score < 0 ? 'text-red-400' : ''}>{g.score}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;
