/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  Play,
  Square,
  ArrowRight,
  Trophy,
  PartyPopper,
  Info
} from 'lucide-react';
import { GameState, RoundResult } from './types';
import { gameAudio } from './utils/audio';
import Scoreboard from './components/Scoreboard';

const TARGET_TIMES = [7, 15, 5, 9, 21, 11, 19, 25, 3, 20];

export default function App() {
  // Game states
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [targetTime, setTargetTime] = useState<number>(TARGET_TIMES[0]);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [score, setScore] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHowTo, setShowHowTo] = useState<boolean>(false);

  const [roundResults, setRoundResults] = useState<RoundResult[]>(() => 
    Array.from({ length: 10 }, (_, idx) => ({
      round: idx + 1,
      targetTime: TARGET_TIMES[idx],
      actualTime: null,
      score: null,
    }))
  );

  // Initialize game on mount
  useEffect(() => {
    initGame();
  }, []);

  // Initialize or Reset the full game
  const initGame = () => {
    const initialResults = Array.from({ length: 10 }, (_, idx) => ({
      round: idx + 1,
      targetTime: TARGET_TIMES[idx],
      actualTime: null,
      score: null,
    }));

    setRoundResults(initialResults);
    setCurrentRound(1);
    setTargetTime(TARGET_TIMES[0]);
    setGameState(GameState.READY);
    setElapsedTime(0);
    setScore(null);

    if (soundEnabled) {
      gameAudio.playBeep(440, 'sine', 0.15, 0.1); // subtle high intro beep
    }
  };

  // Start the timer for the current round
  const handleStart = () => {
    if (soundEnabled) {
      gameAudio.playStart();
    }
    setStartTime(performance.now());
    setGameState(GameState.RUNNING);
  };

  // Stop the timer and calculate results
  const handleStop = () => {
    const stopTime = performance.now();
    if (soundEnabled) {
      gameAudio.playStop();
    }

    const duration = (stopTime - startTime) / 1000;
    setElapsedTime(duration);

    // Round the actual duration to the nearest integer for 3rd graders
    const roundedDuration = Math.round(duration);

    const difference = Math.abs(targetTime - roundedDuration);
    // Score is 10 minus difference, floored at 0 to avoid negative feedback
    let calculatedScore = Math.max(0, 10 - difference);
    calculatedScore = Math.round(calculatedScore);

    setScore(calculatedScore);
    setGameState(GameState.FINISHED);

    // Update scoreboard
    const updatedResults = [...roundResults];
    updatedResults[currentRound - 1] = {
      round: currentRound,
      targetTime: targetTime,
      actualTime: duration,
      score: calculatedScore
    };
    setRoundResults(updatedResults);

    // Sound reactions based on score accuracy
    if (soundEnabled) {
      if (calculatedScore >= 9.0) {
        setTimeout(() => gameAudio.playSuccess(), 100);
      } else if (calculatedScore >= 6.0) {
        setTimeout(() => gameAudio.playBeep(587.33, 'triangle', 0.2, 0.15), 100); // Friendly bounce
      } else {
        setTimeout(() => gameAudio.playFailure(), 100);
      }
    }
  };

  // Move to the next round or show game over screen
  const handleNextRound = () => {
    if (currentRound < 10) {
      const nextRoundNum = currentRound + 1;
      const nextTarget = TARGET_TIMES[nextRoundNum - 1];

      const updatedResults = [...roundResults];
      updatedResults[nextRoundNum - 1] = {
        round: nextRoundNum,
        targetTime: nextTarget,
        actualTime: null,
        score: null
      };

      setRoundResults(updatedResults);
      setCurrentRound(nextRoundNum);
      setTargetTime(nextTarget);
      setGameState(GameState.READY);
      setElapsedTime(0);
      setScore(null);

      if (soundEnabled) {
        gameAudio.playBeep(523.25, 'sine', 0.1, 0.1);
      }
    } else {
      // Game finished (10 rounds complete)
      setGameState(GameState.GAME_OVER);
      if (soundEnabled) {
        gameAudio.playVictory();
      }
    }
  };

  // Calculate cumulative total score
  const totalScore = roundResults.reduce((sum, res) => sum + (res.score || 0), 0);

  // Generate kid-friendly feedback based on round score
  const getFeedbackMessage = () => {
    if (score === null) {
      return {
        emoji: '',
        text: '',
        color: '',
        bg: ''
      };
    }
    if (score >= 9.5) {
      return {
        emoji: '👑',
        text: '우와! 완벽해요! 머릿속에 진짜 정밀 시계가 있나 봐요!',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 border-emerald-200'
      };
    }
    if (score >= 8.5) {
      return {
        emoji: '⭐',
        text: '엄청나요! 정말 한 끗 차이로 맞췄어요!',
        color: 'text-green-600',
        bg: 'bg-green-50 border-green-200'
      };
    }
    if (score >= 7.0) {
      return {
        emoji: '👏',
        text: '대단해요! 시간 감각이 아주 정확해지고 있어요!',
        color: 'text-amber-600',
        bg: 'bg-amber-50 border-amber-200'
      };
    }
    if (score >= 5.0) {
      return {
        emoji: '👍',
        text: '좋아요! 조금만 더 세심하게 마음속 박자를 타 볼까요?',
        color: 'text-sky-600',
        bg: 'bg-sky-50 border-sky-100'
      };
    }
    return {
      emoji: '🎈',
      text: '앗! 마음이 조금 급했거나 느긋했나 봐요. 연습할수록 늘어납니다!',
      color: 'text-rose-500',
      bg: 'bg-rose-50 border-rose-100'
    };
  };

  // Generate kid-friendly summary rank based on total score
  const getFinalRank = () => {
    if (totalScore >= 90) {
      return {
        title: '👑 절대 시간의 제왕',
        desc: '혹시 눈을 감으면 마음속에서 째깍거리는 시계 태엽 소리가 들리나요? 우주 최강의 시간 감각을 가졌어요!',
        badgeColor: 'bg-emerald-500 text-white border-emerald-300'
      };
    }
    if (totalScore >= 75) {
      return {
        title: '🕰️ 시간 마술사',
        desc: '눈 깜짝할 사이에 정교한 1초를 뚝딱 만들어내는 시간의 마술사군요! 정말 뛰어납니다!',
        badgeColor: 'bg-amber-500 text-white border-amber-300'
      };
    }
    if (totalScore >= 55) {
      return {
        title: '⏱️ 무한 도전 탐험가',
        desc: '시간의 흐름을 잘 파악하고 있는 멋진 모험가입니다! 조금만 더 하면 시간의 왕이 될 수 있어요.',
        badgeColor: 'bg-sky-500 text-white border-sky-300'
      };
    }
    return {
      title: '🌱 무럭무럭 꿈나무 시계',
      desc: '포기하지 않고 끝까지 성실하게 10문제를 풀어내어 정말 기특해요! 다시 하면 더 잘할 거예요.',
      badgeColor: 'bg-rose-400 text-white border-rose-300'
    };
  };

  const feedback = getFeedbackMessage();
  const finalRank = getFinalRank();

  return (
    <div className="min-h-screen py-6 px-4 md:py-12 md:px-8 max-w-6xl mx-auto flex flex-col justify-between">
      {/* Header section with cute title and info toggle */}
      <header className="flex items-center justify-between mb-6 bg-white p-4 rounded-3xl border-4 border-amber-300 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-2xl border-2 border-amber-300 animate-wiggle">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-amber-900 tracking-tight">
              ⏱️ 1초 감각 키우기 게임!
            </h1>
            <p className="text-xs md:text-sm text-amber-700/80 font-bold">
              눈을 감고 내 머릿속의 정확한 초(秒) 시계를 훈련해요!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio controller */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${
              soundEnabled 
                ? 'bg-amber-100 border-amber-300 text-amber-700' 
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
            title={soundEnabled ? '소리 켜짐' : '소리 꺼짐'}
            id="sound-toggle-btn"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Guide toggle */}
          <button
            onClick={() => setShowHowTo(!showHowTo)}
            className="p-2.5 bg-sky-100 border-2 border-sky-300 text-sky-700 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1 font-bold text-sm"
            id="guide-toggle-btn"
          >
            <Info className="w-5 h-5" />
            <span className="hidden sm:inline">방법 안내</span>
          </button>
        </div>
      </header>

      {/* Guide overlay */}
      <AnimatePresence>
        {showHowTo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-5 bg-yellow-50 border-4 border-dashed border-yellow-300 rounded-3xl text-yellow-900 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-display font-bold flex items-center gap-1.5 text-yellow-800">
                <HelpCircle className="w-5 h-5 text-amber-500 animate-pulse" /> 게임 방법 알아보기
              </h3>
              <button 
                onClick={() => setShowHowTo(false)}
                className="text-yellow-600 hover:text-yellow-800 font-bold text-sm bg-yellow-100 px-2.5 py-1 rounded-xl border border-yellow-200"
              >
                닫기 ✕
              </button>
            </div>
            <ul className="list-decimal list-inside space-y-1.5 text-sm md:text-base font-semibold text-yellow-800">
              <li>화면 중앙에 <span className="text-rose-500 font-extrabold">목표 초(1~30초)</span>가 무작위로 제시됩니다.</li>
              <li>초록색 <span className="text-emerald-600 font-extrabold">시작 버튼 ▶️</span>을 누르면 눈을 지그시 감고 속으로 정확히 시간을 셉니다.</li>
              <li>목표 시간이 다 지났다고 생각하면 빨간색 <span className="text-rose-600 font-extrabold">멈춤 버튼 🛑</span>을 누릅니다!</li>
              <li>실제 누른 시간에서 <span className="text-amber-600 font-extrabold">소수점은 반올림(가장 가까운 초)</span>해서 점수를 구해요! <span className="font-extrabold">(점수 = 10 - 반올림한 오차 초)</span></li>
              <li>총 10라운드를 완수하여 <span className="text-sky-600 font-extrabold">최종 시간 마술사 칭호</span>에 도전하세요!</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout container (Left: game area, Right: scoreboard) */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-grow">
        
        {/* LEFT: Game Area */}
        <main className="flex-grow bg-white border-4 border-amber-300 rounded-3xl p-6 md:p-10 flex flex-col items-center justify-between shadow-md relative overflow-hidden min-h-[460px]">
          
          {/* Decorative subtle background grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

          {gameState !== GameState.GAME_OVER ? (
            <>
              {/* Round Title and Progression indicator */}
              <div className="w-full flex flex-col items-center gap-2 z-10">
                <div className="px-5 py-1.5 bg-amber-100 text-amber-900 border-2 border-amber-300 font-display text-lg md:text-xl rounded-full shadow-sm flex items-center gap-1">
                  🎈 제 {currentRound} 라운드 / 10
                </div>
                {/* Visual tiny step bar */}
                <div className="flex items-center gap-1.5 mt-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                        i + 1 < currentRound 
                          ? 'bg-emerald-400 border border-emerald-500 scale-95' 
                          : i + 1 === currentRound
                          ? 'bg-amber-400 ring-4 ring-amber-200 animate-pulse scale-110'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Target presentation card */}
              <div className="my-6 text-center z-10">
                <p className="text-base md:text-lg text-slate-500 font-bold mb-1">
                  {gameState === GameState.RUNNING 
                    ? '눈을 지그시 감고 머릿속으로 세어보세요!' 
                    : '아래 버튼을 눌러 출발 준비를 하세요!'}
                </p>
                <motion.div 
                  key={targetTime}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-6xl md:text-8xl text-sky-600 drop-shadow-sm flex items-baseline justify-center gap-1 select-none"
                >
                  {targetTime}<span className="text-3xl md:text-4xl text-sky-500 font-bold">초</span>
                </motion.div>
              </div>

              {/* Central control panel */}
              <div className="flex flex-col items-center justify-center w-full my-4 z-10">
                <AnimatePresence mode="wait">
                  {gameState === GameState.READY && (
                    <motion.div
                      key="ready-state"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <button
                        onClick={handleStart}
                        className="w-48 h-48 rounded-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 border-b-[10px] border-emerald-700 hover:border-b-[8px] active:border-b-[2px] hover:translate-y-[2px] active:translate-y-[8px] text-white font-display text-3xl font-extrabold flex flex-col items-center justify-center gap-1 shadow-lg transition-all cursor-pointer animate-pulse-slow"
                        id="ready-start-btn"
                      >
                        <Play className="w-10 h-10 fill-current" />
                        <span>시작! ▶️</span>
                      </button>
                      <p className="text-slate-500 font-bold text-sm text-center">
                        초록색 버튼을 누르면 마음속 시간이 출발해요!
                      </p>
                    </motion.div>
                  )}

                  {gameState === GameState.RUNNING && (
                    <motion.div
                      key="running-state"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <button
                        onClick={handleStop}
                        className="w-48 h-48 rounded-full bg-rose-500 hover:bg-rose-400 active:bg-rose-600 border-b-[10px] border-rose-700 hover:border-b-[8px] active:border-b-[2px] hover:translate-y-[2px] active:translate-y-[8px] text-white font-display text-3xl font-extrabold flex flex-col items-center justify-center gap-1 shadow-lg transition-all cursor-pointer animate-ping-once"
                        id="running-stop-btn"
                      >
                        <Square className="w-10 h-10 fill-current" />
                        <span>멈춤! 🛑</span>
                      </button>
                      
                      {/* Heartbeat pulsing clock to indicate action */}
                      <div className="flex items-center gap-1.5 bg-rose-50 text-rose-500 px-4 py-1.5 rounded-full border border-rose-200 animate-pulse">
                        <Clock className="w-4 h-4 animate-spin-slow" />
                        <span className="text-xs font-extrabold">째깍째깍... 머릿속 타이머 가동 중!</span>
                      </div>
                    </motion.div>
                  )}

                  {gameState === GameState.FINISHED && (
                    <motion.div
                      key="finished-state"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="flex flex-col items-center w-full max-w-md gap-5"
                    >
                      {/* Interactive score evaluation card */}
                      <div className={`w-full p-4 md:p-6 rounded-3xl border-3 text-center shadow-inner ${feedback.bg}`}>
                        <div className="text-4xl mb-1">{feedback.emoji}</div>
                        <h4 className={`text-lg font-bold ${feedback.color} mb-3`}>
                          {feedback.text}
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-2 border-t-2 border-dashed border-slate-200/50 pt-3 text-slate-700 font-bold">
                          <div>
                            <span className="block text-xs text-slate-400">목표 시간</span>
                            <span className="text-lg font-display text-sky-600">{targetTime}초</span>
                          </div>
                          <div className="border-x border-slate-200">
                            <span className="block text-xs text-slate-400">내가 누른 시간</span>
                            <span className="text-lg font-display text-amber-600">
                              {Math.round(elapsedTime)}초
                            </span>
                          </div>
                          <div>
                            <span className="block text-xs text-slate-400">차이</span>
                            <span className="text-lg font-display text-rose-500">
                              {Math.abs(targetTime - Math.round(elapsedTime))}초
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Display Score Big */}
                      <div className="text-center">
                        <span className="text-sm font-bold text-slate-400 block">라운드 점수</span>
                        <div className="text-4xl md:text-5xl font-display text-amber-500 animate-bounce">
                          +{score}점!
                        </div>
                      </div>

                      {/* Next button */}
                      <button
                        onClick={handleNextRound}
                        className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-display text-xl font-bold rounded-2xl flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border-b-4 border-sky-700 active:border-b-0"
                        id="next-round-btn"
                      >
                        <span>{currentRound === 10 ? '최종 결과 확인하기 🏆' : '다음 문제로 ▶️'}</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Subtitle / Tip of the day */}
              <div className="w-full flex items-center justify-center gap-1 text-slate-400 font-bold text-xs mt-4 select-none">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>팁: 일정한 박자(예: 똑-딱)로 마음속 숫자를 세면 훨씬 더 정확해요!</span>
              </div>
            </>
          ) : (
            /* GAME OVER: Result analysis & custom rank badge */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full h-full flex flex-col items-center justify-center py-6 text-center z-10"
              id="game-over-container"
            >
              <div className="p-4 bg-amber-100 rounded-full border-4 border-amber-300 animate-wiggle mb-4">
                <PartyPopper className="w-16 h-16 text-amber-600" />
              </div>

              <h2 className="text-3xl md:text-4xl font-display text-slate-800 mb-2">
                🎉 최종 결과를 확인하세요! 🎉
              </h2>
              
              <p className="text-slate-500 font-bold text-sm md:text-base mb-6">
                10라운드의 박진감 넘치는 시간 훈련을 멋지게 마쳤어요!
              </p>

              {/* Total Summary Card */}
              <div className="w-full max-w-lg bg-yellow-50 border-4 border-yellow-300 rounded-3xl p-6 mb-8 text-yellow-900 shadow-sm">
                <span className="text-xs uppercase tracking-wider text-yellow-600/80 font-bold block mb-1">나의 최종 칭호</span>
                <div className={`inline-block px-5 py-1 text-lg font-bold font-display rounded-full border-2 mb-4 ${finalRank.badgeColor}`}>
                  {finalRank.title}
                </div>
                <p className="text-base md:text-lg font-bold mb-4 leading-relaxed text-yellow-950">
                  {finalRank.desc}
                </p>

                <div className="border-t-2 border-dashed border-yellow-200 pt-4 flex justify-around items-center">
                  <div>
                    <span className="text-xs text-yellow-600 font-bold block">총 누적 점수</span>
                    <span className="text-3xl md:text-4xl font-display text-amber-600">
                      {totalScore} <span className="text-lg">/ 100</span>
                    </span>
                  </div>
                  <div className="w-px h-12 bg-yellow-200" />
                  <div>
                    <span className="text-xs text-yellow-600 font-bold block">평균 차이</span>
                    <span className="text-2xl md:text-3xl font-display text-rose-500">
                      {Math.round(
                        roundResults.reduce((sum, res) => sum + Math.abs(res.targetTime - Math.round(res.actualTime || 0)), 0) / 10
                      )}초
                    </span>
                  </div>
                </div>
              </div>

              {/* Retry button */}
              <button
                onClick={initGame}
                className="px-10 py-4.5 bg-emerald-500 hover:bg-emerald-400 text-white font-display text-2xl font-bold rounded-2xl flex items-center gap-2.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border-b-6 border-emerald-700 active:border-b-0"
                id="retry-game-btn"
              >
                <RotateCcw className="w-6 h-6" />
                <span>다시 도전하기 🔄</span>
              </button>
            </motion.div>
          )}
        </main>

        {/* RIGHT: Scores display board */}
        <Scoreboard 
          roundResults={roundResults} 
          currentRound={currentRound} 
          totalScore={totalScore} 
        />

      </div>

      {/* Simple elegant footer */}
      <footer className="mt-6 text-center text-xs md:text-sm font-bold text-amber-700/60 select-none flex items-center justify-center gap-1">
        <span>⏱️ 1초 감각 키우기 게임 &copy; 2026. 초등 교육용 안전 가이드 라인 준수.</span>
      </footer>
    </div>
  );
}
