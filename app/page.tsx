"use client";

import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Utensils,
  Car,
  Receipt,
  Tv,
  Coffee,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRightLeft,
  ShoppingBag,
  Eye,
  EyeOff
} from 'lucide-react';

// --- INITIAL MOCK DATA ---
const INITIAL_POCKETS = [
  {
    id: 'pkt-main',
    name: 'Kantong Utama',
    type: 'main',
    balance: 5450000,
    target: null,
    icon: 'Wallet',
    color: 'from-blue-600 to-indigo-700',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500'
  },
  {
    id: 'pkt-daily',
    name: 'Jajan & Makan Harian',
    type: 'spending',
    balance: 850000,
    target: 1500000,
    timeframe: 'Harian',
    icon: 'Coffee',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500'
  },
  {
    id: 'pkt-transport',
    name: 'Transport & Bensin',
    type: 'spending',
    balance: 420000,
    target: 800000,
    timeframe: 'Mingguan',
    icon: 'Car',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500'
  },
  {
    id: 'pkt-saving',
    name: 'Tabungan Nikah / Impian',
    type: 'saving',
    balance: 12500000,
    target: 25000000,
    timeframe: 'Bulanan',
    icon: 'PiggyBank',
    color: 'from-purple-600 to-pink-600',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500'
  }
];

const INITIAL_TRANSACTIONS = [
  { id: 'tx-1', title: 'Gaji Bulanan', amount: 5000000, type: 'INCOME', category: 'Gaji', date: '2026-11-01', pocketId: 'pkt-main' },
  { id: 'tx-2', title: 'Makan Siang Padang', amount: 35000, type: 'EXPENSE', category: 'Makanan', date: '2026-11-10', pocketId: 'pkt-daily' },
  { id: 'tx-3', title: 'Isi Bensin Pertalite', amount: 50000, type: 'EXPENSE', category: 'Transport', date: '2026-11-09', pocketId: 'pkt-transport' },
  { id: 'tx-4', title: 'Belanja Bulanan Indomaret', amount: 250000, type: 'EXPENSE', category: 'Belanja', date: '2026-11-08', pocketId: 'pkt-daily' }
];

