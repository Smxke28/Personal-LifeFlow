import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft,
  ChevronRight,
  Home, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Settings, 
  Plus, 
  Trash2, 
  Activity, 
  Download,
  Flame,
  CheckCircle2,
  Car,
  Utensils,
  Cpu,
  HeartPulse,
  LogOut,
  Sparkles,
  Dumbbell,
  Palette,
  Briefcase,
  Code,
  BookOpen,
  TrendingUp,
  PlusCircle,
  Lock,
  Delete
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction, CalendarBlock, CategoryData, Exercise, WorkoutSession, WorkoutSet, RecurringItem } from './types';

// Default initial data
const defaultExercises: Exercise[] = [
  { id: 'ex-1', name: 'Supino Reto', muscleGroup: 'Peito' },
  { id: 'ex-2', name: 'Agachamento Livre', muscleGroup: 'Pernas' },
  { id: 'ex-3', name: 'Desenvolvimento', muscleGroup: 'Ombros' }
];

const defaultTransactions = [
  { id: 'tx-1', amount: 45.00, category: 'food', description: 'Mercado Orgânico', timestamp: new Date(Date.now() - 3600000 * 24 * 3) },
  { id: 'tx-2', amount: 120.00, category: 'tech', description: 'Servidor Cloud', timestamp: new Date(Date.now() - 3600000 * 24 * 2) },
  { id: 'tx-3', amount: 35.00, category: 'transport', description: 'Passe de Metrô', timestamp: new Date(Date.now() - 3600000 * 12) }
];

const defaultBlocks = [
  { id: 'cal-1', time: '09:00 - 10:30', title: 'Foco Profundo: Arquitetura', category: 'work', durationMin: 90, completed: false },
  { id: 'cal-2', time: '11:00 - 12:00', title: 'Revisão de Sistema', category: 'personal', durationMin: 60, completed: false },
  { id: 'cal-3', time: '14:00 - 15:30', title: 'Mockups Interativos', category: 'work', durationMin: 90, completed: false },
  { id: 'cal-4', time: '16:00 - 17:00', title: 'Cardio', category: 'health', durationMin: 60, completed: false }
];

const baseCategories = [
  { name: 'food', label: 'Alimentação', color: 'var(--color-accent)', iconName: 'Utensils', type: 'expense' },
  { name: 'transport', label: 'Transporte', color: '#38bdf8', iconName: 'Car', type: 'expense' },
  { name: 'tech', label: 'Tecnologia', color: 'var(--color-accent)', iconName: 'Cpu', type: 'expense' },
  { name: 'health', label: 'Saúde', color: '#10b981', iconName: 'HeartPulse', type: 'expense' },
  { name: 'salary', label: 'Salário', color: '#10b981', iconName: 'Briefcase', type: 'income' },
  { name: 'freelance', label: 'Freelance', color: '#8b5cf6', iconName: 'Code', type: 'income' },
  { name: 'internship', label: 'Estágio', color: '#3b82f6', iconName: 'BookOpen', type: 'income' },
  { name: 'investments', label: 'Investimentos', color: '#f59e0b', iconName: 'TrendingUp', type: 'income' },
  { name: 'others_income', label: 'Outros', color: '#9ca3af', iconName: 'PlusCircle', type: 'income' }
];


const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

const safeParseArray = (raw: string | null, validator: (item: any) => boolean): any[] | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(validator);
  } catch (e) {
    console.error("Localstorage parse error", e);
    return null;
  }
};

