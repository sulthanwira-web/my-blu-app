"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Wallet, 
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Coffee,
  Car,
  Receipt,
  X,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export default function BluFinanceApp() {
  const [pockets, setPockets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'home' | 'pockets' | 'analytics' | 'ai'>('home');
  const [showBalance, setShowBalance] = useState(true);
  
  // Modal states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txPocketId, setTxPocketId] = useState('pkt-main');

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. FETCH DATA DARI SUPABASE
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: pocketsData } = await supabase.from('pockets').select('*').order('created_at', { ascending: true });
      const { data: txData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });

      if (pocketsData) setPockets(pocketsData);
      if (txData) setTransactions(txData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate total balance
  const totalBalance = useMemo(() => {
    return pockets.reduce((acc, p) => acc + Number(p.balance), 0);
  }, [pockets]);

  // 2. HANDLE TAMBAH TRANSAKSI (SIMPAN KE SUPABASE CLOUD)
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle || !txAmount) return;

    const amountNum = parseFloat(txAmount);
    const selectedPocket = pockets.find(p => p.id === txPocketId);
    if (!selectedPocket) return;

    const newTxId = 'tx-' + Date.now();
    const newTx = {
      id: newTxId,
      title: txTitle,
      amount: amountNum,
      type: txType,
      category: txType === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
      date: new Date().toISOString().split('T')[0],
      pocket_id: txPocketId
    };

    // Update Saldo Kantong
    const updatedBalance = txType === 'INCOME' 
      ? Number(selectedPocket.balance) + amountNum 
      : Number(selectedPocket.balance) - amountNum;

    // Direct Database Operation
    await supabase.from('transactions').insert([newTx]);
    await supabase.from('pockets').update({ balance: updatedBalance }).eq('id', txPocketId);

    // Refresh Data UI
    fetchData();

    setTxTitle('');
    setTxAmount('');
    setIsTxModalOpen(false);
  };

  // 3. AI GEMINI ASSISTANT
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
              text: `Bertindaklah sebagai Asisten Keuangan Pribadi m-banking blu by BCA Digital. Total saldo pengguna: Rp ${totalBalance.toLocaleString('id-ID')}. Rincian kantong: ${JSON.stringify(pockets)}. Pertanyaan: "${aiPrompt}". Jawab ringkas, bijak, dan ramah.`
            }]
          }]
        })
      });

      const data = await response.json();
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, asisten sedang sibuk.");
    } catch (err) {
      setAiResponse("Gagal terhubung ke AI Assistant.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0F1D] text-slate-100 flex justify-center pb-24">
      <div className="w-full max-w-md bg-[#0D1527] min-h-screen shadow-2xl flex flex-col relative border-x border-slate-800">
        
        {/* HEADER */}
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

        {/* CONTENT */}
        <div className="flex-1 p-5 space-y-6 overflow-y-auto">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Mengambil data dari Supabase Cloud...</div>
          ) : (
            <>
              {activeTab === 'home' && (
                <>
                  {/* TOTAL BALANCE CARD */}
                  <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden border border-blue-400/20">
                    <p className="text-xs text-blue-200 font-medium tracking-wider uppercase">Total Saldo (Live Cloud)</p>
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

                  {/* KANTONG */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-3">Kantong blu (Cloud Sync)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {pockets.map(pocket => (
                        <div key={pocket.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                          <div>
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                              <Wallet size={16} />
                            </div>
                            <h4 className="text-xs font-semibold text-slate-300 truncate">{pocket.name}</h4>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm font-bold text-white">
                              {showBalance ? `Rp ${Number(pocket.balance).toLocaleString('id-ID')}` : 'Rp •••••'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MUTASI TERAKHIR */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-3">Mutasi Terakhir</h3>
                    <div className="space-y-2.5">
                      {transactions.slice(0, 5).map(tx => (
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
                            {tx.type === 'INCOME' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
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
                  {pockets.map(pocket => (
                    <div key={pocket.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                      <h4 className="text-sm font-bold text-white">{pocket.name}</h4>
                      <p className="text-lg font-bold text-white mt-2">Rp {Number(pocket.balance).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="text-cyan-400" size={20} />
                    <h3 className="text-base font-bold text-white">blu AI Financial Advisor</h3>
                  </div>
                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Tanyakan sesuatu tentang keuanganmu..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                  />
                  <button 
                    onClick={askGeminiAI}
                    disabled={isAiLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-xs font-semibold text-white transition shadow-lg shadow-blue-600/30"
                  >
                    {isAiLoading ? 'Sedang Berpikir...' : 'Tanya blu AI'}
                  </button>
                  {aiResponse && (
                    <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 text-xs text-slate-200 leading-relaxed">
                      {aiResponse}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* BOTTOM NAVIGATION */}
        <nav className="absolute bottom-0 left-0 right-0 bg-[#0A0F1D]/90 backdrop-blur border-t border-slate-800 p-3 flex justify-around items-center z-20">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center space-y-1 ${activeTab === 'home' ? 'text-blue-400' : 'text-slate-400'}`}>
            <Wallet size={20} />
            <span className="text-[10px] font-medium">Beranda</span>
          </button>
          <button onClick={() => setActiveTab('pockets')} className={`flex flex-col items-center space-y-1 ${activeTab === 'pockets' ? 'text-blue-400' : 'text-slate-400'}`}>
            <PiggyBank size={20} />
            <span className="text-[10px] font-medium">Kantong</span>
          </button>
          <button onClick={() => { setTxType('EXPENSE'); setIsTxModalOpen(true); }} className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 -mt-5 hover:scale-105 transition">
            <Plus size={24} />
          </button>
          <button onClick={() => setActiveTab('ai')} className={`flex flex-col items-center space-y-1 ${activeTab === 'ai' ? 'text-blue-400' : 'text-slate-400'}`}>
            <Sparkles size={20} />
            <span className="text-[10px] font-medium">blu AI</span>
          </button>
        </nav>

        {/* MODAL TRANSAKSI */}
        {isTxModalOpen && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-[#0D1527] border border-slate-800 w-full rounded-t-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">
                  {txType === 'INCOME' ? 'Tambah Pemasukan' : 'Catat Pengeluaran'}
                </h3>
                <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Catatan / Keterangan</label>
                  <input 
                    type="text" 
                    value={txTitle}
                    onChange={(e) => setTxTitle(e.target.value)}
                    placeholder="Contoh: Makan Siang"
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
                  Simpan ke Supabase Cloud
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}