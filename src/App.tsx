import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronLeft, ChevronRight, Moon, Sun, Award, Users, User, Info } from 'lucide-react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

import { DailyLog, AmalCategory } from './types';
import { AMAL_TARGETS, RAMADAN_START_DATE, RAMADAN_DAYS } from './constants';
import { AmalItem } from './components/AmalItem';
import { Dashboard } from './components/Dashboard';
import { cn, getRamadanDay } from './utils';

export default function App() {
  const [logs, setLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('ramadan_logs_1447');
    return saved ? JSON.parse(saved) : [];
  });

  const [customTargetValues, setCustomTargetValues] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('ramadan_targets_1447');
    if (saved) return JSON.parse(saved);
    
    // Default from constants
    const defaults: Record<string, number> = {};
    AMAL_TARGETS.forEach(t => {
      defaults[t.id] = t.targetValue;
    });
    return defaults;
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to today if it's within Ramadan, otherwise start of Ramadan
    const today = format(new Date(), 'yyyy-MM-dd');
    const start = new Date(RAMADAN_START_DATE);
    const end = addDays(start, RAMADAN_DAYS);
    const now = new Date();
    
    if (now >= start && now <= end) return today;
    return RAMADAN_START_DATE;
  });

  const [activeCategory, setActiveCategory] = useState<AmalCategory>(AmalCategory.INDIVIDU);

  useEffect(() => {
    localStorage.setItem('ramadan_logs_1447', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('ramadan_targets_1447', JSON.stringify(customTargetValues));
  }, [customTargetValues]);

  const currentLog = useMemo(() => {
    return logs.find(l => l.date === selectedDate) || { date: selectedDate, values: {} };
  }, [logs, selectedDate]);

  const handleAmalChange = (amalId: string, value: number) => {
    setLogs(prev => {
      const existingIdx = prev.findIndex(l => l.date === selectedDate);
      if (existingIdx >= 0) {
        const newLogs = [...prev];
        newLogs[existingIdx] = {
          ...newLogs[existingIdx],
          values: { ...newLogs[existingIdx].values, [amalId]: value }
        };
        return newLogs;
      } else {
        return [...prev, { date: selectedDate, values: { [amalId]: value } }];
      }
    });
  };

  const handleTargetChange = (amalId: string, value: number) => {
    setCustomTargetValues(prev => ({
      ...prev,
      [amalId]: value
    }));
  };

  const ramadanDay = getRamadanDay(selectedDate, RAMADAN_START_DATE);
  
  const filteredTargets = AMAL_TARGETS.filter(t => {
    if (t.category !== activeCategory) return false;
    if (t.frequency === 'last10days' && ramadanDay < 21) return false;
    return true;
  });

  const ramadanDates = useMemo(() => {
    return Array.from({ length: RAMADAN_DAYS }).map((_, i) => {
      const date = addDays(new Date(RAMADAN_START_DATE), i);
      return format(date, 'yyyy-MM-dd');
    });
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-ramadan-gold/10 text-ramadan-gold text-xs font-bold uppercase tracking-widest mb-4"
        >
          <Moon className="w-3 h-3" />
          Ramadan 1447 H
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-2 text-ramadan-ink">
          Mutaba'ah Yaumiyah
        </h1>
        <p className="text-ramadan-ink/60 font-serif italic text-lg">
          "Terbentuknya pribadi yang lebih bertakwa, berakhlak, dan peduli"
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        {/* Date Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-ramadan-gold" />
              Pilih Hari
            </h2>
            <div className="text-sm font-medium text-ramadan-gold">
              Hari ke-{ramadanDay} Ramadan
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
            {ramadanDates.map((dateStr, idx) => {
              const isSelected = selectedDate === dateStr;
              const dateObj = parseISO(dateStr);
              const isToday = isSameDay(new Date(), dateObj);
              
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all snap-start",
                    isSelected 
                      ? "bg-ramadan-accent text-white shadow-xl shadow-ramadan-accent/20 scale-105" 
                      : "bg-white border border-black/5 text-ramadan-ink/60 hover:border-ramadan-gold/50",
                    isToday && !isSelected && "border-ramadan-gold border-2"
                  )}
                >
                  <span className="text-[10px] uppercase font-bold opacity-60">
                    {format(dateObj, 'EEE', { locale: id })}
                  </span>
                  <span className="text-xl font-serif font-bold">
                    {idx + 1}
                  </span>
                  {isToday && <div className="w-1 h-1 rounded-full bg-ramadan-gold mt-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard */}
        <Dashboard logs={logs} currentDate={selectedDate} customTargets={customTargetValues} />

        {/* Category Tabs */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 flex p-1 bg-ramadan-gold/10 rounded-2xl">
            <button
              onClick={() => setActiveCategory(AmalCategory.INDIVIDU)}
              className={cn(
                "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all",
                activeCategory === AmalCategory.INDIVIDU 
                  ? "bg-white text-ramadan-accent shadow-sm" 
                  : "text-ramadan-ink/50 hover:text-ramadan-ink"
              )}
            >
              <User className="w-4 h-4" />
              Individu
            </button>
            <button
              onClick={() => setActiveCategory(AmalCategory.KELUARGA_MASYARAKAT)}
              className={cn(
                "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all",
                activeCategory === AmalCategory.KELUARGA_MASYARAKAT 
                  ? "bg-white text-ramadan-accent shadow-sm" 
                  : "text-ramadan-ink/50 hover:text-ramadan-ink"
              )}
            >
              <Users className="w-4 h-4" />
              Keluarga & Masyarakat
            </button>
          </div>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={cn(
              "px-4 py-3 rounded-2xl font-bold text-sm transition-all border",
              isEditMode 
                ? "bg-ramadan-gold text-white border-ramadan-gold" 
                : "bg-white border-black/5 text-ramadan-ink/50 hover:border-ramadan-gold/50"
            )}
          >
            {isEditMode ? "Selesai Edit" : "Atur Target"}
          </button>
        </div>

        {/* Amal List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTargets.map((target) => (
              <AmalItem
                key={target.id}
                target={target}
                value={currentLog.values[target.id] || 0}
                targetValue={customTargetValues[target.id]}
                isEditMode={isEditMode}
                onChange={(val) => isEditMode ? handleTargetChange(target.id, val) : handleAmalChange(target.id, val)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 glass-card border-dashed border-ramadan-gold/30 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-ramadan-gold/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-ramadan-gold" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-lg mb-1">Tips Evaluasi Formatif</h4>
            <p className="text-sm text-ramadan-ink/60 leading-relaxed">
              Gunakan aplikasi ini setiap malam sebelum tidur atau setelah sahur untuk mencatat progres Anda. 
              Jangan berkecil hati jika ada target yang belum tercapai, jadikan motivasi untuk lebih baik di hari esok. 
              Semoga Ramadan tahun ini membawa keberkahan bagi kita semua.
            </p>
          </div>
        </div>
      </main>

      {/* Floating Action / Summary */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
        <div className="bg-ramadan-ink text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ramadan-gold flex items-center justify-center">
              <Award className="w-6 h-6 text-ramadan-ink" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Pencapaian Hari Ini</div>
              <div className="text-lg font-serif font-bold">
                {Object.entries(currentLog.values).filter(([id, val]) => {
                  const target = AMAL_TARGETS.find(t => t.id === id);
                  const targetValue = customTargetValues[id] ?? target?.targetValue ?? 1;
                  return target && (val as number) >= targetValue;
                }).length} / {AMAL_TARGETS.filter(t => t.category === activeCategory).length} Target
              </div>
            </div>
          </div>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
          >
            Lihat Grafik
          </button>
        </div>
      </div>
    </div>
  );
}
