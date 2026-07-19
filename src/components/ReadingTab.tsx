import React, { useState, useMemo } from 'react';
import { Book, ReadingLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Trash2, Edit2, Play, Pause, Check, Book as BookIcon, CheckCircle2, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { playSuccess } from '../utils/sound';

interface ReadingTabProps {
  books: Book[];
  setBooks: (b: Book[]) => void;
  readingLogs: ReadingLog[];
  setReadingLogs: (rl: ReadingLog[]) => void;
  dailyGoal: number;
  setDailyGoal: (g: number) => void;
  themeColor: string;
}

const neonColors: Record<string, string> = {
  cyan: '#00f3ff',
  purple: '#b026ff',
  green: '#00ff66',
  orange: '#ff6a00',
  pink: '#ff007f',
  yellow: '#ffcc00'
};

export function ReadingTab({ books, setBooks, readingLogs, setReadingLogs, dailyGoal, setDailyGoal, themeColor }: ReadingTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'progress' | 'books' | 'evolution'>('progress');
  const [showNewBook, setShowNewBook] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newPages, setNewPages] = useState('');
  const [editBookId, setEditBookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [editBookData, setEditBookData] = useState<{titulo: string, autor: string, totalPaginas: string, paginaAtual: string} | null>(null);

  const [logBookId, setLogBookId] = useState<string>('');
  const [logPages, setLogPages] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const colorHex = neonColors[themeColor] || neonColors.cyan;

  // Derived data
  const pagesReadToday = useMemo(() => {
    return readingLogs
      .filter(log => log.data === todayStr)
      .reduce((sum, log) => sum + log.paginasLidas, 0);
  }, [readingLogs, todayStr]);

  const currentStreak = useMemo(() => {
    if (readingLogs.length === 0) return 0;
    
    // Group logs by date
    const pagesByDate = readingLogs.reduce((acc, log) => {
      acc[log.data] = (acc[log.data] || 0) + log.paginasLidas;
      return acc;
    }, {} as Record<string, number>);

    // Sort dates descending
    const dates = Object.keys(pagesByDate).sort((a, b) => b.localeCompare(a));
    
    let streak = 0;
    let d = new Date();
    // Start checking from today
    d.setHours(0,0,0,0);

    // If today is not met, but yesterday is, streak still continues from yesterday
    // Let's check today
    const todayLog = pagesByDate[todayStr] || 0;
    let checkDate = new Date();
    
    if (todayLog < dailyGoal) {
      // Check if yesterday was met. If not, streak is 0
      checkDate.setDate(checkDate.getDate() - 1);
      const yStr = checkDate.toISOString().split('T')[0];
      if ((pagesByDate[yStr] || 0) < dailyGoal) {
        return 0;
      }
    } else {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Now loop backwards
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if ((pagesByDate[dStr] || 0) >= dailyGoal) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [readingLogs, dailyGoal, todayStr]);

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPages) return;
    const newBook: Book = {
      id: Date.now().toString(),
      titulo: newTitle,
      autor: newAuthor,
      totalPaginas: Number(newPages),
      paginaAtual: 0,
      status: 'lendo',
      notas: ''
    };
    setBooks([...books, newBook]);
    setNewTitle('');
    setNewAuthor('');
    setNewPages('');
    setShowNewBook(false);
    playSuccess(true);
  };


  const handleSaveBook = (id: string) => {
    if (!editBookData) return;
    setBooks(books.map(b => {
      if (b.id === id) {
        const tPaginas = Math.max(1, Number(editBookData.totalPaginas) || 1);
        const pAtual = Math.max(0, Math.min(Number(editBookData.paginaAtual) || 0, tPaginas));
        const status = pAtual >= tPaginas ? 'concluido' : (b.status === 'concluido' ? 'lendo' : b.status);
        return { 
          ...b, 
          titulo: editBookData.titulo || b.titulo, 
          autor: editBookData.autor, 
          totalPaginas: tPaginas,
          paginaAtual: pAtual,
          status
        };
      }
      return b;
    }));
    setEditBookId(null);
    setEditBookData(null);
  };

  const handleUpdateNotes = (id: string, notas: string) => {
    setBooks(books.map(b => b.id === id ? { ...b, notas } : b));
  };

  const handleLogProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logBookId || !logPages) return;
    const pages = Number(logPages);
    
    const book = books.find(b => b.id === logBookId);
    if (!book) return;
    
    const pagesLeft = book.totalPaginas - book.paginaAtual;
    if (pagesLeft <= 0) {
      setLogPages('');
      return;
    }
    
    const actualPagesToLog = Math.min(pages, pagesLeft);
    
    const newLog: ReadingLog = {
      id: Date.now().toString(),
      bookId: logBookId,
      data: todayStr,
      paginasLidas: actualPagesToLog
    };
    
    setReadingLogs([...readingLogs, newLog]);
    setBooks(books.map(b => {
      if (b.id === logBookId) {
        const novaPagina = b.paginaAtual + actualPagesToLog;
        const novoStatus = novaPagina >= b.totalPaginas ? 'concluido' : b.status;
        return { ...b, paginaAtual: novaPagina, status: novoStatus };
      }
      return b;
    }));
    setLogPages('');
    playSuccess(true);
  };

  const deleteBook = (id: string) => {
    setBooks(books.filter(b => b.id !== id));
    setReadingLogs(readingLogs.filter(l => l.bookId !== id));
  };

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    const lowerQ = searchQuery.toLowerCase();
    return books.filter(b => 
      b.titulo.toLowerCase().includes(lowerQ) || 
      (b.autor && b.autor.toLowerCase().includes(lowerQ))
    );
  }, [books, searchQuery]);

  const chartData = useMemo(() => {
    if (!books.length) return [];
    const bId = logBookId || books[0]?.id;
    if (!bId) return [];

    const logs = readingLogs.filter(l => l.bookId === bId);
    const byDate = logs.reduce((acc, log) => {
      acc[log.data] = (acc[log.data] || 0) + log.paginasLidas;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, pages]) => {
        const d = new Date(date);
        return {
          date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          paginas: pages
        };
      });
  }, [readingLogs, logBookId, books]);

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <button
          onClick={() => setActiveSubTab('progress')}
          className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all duration-300 relative ${activeSubTab === 'progress' ? 'text-white shadow-[0_0_15px_rgba(var(--color-accent),0.3)]' : 'text-gray-400 hover:text-white'}`}
          style={activeSubTab === 'progress' ? { backgroundColor: colorHex + '20' } : {}}
        >
          Progresso
        </button>
        <button
          onClick={() => setActiveSubTab('books')}
          className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all duration-300 relative ${activeSubTab === 'books' ? 'text-white shadow-[0_0_15px_rgba(var(--color-accent),0.3)]' : 'text-gray-400 hover:text-white'}`}
          style={activeSubTab === 'books' ? { backgroundColor: colorHex + '20' } : {}}
        >
          Livros
        </button>
        <button
          onClick={() => setActiveSubTab('evolution')}
          className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-all duration-300 relative ${activeSubTab === 'evolution' ? 'text-white shadow-[0_0_15px_rgba(var(--color-accent),0.3)]' : 'text-gray-400 hover:text-white'}`}
          style={activeSubTab === 'evolution' ? { backgroundColor: colorHex + '20' } : {}}
        >
          Evolução
        </button>
      </div>

      {activeSubTab === 'progress' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            <h3 className="text-gray-400 text-sm font-mono tracking-widest mb-4">PÁGINAS HOJE</h3>
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" className="stroke-white/5" strokeWidth="8" fill="none" />
                <circle
                  cx="80" cy="80" r="70"
                  className="transition-all duration-1000 ease-out"
                  stroke={colorHex}
                  strokeWidth="8" fill="none"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * Math.min(pagesReadToday / dailyGoal, 1))}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 8px ${colorHex}80)` }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-white">{pagesReadToday}</span>
                <span className="text-xs font-mono text-gray-500">/ {dailyGoal}</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center space-x-2 text-accent">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-mono font-bold">{currentStreak} DIAS SEGUIDOS</span>
            </div>
            
            <div className="mt-4 flex flex-col items-center">
              <label className="text-xs text-gray-500 font-mono mb-1">META DIÁRIA</label>
              <input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value) || 1)}
                className="w-24 bg-black/50 border border-white/10 rounded-lg p-1 text-center text-white focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <h3 className="text-sm font-mono text-gray-400 mb-4 flex items-center"><Plus className="w-4 h-4 mr-2" /> REGISTRAR LEITURA</h3>
            <form onSubmit={handleLogProgress} className="flex space-x-2">
              <select
                value={logBookId}
                onChange={(e) => setLogBookId(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent appearance-none"
              >
                <option value="" disabled>Selecione o livro...</option>
                {books.filter(b => b.status === 'lendo').map(b => (
                  <option key={b.id} value={b.id}>{b.titulo}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Pág."
                value={logPages}
                onChange={(e) => setLogPages(e.target.value)}
                className="w-20 bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent"
                min="1"
              />
              <button type="submit" className="bg-accent/20 text-accent p-3 rounded-xl hover:bg-accent/30 transition-colors border border-accent/30">
                <Check className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {activeSubTab === 'books' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent placeholder-gray-500"
            />
          </div>
          <button
            onClick={() => setShowNewBook(!showNewBook)}
            className="w-full flex items-center justify-center space-x-2 bg-accent/10 text-accent p-4 rounded-2xl hover:bg-accent/20 transition-colors border border-accent/20 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Livro</span>
          </button>

          <AnimatePresence>
            {showNewBook && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddBook}
                className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-4 overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Título"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Autor (opcional)"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent"
                />
                <input
                  type="number"
                  placeholder="Total de páginas"
                  value={newPages}
                  onChange={(e) => setNewPages(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent"
                  min="1"
                />
                <button type="submit" className="w-full bg-accent text-black font-bold p-3 rounded-xl hover:opacity-90 transition-opacity">
                  Salvar
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {filteredBooks.map((book) => (
              <div key={book.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                {editBookId === book.id && editBookData ? (
                  <div className="space-y-3 bg-black/30 p-3 rounded-xl border border-white/5">
                    <div>
                      <label className="text-xs font-mono text-gray-500 block mb-1">TÍTULO & AUTOR</label>
                      <div className="flex space-x-2">
                        <input type="text" value={editBookData.titulo} onChange={e => setEditBookData({...editBookData, titulo: e.target.value})} className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent" placeholder="Título" />
                        <input type="text" value={editBookData.autor} onChange={e => setEditBookData({...editBookData, autor: e.target.value})} className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent" placeholder="Autor" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-gray-500 block mb-1">PÁGINAS (ATUAL / TOTAL)</label>
                      <div className="flex space-x-2">
                        <input type="number" value={editBookData.paginaAtual} onChange={e => setEditBookData({...editBookData, paginaAtual: e.target.value})} className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent" min="0" />
                        <input type="number" value={editBookData.totalPaginas} onChange={e => setEditBookData({...editBookData, totalPaginas: e.target.value})} className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent" min="1" />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button onClick={() => { setEditBookId(null); setEditBookData(null); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors">Cancelar</button>
                      <button onClick={() => handleSaveBook(book.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors">Salvar Alterações</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium text-lg flex items-center">
                        {book.titulo}
                        {book.status === 'concluido' && (
                          <span className="ml-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 tracking-wider">
                            CONCLUÍDO
                          </span>
                        )}
                      </h4>
                      <p className="text-gray-400 text-sm">{book.autor || 'Desconhecido'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setEditBookData({ titulo: book.titulo, autor: book.autor, totalPaginas: String(book.totalPaginas), paginaAtual: String(book.paginaAtual) }); setEditBookId(book.id); }}
                        className="p-2 bg-black/50 rounded-lg text-gray-400 hover:text-accent transition-colors"
                        title="Editar livro"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setBooks(books.map(b => b.id === book.id ? { ...b, status: b.status === 'lendo' ? (b.paginaAtual >= b.totalPaginas ? 'concluido' : 'pausado') : 'lendo' } : b))}
                        className="p-2 bg-black/50 rounded-lg text-gray-400 hover:text-accent transition-colors"
                        title="Mudar status"
                      >
                        {book.status === 'lendo' ? <Pause className="w-4 h-4" /> : (book.status === 'concluido' ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Play className="w-4 h-4" />)}
                      </button>
                      <button onClick={() => deleteBook(book.id)} className="p-2 bg-black/50 rounded-lg text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
                    <span>{book.paginaAtual} PÁGS</span>
                    <span>{book.totalPaginas} PÁGS</span>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${(book.paginaAtual / book.totalPaginas) * 100}%`, backgroundColor: colorHex }}
                    />
                  </div>
                  <div className="text-right text-xs text-accent mt-1 font-mono">
                    {Math.round((book.paginaAtual / book.totalPaginas) * 100)}% CONCLUÍDO
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-mono text-gray-500 block">NOTAS</label>
                    {editingNoteId !== book.id && (
                      <button 
                        onClick={() => { setTempNote(book.notas); setEditingNoteId(book.id); }}
                        className="text-xs text-gray-400 hover:text-accent transition-colors flex items-center"
                      >
                        <Edit2 className="w-3 h-3 mr-1" /> Editar
                      </button>
                    )}
                  </div>
                  {editingNoteId === book.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="Suas anotações..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-accent min-h-[120px]"
                      />
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => { handleUpdateNotes(book.id, tempNote); setEditingNoteId(null); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-black/30 border border-white/5 rounded-xl p-3 text-gray-300 text-sm min-h-[80px] whitespace-pre-wrap">
                      {book.notas || <span className="text-gray-600 italic">Nenhuma anotação.</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredBooks.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                <BookIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>{searchQuery ? 'Nenhum livro encontrado na busca.' : 'Nenhum livro cadastrado.'}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeSubTab === 'evolution' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <select
              value={logBookId || (books.length > 0 ? books[0].id : '')}
              onChange={(e) => setLogBookId(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent appearance-none mb-4"
            >
              <option value="" disabled>Selecione o livro...</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.titulo}</option>
              ))}
            </select>

            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} width={30} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000000e0', border: '1px solid #ffffff20', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: colorHex }}
                    />
                    <Line
                      type="monotone"
                      dataKey="paginas"
                      name="Páginas"
                      stroke={colorHex}
                      strokeWidth={3}
                      dot={{ fill: colorHex, strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#fff', stroke: colorHex }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>Nenhum dado de leitura para exibir.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
