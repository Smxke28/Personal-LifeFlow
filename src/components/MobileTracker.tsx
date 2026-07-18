import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Car, 
  Cpu, 
  HeartPulse, 
  Delete, 
  Wifi, 
  Battery, 
  Signal, 
  CheckCircle2, 
  Smartphone,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { CategoryData } from '../types';
import { playClick, playSuccess } from '../utils/sound';

interface MobileTrackerProps {
  onRegister: (amount: number, category: string, description: string) => void;
  categories: CategoryData[];
  glowLevel: 'off' | 'medium' | 'hyper';
  soundEnabled: boolean;
}

export const MobileTracker: React.FC<MobileTrackerProps> = ({
  onRegister,
  categories,
  glowLevel,
  soundEnabled
}) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('food');
  const [description, setDescription] = useState<string>('');
  const [isSuccessShowing, setIsSuccessShowing] = useState<boolean>(false);
  const [isAnimatingSuccess, setIsAnimatingSuccess] = useState<boolean>(false);
  const [registeredAmount, setRegisteredAmount] = useState<number>(0);

  // Quick note templates based on category
  const noteTemplates: Record<string, string[]> = {
    food: ['Lunch Match', 'Starbucks', 'Grocery Store', 'Dinner Delivery'],
    transport: ['Uber Ride', 'Subway Pass', 'Fuel Fill', 'Train Ticket'],
    tech: ['SaaS Renewal', 'Cloud Servers', 'Tech Accessory', 'E-Book'],
    health: ['Gym Class', 'Vitamin Pill', 'Organic Shop', 'Therapy Sync']
  };

  // Keyboard pad click handler
  const handleKeypress = (key: string) => {
    playClick(soundEnabled);
    
    if (key === 'clear') {
      setAmount('');
      return;
    }

    if (key === 'backspace') {
      setAmount(prev => prev.slice(0, -1));
      return;
    }

    // Limit digits length to prevent visual overflow
    if (amount.replace('.', '').length >= 6) return;

    if (key === '.') {
      if (amount.includes('.')) return;
      if (amount === '') {
        setAmount('0.');
        return;
      }
      setAmount(prev => prev + '.');
      return;
    }

    // Handle standard digits
    if (amount === '0') {
      setAmount(key);
      return;
    }

    // Enforce 2 decimals limit
    if (amount.includes('.')) {
      const parts = amount.split('.');
      if (parts[1] && parts[1].length >= 2) return;
    }

    setAmount(prev => prev + key);
  };

  // Submit transaction
  const handleRegister = () => {
    const numericVal = parseFloat(amount);
    if (!numericVal || numericVal <= 0) return;

    playSuccess(soundEnabled);
    
    // Default description if empty
    const finalDesc = description.trim() || noteTemplates[selectedCategory][0] || 'Quick Charge';
    
    // Register event
    onRegister(numericVal, selectedCategory, finalDesc);
    setRegisteredAmount(numericVal);

    // Trigger local tactile registration button success feedback bounce
    setIsAnimatingSuccess(true);
    setTimeout(() => {
      setIsAnimatingSuccess(false);
    }, 600);

    // Show temporary mobile success screen overlay
    setIsSuccessShowing(true);
    setTimeout(() => {
      setIsSuccessShowing(false);
    }, 1800);

    // Reset fields
    setAmount('');
    setDescription('');
  };

  // Display amount helper
  const getDisplayAmount = () => {
    if (amount === '') return '$ 0.00';
    // Append extra trailing zero for visual perfection
    const parts = amount.split('.');
    if (parts.length === 1) {
      return `$ ${amount}`;
    }
    return `$ ${amount}`;
  };

  // Glow shadows helper
  const glowStyle = {
    off: {},
    medium: { boxShadow: '0 0 15px rgba(0, 242, 254, 0.25)', border: '1px solid rgba(0, 242, 254, 0.35)' },
    hyper: { boxShadow: '0 0 25px rgba(0, 242, 254, 0.6)', border: '1px solid rgba(0, 242, 254, 0.7)' }
  }[glowLevel];

  // Map category icons
  const renderCatIcon = (iconName: string, color: string) => {
    const props = { className: "w-5 h-5 mb-1.5 transition-transform duration-200 group-hover:scale-110", style: { color } };
    switch (iconName) {
      case 'Utensils': return <Utensils {...props} />;
      case 'Car': return <Car {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      case 'HeartPulse': return <HeartPulse {...props} />;
      default: return <Utensils {...props} />;
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      
      {/* Smartphone Chassis Bezel */}
      <div 
        id="smartphone-mockup"
        className="relative w-[310px] h-[610px] rounded-[48px] bg-[#05070c] p-3 border-4 border-[#1a2233] shadow-glass flex flex-col overflow-hidden transition-all duration-300"
        style={glowLevel !== 'off' ? glowStyle : {}}
      >
        {/* Screen glass highlights */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-[44px]" />
        
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-black rounded-2xl z-50 flex items-center justify-between px-3.5">
          <div className="w-1.5 h-1.5 bg-[#00f2fe]/40 rounded-full animate-pulse" />
          <div className="w-8 h-1 bg-white/10 rounded-full" />
          <div className="w-2.5 h-2.5 bg-sky-900 rounded-full border border-sky-950 flex items-center justify-center">
            <div className="w-1 h-1 bg-blue-400 rounded-full" />
          </div>
        </div>

        {/* Smartphone Internal Display Area */}
        <div className="flex-1 rounded-[38px] bg-[#0a0e17] overflow-hidden flex flex-col relative border border-white/5 p-4 justify-between">
          
          {/* Success Flash Screen overlay */}
          <AnimatePresence>
            {isSuccessShowing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-brand-black/95 flex flex-col items-center justify-center p-6 text-center select-none"
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-16 h-16 rounded-full bg-[#00f2fe]/10 border-2 border-[#00f2fe] flex items-center justify-center text-[#00f2fe] mb-4 shadow-neon-cyan"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <h3 className="font-display font-bold text-lg text-white mb-1">TRANSACTION SENT</h3>
                <p className="text-xs text-gray-400 font-mono">NODE SUCCESSFULLY DISPATCHED</p>
                <div className="mt-4 bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-3 py-1 rounded text-sm text-[#00f2fe] font-mono font-semibold">
                  + ${registeredAmount.toFixed(2)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phone Header Status Bar */}
          <div className="flex justify-between items-center px-2 pt-2.5 text-[10px] font-mono text-gray-400 select-none">
            <span>09:03</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Display Output - Glowing Cyan */}
          <div className="mt-5 text-center flex flex-col items-center justify-center flex-1 max-h-[80px]">
            <span className="text-[9px] font-mono tracking-widest text-[#00f2fe]/60 uppercase mb-1">REGISTER EXPENSE</span>
            <motion.div 
              key={amount}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-3xl font-display font-bold text-[#00f2fe] tracking-tight cyan-glow-text"
            >
              {getDisplayAmount()}
            </motion.div>
          </div>

          {/* Quick Notes Template selector */}
          <div className="mb-3 select-none">
            <span className="text-[8px] font-mono tracking-widest text-gray-500 uppercase block mb-1 px-1">MEMO TEMPLATE</span>
            <div className="flex gap-1 overflow-x-auto pb-1.5 no-scrollbar">
              {noteTemplates[selectedCategory].map((note, i) => (
                <button
                  key={i}
                  onClick={() => {
                    playClick(soundEnabled);
                    setDescription(note);
                  }}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[9px] font-mono transition-all border ${description === note ? 'bg-[#00f2fe]/10 text-[#00f2fe] border-[#00f2fe]/40' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'}`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          {/* 2x2 Grid of Tactile Category buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {categories.map((c) => {
              const isActive = selectedCategory === c.name.toLowerCase();
              return (
                <motion.button
                  key={c.name}
                  onClick={() => {
                    playClick(soundEnabled);
                    setSelectedCategory(c.name.toLowerCase());
                    setDescription(''); // reset note on category shift
                  }}
                  whileTap={{ scale: 0.97 }}
                  className={`p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border select-none group relative ${isActive ? 'bg-[#0a0e17] border-[#00f2fe] shadow-neon-cyan' : 'bg-[#05070c]/70 border-white/5 hover:border-white/15'}`}
                >
                  {renderCatIcon(c.iconName, isActive ? '#00f2fe' : c.color)}
                  
                  <span className={`text-[10px] font-display font-semibold uppercase tracking-wider ${isActive ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white'}`}>
                    {c.name}
                  </span>
                  
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00f2fe] rounded-full ring-2 ring-[#0a0e17] animate-pulse" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Interactive Keyboard Num Pad */}
          <div className="grid grid-cols-3 gap-2.5 mb-4 px-2 select-none">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => {
              const isBackspace = key === 'backspace';
              return (
                <motion.button
                  key={key}
                  onClick={() => handleKeypress(key)}
                  whileTap={{ scale: 0.93 }}
                  className={`h-10 rounded-xl flex items-center justify-center font-display text-sm font-semibold transition-all border ${isBackspace ? 'bg-white/5 border-transparent text-gray-400 hover:text-white' : 'bg-[#05070c]/50 border-white/5 text-gray-300 hover:border-white/15 hover:bg-[#0a0e17]'}`}
                >
                  {isBackspace ? <Delete className="w-4 h-4 text-red-400" /> : key}
                </motion.button>
              );
            })}
          </div>

          {/* Register Action Button at the Bottom */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            animate={isAnimatingSuccess ? {
              scale: [1, 1.08, 0.92, 1.02, 1],
              boxShadow: [
                "0 4px 20px rgba(0,242,254,0.15)",
                "0 0 35px rgba(16,185,129,0.8)",
                "0 4px 20px rgba(0,242,254,0.15)"
              ]
            } : {}}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={handleRegister}
            disabled={!parseFloat(amount) || parseFloat(amount) <= 0}
            className={`w-full py-3.5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(0,242,254,0.15)] cursor-pointer select-none ${(!parseFloat(amount) || parseFloat(amount) <= 0) ? 'bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-[#00f2fe] to-sky-400 text-black border-2 border-[#00f2fe] hover:shadow-neon-cyan-strong'}`}
          >
            <span>REGISTER ACTION</span>
            <ChevronRight className="w-4 h-4 stroke-[3px]" />
          </motion.button>

        </div>
      </div>

      {/* Decorative shadow base */}
      <div className="absolute -bottom-6 w-4/5 h-4 bg-brand-cyan/10 blur-xl rounded-full opacity-60 pointer-events-none" />
    </div>
  );
};
