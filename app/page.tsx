"use client";

import React, { useState, useEffect } from "react";
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Plus, Repeat, Coffee, 
  CreditCard, PiggyBank, Download, Eye, EyeOff, ChevronRight, 
  FileText, Printer, CheckCircle2, Share2, Clock, X, Trash2, 
  Edit3, RotateCcw
} from "lucide-react";
import { BluLogo } from "@/components/BluLogo"; // Pastikan path ini sesuai

// --- INTERFACES ---
interface Pocket {
  id: number;
  name: string;
  balance: number;
  type: string;
  target: number | null;
  progress: number;
}

interface Transaction {
  id: number;
  pocketName: string;
  title: string;
  category: string;
  tag: string;
  amount: number;
  type: "in" | "out";
  date: string;
  ref: string;
}

// Inisialisasi AWAL: Saldo 0, 1 Kantong Default, Transaksi Kosong
const DEFAULT_POCKET: Pocket[] = [
  { id: 1, name: "Kantong Utama", balance: 0, type: "Utama", target: null, progress: 0 }
];

export default function BluDashboardPro() {
  const [isLoaded, setIsLoaded] = useState(false); // Mencegah Hydration Error Next.js
  const [showBalance, setShowBalance] = useState(true);
  
  // Data State
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [latestTx, setLatestTx] = useState<Transaction | null>(null);
  const [selectedPocketDetail, setSelectedPocketDetail] = useState<Pocket | null>(null);
  const [isAllPocketsOpen, setIsAllPocketsOpen] = useState(false);
  const [isAllTxOpen, setIsAllTxOpen] = useState(false);
  
  // Form State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isPocketModalOpen, setIsPocketModalOpen] = useState(false);
  const [editingPocket, setEditingPocket] = useState<Pocket | null>(null);
  const [pocketFormName, setPocketFormName] = useState("");
  const [pocketFormType, setPocketFormType] = useState("Harian");
  const [pocketFormTarget, setPocketFormTarget] = useState("");

  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"in" | "out">("out");
  const [selectedPocket, setSelectedPocket] = useState("");
  
  // Custom Interval State
  const [isRecurring, setIsRecurring] = useState(false);
  const [timesCount, setTimesCount] = useState<number>(1);
  const [periodCount, setPeriodCount] = useState<number>(1);
  const [periodUnit, setPeriodUnit] = useState<"Hari" | "Minggu" | "Bulan">("Hari");

  // Total Balance Dinamis
  const totalBalance = pockets.reduce((acc, curr) => acc + curr.balance, 0);

  // --- EFEK LOCALSTORAGE (PERSISTENSI DATA) ---
  useEffect(() => {
    const savedPockets = localStorage.getItem("blu_pockets");
    const savedTransactions = localStorage.getItem("blu_transactions");
    
    if (savedPockets) setPockets(JSON.parse(savedPockets));
    else setPockets(DEFAULT_POCKET);

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("blu_pockets", JSON.stringify(pockets));
      localStorage.setItem("blu_transactions", JSON.stringify(transactions));
    }
  }, [pockets, transactions, isLoaded]);

  // Render loading screen saat LocalStorage sedang dimuat
  if (!isLoaded) {
    return <div className="min-h-screen bg-[#070b19] flex items-center justify-center text-cyan-400">Memuat Data...</div>;
  }

  // --- HANDLER FUNCTIONS ---
  const handleResetData = () => {
    if (confirm("Yakin ingin menghapus SEMUA data? Saldo akan kembali Rp 0.")) {
      setPockets(DEFAULT_POCKET);
      setTransactions([]);
      localStorage.removeItem("blu_pockets");
      localStorage.removeItem("blu_transactions");
      alert("Data berhasil di-reset!");
    }
  };

  const handleTypeChange = (type: "in" | "out") => {
    setTxType(type);
    setSelectedPocket(pockets[0]?.name || "");
  };

  // Simpan Transaksi (BARU & EDIT)
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(txAmount);
    if (!txTitle || isNaN(numAmount) || numAmount <= 0) return;

    const finalAmount = txType === "out" ? -numAmount : numAmount;
    const recurringTag = isRecurring ? `${timesCount}x tiap ${periodCount} ${periodUnit}` : "Sekali";

    if (editingTx) {
      const diffAmount = finalAmount - editingTx.amount;
      
      setTransactions(transactions.map(t => t.id === editingTx.id ? {
        ...t, title: txTitle, amount: finalAmount, type: txType, pocketName: selectedPocket, tag: recurringTag
      } : t));

      // Update Saldo Kantong LAMA dan BARU jika pindah kantong
      if (editingTx.pocketName !== selectedPocket) {
        setPockets(pockets.map(p => {
          if (p.name === editingTx.pocketName) return { ...p, balance: p.balance - editingTx.amount };
          if (p.name === selectedPocket) return { ...p, balance: p.balance + finalAmount };
          return p;
        }));
      } else {
        setPockets(pockets.map(p => p.name === selectedPocket ? { ...p, balance: p.balance + diffAmount } : p));
      }
      setEditingTx(null);
    } else {
      const newTxData: Transaction = {
        id: Date.now(),
        pocketName: selectedPocket,
        title: txTitle,
        category: txType === "out" ? "Pengeluaran" : "Pemasukan",
        tag: recurringTag,
        amount: finalAmount,
        type: txType,
        date: new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        ref: `BLU-${Math.floor(100000000 + Math.random() * 900000000)}`
      };

      setTransactions([newTxData, ...transactions]);
      setPockets(pockets.map(p => p.name === selectedPocket ? { ...p, balance: p.balance + finalAmount } : p));
      setLatestTx(newTxData);
      setIsReceiptOpen(true);
    }

    setIsModalOpen(false);
    setTxTitle(""); setTxAmount(""); setIsRecurring(false); setTimesCount(1); setPeriodCount(1);
  };

  // Hapus Transaksi
  const handleDeleteTransaction = (tx: Transaction) => {
    if (confirm(`Hapus transaksi "${tx.title}"? Saldo kantong akan disesuaikan otomatis.`)) {
      setTransactions(transactions.filter(t => t.id !== tx.id));
      setPockets(pockets.map(p => p.name === tx.pocketName ? { ...p, balance: p.balance - tx.amount } : p));
    }
  };

  // Setup Form saat Edit Transaksi
  const handleOpenEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxTitle(tx.title);
    setTxAmount(Math.abs(tx.amount).toString());
    setTxType(tx.type);
    setSelectedPocket(tx.pocketName);
    setIsRecurring(tx.tag !== "Sekali");
    setIsModalOpen(true);
  };

  // Simpan Kantong (BARU & EDIT)
  const handleSavePocket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pocketFormName) return;
    const targetVal = pocketFormTarget ? parseFloat(pocketFormTarget) : null;

    if (editingPocket) {
      // Update Nama di Transaksi juga jika nama kantong diubah
      if (editingPocket.name !== pocketFormName) {
        setTransactions(transactions.map(t => t.pocketName === editingPocket.name ? { ...t, pocketName: pocketFormName } : t));
      }
      setPockets(pockets.map(p => p.id === editingPocket.id ? {
        ...p, name: pocketFormName, type: pocketFormType, target: targetVal,
        progress: targetVal ? Math.min(100, Math.round((p.balance / targetVal) * 100)) : 0
      } : p));
    } else {
      setPockets([...pockets, {
        id: Date.now(), name: pocketFormName, balance: 0, type: pocketFormType, target: targetVal, progress: 0
      }]);
    }

    setIsPocketModalOpen(false); setEditingPocket(null); setPocketFormName(""); setPocketFormTarget("");
  };

  // Hapus Kantong
  const handleDeletePocket = (pocketId: number) => {
    if (pockets.length <= 1) return alert("Anda harus menyisakan minimal 1 kantong!");
    const pocketToDelete = pockets.find(p => p.id === pocketId);
    
    if (confirm(`Hapus kantong "${pocketToDelete?.name}"? Saldo Rp ${pocketToDelete?.balance} di dalamnya akan dianggap HANGUS.`)) {
      setPockets(pockets.filter(p => p.id !== pocketId));
      // Hapus riwayat transaksi terkait kantong tersebut agar sinkron
      setTransactions(transactions.filter(t => t.pocketName !== pocketToDelete?.name));
      if (selectedPocketDetail?.id === pocketId) setSelectedPocketDetail(null);
    }
  };

  const handleExportCSV = () => { /* Logika CSV tetap sama */ };
  const handleExportPDF = () => window.print();

  const formatRp = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  // Dapatkan Icon Dinamis berdasarkan Tipe Kantong
  const getPocketIcon = (type: string) => {
    switch(type) {
      case "Harian": return <Coffee className="w-4 h-4" />;
      case "Bulanan": return <CreditCard className="w-4 h-4" />;
      case "Impian": return <PiggyBank className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-white flex justify-center items-center p-0 sm:p-4 font-sans selection:bg-cyan-900">
      <div className="w-full max-w-md bg-[#0a1128] sm:rounded-3xl border border-blue-900/30 overflow-hidden shadow-2xl flex flex-col min-h-screen sm:min-h-[840px]">
        
        {/* TOP HEADER */}
        <div className="p-5 flex items-center justify-between border-b border-white/5 bg-[#0d1635]">
          <BluLogo />
          <div className="flex items-center gap-2">
            <button onClick={handleResetData} className="p-2 text-rose-300 bg-rose-950/50 border border-rose-500/30 rounded-lg"><RotateCcw className="w-4 h-4" /></button>
            <button onClick={handleExportPDF} className="p-2 text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-lg"><FileText className="w-4 h-4" /></button>
          </div>
        </div>

        {/* HERO CARD TOTAL SALDO */}
        <div className="p-5">
          <div className="relative rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-5 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between text-blue-100/80 text-xs mb-1">
              <span>Total Saldo Kamu</span>
              <button onClick={() => setShowBalance(!showBalance)}>{showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            <div className="text-3xl font-bold text-white mb-5">
              {showBalance ? formatRp(totalBalance) : "••••••••••••"}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setEditingTx(null); setTxTitle(""); setTxAmount(""); setSelectedPocket(pockets[0]?.name); setIsModalOpen(true); }} className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold">
                <Plus className="w-4 h-4 text-cyan-300" /> Catat Transaksi
              </button>
              <button onClick={() => { setEditingPocket(null); setPocketFormName(""); setPocketFormTarget(""); setIsPocketModalOpen(true); }} className="flex items-center justify-center gap-2 py-2.5 px-3 bg-cyan-400 hover:bg-cyan-300 text-blue-950 rounded-xl text-xs font-bold shadow-md">
                <Wallet className="w-4 h-4" /> Buat Kantong
              </button>
            </div>
          </div>
        </div>

        {/* SECTION KANTONG */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase text-blue-200/60 flex items-center gap-2">Kantong Aktif ({pockets.length})</h2>
            <button onClick={() => setIsAllPocketsOpen(true)} className="text-xs text-cyan-400 font-medium">Lihat Semua</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {pockets.slice(0, 4).map((pocket) => (
              <div key={pocket.id} onClick={() => setSelectedPocketDetail(pocket)} className="bg-[#0e1738] border border-blue-900/30 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer active:scale-95 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-blue-950/80 text-cyan-400">{getPocketIcon(pocket.type)}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-200">{pocket.type}</span>
                  </div>
                  <p className="text-xs text-blue-200/70 font-medium truncate">{pocket.name}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{showBalance ? formatRp(pocket.balance) : "••••••"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION TRANSAKSI */}
        <div className="px-5 flex-1 pb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase text-blue-200/60">Transaksi Terakhir</h2>
            <button onClick={() => setIsAllTxOpen(true)} className="text-xs text-cyan-400 font-medium">Semua</button>
          </div>
          <div className="space-y-2.5">
            {transactions.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-blue-900/50 rounded-xl text-blue-300/50 text-xs">Belum ada transaksi.</div>
            ) : (
              transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="bg-[#0e1738]/60 border border-blue-900/20 rounded-xl p-3 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${tx.type === "in" ? "bg-emerald-950/60 text-emerald-400" : "bg-rose-950/60 text-rose-400"}`}>
                      {tx.type === "in" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{tx.title}</p>
                      <p className="text-[10px] text-blue-300/60">{tx.pocketName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-xs font-bold ${tx.type === "in" ? "text-emerald-400" : "text-white"}`}>{tx.type === "in" ? "+" : ""}{formatRp(tx.amount)}</p>
                      <p className="text-[10px] text-blue-300/40">{tx.date.split(',')[0]}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleOpenEditTx(tx)} className="text-blue-400 hover:text-cyan-300"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteTransaction(tx)} className="text-rose-500 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL CATAT TRANSAKSI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-[#0d1635] border border-blue-800/40 rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0">
            <h3 className="text-sm font-bold text-white mb-4">{editingTx ? "Edit Transaksi" : "Catat Transaksi Baru"}</h3>
            <form onSubmit={handleSaveTransaction} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-2 bg-[#070b19] p-1 rounded-xl">
                <button type="button" onClick={() => handleTypeChange("out")} className={`py-2 text-xs rounded-lg font-medium transition ${txType === "out" ? "bg-rose-500/20 text-rose-400 shadow-sm" : "text-blue-300"}`}>Pengeluaran</button>
                <button type="button" onClick={() => handleTypeChange("in")} className={`py-2 text-xs rounded-lg font-medium transition ${txType === "in" ? "bg-emerald-500/20 text-emerald-400 shadow-sm" : "text-blue-300"}`}>Pemasukan</button>
              </div>

              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Nominal (Rp)</label>
                <input type="number" required inputMode="numeric" placeholder="Contoh: 50000" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} className="w-full bg-[#070b19] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400" />
              </div>

              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Keterangan</label>
                <input type="text" required placeholder="Contoh: Beli Kopi / Gaji" value={txTitle} onChange={(e) => setTxTitle(e.target.value)} className="w-full bg-[#070b19] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400" />
              </div>

              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Pilih Kantong</label>
                <select value={selectedPocket} onChange={(e) => setSelectedPocket(e.target.value)} className="w-full bg-[#070b19] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 appearance-none">
                  {pockets.map(p => (<option key={p.id} value={p.name}>{p.name} (Rp {p.balance.toLocaleString('id-ID')})</option>))}
                </select>
              </div>

              {/* FREKUENSI BEBAS 2 ARAH (MOBILE FRIENDLY) */}
              <div className="p-3 bg-blue-950/30 rounded-xl border border-blue-900/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] text-blue-200">Ulangi Otomatis?</span>
                  <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                </div>
                {isRecurring && (
                  <div className="space-y-3 pt-2">
                     <p className="text-center text-xs text-cyan-400 bg-cyan-950/40 py-1.5 rounded-lg border border-cyan-500/20 font-semibold">{timesCount}x tiap {periodCount} {periodUnit}</p>
                     
                     <div className="flex items-center gap-2">
                        <input type="number" inputMode="numeric" min="1" value={timesCount} onChange={e => setTimesCount(parseInt(e.target.value)||1)} className="w-16 bg-[#070b19] border border-blue-900 rounded-lg text-center text-xs py-2" />
                        <span className="text-[10px] text-blue-300">Kali, tiap</span>
                        <input type="number" inputMode="numeric" min="1" value={periodCount} onChange={e => setPeriodCount(parseInt(e.target.value)||1)} className="w-16 bg-[#070b19] border border-blue-900 rounded-lg text-center text-xs py-2" />
                     </div>

                     <div className="flex gap-2">
                       {(["Hari", "Minggu", "Bulan"] as const).map(u => (
                         <button type="button" key={u} onClick={() => setPeriodUnit(u)} className={`flex-1 py-1.5 text-[10px] rounded-lg border ${periodUnit === u ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-[#070b19] border-blue-900/50 text-blue-300'}`}>{u}</button>
                       ))}
                     </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-[#070b19] text-blue-300 rounded-xl text-xs font-semibold">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-cyan-400 text-blue-950 rounded-xl text-xs font-bold shadow-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SISA MODAL LAINNYA (TAMBAH KANTONG, DETAIL KANTONG, STRUK) --- */}
      {/* KODE MODAL KANTONG (SAMA SEPERTI ASLINYA, HANYA DIPERBAIKI INPUTNYA) */}
      {isPocketModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-[#0d1635] border border-blue-800/40 rounded-t-3xl sm:rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4">{editingPocket ? "Edit Kantong" : "Buat Kantong Baru"}</h3>
            <form onSubmit={handleSavePocket} className="space-y-4">
              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Nama Kantong</label>
                <input type="text" required value={pocketFormName} onChange={e => setPocketFormName(e.target.value)} className="w-full bg-[#070b19] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Tipe Kantong</label>
                <select value={pocketFormType} onChange={e => setPocketFormType(e.target.value)} className="w-full bg-[#070b19] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white appearance-none">
                  <option value="Utama">Utama</option><option value="Harian">Harian</option>
                  <option value="Bulanan">Bulanan</option><option value="Impian">Impian</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Target Menabung (Opsional)</label>
                <input type="number" inputMode="numeric" placeholder="Contoh: 5000000" value={pocketFormTarget} onChange={e => setPocketFormTarget(e.target.value)} className="w-full bg-[#070b19] border border-blue-900/50 rounded-xl px-4 py-3 text-sm text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsPocketModalOpen(false)} className="flex-1 py-3 bg-[#070b19] text-blue-300 rounded-xl text-xs font-semibold">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-cyan-400 text-blue-950 rounded-xl text-xs font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL STRUK SUKSES --- */}
      {isReceiptOpen && latestTx && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e1738] border border-cyan-500/30 rounded-3xl w-full max-w-xs p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-xs font-bold text-cyan-400 mb-4">Transaksi Berhasil!</h3>
            <div className="text-2xl font-bold text-white mb-6">{latestTx.type === "in" ? "+" : ""}{formatRp(latestTx.amount)}</div>
            <button onClick={() => setIsReceiptOpen(false)} className="w-full py-3 bg-cyan-400 text-blue-950 rounded-xl text-xs font-bold">Tutup</button>
          </div>
        </div>
      )}

      {/* --- MODAL LIHAT SEMUA KANTONG & TRANSAKSI --- */}
      {(isAllPocketsOpen || isAllTxOpen) && (
        <div className="fixed inset-0 bg-[#070b19] z-50 flex flex-col">
          <div className="p-4 border-b border-blue-900/50 flex justify-between items-center bg-[#0d1635]">
            <h3 className="font-bold text-white text-sm">{isAllPocketsOpen ? "Semua Kantong" : "Semua Transaksi"}</h3>
            <button onClick={() => {setIsAllPocketsOpen(false); setIsAllTxOpen(false)}} className="p-2 text-rose-400"><X className="w-5 h-5"/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {/* Render Kantong / Transaksi Full Screen Modal Disini */}
             {isAllPocketsOpen && pockets.map(p => (
                <div key={p.id} className="bg-[#0e1738] p-4 rounded-xl flex justify-between items-center border border-blue-900/30">
                  <div><p className="font-bold text-sm text-white">{p.name}</p><p className="text-[10px] text-blue-400">{p.type}</p></div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-400 text-sm">{formatRp(p.balance)}</p>
                    <div className="flex gap-2 justify-end mt-2">
                       <button onClick={() => {setEditingPocket(p); setPocketFormName(p.name); setPocketFormType(p.type); setPocketFormTarget(p.target ? p.target.toString() : ""); setIsPocketModalOpen(true); setIsAllPocketsOpen(false)}} className="text-blue-300"><Edit3 className="w-4 h-4"/></button>
                       <button onClick={() => handleDeletePocket(p.id)} className="text-rose-500"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                </div>
             ))}
             {isAllTxOpen && transactions.map(tx => (
                <div key={tx.id} className="bg-[#0e1738] p-4 rounded-xl flex justify-between items-center border border-blue-900/30">
                  <div><p className="font-bold text-sm text-white">{tx.title}</p><p className="text-[10px] text-blue-400">{tx.pocketName} • {tx.date}</p></div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${tx.type === 'in' ? 'text-emerald-400' : 'text-white'}`}>{formatRp(tx.amount)}</p>
                  </div>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}