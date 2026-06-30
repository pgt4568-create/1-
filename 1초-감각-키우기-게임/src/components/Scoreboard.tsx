import { motion } from 'motion/react';
import { RoundResult } from '../types';
import { Star, Award, Trophy } from 'lucide-react';

interface ScoreboardProps {
  roundResults: RoundResult[];
  currentRound: number;
  totalScore: number;
}

export default function Scoreboard({ roundResults, currentRound, totalScore }: ScoreboardProps) {
  return (
    <div className="w-full lg:w-[320px] bg-sky-50/90 border-4 border-dashed border-sky-200 rounded-3xl p-6 flex flex-col justify-between shadow-inner h-full min-h-[500px]">
      <div>
        <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b-2 border-sky-100">
          <Trophy className="w-6 h-6 text-amber-500 animate-bounce" />
          <h2 className="text-2xl font-bold font-display text-sky-800 text-center">
            📊 알록달록 점수판
          </h2>
        </div>

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {roundResults.map((result) => {
            const isCompleted = result.actualTime !== null;
            const isCurrent = result.round === currentRound;

            let statusBg = 'bg-white border-slate-100 text-slate-400';
            let scoreColor = 'text-slate-400';

            if (isCompleted) {
              const score = result.score || 0;
              if (score >= 9) {
                statusBg = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                scoreColor = 'text-emerald-600 font-extrabold';
              } else if (score >= 7) {
                statusBg = 'bg-amber-50 border-amber-200 text-amber-800';
                scoreColor = 'text-amber-600 font-bold';
              } else {
                statusBg = 'bg-blue-50 border-blue-100 text-blue-800';
                scoreColor = 'text-blue-500 font-semibold';
              }
            } else if (isCurrent) {
              statusBg = 'bg-sky-100 border-sky-400 text-sky-900 font-bold shadow-sm';
            }

            return (
              <motion.div
                key={result.round}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: result.round * 0.05 }}
                className={`flex items-center justify-between p-3 border-2 rounded-2xl transition-all ${statusBg}`}
                id={`round-item-${result.round}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {isCompleted ? '⭐' : isCurrent ? '⏱️' : '🎈'}
                  </span>
                  <span className="font-display text-base">
                    {result.round}라운드
                  </span>
                </div>

                <div className="text-right text-sm">
                  {isCompleted ? (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-500 font-bold">
                        {result.targetTime}초 ➔ {result.actualTime !== null ? Math.round(result.actualTime) : 0}초
                      </span>
                      <span className={`text-base font-display ${scoreColor}`}>
                        {result.score}점
                      </span>
                    </div>
                  ) : isCurrent ? (
                    <span className="text-sky-600 font-display text-sm animate-pulse flex items-center gap-1">
                      도전 중! <Star className="w-3 h-3 fill-current animate-spin" />
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">대기 중</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mt-6 p-4 bg-sky-500 text-white rounded-2xl text-center shadow-md border-2 border-sky-300"
      >
        <div className="text-sm opacity-90 font-bold flex items-center justify-center gap-1">
          <Award className="w-4 h-4" /> 누적 점수
        </div>
        <div className="text-3xl font-bold font-display mt-1">
          {totalScore} <span className="text-xl">/ 100 점</span>
        </div>
      </motion.div>
    </div>
  );
}