export default function BluFinanceApp() {
  const [pockets, setPockets] = useState(INITIAL_POCKETS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<'home' | 'pockets' | 'analytics' | 'ai'>('home');
  const [showBalance, setShowBalance] = useState(true);
  
  // Modal states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txPocketId, setTxPocketId] = useState('pkt-main');

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Calculate total balance
  const totalBalance = useMemo(() => {
    return pockets.reduce((acc, p) => acc + p.balance, 0);
  }, [pockets]);

  // Handle Add Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount) return;

    const amountNum = parseFloat(txAmount);
    const newTx = {
      id: 'tx-' + Date.now(),
      title: txTitle,
      amount: amountNum,
      type: txType,
      category: txType === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
      date: new Date().toISOString().split('T')[0],
      pocketId: txPocketId
    };

    setTransactions([newTx, ...transactions]);

    // Update pocket balance
    setPockets(pockets.map(p => {
      if (p.id === txPocketId) {
        return {
          ...p,
          balance: txType === 'INCOME' ? p.balance + amountNum : p.balance - amountNum
        };
      }
      return p;
    }));

    setTxTitle('');
    setTxAmount('');
    setIsTxModalOpen(false);
  };

  // AI Gemini Integration
  const askGeminiAI = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    setAiResponse('');

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Bertindaklah sebagai Asisten Keuangan Pribadi kelas m-banking blu by BCA Digital. Pengguna memiliki total saldo Rp ${totalBalance.toLocaleString('id-ID')} dengan rincian kantong: ${JSON.stringify(pockets)}. Pertanyaan pengguna: "${aiPrompt}". Berikan saran keuangan yang bijak, singkat, dan bernada ramah khas layanan digital banking.`
            }]
          }]
        })
      });

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, asisten sedang sibuk mengatur kantong keuanganmu.";
      setAiResponse(reply);
    } catch (err) {
      setAiResponse("Gagal terhubung ke AI Assistant. Periksa koneksi atau API Key Anda.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0F1D] text-slate-100 flex justify-center pb-24">
      <div className="w-full max-w-md bg-[#0D1527] min-h-screen shadow-2xl flex flex-col relative border-x border-slate-800">
        
        {/* TOP HEADER (BLU STYLE) */}
        <header className="p-5 flex items-center justify-between border-b border-slate-800 bg-[#0A0F1D]/80 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/30">
              blu
            </div>
            <div>
              <p className="text-xs text-slate-400">Selamat datang,</p>
              <h1 className="text-sm font-semibold text-white">Sulthan</h1>
            </div>
          </div>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition"
          >
            {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 p-5 space-y-6 overflow-y-auto">
          
          {activeTab === 'home' && (
            <>
              {/* TOTAL BALANCE CARD */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden border border-blue-400/20">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-2xl"></div>
                <p className="text-xs text-blue-200 font-medium tracking-wider uppercase">Total Saldo Gabungan</p>
                <h2 className="text-3xl font-bold text-white mt-1">
                  {showBalance ? `Rp ${totalBalance.toLocaleString('id-ID')}` : 'Rp ••••••••••'}
                </h2>
                <div className="mt-6 flex space-x-3">
                  <button 
                    onClick={() => { setTxType('INCOME'); setIsTxModalOpen(true); }}
                    className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition border border-white/10"
                  >
                    <ArrowDownLeft size={16} className="text-emerald-400" />
                    <span>Pemasukan</span>
                  </button>
                  <button 
                    onClick={() => { setTxType('EXPENSE'); setIsTxModalOpen(true); }}
                    className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition border border-white/10"
                  >
                    <ArrowUpRight size={16} className="text-rose-400" />
                    <span>Pengeluaran</span>
                  </button>
                </div>
              </div>

              {/* POCKETS SECTION (BLU SAVING/GETHER CONCEPT) */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-200">Kantong blu (Pockets)</h3>
                  <button onClick={() => setActiveTab('pockets')} className="text-xs text-blue-400 font-medium hover:underline">Lihat Semua</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {pockets.map(pocket => (
                    <div key={pocket.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition">
                      <div>
                        <div className={`w-8 h-8 rounded-xl ${pocket.bgColor} ${pocket.textColor} flex items-center justify-center mb-3`}>
                          <Wallet size={16} />
                        </div>
                        <h4 className="text-xs font-semibold text-slate-300 truncate">{pocket.name}</h4>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-bold text-white">
                          {showBalance ? `Rp ${pocket.balance.toLocaleString('id-ID')}` : 'Rp •••••'}
                        </p>
                        {pocket.timeframe && (
                          <span className="inline-block mt-1 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                            Budget {pocket.timeframe}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT TRANSACTIONS */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-3">Mutasi Terakhir</h3>
                <div className="space-y-2.5">
                  {transactions.slice(0, 4).map(tx => (
                    <div key={tx.id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {tx.type === 'INCOME' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{tx.title}</p>
                          <p className="text-[10px] text-slate-400">{tx.date} • {tx.category}</p>
                        </div>
                      </div>
                      <p className={`text-xs font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'pockets' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Kelola Kantong blu</h3>
              <p className="text-xs text-slate-400">Pisahkan dana harian, mingguan, dan tabunganmu agar keuangan lebih teratur.</p>
              {pockets.map(pocket => (
                <div key={pocket.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{pocket.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Tipe: {pocket.type.toUpperCase()}</p>
                    </div>
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg font-semibold">Aktif</span>
                  </div>
                  <div className="mt-4 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-400">Saldo Kantong</p>
                      <p className="text-lg font-bold text-white">Rp {pocket.balance.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Analitik Keuangan</h3>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles size={24} />
                </div>
                <h4 className="text-sm font-bold text-white">Grafik & Arus Kas</h4>
                <p className="text-xs text-slate-400">Total pengeluaran minggu ini terkontrol dengan baik di bawah batas limit kantong harian.</p>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="text-cyan-400" size={20} />
                <h3 className="text-base font-bold text-white">blu AI Financial Advisor</h3>
              </div>
              <p className="v text-xs text-slate-400">Tanyakan tips menabung, analisis pengeluaran harian, atau saran finansial langsung ke AI powered by Google Gemini.</p>
              
              <div className="space-y-3">
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Contoh: Bagaimana cara menghemat uang jajan mingguan saya?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                />
                <button 
                  onClick={askGeminiAI}
                  disabled={isAiLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-xs font-semibold text-white transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
                >
                  {isAiLoading ? <span>Sedang Berpikir...</span> : <span>Tanya blu AI Sekarang</span>}
                </button>
              </div>

              {aiResponse && (
                <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Jawaban blu AI:</p>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{aiResponse}</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* BOTTOM NAVIGATION BAR (M-BANKING STYLE) */}
        <nav className="absolute bottom-0 left-0 right-0 bg-[#0A0F1D]/90 backdrop-blur border-t border-slate-800 p-3 flex justify-around items-center z-20">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'home' ? 'text-blue-400' : 'text-slate-400'}`}
          >
            <Wallet size={20} />
            <span className="text-[10px] font-medium">Beranda</span>
          </button>
          <button 
            onClick={() => setActiveTab('pockets')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'pockets' ? 'text-blue-400' : 'text-slate-400'}`}
          >
            <PiggyBank size={20} />
            <span className="text-[10px] font-medium">Kantong</span>
          </button>
          <button 
            onClick={() => { setTxType('EXPENSE'); setIsTxModalOpen(true); }}
            className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 -mt-5 hover:scale-105 transition"
          >
            <Plus size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'analytics' ? 'text-blue-400' : 'text-slate-400'}`}
          >
            <Receipt size={20} />
            <span className="text-[10px] font-medium">Mutasi</span>
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center space-y-1 ${activeTab === 'ai' ? 'text-blue-400' : 'text-slate-400'}`}
          >
            <Sparkles size={20} />
            <span className="text-[10px] font-medium">blu AI</span>
          </button>
        </nav>

        {/* MODAL TAMBAH TRANSAKSI */}
        {isTxModalOpen && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-[#0D1527] border border-slate-800 w-full rounded-t-3xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">
                  {txType === 'INCOME' ? 'Tambah Pemasukan' : 'Catat Pengeluaran Baru'}
                </h3>
                <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Keterangan / Catatan</label>
                  <input 
                    type="text" 
                    value={txTitle}
                    onChange={(e) => setTxTitle(e.target.value)}
                    placeholder="Contoh: Makan Siang, Bensin..."
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Nominal (Rp)</label>
                  <input 
                    type="number" 
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="Contoh: 35000"
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Pilih Kantong</label>
                  <select 
                    value={txPocketId}
                    onChange={(e) => setTxPocketId(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {pockets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-xs font-semibold text-white transition shadow-lg shadow-blue-600/30 mt-2"
                >
                  Simpan Transaksi
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}