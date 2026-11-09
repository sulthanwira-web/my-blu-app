"use client";

import React, { useState } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Repeat, 
  Coffee, 
  CreditCard, 
  PiggyBank, 
  Download,
  Eye,
  EyeOff,
  ChevronRight,
  FileText,
  Printer,
  CheckCircle2,
  Share2,
  Clock,
  X,
  Filter
} from "lucide-react";
import { BluLogo } from "@/components/BluLogo";

export default function BluDashboardPro() {
  const [showBalance, setShowBalance] = useState(true);
  
  const [pockets, setPockets] = useState([
    { id: 1, name: "Kantong Utama", balance: 5450000, type: "Utama", target: null, progress: 0, icon: Wallet },
    { id: 2, name: "Jajan & Makan Harian", balance: 850000, type: "Harian", target: 1500000, progress: 57, icon: Coffee },
    { id: 3, name: "Tagihan & Langganan", balance: 420000, type: "Bulanan", target: 600000, progress: 70, icon: CreditCard },
    { id: 4, name: "Dana Darurat 2026", balance: 3200000, type: "Impian", target: 10000000, progress: 32, icon: PiggyBank },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 1718001, pocketName: "Jajan & Makan Harian", title: "Kopi Kenangan Mantan", category: "Makanan", tag: "Harian", amount: -28000, type: "out", date: "10 Nov 2026, 08:30", ref: "BLU-9928103" },
    { id: 2718002, pocketName: "Kantong Utama", title: "Gaji Bulanan PT Digital", category: "Pemasukan", tag: "Bulanan", amount: 8500000, type: "in", date: "09 Nov 2026, 09:00", ref: "BLU-8819203" },
  ]);

  // Modal Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [latestTx, setLatestTx] = useState<any>(null);

  // Filter & Detail Pocket Modals
  const [selectedPocketDetail, setSelectedPocketDetail] = useState<any>(null);
  const [isAllPocketsOpen, setIsAllPocketsOpen] = useState(false);
  const [isAllTxOpen, setIsAllTxOpen] = useState(false);

  // Form State
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"in" | "out">("out");
  const [selectedPocket, setSelectedPocket] = useState("Jajan & Makan Harian");
  
  // Custom Interval Slider State
  const [isRecurring, setIsRecurring] = useState(false);
  const [intervalValue, setIntervalValue] = useState<number>(3); // Nilai slider (misal 3)
  const [intervalUnit, setIntervalUnit] = useState<"Hari" | "Minggu" | "Bulan">("Bulan"); // Unit waktu

  const totalBalance = pockets.reduce((acc, curr) => acc + curr.balance, 0);

  const handleTypeChange = (type: "in" | "out") => {
    setTxType(type);
    if (type === "in") {
      setSelectedPocket("Kantong Utama");
    } else {
      setSelectedPocket("Jajan & Makan Harian");
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(txAmount);
    if (!txTitle || isNaN(numAmount) || numAmount <= 0) return;

    const finalAmount = txType === "out" ? -numAmount : numAmount;
    const recurringText = isRecurring ? `1x tiap ${intervalValue} ${intervalUnit}` : "Sekali";

    const newTxData = {
      id: Date.now(),
      pocketName: selectedPocket,
      title: txTitle,
      category: txType === "out" ? "Pengeluaran" : "Pemasukan",
      tag: recurringText,
      amount: finalAmount,
      type: txType,
      date: new Date().toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      ref: `BLU-${Math.floor(100000000 + Math.random() * 900000000)}`
    };

    setTransactions([newTxData, ...transactions]);
    setPockets(pockets.map(p => p.name === selectedPocket ? { ...p, balance: p.balance + finalAmount } : p));

    setLatestTx(newTxData);
    setIsModalOpen(false);
    setIsReceiptOpen(true);

    setTxTitle("");
    setTxAmount("");
    setIsRecurring(false);
  };

  const handleExportCSV = () => {
    const headers = ["ID Ref", "Kantong", "Tanggal", "Keterangan", "Kategori", "Interval/Tag", "Nominal (Rp)"];
    const rows = transactions.map(t => [t.ref, `"${t.pocketName}"`, t.date, `"${t.title}"`, t.category, `"${t.tag}"`, t.amount]);
    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const formatRp = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-white flex justify-center items-center p-0 sm:p-4 font-sans">
      <div className="w-full max-w-md bg-[#0a1128] sm:rounded-3xl border border-blue-900/30 overflow-hidden shadow-2xl flex flex-col min-h-screen sm:min-h-[840px]">
        
        {/* Top Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/5 bg-[#0d1635]">
          <BluLogo />
          
          <div className="flex items-center gap-1.5">
            <button onClick={handleExportCSV} title="Download CSV" className="p-2 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-lg hover:bg-cyan-900/60 transition">
              <Download className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleExportPDF} title="Cetak / Simpan PDF" className="p-2 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-lg hover:bg-cyan-900/60 transition">
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hero Card Total Saldo */}
        <div className="p-5">
          <div className="relative rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-5 shadow-lg shadow-blue-600/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between text-blue-100/80 text-xs mb-1">
              <span>Total Saldo Kamu</span>
              <button onClick={() => setShowBalance(!showBalance)} className="text-blue-200 hover:text-white transition">
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-2xl font-bold tracking-tight text-white mb-5">
              {showBalance ? formatRp(totalBalance) : "••••••••••••"}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-semibold text-white transition active:scale-95">
                <Plus className="w-4 h-4 text-cyan-300" />
                <span>Catat Transaksi</span>
              </button>
              <button onClick={handleExportPDF} className="flex items-center justify-center gap-2 py-2.5 px-3 bg-cyan-400 hover:bg-cyan-300 text-blue-950 rounded-xl text-xs font-bold transition active:scale-95 shadow-md">
                <Printer className="w-4 h-4" />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section Kantong (Setiap Kantong Bisa Diklik!) */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-200/60 flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kantong Aktif ({pockets.length})</span>
            </h2>
            <button 
              onClick={() => setIsAllPocketsOpen(true)}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
            >
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {pockets.map((pocket) => {
              const IconComp = pocket.icon;
              return (
                <div 
                  key={pocket.id} 
                  onClick={() => setSelectedPocketDetail(pocket)}
                  className="bg-[#0e1738] border border-blue-900/30 rounded-2xl p-3.5 flex flex-col justify-between hover:border-cyan-400/80 cursor-pointer transition active:scale-95 shadow-sm"
                  title="Klik untuk lihat detail transaksi kantong ini"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-blue-950/80 text-cyan-400 border border-blue-800/40">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-200 border border-blue-700/30">
                        {pocket.type}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200/70 font-medium line-clamp-1">{pocket.name}</p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {showBalance ? formatRp(pocket.balance) : "••••••"}
                    </p>
                  </div>

                  {pocket.target && (
                    <div className="mt-3 pt-2 border-t border-white/5">
                      <div className="flex justify-between text-[10px] text-blue-300/60 mb-1">
                        <span>Target</span>
                        <span className="font-semibold text-cyan-400">{pocket.progress}%</span>
                      </div>
                      <div className="w-full bg-blue-950 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full" style={{ width: `${pocket.progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Transaksi Terakhir (Tombol "Semua" Berfungsi!) */}
        <div className="px-5 flex-1 pb-20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-200/60 flex items-center gap-2">
              <Repeat className="w-3.5 h-3.5 text-cyan-400" />
              <span>Transaksi Terakhir</span>
            </h2>
            <button 
              onClick={() => setIsAllTxOpen(true)}
              className="text-xs text-cyan-400 hover:underline font-medium cursor-pointer"
            >
              Semua
            </button>
          </div>

          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-[#0e1738]/60 border border-blue-900/20 rounded-xl p-3 flex items-center justify-between hover:bg-[#0e1738] transition">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${tx.type === "in" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30" : "bg-rose-950/60 text-rose-400 border border-rose-500/30"}`}>
                    {tx.type === "in" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{tx.title}</p>
                    <p className="text-[10px] text-blue-300/60">{tx.pocketName} • <span className="text-cyan-400">{tx.tag}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold ${tx.type === "in" ? "text-emerald-400" : "text-white"}`}>
                    {tx.type === "in" ? "+" : ""}{formatRp(tx.amount)}
                  </p>
                  <p className="text-[10px] text-blue-300/40">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 1. MODAL DETAIL TRANSAKSI KANTONG (Saat Kartu Kantong Diklik) */}
      {selectedPocketDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1635] border border-blue-800/40 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedPocketDetail.name}</h3>
                <p className="text-xs text-cyan-400 font-semibold">Saldo: {formatRp(selectedPocketDetail.balance)}</p>
              </div>
              <button onClick={() => setSelectedPocketDetail(null)} className="text-blue-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-blue-200/60 mb-2 font-medium">Riwayat Transaksi Kantong Ini:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {transactions.filter(t => t.pocketName === selectedPocketDetail.name).length === 0 ? (
                <p className="text-xs text-blue-300/40 text-center py-4">Belum ada transaksi di kantong ini.</p>
              ) : (
                transactions.filter(t => t.pocketName === selectedPocketDetail.name).map(tx => (
                  <div key={tx.id} className="bg-[#070b19] border border-blue-900/30 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white">{tx.title}</p>
                      <p className="text-[10px] text-blue-300/50">{tx.date}</p>
                    </div>
                    <p className={`text-xs font-bold ${tx.type === "in" ? "text-emerald-400" : "text-white"}`}>
                      {tx.type === "in" ? "+" : ""}{formatRp(tx.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL LIHAT SEMUA KANTONG */}
      {isAllPocketsOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1635] border border-blue-800/40 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span>Semua Kantong ({pockets.length})</span>
              </h3>
              <button onClick={() => setIsAllPocketsOpen(false)} className="text-blue-300 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pockets.map(p => (
                <div key={p.id} onClick={() => { setSelectedPocketDetail(p); setIsAllPocketsOpen(false); }} className="bg-[#070b19] border border-blue-900/40 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-cyan-400">
                  <div>
                    <p className="text-xs font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-blue-300/60">{p.type}</p>
                  </div>
                  <p className="text-xs font-bold text-cyan-300">{formatRp(p.balance)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL LIHAT SEMUA TRANSAKSI */}
      {isAllTxOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1635] border border-blue-800/40 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Repeat className="w-4 h-4 text-cyan-400" />
                <span>Semua Mutasi Transaksi</span>
              </h3>
              <button onClick={() => setIsAllTxOpen(false)} className="text-blue-300 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {transactions.map(tx => (
                <div key={tx.id} className="bg-[#070b19] border border-blue-900/40 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{tx.title}</p>
                    <p className="text-[10px] text-blue-300/60">{tx.pocketName} • {tx.date}</p>
                  </div>
                  <p className={`text-xs font-bold ${tx.type === "in" ? "text-emerald-400" : "text-white"}`}>
                    {tx.type === "in" ? "+" : ""}{formatRp(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL CATAT TRANSAKSI DENGAN SLIDER & BEBAS UNIT WAKTU */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1635] border border-blue-800/40 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Catat Transaksi Baru</span>
            </h3>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Judul / Keterangan</label>
                <input 
                  type="text" 
                  required
                  placeholder={txType === "in" ? "Misal: Gaji Bulanan / Bonus" : "Misal: Jajan Kopi / Wifi"} 
                  value={txTitle} 
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full bg-[#070b19] border border-blue-900/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required
                  placeholder="50000" 
                  value={txAmount} 
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full bg-[#070b19] border border-blue-900/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => handleTypeChange("out")} className={`py-1.5 text-xs rounded-lg border font-medium ${txType === "out" ? "bg-rose-950 border-rose-500 text-rose-300" : "bg-[#070b19] border-blue-900/40 text-blue-300"}`}>Pengeluaran</button>
                  <button type="button" onClick={() => handleTypeChange("in")} className={`py-1.5 text-xs rounded-lg border font-medium ${txType === "in" ? "bg-emerald-950 border-emerald-500 text-emerald-300" : "bg-[#070b19] border-blue-900/40 text-blue-300"}`}>Pemasukan</button>
                </div>
              </div>

              {/* SLIDER & FREKUENSI BEBAS WAKTU */}
              <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-200 font-medium">Ulangi Berkala Otomatis?</span>
                  <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-4 h-4 accent-cyan-400 cursor-pointer" />
                </div>

                {isRecurring && (
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-300">Frekuensi:</span>
                      <span className="font-bold text-white bg-blue-900/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        1x tiap {intervalValue} {intervalUnit}
                      </span>
                    </div>

                    {/* Input Slider Angka Bebas (1 s/d 12) */}
                    <div>
                      <input 
                        type="range" 
                        min="1" 
                        max="12" 
                        value={intervalValue} 
                        onChange={(e) => setIntervalValue(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-blue-950 cursor-pointer"
                      />
                    </div>

                    {/* Dropdown Bebas Pilihan Unit (Hari, Minggu, Bulan) */}
                    <div className="flex gap-2">
                      {(["Hari", "Minggu", "Bulan"] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setIntervalUnit(unit)}
                          className={`flex-1 py-1 text-[10px] rounded-lg border font-medium ${intervalUnit === unit ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" : "bg-[#070b19] border-blue-900/40 text-blue-300"}`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Simpan ke Kantong</label>
                <select 
                  value={selectedPocket}
                  onChange={(e) => setSelectedPocket(e.target.value)}
                  className="w-full bg-[#070b19] border border-blue-900/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {pockets.map(p => (<option key={p.id} value={p.name}>{p.name}</option>))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-blue-950 hover:bg-blue-900 text-blue-200 text-xs rounded-xl border border-blue-800/40">Batal</button>
                <button type="submit" className="flex-1 py-2 bg-cyan-400 hover:bg-cyan-300 text-blue-950 font-bold text-xs rounded-xl shadow-md">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL STRUK DIGITAL */}
      {isReceiptOpen && latestTx && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e1738] border border-cyan-500/30 rounded-3xl w-full max-w-xs p-6 shadow-2xl text-center relative overflow-hidden">
            <div className="w-12 h-12 bg-emerald-950 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Transaksi Berhasil</h3>
            <p className="text-[10px] text-blue-300/60 mb-4">bluDigital Secure Receipt</p>

            <div className="text-xl font-extrabold text-white mb-4">
              {latestTx.type === "in" ? "+" : ""}{formatRp(latestTx.amount)}
            </div>

            <div className="bg-[#070b19]/80 border border-blue-900/40 rounded-2xl p-3.5 text-left space-y-2 mb-5 text-xs">
              <div className="flex justify-between text-blue-300/70"><span>Status</span><span className="text-emerald-400 font-semibold">SUCCESS</span></div>
              <div className="flex justify-between text-blue-300/70"><span>Kantong</span><span className="text-cyan-300 font-medium">{latestTx.pocketName}</span></div>
              <div className="flex justify-between text-blue-300/70"><span>No. Ref</span><span className="text-white font-mono">{latestTx.ref}</span></div>
              <div className="flex justify-between text-blue-300/70"><span>Frekuensi</span><span className="text-cyan-300 font-medium">{latestTx.tag}</span></div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => alert("Struk berhasil dibagikan!")} className="flex-1 py-2.5 bg-blue-900/60 hover:bg-blue-800 text-cyan-300 text-xs font-semibold rounded-xl border border-blue-700/40 flex items-center justify-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> Bagikan
              </button>
              <button onClick={() => setIsReceiptOpen(false)} className="flex-1 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-blue-950 text-xs font-bold rounded-xl shadow-md">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}