export default function App() {
  const [appPin, setAppPin] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");

  const [currentTab, setCurrentTab] = useState<'home' | 'finances' | 'calendar' | 'settings' | 'workouts'>('home');

  // States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([]);
  const [calendarBlocks, setCalendarBlocks] = useState<CalendarBlock[]>([]);
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [themeColor, setThemeColor] = useState<string>('cyan');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial Load
  useEffect(() => {
    const savedPin = localStorage.getItem('pos-pin');
    if (savedPin) {
      setAppPin(savedPin);
      setIsUnlocked(false);
    } else {
      setIsUnlocked(true);
    }

    const savedTheme = localStorage.getItem('pos-theme');
    if (savedTheme) {
      setThemeColor(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const savedRecurring = safeParseArray(localStorage.getItem('pos-recurringItems'), (i) => i && typeof i === 'object');
    if (savedRecurring) {
      const parsed = savedRecurring.map((item: any) => {
        let type = item.type || 'expense';
        let category = item.category;
        if (type === 'income' && !['salary', 'freelance', 'internship', 'investments', 'others_income'].includes(category)) {
          category = 'salary';
        }
        return { ...item, type, category };
      });
      setRecurringItems(parsed);
    }

    const savedTx = safeParseArray(localStorage.getItem('pos-transactions'), (i) => i && typeof i === 'object' && i.id);
    if (savedTx) {
      setTransactions(savedTx.map((t: any) => ({ ...t, timestamp: new Date(t.timestamp || Date.now()) })));
    } else {
      setTransactions(defaultTransactions);
    }

    const savedBlocks = safeParseArray(localStorage.getItem('pos-calendarBlocks'), (i) => i && typeof i === 'object' && i.id);
    if (savedBlocks) {
      setCalendarBlocks(savedBlocks.map((b: any) => ({ ...b, timestamp: b.timestamp ? new Date(b.timestamp) : new Date() })));
    } else {
      setCalendarBlocks(defaultBlocks.map(b => ({ ...b, timestamp: new Date() })) as CalendarBlock[]);
    }

    const savedCats = safeParseArray(localStorage.getItem('pos-categories'), (i) => i && typeof i === 'object' && i.name);
    if (savedCats) setCustomCategories(savedCats);

    const savedExercises = safeParseArray(localStorage.getItem('pos-exercises'), (i) => i && typeof i === 'object' && i.id);
    if (savedExercises) {
      setExercises(savedExercises);
    } else {
      setExercises(defaultExercises);
    }

    const savedWorkouts = safeParseArray(localStorage.getItem('pos-workouts'), (i) => i && typeof i === 'object' && i.id);
    if (savedWorkouts) {
      setWorkoutSessions(savedWorkouts.map((s: any) => ({ ...s, date: new Date(s.date || Date.now()) })));
    }

    setIsLoaded(true);
  }, []);

  // Save Effects
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('pos-transactions', JSON.stringify(transactions));
    localStorage.setItem('pos-recurringItems', JSON.stringify(recurringItems));
    localStorage.setItem('pos-calendarBlocks', JSON.stringify(calendarBlocks));
    localStorage.setItem('pos-categories', JSON.stringify(customCategories));
    localStorage.setItem('pos-exercises', JSON.stringify(exercises));
    localStorage.setItem('pos-workouts', JSON.stringify(workoutSessions));
    localStorage.setItem('pos-theme', themeColor);
  }, [transactions, calendarBlocks, customCategories, exercises, workoutSessions, themeColor, recurringItems, isLoaded]);

  const [periodFilter, setPeriodFilter] = useState<'current' | 'previous' | 'all'>('current');

  // Derived Data
  const allCategories = [...baseCategories, ...customCategories];
  
  const filteredTransactions = transactions.filter((t: any) => {
    if (periodFilter === 'all') return true;
    const date = new Date(t.timestamp);
    const now = new Date();
    if (periodFilter === 'current') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (periodFilter === 'previous') {
      const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    }
    return true;
  });

  const computedCategories = allCategories.map(cat => {
    const recurringAmount = recurringItems
      .filter(r => r.type === 'expense' && r.category.toLowerCase() === cat.name.toLowerCase())
      .reduce((sum, r) => sum + r.amount, 0);
    const amount = filteredTransactions
      .filter(t => t.category.toLowerCase() === cat.name.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0) + recurringAmount;
    return { ...cat, amount };
  });

  const totalIncome = recurringItems.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = computedCategories.reduce((sum, c) => sum + c.amount, 0);
  const balance = totalIncome - totalExpenses;

  const focusHours = useMemo(() => {
    const mins = calendarBlocks.filter(b => b.completed).reduce((acc, b) => acc + b.durationMin, 0);
    return parseFloat((mins / 60).toFixed(1));
  }, [calendarBlocks]);

  const streak = useMemo(() => {
    const completedBlocks = calendarBlocks.filter(b => b.completed && b.timestamp);
    if (completedBlocks.length === 0) return 0;

    const dates = completedBlocks.map(b => {
      const d = new Date(b.timestamp!);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });
    
    const uniqueDates = Array.from(new Set(dates)).sort((a: any, b: any) => b - a);
    
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = today.getTime();
    
    // Check if there's a streak starting today or yesterday
    if (!uniqueDates.includes(checkDate)) {
       const yesterday = new Date(today);
       yesterday.setDate(yesterday.getDate() - 1);
       checkDate = yesterday.getTime();
    }

    if (!uniqueDates.includes(checkDate)) return 0;
    
    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === checkDate) {
        currentStreak++;
        checkDate -= 86400000; // Subtract one day
      } else {
        break;
      }
    }
    
    return currentStreak;
  }, [calendarBlocks]);

  // Handlers
  const handleRegisterTransaction = (amount: number, category: string, description: string, id?: string) => {
    if (id) {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, amount, category, description } : t));
    } else {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`, amount, category, description, timestamp: new Date()
      };
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  const handleAddCategory = (name: string, limit?: number, type: 'income' | 'expense' = 'expense') => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (allCategories.some(c => c.name === slug)) return; // Prevent dupes
    // Generate distinct color using HSL
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 80%, 60%)`;
    const newCat = { name: slug, label: name, color, iconName: 'Activity', limit, type };
    setCustomCategories(prev => [...prev, newCat]);
  };

  const handleUpdateCategoryLimit = (name: string, limit: number) => {
    // If base category, we might need to store limits separately or just copy it to custom?
    // Let's store all limits in a map or just keep modified base in customCategories if possible.
    // For simplicity, we can store limits in a separate state, but let's just use customCategories for overrides too.
    setCustomCategories(prev => {
      const existing = prev.find(c => c.name === name);
      if (existing) return prev.map(c => c.name === name ? { ...c, limit } : c);
      const base = baseCategories.find(c => c.name === name);
      if (base) return [...prev, { ...base, limit }];
      return prev;
    });
  };

  const handleAddWorkoutSession = (session: WorkoutSession) => {
    setWorkoutSessions(prev => [session, ...prev]);
  };

  const handleAddExercise = (name: string, muscleGroup: string) => {
    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      name,
      muscleGroup
    };
    setExercises(prev => [...prev, newEx]);
    return newEx.id;
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddCalendarBlock = (title: string, category: string, durationMin: number, timestamp: Date, id?: string) => {
    if (id) {
      setCalendarBlocks(prev => prev.map(b => b.id === id ? { ...b, title, category: category as any, durationMin, timestamp } : b));
    } else {
      const newBlock: CalendarBlock = {
        id: `cal-${Date.now()}`, time: 'Novo', title, category: category as any, durationMin, completed: false, timestamp
      };
      setCalendarBlocks(prev => [...prev, newBlock]);
    }
  };

  const handleToggleCalendarBlock = (id: string) => {
    setCalendarBlocks(prev => prev.map(block => {
      if (block.id === id) {
        return { ...block, completed: !block.completed };
      }
      return block;
    }));
  };

  const handleDeleteCalendarBlock = (id: string) => {
    setCalendarBlocks(prev => prev.filter(b => b.id !== id));
  };

  const handleExportData = () => {
    const data = { transactions, calendarBlocks, exercises, workoutSessions, customCategories };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos-data-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const renderIcon = (name: string, props: any) => {
    switch (name) {
      case 'Utensils': return <Utensils {...props} />;
      case 'Car': return <Car {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      case 'HeartPulse': return <HeartPulse {...props} />;
      case 'Briefcase': return <Briefcase {...props} />;
      case 'Code': return <Code {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'PlusCircle': return <PlusCircle {...props} />;
      default: return <Activity {...props} />;
    }
  };

  const cycleTheme = () => {
    const colors = ['cyan', 'purple', 'emerald', 'rose', 'amber', 'blue', 'indigo', 'pink', 'teal', 'orange'];
    const currentIndex = colors.indexOf(themeColor);
    const nextTheme = colors[(currentIndex + 1) % colors.length];
    setThemeColor(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#05070c]" />;

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#05070c] text-white flex flex-col items-center justify-center font-sans cyber-grid-fine p-6">
        <div className="bg-[#0a0e17] border border-white/10 p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-widest mb-2">SISTEMA BLOQUEADO</h1>
          <p className="text-sm font-mono text-gray-400 mb-8">Insira o PIN de 4 dígitos</p>
          
          <div className="flex justify-center gap-3 mb-8">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full border transition-all ${pinInput.length > i ? 'bg-accent border-accent shadow-[0_0_10px_var(--color-accent)]' : 'bg-transparent border-white/20'}`} />
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button 
                key={n} 
                onClick={() => {
                  if (pinInput.length < 4) {
                    const newPin = pinInput + n.toString();
                    setPinInput(newPin);
                    if (newPin.length === 4) {
                      setTimeout(() => {
                        if (simpleHash(newPin) === appPin) {
                          setIsUnlocked(true);
                          setPinInput("");
                        } else {
                          setPinInput("");
                          // could add a shake animation here
                        }
                      }, 100);
                    }
                  }
                }}
                className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl font-mono hover:bg-white/10 transition-colors mx-auto"
              >
                {n}
              </button>
            ))}
            <div />
            <button 
              onClick={() => {
                if (pinInput.length < 4) {
                  const newPin = pinInput + "0";
                  setPinInput(newPin);
                  if (newPin.length === 4) {
                    setTimeout(() => {
                      if (simpleHash(newPin) === appPin) {
                        setIsUnlocked(true);
                        setPinInput("");
                      } else {
                        setPinInput("");
                      }
                    }, 100);
                  }
                }
              }}
              className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl font-mono hover:bg-white/10 transition-colors mx-auto"
            >
              0
            </button>
            <button 
              onClick={() => setPinInput(prev => prev.slice(0, -1))}
              className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center text-xl font-mono text-gray-400 hover:text-white transition-colors mx-auto"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#05070c] text-white flex flex-col font-sans cyber-grid-fine relative">
      <header className="p-4 border-b border-white/10 bg-[#0a0e17]/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-display font-bold text-black shadow-neon-cyan">
            P
          </div>
          <div>
            <h1 className="font-display font-bold tracking-widest text-sm text-white">PERSONAL OS</h1>
            <p className="text-[10px] text-accent font-mono tracking-widest">SISTEMA ATIVO</p>
          </div>
        </div>
        <button onClick={cycleTheme} className="p-2 bg-accent/10 border border-accent/30 rounded-lg hover:bg-accent/20 transition-all text-accent hover:shadow-neon-cyan" title="Mudar Tema">
          <Palette className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto w-full pb-24">
        <div className="max-w-xl mx-auto w-full h-full p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {currentTab === 'home' && (
                <HomeTab 
                  totalExpenses={totalExpenses} totalIncome={totalIncome} balance={balance} 
                  focusHours={focusHours} 
                  streak={streak} 
                  transactions={filteredTransactions} 
                  baseCategories={allCategories}
                />
              )}
              {currentTab === 'finances' && (
                <FinancesTab 
                  transactions={filteredTransactions} 
                  computedCategories={computedCategories}
                  renderIcon={renderIcon}
                  onAdd={handleRegisterTransaction}
                  onDelete={handleDeleteTransaction}
                  onAddCategory={handleAddCategory}
                  periodFilter={periodFilter}
                  setPeriodFilter={setPeriodFilter}
                  recurringItems={recurringItems}
                  setRecurringItems={setRecurringItems}
                />
              )}
              {currentTab === 'calendar' && (
                <CalendarTab 
                  calendarBlocks={calendarBlocks}
                  onToggle={handleToggleCalendarBlock}
                  onAdd={handleAddCalendarBlock}
                  onDelete={handleDeleteCalendarBlock}
                />
              )}
              {currentTab === 'workouts' && (
                <WorkoutsTab 
                  exercises={exercises}
                  workoutSessions={workoutSessions}
                  onAddSession={handleAddWorkoutSession}
                  onAddExercise={handleAddExercise}
                />
              )}
              {currentTab === 'settings' && (
                <SettingsTab 
                  appPin={appPin}
                  setAppPin={setAppPin}
                  onExport={handleExportData}
                  onClear={handleClearData}
                  themeColor={themeColor}
                  onChangeTheme={(color: string) => {
                    setThemeColor(color);
                    document.documentElement.setAttribute('data-theme', color);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-[#0a0e17]/90 backdrop-blur-xl border-t border-white/10 p-2 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-xl mx-auto flex justify-between px-2 items-center">
          <NavButton icon={<Home className="w-5 h-5" />} label="Início" isActive={currentTab === 'home'} onClick={() => setCurrentTab('home')} />
          <NavButton icon={<DollarSign className="w-5 h-5" />} label="Finanças" isActive={currentTab === 'finances'} onClick={() => setCurrentTab('finances')} />
          <NavButton icon={<CalendarIcon className="w-5 h-5" />} label="Agenda" isActive={currentTab === 'calendar'} onClick={() => setCurrentTab('calendar')} />
          <NavButton icon={<Dumbbell className="w-5 h-5" />} label="Treinos" isActive={currentTab === 'workouts'} onClick={() => setCurrentTab('workouts')} />
          <NavButton icon={<Settings className="w-5 h-5" />} label="Ajustes" isActive={currentTab === 'settings'} onClick={() => setCurrentTab('settings')} />
        </div>
      </nav>
    </div>
  );
}

// --- Tabs Components ---

function HomeTab({ totalExpenses, totalIncome, balance, focusHours, streak, transactions, baseCategories }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20"><Activity className="w-10 h-10 text-accent" /></div>
          <p className="text-[10px] font-mono text-gray-400 mb-1">HORAS DE FOCO</p>
          <p className="text-2xl font-display font-bold text-accent">{focusHours.toFixed(1)}<span className="text-sm text-gray-500">h</span></p>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20"><Flame className="w-10 h-10 text-accent" /></div>
          <p className="text-[10px] font-mono text-gray-400 mb-1">SEQUÊNCIA DIÁRIA</p>
          <p className="text-2xl font-display font-bold text-accent">{streak}<span className="text-sm text-gray-500"> dias</span></p>
        </div>
                <div className="bg-gradient-to-br from-accent/20 to-transparent border border-accent/30 p-4 rounded-2xl col-span-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-accent mb-1 tracking-widest">SALDO DO MÊS</p>
            <p className="text-3xl font-display font-bold text-white shadow-sm">${balance.toFixed(2)}</p>
            {totalIncome > 0 && <p className="text-[10px] text-gray-400 font-mono mt-1">Entradas: ${totalIncome.toFixed(2)} | Despesas: ${totalExpenses.toFixed(2)}</p>}
          </div>
          <DollarSign className="w-10 h-10 text-accent opacity-50" />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
          <h2 className="text-sm font-display font-bold text-gray-200 tracking-wider">ATIVIDADE RECENTE</h2>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 3).map((t: any) => {
            const cat = baseCategories.find((c: any) => c.name === t.category);
            return (
              <div key={t.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">{t.description}</p>
                  <p className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">{cat?.label || t.category}</p>
                </div>
                <p className="text-sm font-bold" style={{ color: cat?.color || 'var(--color-accent)' }}>
                  ${t.amount.toFixed(2)}
                </p>
              </div>
            );
          })}
          {transactions.length === 0 && <p className="text-xs text-center text-gray-500 font-mono py-4">NENHUMA ATIVIDADE REGISTRADA</p>}
        </div>
      </div>
    </div>
  );
}

function FinancesTab({ transactions, computedCategories, renderIcon, onAdd, onDelete, onAddCategory, periodFilter, setPeriodFilter, recurringItems, setRecurringItems }: any) {
  const [financesTab, setFinancesTab] = useState<'transactions' | 'fixed'>('transactions');
  const [recType, setRecType] = useState<'income' | 'expense'>('income');
  const [recCategory, setRecCategory] = useState('salary'); // Default to salary for income
  const [recDesc, setRecDesc] = useState('');
  const [recAmount, setRecAmount] = useState('');
    const [recDay, setRecDay] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [desc, setDesc] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // New Category States
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewRecCat, setShowNewRecCat] = useState(false);
  const [newRecCatName, setNewRecCatName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatLimit, setNewCatLimit] = useState('');

  const pieData = computedCategories.filter((c: any) => c.amount > 0).map((c: any) => ({
    name: c.label, value: c.amount, color: c.color
  }));

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (isNaN(num) || !isFinite(num) || num <= 0) return;
    onAdd(Number(amount), category, desc || 'Registro Manual', editId);
    setAmount('');
    setDesc('');
    setEditId(null);
  };

  const handleEdit = (t: any) => {
    setEditId(t.id);
    setAmount(t.amount.toString());
    setCategory(t.category);
    setDesc(t.description);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateRecCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecCatName.trim()) return;
    onAddCategory(newRecCatName.trim(), undefined, recType);
    setRecCategory(newRecCatName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'));
    setShowNewRecCat(false);
    setNewRecCatName('');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim(), newCatLimit ? Number(newCatLimit) : undefined);
    setCategory(newCatName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'));
    setShowNewCat(false);
    setNewCatName('');
    setNewCatLimit('');
  };

  React.useEffect(() => {
    if (recType === 'income') {
      setRecCategory('salary');
    } else {
      setRecCategory('food');
    }
  }, [recType]);

  const handleAddRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(recAmount);
    if (isNaN(num) || !isFinite(num) || num <= 0) return;
    const newItem: any = {
      id: `rec-${Date.now()}`,
      description: recDesc || 'Item Fixo',
      amount: Number(recAmount),
      type: recType,
      category: recCategory,
      dayOfMonth: recDay ? Number(recDay) : undefined
    };
    setRecurringItems((prev: any) => [...prev, newItem]);
    setRecDesc('');
    setRecAmount('');
    setRecDay('');
  };

  const handleDeleteRecurring = (id: string) => {
    setRecurringItems((prev: any) => prev.filter((r: any) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-[#0a0e17] rounded-lg p-1 border border-white/10">
        <button onClick={() => setFinancesTab('transactions')} className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors ${financesTab === 'transactions' ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white'}`}>REGISTROS</button>
        <button onClick={() => setFinancesTab('fixed')} className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors ${financesTab === 'fixed' ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white'}`}>FIXOS</button>
      </div>
      
      {financesTab === 'transactions' && (
        <div className="space-y-6">
          <div className="bg-[#0a0e17] border border-white/10 p-4 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-mono text-accent tracking-widest">{editId ? 'EDITAR DESPESA' : 'ADICIONAR DESPESA'}</h2>
              {editId && (
                <button onClick={() => { setEditId(null); setAmount(''); setDesc(''); }} className="text-[10px] text-gray-500 hover:text-white">CANCELAR EDIÇÃO</button>
              )}
            </div>
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input 
                    type="number" step="0.01" placeholder="Valor ($)" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>
                <div className="flex-1">
                  <select 
                    value={showNewCat ? 'new' : category} onChange={(e) => {
                      if (e.target.value === 'new') {
                        setShowNewCat(true);
                        setCategory('');
                      } else {
                        setShowNewCat(false);
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-accent appearance-none"
                  >
                    {computedCategories.map((c: any) => (
                      <option key={c.name} value={c.name} className="bg-[#0a0e17]">{c.label}</option>
                    ))}
                    <option value="new" className="bg-[#0a0e17] text-accent">+ Nova Categoria</option>
                  </select>
                </div>
              </div>
              <input 
                type="text" placeholder="Descrição" value={desc} onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              />
              <button type="submit" className="w-full bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30 font-bold py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> {editId ? 'SALVAR EDIÇÃO' : 'REGISTRAR'}
              </button>
            </form>

            {showNewCat && (
              <form onSubmit={handleCreateCategory} className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                 <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-mono text-gray-400">NOVA CATEGORIA</h3>
                   <button type="button" onClick={() => { setShowNewCat(false); setCategory(''); }} className="text-[10px] text-gray-500 hover:text-white">CANCELAR</button>
                 </div>
                 <div className="flex gap-2">
                    <input type="text" placeholder="Nome" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-accent" />
                    <input type="number" placeholder="Limite (opcional)" value={newCatLimit} onChange={(e) => setNewCatLimit(e.target.value)} className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-accent" />
                    <button type="submit" className="bg-accent/20 text-accent px-3 rounded-lg text-xs font-bold hover:bg-accent/30">CRIAR</button>
                 </div>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest px-1">Progresso & Limites</h2>
            <div className="space-y-3">
              {computedCategories.filter((c: any) => c.limit || c.amount > 0).map((c: any) => {
                const limit = c.limit || 0;
                const percentage = limit > 0 ? (c.amount / limit) * 100 : 0;
                const isOver = percentage > 100;
                const isWarning = percentage > 70 && !isOver;
                const barColor = isOver ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : isWarning ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
                
                return (
                  <div key={c.name} className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-medium" style={{ color: c.color }}>{c.label}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white">${c.amount.toFixed(2)}</span>
                        {limit > 0 && <span className="text-[10px] text-gray-500 ml-1">/ ${limit}</span>}
                      </div>
                    </div>
                    {limit > 0 && (
                      <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Registros</h2>
              <select 
                value={periodFilter} 
                onChange={(e: any) => setPeriodFilter(e.target.value)}
                className="bg-transparent text-[10px] text-gray-400 font-mono focus:outline-none border-b border-white/20 pb-0.5"
              >
                <option value="current" className="bg-[#0a0e17]">Mês Atual</option>
                <option value="previous" className="bg-[#0a0e17]">Mês Anterior</option>
                <option value="all" className="bg-[#0a0e17]">Tudo</option>
              </select>
            </div>
            
            <div className="space-y-2">
              {transactions.map((t: any) => {
                const cat = computedCategories.find((c: any) => c.name === t.category);
                return (
                  <div key={t.id} onClick={() => handleEdit(t)} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="p-2 rounded-lg bg-white/5" style={{ color: cat?.color || 'var(--color-accent)' }}>
                      {renderIcon(cat?.iconName || 'Activity', { className: 'w-4 h-4' })}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{t.description}</p>
                      <p className="text-[10px] font-mono text-gray-500 uppercase">{cat?.label} • {new Date(t.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold" style={{ color: cat?.color || 'var(--color-accent)' }}>${t.amount.toFixed(2)}</p>
                      <button onClick={(e: any) => { e.stopPropagation(); onDelete(t.id); }} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {transactions.length === 0 && <p className="text-xs text-center text-gray-500 font-mono py-4">NENHUM REGISTRO NESTE PERÍODO</p>}
            </div>
          </div>
        </div>
      )}

      {financesTab === 'fixed' && (
        <div className="space-y-6">
          <div className="bg-[#0a0e17] border border-white/10 p-4 rounded-2xl shadow-lg">
            <h2 className="text-xs font-mono text-accent tracking-widest mb-4">ADICIONAR ITEM FIXO</h2>
            <form onSubmit={handleAddRecurring} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <select value={recType} onChange={(e: any) => setRecType(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-accent appearance-none">
                  <option value="income" className="bg-[#0a0e17]">Entrada</option>
                  <option value="expense" className="bg-[#0a0e17]">Despesa</option>
                </select>
                <input type="number" step="0.01" placeholder="Valor ($)" value={recAmount} onChange={(e: any) => setRecAmount(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors" required />
              </div>
              <div className="flex gap-3">
                <div className="flex-[2] flex flex-col gap-2">
                  <select 
                    value={showNewRecCat ? 'new' : recCategory} 
                    onChange={(e: any) => {
                      if (e.target.value === 'new') {
                        setShowNewRecCat(true);
                        setRecCategory('');
                      } else {
                        setShowNewRecCat(false);
                        setRecCategory(e.target.value);
                      }
                    }} 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-accent appearance-none"
                  >
                    {computedCategories.filter((c: any) => (recType === 'income' ? c.type === 'income' : c.type !== 'income')).map((c: any) => (
                      <option key={c.name} value={c.name} className="bg-[#0a0e17]">{c.label}</option>
                    ))}
                    <option value="new" className="bg-[#0a0e17] text-accent">+ Nova Categoria</option>
                  </select>
                  
                  {showNewRecCat && (
                    <div className="flex gap-2">
                      <input type="text" placeholder="Nome" value={newRecCatName} onChange={(e) => setNewRecCatName(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-accent" />
                      <button type="button" onClick={handleCreateRecCategory} className="bg-accent/20 text-accent px-3 rounded-lg text-xs font-bold hover:bg-accent/30">CRIAR</button>
                      <button type="button" onClick={() => { setShowNewRecCat(false); setRecCategory(recType === 'income' ? 'salary' : 'food'); }} className="text-gray-500 hover:text-white px-2">X</button>
                    </div>
                  )}
                </div>
                <input type="number" placeholder="Dia (Opc)" value={recDay} onChange={(e: any) => setRecDay(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" min="1" max="31" />
              </div>
              <input type="text" placeholder="Descrição (ex: Salário)" value={recDesc} onChange={(e: any) => setRecDesc(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" required />
              <button type="submit" className="w-full bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30 font-bold py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> ADICIONAR ITEM FIXO
              </button>
            </form>
          </div>

          <div className="space-y-4">
             <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest px-1">Entradas Fixas</h3>
             <div className="space-y-2">
               {recurringItems.filter((r: any) => r.type === 'income').map((r: any) => {
                 const cat = computedCategories.find((c: any) => c.name === r.category);
                 return (
                   <div key={r.id} className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3">
                     <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500">
                       {renderIcon(cat?.iconName || 'Activity', { className: 'w-4 h-4' })}
                     </div>
                     <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-medium text-emerald-100 truncate">{r.description}</p>
                       <p className="text-[10px] font-mono text-emerald-500/70 uppercase">{cat?.label} {r.dayOfMonth ? `• Dia ${r.dayOfMonth}` : ''}</p>
                     </div>
                     <div className="flex items-center gap-3">
                       <p className="text-sm font-bold text-emerald-400">+${r.amount.toFixed(2)}</p>
                       <button onClick={() => handleDeleteRecurring(r.id)} className="text-gray-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                     </div>
                   </div>
                 );
               })}
               {recurringItems.filter((r: any) => r.type === 'income').length === 0 && <p className="text-xs text-gray-500 px-2 font-mono">Nenhuma entrada fixa.</p>}
             </div>

             <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest px-1 mt-6">Despesas Fixas</h3>
             <div className="space-y-2">
               {recurringItems.filter((r: any) => r.type === 'expense').map((r: any) => {
                 const cat = computedCategories.find((c: any) => c.name === r.category);
                 return (
                   <div key={r.id} className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3">
                     <div className="p-2 rounded-lg bg-red-500/20 text-red-500">
                       {renderIcon(cat?.iconName || 'Activity', { className: 'w-4 h-4' })}
                     </div>
                     <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-medium text-red-100 truncate">{r.description}</p>
                       <p className="text-[10px] font-mono text-red-500/70 uppercase">{cat?.label} {r.dayOfMonth ? `• Dia ${r.dayOfMonth}` : ''}</p>
                     </div>
                     <div className="flex items-center gap-3">
                       <p className="text-sm font-bold text-red-400">-${r.amount.toFixed(2)}</p>
                       <button onClick={() => handleDeleteRecurring(r.id)} className="text-gray-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                     </div>
                   </div>
                 );
               })}
               {recurringItems.filter((r: any) => r.type === 'expense').length === 0 && <p className="text-xs text-gray-500 px-2 font-mono">Nenhuma despesa fixa.</p>}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarForm({
  editId,
  setEditId,
  viewMode,
  title, setTitle,
  category, setCategory,
  duration, setDuration,
  dateStr, setDateStr,
  timeStr, setTimeStr,
  handleAdd,
  setFormDateToOffset,
  setFormDateToDayOfWeek,
  setShowMonthForm
}: any) {
  return (
    <div className="bg-[#0a0e17] border border-white/10 p-4 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-mono text-accent tracking-widest">{editId ? 'EDITAR BLOCO' : 'NOVO BLOCO DE FOCO'}</h2>
        {(editId || viewMode === 'month') && (
          <button onClick={() => { 
            if (viewMode === 'month') setShowMonthForm(false);
            setEditId(null); 
            setTitle(''); 
          }} className="text-[10px] text-gray-500 hover:text-white">
            CANCELAR
          </button>
        )}
      </div>
      
      <form onSubmit={handleAdd} className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 mb-1">
           <button type="button" onClick={() => setFormDateToOffset(0)} className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-gray-300">Hoje</button>
           <button type="button" onClick={() => setFormDateToOffset(1)} className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-gray-300">Amanhã</button>
           <div className="w-px h-4 bg-white/20 mx-1 self-center"></div>
           {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, i) => (
              <button key={d} type="button" onClick={() => setFormDateToDayOfWeek(i)} className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-gray-300">{d}</button>
           ))}
        </div>
        
        <div className="flex gap-3">
           <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="flex-[2] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" required />
           <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" required />
        </div>

        <input type="text" placeholder="Ex: Estudar React" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" required />
        <div className="flex gap-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-accent appearance-none">
            <option value="work">Trabalho</option>
            <option value="personal">Pessoal</option>
            <option value="health">Saúde</option>
            <option value="admin">Administrativo</option>
          </select>
          <input type="number" placeholder="Minutos" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" required min="1" />
        </div>
        <button type="submit" className="w-full bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30 font-bold py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {editId ? 'SALVAR EDIÇÃO' : 'ADICIONAR'}
        </button>
      </form>
    </div>
  );
}

function CalendarTab({ calendarBlocks, onToggle, onAdd, onDelete }: any) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('work');
  const [duration, setDuration] = useState('60');
  
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [timeStr, setTimeStr] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString('pt-BR', {hour12: false, hour: '2-digit', minute:'2-digit'});
  });
  
  const [editId, setEditId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showMonthForm, setShowMonthForm] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const durNum = parseInt(duration, 10);
    if (title.trim() && !isNaN(durNum) && isFinite(durNum) && durNum > 0) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hour, minute] = timeStr.split(':').map(Number);
      const timestamp = new Date(year, month - 1, day, hour, minute);
      
      onAdd(title, category, parseInt(duration), timestamp, editId);
      setTitle('');
      setEditId(null);
      setShowMonthForm(false);
    }
  };

  const handleEdit = (block: any) => {
    setEditId(block.id);
    setTitle(block.title);
    setCategory(block.category);
    setDuration(block.durationMin.toString());
    const d = new Date(block.timestamp || Date.now());
    
    const localDateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    setDateStr(localDateStr);
    
    setTimeStr(d.toLocaleTimeString('pt-BR', {hour12: false, hour: '2-digit', minute:'2-digit'}));
    
    if (viewMode === 'month') {
      setShowMonthForm(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0,0,0,0);
    return date;
  };
  
  const startOfWeek = getMonday(referenceDate);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const handlePrevWeek = () => {
    const newRef = new Date(referenceDate);
    if (viewMode === 'week') newRef.setDate(newRef.getDate() - 7);
    else newRef.setMonth(newRef.getMonth() - 1);
    setReferenceDate(newRef);
  };
  const handleNextWeek = () => {
    const newRef = new Date(referenceDate);
    if (viewMode === 'week') newRef.setDate(newRef.getDate() + 7);
    else newRef.setMonth(newRef.getMonth() + 1);
    setReferenceDate(newRef);
  };
  const handleToday = () => {
    setReferenceDate(new Date());
  };
  
  const setFormDateToOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDateStr(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  };
  
  const setFormDateToDayOfWeek = (dayOffset: number) => {
    const monday = getMonday(new Date());
    monday.setDate(monday.getDate() + dayOffset);
    setDateStr(new Date(monday.getTime() - (monday.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  };
  
  const handleAddForDay = (d: Date) => {
    const localDateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    setDateStr(localDateStr);
    setEditId(null);
    setTitle('');
    setShowMonthForm(true);
  };

  const weekBlocks = calendarBlocks.filter((block: any) => {
    const d = new Date(block.timestamp || Date.now());
    return d >= startOfWeek && d <= endOfWeek;
  });
  
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59, 999);
  const monthBlocks = calendarBlocks.filter((block: any) => {
    const d = new Date(block.timestamp || Date.now());
    return d >= monthStart && d <= monthEnd;
  });

  const displayBlocks = viewMode === 'week' ? weekBlocks : monthBlocks;
  
  const totalMins = displayBlocks.reduce((acc: number, b: any) => acc + b.durationMin, 0);
  const totalHours = (totalMins / 60).toFixed(1);
  const completedCount = displayBlocks.filter((b: any) => b.completed).length;

  const daysOfWeek = [
    { label: 'Seg', date: new Date(startOfWeek) },
    { label: 'Ter', date: new Date(startOfWeek.getTime() + 86400000) },
    { label: 'Qua', date: new Date(startOfWeek.getTime() + 86400000 * 2) },
    { label: 'Qui', date: new Date(startOfWeek.getTime() + 86400000 * 3) },
    { label: 'Sex', date: new Date(startOfWeek.getTime() + 86400000 * 4) },
    { label: 'Sáb', date: new Date(startOfWeek.getTime() + 86400000 * 5) },
    { label: 'Dom', date: new Date(startOfWeek.getTime() + 86400000 * 6) }
  ];

  const getMonthDays = (refDate: Date) => {
    const year = refDate.getFullYear();
    const month = refDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    const firstDayOfWeek = firstDay.getDay(); 
    for (let i = firstDayOfWeek; i > 0; i--) {
      days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const monthGridDays = getMonthDays(referenceDate);
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];


  return (
    <div className="space-y-6">
      <div className="flex bg-[#0a0e17] rounded-lg p-1 border border-white/10">
        <button onClick={() => setViewMode('week')} className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors ${viewMode === 'week' ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white'}`}>SEMANA</button>
        <button onClick={() => { setViewMode('month'); setSelectedDay(null); setShowMonthForm(false); }} className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors ${viewMode === 'month' ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white'}`}>MÊS</button>
      </div>

      {viewMode === 'week' && <CalendarForm 
          editId={editId} setEditId={setEditId}
          viewMode={viewMode}
          title={title} setTitle={setTitle}
          category={category} setCategory={setCategory}
          duration={duration} setDuration={setDuration}
          dateStr={dateStr} setDateStr={setDateStr}
          timeStr={timeStr} setTimeStr={setTimeStr}
          handleAdd={handleAdd}
          setFormDateToOffset={setFormDateToOffset}
          setFormDateToDayOfWeek={setFormDateToDayOfWeek}
          setShowMonthForm={setShowMonthForm}
 />}

      {viewMode === 'week' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0a0e17] rounded-xl p-2 border border-white/10 shadow-lg">
            <button onClick={handlePrevWeek} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <div className="text-center flex-1">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">{startOfWeek.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})} - {endOfWeek.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</h3>
               <p className="text-[10px] font-mono text-gray-400">TOTAL: {totalHours}h • {completedCount}/{displayBlocks.length} CONCLUÍDOS</p>
            </div>
            <button onClick={handleNextWeek} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="flex justify-center mb-4">
            <button onClick={handleToday} className="text-[10px] font-mono tracking-wider bg-white/5 hover:bg-white/10 text-gray-300 py-1.5 px-4 rounded-lg border border-white/10 transition-colors uppercase">Hoje</button>
          </div>
          
          <div className="space-y-4">
            {daysOfWeek.map((day, idx) => {
              const isToday = new Date().toDateString() === day.date.toDateString();
              const dayBlocks = displayBlocks.filter((b: any) => new Date(b.timestamp || Date.now()).toDateString() === day.date.toDateString());
              
              dayBlocks.sort((a: any, b: any) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());

              return (
                <div key={idx} className={`bg-[#0a0e17] rounded-xl overflow-hidden border transition-colors ${isToday ? 'border-accent shadow-[0_0_15px_rgba(0,0,0,0)]' : 'border-white/10'}`} style={isToday ? { boxShadow: '0 0 10px var(--color-accent)20' } : {}}>
                   <div className={`px-4 py-2 flex justify-between items-center border-b ${isToday ? 'bg-accent/10 border-accent/20' : 'bg-white/5 border-white/5'}`}>
                      <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isToday ? 'text-accent' : 'text-gray-300'}`}>
                        {day.label} <span className="text-gray-500 font-mono">{day.date.getDate()}</span>
                        {isToday && <span className="px-1.5 py-0.5 rounded text-[8px] bg-accent/20 text-accent ml-1">HOJE</span>}
                      </h4>
                      <div className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${dayBlocks.length > 0 ? 'bg-accent/20 text-accent' : 'bg-black/40 text-gray-500'}`}>
                        {dayBlocks.length}
                      </div>
                   </div>
                   <div className="p-2 space-y-2">
                      {dayBlocks.length === 0 ? (
                        <div className="p-3 text-center text-xs font-mono text-gray-600 bg-white/5 rounded-lg border border-dashed border-white/5">Livre</div>
                      ) : (
                        dayBlocks.map((block: any) => (
                           <div key={block.id} onClick={() => handleEdit(block)} className={`p-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer hover:bg-white/10 ${block.completed ? 'bg-[#10b981]/5 border-[#10b981]/20 opacity-70' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                             <button onClick={(e) => { e.stopPropagation(); onToggle(block.id); }} className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${block.completed ? 'bg-[#10b981] border-[#10b981] text-white' : 'border-gray-500 text-transparent hover:border-accent'}`}>
                               <CheckCircle2 className="w-3 h-3" />
                             </button>
                             <div className="flex-1 overflow-hidden">
                               <h3 className={`text-sm font-bold truncate ${block.completed ? 'text-gray-400 line-through' : 'text-white'}`}>{block.title}</h3>
                               <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                                 {new Date(block.timestamp || Date.now()).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} • {block.durationMin}M • {block.category}
                               </p>
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} className="p-1.5 text-gray-600 hover:text-red-400 rounded-md transition-colors shrink-0">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        ))
                      )}
                   </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
           {/* Month Navigation */}
           <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {monthNames.map((m, i) => {
                 const isCurrent = i === referenceDate.getMonth();
                 return (
                   <button 
                     key={m} 
                     onClick={() => {
                        const newRef = new Date(referenceDate);
                        newRef.setMonth(i);
                        setReferenceDate(newRef);
                     }}
                     className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${isCurrent ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-500 hover:text-white'}`}
                   >
                     {m}
                   </button>
                 )
              })}
           </div>

           <div className="flex justify-between items-center bg-[#0a0e17] rounded-xl p-2 border border-white/10 shadow-lg">
             <button onClick={handlePrevWeek} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
             <div className="text-center flex-1">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">{monthNames[referenceDate.getMonth()]} {referenceDate.getFullYear()}</h3>
             </div>
             <button onClick={handleNextWeek} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
           </div>
           
           <div className="flex justify-center mb-4">
             <button onClick={handleToday} className="text-[10px] font-mono tracking-wider bg-white/5 hover:bg-white/10 text-gray-300 py-1.5 px-4 rounded-lg border border-white/10 transition-colors uppercase">Hoje</button>
           </div>

           <div className="bg-[#0a0e17] rounded-xl border border-white/10 p-4 shadow-lg">
             {/* Weekday headers */}
             <div className="grid grid-cols-7 mb-2">
               {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                 <div key={d} className="text-center text-[10px] font-mono text-gray-500">{d}</div>
               ))}
             </div>
             {/* Grid */}
             <div className="grid grid-cols-7 gap-1">
               {monthGridDays.map((dayObj, i) => {
                 const isToday = new Date().toDateString() === dayObj.date.toDateString();
                 const isSelected = selectedDay?.toDateString() === dayObj.date.toDateString();
                 const dayBlocks = calendarBlocks.filter((b: any) => new Date(b.timestamp || Date.now()).toDateString() === dayObj.date.toDateString());
                 const hasBlocks = dayBlocks.length > 0;

                 return (
                   <button 
                     key={i} 
                     onClick={() => {
                       setSelectedDay(dayObj.date);
                       setShowMonthForm(false);
                     }}
                     className={`aspect-square flex flex-col items-center justify-center rounded-lg relative transition-all ${!dayObj.isCurrentMonth ? 'opacity-40' : ''} ${isSelected ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'}`}
                   >
                     <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${isToday ? 'bg-accent text-[#0a0e17] font-bold shadow-[0_0_10px_var(--color-accent)]' : 'text-gray-300'}`}>
                       {dayObj.date.getDate()}
                     </div>
                     {hasBlocks && (
                       <div className="absolute bottom-1.5 flex gap-0.5">
                         {dayBlocks.slice(0, 3).map((_, j) => (
                           <div key={j} className="w-1 h-1 rounded-full bg-accent"></div>
                         ))}
                         {dayBlocks.length > 3 && <div className="w-1 h-1 rounded-full bg-accent opacity-50 text-[6px] leading-none text-white">+</div>}
                       </div>
                     )}
                   </button>
                 );
               })}
             </div>
           </div>

           {/* Selected Day Details */}
           {selectedDay && (
             <div className="bg-[#0a0e17] rounded-xl border border-white/10 p-4 shadow-lg animate-in fade-in slide-in-from-bottom-4">
               <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                 <h3 className="text-sm font-bold text-accent uppercase tracking-widest">{selectedDay.toLocaleDateString('pt-BR', {weekday: 'long', day: '2-digit', month: 'long'})}</h3>
                 <button onClick={() => { setSelectedDay(null); setShowMonthForm(false); }} className="text-gray-500 hover:text-white">✕</button>
               </div>
               
               {showMonthForm ? (
                 <CalendarForm 
          editId={editId} setEditId={setEditId}
          viewMode={viewMode}
          title={title} setTitle={setTitle}
          category={category} setCategory={setCategory}
          duration={duration} setDuration={setDuration}
          dateStr={dateStr} setDateStr={setDateStr}
          timeStr={timeStr} setTimeStr={setTimeStr}
          handleAdd={handleAdd}
          setFormDateToOffset={setFormDateToOffset}
          setFormDateToDayOfWeek={setFormDateToDayOfWeek}
          setShowMonthForm={setShowMonthForm}
 />
               ) : (
                 (() => {
                   const dayBlocks = calendarBlocks.filter((b: any) => new Date(b.timestamp || Date.now()).toDateString() === selectedDay.toDateString());
                   dayBlocks.sort((a: any, b: any) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
                   
                   if (dayBlocks.length === 0) {
                     return (
                       <div className="text-center py-6">
                         <p className="text-xs text-gray-500 font-mono mb-4">Nada marcado neste dia.</p>
                         <button onClick={() => handleAddForDay(selectedDay)} className="text-[10px] font-bold bg-accent/20 text-accent py-2 px-4 rounded-lg hover:bg-accent/30 transition-colors">
                           + ADICIONAR COMPROMISSO
                         </button>
                       </div>
                     );
                   }
  
                   return (
                     <div className="space-y-2">
                       {dayBlocks.map((block: any) => (
                         <div key={block.id} onClick={() => handleEdit(block)} className={`p-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer hover:bg-white/10 ${block.completed ? 'bg-[#10b981]/5 border-[#10b981]/20 opacity-70' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                           <button onClick={(e) => { e.stopPropagation(); onToggle(block.id); }} className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${block.completed ? 'bg-[#10b981] border-[#10b981] text-white' : 'border-gray-500 text-transparent hover:border-accent'}`}>
                             <CheckCircle2 className="w-3 h-3" />
                           </button>
                           <div className="flex-1 overflow-hidden">
                             <h3 className={`text-sm font-bold truncate ${block.completed ? 'text-gray-400 line-through' : 'text-white'}`}>{block.title}</h3>
                             <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                               {new Date(block.timestamp || Date.now()).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} • {block.durationMin}M • {block.category}
                             </p>
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} className="p-1.5 text-gray-600 hover:text-red-400 rounded-md transition-colors shrink-0">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       ))}
                       <button onClick={() => handleAddForDay(selectedDay)} className="w-full mt-2 text-[10px] font-bold bg-white/5 text-gray-300 py-2 rounded-lg hover:bg-white/10 border border-white/10 transition-colors">
                         + NOVO COMPROMISSO AQUI
                       </button>
                     </div>
                   );
                 })()
               )}
             </div>
           )}
        </div>
      )}
    </div>
  );
}

function WorkoutsTab({ exercises, workoutSessions, onAddSession, onAddExercise }: any) {
  const [activeTab, setActiveTab] = useState<'record' | 'history' | 'evolution'>('record');
  
  // Record States
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [sets, setSets] = useState<{ reps: string; weight: string }[]>([{ reps: '', weight: '' }]);
  const [currentSessionExercises, setCurrentSessionExercises] = useState<{ exerciseId: string; sets: { reps: number; weightKg: number }[] }[]>([]);
  
  // New Exercise States
  const [showNewEx, setShowNewEx] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExGroup, setNewExGroup] = useState('Peito');

  // Chart States
  const [chartExerciseId, setChartExerciseId] = useState<string>('');

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    const newId = onAddExercise(newExName, newExGroup);
    setSelectedExerciseId(newId);
    setShowNewEx(false);
    setNewExName('');
  };

  const handleAddSetToSession = () => {
    if (!selectedExerciseId) return;
    const validSets = sets
      .map(s => ({ reps: Number(s.reps), weightKg: Number(s.weight) }))
      .filter(s => !isNaN(s.reps) && isFinite(s.reps) && s.reps > 0 && !isNaN(s.weightKg) && isFinite(s.weightKg) && s.weightKg >= 0);
      
    if (validSets.length === 0) return;

    setCurrentSessionExercises(prev => {
      const existing = prev.find(e => e.exerciseId === selectedExerciseId);
      if (existing) {
        return prev.map(e => e.exerciseId === selectedExerciseId ? { ...e, sets: [...e.sets, ...validSets] } : e);
      }
      return [...prev, { exerciseId: selectedExerciseId, sets: validSets }];
    });
    setSets([{ reps: '', weight: '' }]);
  };

  const handleFinishSession = () => {
    if (currentSessionExercises.length === 0) return;
    const session: WorkoutSession = {
      id: `ws-${Date.now()}`,
      date: new Date(),
      exercises: currentSessionExercises
    };
    onAddSession(session);
    setCurrentSessionExercises([]);
    setActiveTab('history');
  };

  // Chart Data Prep
  const chartData = [...workoutSessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(session => {
      const ex = session.exercises.find((e: any) => e.exerciseId === chartExerciseId);
      if (!ex) return null;
      const maxWeight = Math.max(...ex.sets.map((s: any) => s.weightKg));
      const heaviestSet = ex.sets.reduce((max: any, s: any) => s.weightKg > (max?.weightKg || 0) ? s : max, null);
      return {
        date: new Date(session.date).toLocaleDateString(),
        maxWeight,
        heaviestSet
      };
    })
    .filter(Boolean);

  const bestOverallSet = chartData.reduce((best: any, data: any) => {
    if (!best) return data.heaviestSet;
    return (data.heaviestSet?.weightKg || 0) > (best.weightKg || 0) ? data.heaviestSet : best;
  }, null);

  const estimated1RM = bestOverallSet ? Math.round(bestOverallSet.weightKg * (1 + bestOverallSet.reps / 30)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex bg-[#0a0e17] rounded-lg p-1 border border-white/10">
        <button onClick={() => setActiveTab('record')} className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors ${activeTab === 'record' ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white'}`}>REGISTRAR</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors ${activeTab === 'history' ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white'}`}>HISTÓRICO</button>
        <button onClick={() => setActiveTab('evolution')} className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors ${activeTab === 'evolution' ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white'}`}>EVOLUÇÃO</button>
      </div>

      {activeTab === 'record' && (
        <div className="space-y-4">
          <div className="bg-[#0a0e17] border border-white/10 p-4 rounded-2xl shadow-lg">
            <h2 className="text-xs font-mono text-accent tracking-widest mb-4">ADICIONAR EXERCÍCIO</h2>
            
            <div className="mb-4">
              <select 
                value={showNewEx ? 'new' : selectedExerciseId} 
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setShowNewEx(true);
                    setSelectedExerciseId('');
                  } else {
                    setShowNewEx(false);
                    setSelectedExerciseId(e.target.value);
                  }
                }}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              >
                <option value="" disabled className="bg-[#0a0e17] text-gray-500">Selecione o exercício...</option>
                {exercises.map((ex: any) => (
                  <option key={ex.id} value={ex.id} className="bg-[#0a0e17]">{ex.name} ({ex.muscleGroup})</option>
                ))}
                <option value="new" className="bg-[#0a0e17] text-accent">+ Criar Novo Exercício</option>
              </select>
            </div>

            {showNewEx && (
              <form onSubmit={handleCreateExercise} className="mb-4 p-3 bg-white/5 rounded-lg border border-white/5 space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-gray-400">NOVO EXERCÍCIO</span>
                  <button type="button" onClick={() => { setShowNewEx(false); setSelectedExerciseId(''); }} className="text-[10px] text-gray-500 hover:text-white">CANCELAR</button>
                </div>
                <input type="text" placeholder="Nome do exercício" value={newExName} onChange={(e) => setNewExName(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
                <div className="flex gap-2">
                  <select value={newExGroup} onChange={(e) => setNewExGroup(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent">
                    <option value="Peito" className="bg-[#0a0e17]">Peito</option>
                    <option value="Costas" className="bg-[#0a0e17]">Costas</option>
                    <option value="Pernas" className="bg-[#0a0e17]">Pernas</option>
                    <option value="Ombros" className="bg-[#0a0e17]">Ombros</option>
                    <option value="Braços" className="bg-[#0a0e17]">Braços</option>
                    <option value="Core" className="bg-[#0a0e17]">Core</option>
                  </select>
                  <button type="submit" className="bg-accent/20 text-accent px-4 rounded-lg font-bold text-xs hover:bg-accent/30">CRIAR</button>
                </div>
              </form>
            )}

            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-[10px] font-mono text-gray-400 pl-1">Reps</span>
                <span className="text-[10px] font-mono text-gray-400 pl-1">Carga (kg)</span>
              </div>
              {sets.map((set, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <input type="number" value={set.reps} onChange={(e) => { const n = [...sets]; n[i].reps = e.target.value; setSets(n); }} placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
                  <input type="number" value={set.weight} onChange={(e) => { const n = [...sets]; n[i].weight = e.target.value; setSets(n); }} placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
                </div>
              ))}
              <button onClick={() => setSets([...sets, { reps: '', weight: '' }])} className="w-full text-xs text-accent py-2 bg-accent/5 rounded border border-dashed border-accent/30 hover:bg-accent/10">+ ADICIONAR SÉRIE</button>
            </div>

            <button onClick={handleAddSetToSession} disabled={!selectedExerciseId} className="w-full bg-[#0a0e17] border border-accent/40 text-accent hover:bg-accent/10 font-bold py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
              REGISTRAR EXERCÍCIO
            </button>
          </div>

          {currentSessionExercises.length > 0 && (
            <div className="bg-[#0a0e17] border border-white/10 p-4 rounded-2xl shadow-lg">
              <h3 className="text-[10px] font-mono text-gray-400 tracking-widest mb-3">SESSÃO ATUAL</h3>
              <div className="space-y-3 mb-4">
                {currentSessionExercises.map((e, i) => {
                  const ex = exercises.find((x: any) => x.id === e.exerciseId);
                  return (
                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="font-bold text-sm text-accent mb-1">{ex?.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {e.sets.map((s, j) => (
                          <span key={j} className="text-xs bg-black/40 px-2 py-1 rounded text-gray-300 font-mono">
                            {s.reps}x {s.weightKg}kg
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              <button onClick={handleFinishSession} className="w-full bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30 font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> FINALIZAR TREINO
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {workoutSessions.map((session: any) => (
            <div key={session.id} className="bg-[#0a0e17] border border-white/10 p-4 rounded-2xl">
              <h3 className="text-xs font-mono text-accent tracking-widest mb-3">{new Date(session.date).toLocaleDateString()}</h3>
              <div className="space-y-2">
                {session.exercises.map((e: any, i: number) => {
                  const ex = exercises.find((x: any) => x.id === e.exerciseId);
                  const volume = e.sets.reduce((sum: number, s: any) => sum + (s.reps * s.weightKg), 0);
                  return (
                    <div key={i} className="bg-white/5 p-2 rounded-lg border border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-200">{ex?.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{e.sets.length} séries</p>
                      </div>
                      <p className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">Vol: {volume}kg</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {workoutSessions.length === 0 && <p className="text-xs text-center text-gray-500 font-mono py-8">NENHUM TREINO REGISTRADO</p>}
        </div>
      )}

      {activeTab === 'evolution' && (
        <div className="space-y-6">
          <div className="bg-[#0a0e17] border border-white/10 p-4 rounded-2xl">
            <h2 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">Selecione o Exercício</h2>
            <select 
              value={chartExerciseId} 
              onChange={(e) => setChartExerciseId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="" disabled className="bg-[#0a0e17] text-gray-500">Escolha...</option>
              {exercises.map((ex: any) => (
                <option key={ex.id} value={ex.id} className="bg-[#0a0e17]">{ex.name}</option>
              ))}
            </select>
          </div>

          {chartExerciseId && chartData.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20"><Flame className="w-10 h-10 text-accent" /></div>
                  <p className="text-[10px] font-mono text-gray-400 mb-1">CARGA MÁXIMA</p>
                  <p className="text-2xl font-display font-bold text-accent">{bestOverallSet?.weightKg || 0}<span className="text-sm text-gray-500">kg</span></p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20"><Activity className="w-10 h-10 text-accent" /></div>
                  <p className="text-[10px] font-mono text-gray-400 mb-1">1RM ESTIMADO</p>
                  <p className="text-2xl font-display font-bold text-accent">{estimated1RM}<span className="text-sm text-gray-500">kg</span></p>
                </div>
              </div>

              <div className="bg-[#0a0e17] border border-white/10 p-4 rounded-2xl h-64">
                <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-4">Evolução de Carga (kg)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(10, 14, 23, 0.9)', borderColor: 'var(--color-accent)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: 'var(--color-accent)' }}
                    />
                    <Line type="monotone" dataKey="maxWeight" stroke="var(--color-accent)" strokeWidth={3} dot={{ fill: '#0a0e17', stroke: 'var(--color-accent)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: 'var(--color-accent)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
          {chartExerciseId && chartData.length === 0 && (
            <p className="text-xs text-center text-gray-500 font-mono py-8">SEM DADOS PARA ESTE EXERCÍCIO</p>
          )}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ appPin, setAppPin, onExport, onClear, themeColor, onChangeTheme }: any) {
  const [pinInput, setPinInput] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const colors = [
    { id: 'cyan', color: '#00f2fe' },
    { id: 'purple', color: '#a855f7' },
    { id: 'emerald', color: '#10b981' },
    { id: 'rose', color: '#f43f5e' },
    { id: 'amber', color: '#f59e0b' },
    { id: 'blue', color: '#3b82f6' },
    { id: 'indigo', color: '#6366f1' },
    { id: 'pink', color: '#ec4899' },
    { id: 'teal', color: '#14b8a6' },
    { id: 'orange', color: '#f97316' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center py-6 border-b border-white/10">
        <div className="w-16 h-16 rounded-2xl bg-accent mx-auto mb-4 flex items-center justify-center font-display font-bold text-3xl text-black shadow-neon-cyan">
          P
        </div>
        <h2 className="text-xl font-display font-bold text-white tracking-widest">PERSONAL OS</h2>
        <p className="text-xs font-mono text-gray-400 mt-1">SISTEMA ATIVO V1.0</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-2 px-1">Aparência</h3>
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
          <p className="text-sm font-bold text-white mb-3">Cor do Sistema</p>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c.id}
                onClick={() => onChangeTheme(c.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${themeColor === c.id ? 'scale-110 ring-2 ring-white/50 ring-offset-2 ring-offset-[#0a0e17]' : 'hover:scale-110'}`}
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        </div>
      </div>

      
      <div className="space-y-3">
        <h3 className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-2 px-1">Segurança</h3>
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-white">Bloqueio por PIN</p>
              <p className="text-[10px] font-mono text-gray-400">{appPin ? 'Ativo' : 'Inativo'}</p>
            </div>
            <button 
              onClick={() => {
                if (appPin) {
                  setAppPin(null);
                  localStorage.removeItem('pos-pin');
                } else {
                  setIsSettingPin(true);
                  setPinInput('');
                }
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${appPin ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-accent/50 text-accent hover:bg-accent/10'}`}
            >
              {appPin ? 'REMOVER' : 'CONFIGURAR'}
            </button>
          </div>
          {isSettingPin && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs font-mono text-gray-300 mb-2">Digite o novo PIN de 4 dígitos:</p>
              <div className="flex gap-2 items-center">
                <input 
                  type="password" 
                  maxLength={4} 
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/D/g, ''))}
                  className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm text-center tracking-[0.5em] w-24 focus:outline-none focus:border-accent"
                />
                <button 
                  onClick={() => {
                    if (pinInput.length === 4) {
                      const hashed = simpleHash(pinInput);
                      setAppPin(hashed);
                      localStorage.setItem('pos-pin', hashed);
                      setIsSettingPin(false);
                      setPinInput('');
                    }
                  }}
                  disabled={pinInput.length !== 4}
                  className="bg-accent/20 text-accent font-bold text-xs px-4 py-2 rounded-lg border border-accent/30 hover:bg-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SALVAR
                </button>
                <button 
                  onClick={() => setIsSettingPin(false)}
                  className="text-gray-500 text-xs px-2 hover:text-white transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-2 px-1">Dados & Exportação</h3>
        
        <button onClick={onExport} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg text-accent"><Download className="w-5 h-5" /></div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Exportar Dados</p>
              <p className="text-[10px] font-mono text-gray-400">Backup completo em JSON</p>
            </div>
          </div>
        </button>

        <button onClick={onClear} className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg text-red-400 group-hover:text-red-300 transition-colors"><LogOut className="w-5 h-5" /></div>
            <div className="text-left">
              <p className="text-sm font-bold text-red-400 group-hover:text-red-300">Zerar Sistema</p>
              <p className="text-[10px] font-mono text-red-400/60 group-hover:text-red-400/80">Apagar todos os dados permanentemente</p>
            </div>
          </div>
        </button>
      </div>
      
      <div className="pt-8 text-center text-[9px] font-mono text-gray-600">
        <p>FEITO PARA PRODUTIVIDADE ISOLADA</p>
        <p className="mt-1">NENHUM DADO SAI DO SEU DISPOSITIVO</p>
      </div>
    </div>
  );
}

// --- Shared UI ---

function NavButton({ icon, label, isActive, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-14 gap-1 transition-all ${isActive ? 'text-accent -translate-y-1' : 'text-gray-500 hover:text-gray-300'}`}>
      <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-accent/10 shadow-neon-cyan' : ''}`}>
        {icon}
      </div>
      <span className="text-[9px] font-mono font-medium tracking-wide truncate w-full text-center">{label}</span>
    </button>
  );
}
