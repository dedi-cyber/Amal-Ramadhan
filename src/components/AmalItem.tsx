import React from 'react';
import { motion } from 'motion/react';
import { Check, Plus, Minus } from 'lucide-react';
import { AmalTarget, AmalType } from '../types';
import { cn, formatCurrency } from '../utils';

interface AmalItemProps {
  target: AmalTarget;
  value: number;
  targetValue: number;
  isEditMode?: boolean;
  onChange: (value: number) => void;
}

export const AmalItem: React.FC<AmalItemProps> = ({ target, value, targetValue, isEditMode, onChange }) => {
  const displayValue = isEditMode ? targetValue : value;
  const isCompleted = !isEditMode && value >= targetValue;

  return (
    <motion.div
      layout
      className={cn(
        "p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4",
        isEditMode 
          ? "bg-ramadan-gold/5 border-ramadan-gold/30"
          : isCompleted 
            ? "bg-ramadan-accent/5 border-ramadan-accent/20" 
            : "bg-white border-black/5 hover:border-ramadan-gold/30"
      )}
    >
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-lg font-medium leading-tight",
          isEditMode ? "text-ramadan-gold" : isCompleted ? "text-ramadan-accent" : "text-ramadan-ink"
        )}>
          {target.label}
        </h4>
        {target.description && (
          <p className="text-xs text-ramadan-ink/50 mt-1 italic">
            {target.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ramadan-gold">
            {isEditMode ? "Atur Target:" : "Target:"} {target.type === AmalType.CURRENCY ? formatCurrency(targetValue) : `${targetValue} ${target.unit || ''}`}
          </span>
          {target.frequency !== 'daily' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-ramadan-gold/10 text-ramadan-gold font-bold uppercase">
              {target.frequency === 'weekly' ? 'Pekan' : '10 Hari Akhir'}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {target.type === AmalType.BOOLEAN && !isEditMode ? (
          <button
            onClick={() => onChange(value === 1 ? 0 : 1)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              value === 1 
                ? "bg-ramadan-accent text-white shadow-lg shadow-ramadan-accent/20" 
                : "bg-ramadan-bg border border-black/10 text-ramadan-ink/30 hover:border-ramadan-accent/50"
            )}
          >
            <Check className={cn("w-5 h-5", value === 1 ? "scale-110" : "scale-90")} />
          </button>
        ) : (
          <div className={cn(
            "flex items-center bg-ramadan-bg rounded-full border border-black/5 p-1",
            isEditMode && "border-ramadan-gold/50 bg-ramadan-gold/5"
          )}>
            <button
              onClick={() => onChange(Math.max(0, displayValue - (target.type === AmalType.CURRENCY ? 500 : 1)))}
              className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-ramadan-ink/50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="px-3 min-w-[60px] text-center">
              <span className="font-mono font-bold text-sm">
                {displayValue}
              </span>
              <span className="text-[10px] block text-ramadan-ink/40 -mt-1">
                {target.unit || (target.type === AmalType.CURRENCY ? 'Rp' : '')}
              </span>
            </div>
            <button
              onClick={() => onChange(displayValue + (target.type === AmalType.CURRENCY ? 500 : 1))}
              className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-ramadan-ink/50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
