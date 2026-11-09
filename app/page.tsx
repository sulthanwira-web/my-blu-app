"use client";

import React, { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function BluDashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("beranda");
  
  // State Data
  const [pockets, setPockets] = useState([
    { id: 1, name: "Kantong Utama", balance: 5450000, type: "Utama", target: null, progress: 0, icon: Wallet },
    { id: 2, name: "Jajan & Makan Harian", balance: 850000, type: "Harian", target: 1500000, progress: 57, icon: Coffee },
    { id: 3, name: "Tagihan & Langganan", balance: 420000, type: "Bulanan", target: 600000, progress: 70, icon: CreditCard },
    { id: 4, name: "Dana Darurat 2026", balance: 3200000, type: "Impian", target: 10000000, progress: 32, icon: PiggyBank },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 1, title: "Kopi Kenangan Mantan", category: "Makanan", tag: "Harian", amount: -28000, type: "out", date: "Hari ini" },
    { id: 2, title: "Gaji Bulanan PT Digital", category: "Pemasukan", tag: "Bulanan", amount: 8500000, type: "in", date: "Kemarin" },
    { id: 3, title: "Voucher Streaming Netflix", category: "Hiburan", tag: "Bulanan", amount: -186000, type: "out", date: "08 Nov" },
    { id: 4, title: "Gojek Ride Ke Kantor", category: "Transportasi", tag: "Harian", amount: -35000, type: "out", date: "07 Nov" },
  ]);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"transaction" | "transfer">("transaction");
  
  // Form State
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"in" | "out">("out");
  const [selectedPocket, setSelectedPocket] = useState("Kantong Utama");

  // Total Saldo
  const totalBalance = pockets.reduce((acc, curr) => acc + curr.balance, 0);

  // 1. Fungsi Tambah Transaksi
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(txAmount);
    if (!txTitle || isNaN(numAmount) || numAmount <= 0) return;

    const finalAmount = txType === "out" ? -numAmount : numAmount;

    const newTx = {
      id: Date.now(),
      title: txTitle,
      category: txType === "out" ? "Pengeluaran" : "Pemasukan",
      tag: "Umum",
      amount: finalAmount,
      type: txType,
      date: "Baru saja"
    };

    setTransactions([newTx, ...transactions]);

    // Update Saldo Kantong
    setPockets(pockets.map(p => {
      if (p.name === selectedPocket) {
        return { ...p, balance: p.balance + finalAmount };
      }
      return p;
    }));

    setTxTitle("");
    setTxAmount("");
    setIsModalOpen(false);
  };

  // 2. Fungsi Export Laporan CSV/Excel
  const handleExportCSV = () => {
    const headers = ["ID", "Tanggal", "Keterangan", "Kategori", "Jenis", "Nominal (Rp)"];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      `"${t.title}"`,
      t.category,
      t.type === "in" ? "Pemasukan" : "Pengeluaran",
      t.amount
    ]);

    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_blu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatRp = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-white flex justify-center items-center p-0 sm:p-4 font-sans">
      <div className="w-full max-w-md bg-[#0a1128] sm:rounded-3xl border border-blue-900/30 overflow-hidden shadow-2xl flex flex-col min-h-screen sm:min-h-[840px]">
        
        {/* Top Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/5 bg-[#0d1635]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[2px]">
              <div className="w-full h-full bg-[#0a1128] rounded-[10px] flex items-center justify-center font-bold text-cyan-400 text-base">
                b
              </div>
            </div>
            <div>
              <p className="text-xs text-blue-200/60">Selamat datang,</p>
              <h1 className="text-sm font-semibold text-white">Sulthan</h1>
            </div>
          </div>
          
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-lg hover:bg-cyan-900/60 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor</span>
          </button>
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
              <button 
                onClick={() => { setModalType("transaction"); setIsModalOpen(true); }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-semibold text-white transition active:scale-95"
              >
                <Plus className="w-4 h-4 text-cyan-300" />
                <span>Catat Transaksi</span>
              </button>

              <button 
                onClick={() => { setModalType("transfer"); setIsModalOpen(true); }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-cyan-400 hover:bg-cyan-300 text-blue-950 rounded-xl text-xs font-bold transition active:scale-95 shadow-md shadow-cyan-400/20"
              >
                <Repeat className="w-4 h-4" />
                <span>Pindah Dana</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section Kantong */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-200/60 flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kantong Aktif ({pockets.length})</span>
            </h2>
            <button className="text-xs text-cyan-400 hover:underline flex items-center gap-0.5">
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {pockets.map((pocket) => {
              const IconComp = pocket.icon;
              return (
                <div key={pocket.id} className="bg-[#0e1738] border border-blue-900/30 rounded-2xl p-3.5 flex flex-col justify-between hover:border-cyan-500/40 transition">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-blue-950/80 text-cyan-400 border border-blue-800/40">
                        <IconComp className="w-4 h-4" />
                      </div>
                      {pocket.type !== "Utama" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-200 border border-blue-700/30">
                          {pocket.type}
                        </span>
                      )}
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

        {/* Mutasi Terakhir */}
        <div className="px-5 flex-1 pb-20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-200/60 flex items-center gap-2">
              <Repeat className="w-3.5 h-3.5 text-cyan-400" />
              <span>Transaksi Terakhir</span>
            </h2>
            <button className="text-xs text-cyan-400 hover:underline">Semua</button>
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
                    <p className="text-[10px] text-blue-300/60">{tx.category} • <span className="text-cyan-400">{tx.tag}</span></p>
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

      {/* Modal Catat Transaksi / Pindah Dana */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d1635] border border-blue-800/40 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4">
              {modalType === "transaction" ? "Catat Transaksi Baru" : "Pindah Dana Antar Kantong"}
            </h3>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Judul / Keterangan</label>
                <input 
                  type="text" 
                  required
                  placeholder="Misal: Jajan Kopi" 
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

              {modalType === "transaction" && (
                <div>
                  <label className="text-[11px] text-blue-200/70 block mb-1">Jenis Transaksi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button" 
                      onClick={() => setTxType("out")} 
                      className={`py-1.5 text-xs rounded-lg border font-medium ${txType === "out" ? "bg-rose-950 border-rose-500 text-rose-300" : "bg-[#070b19] border-blue-900/40 text-blue-300"}`}
                    >
                      Pengeluaran
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setTxType("in")} 
                      className={`py-1.5 text-xs rounded-lg border font-medium ${txType === "in" ? "bg-emerald-950 border-emerald-500 text-emerald-300" : "bg-[#070b19] border-blue-900/40 text-blue-300"}`}
                    >
                      Pemasukan
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] text-blue-200/70 block mb-1">Pilih Kantong</label>
                <select 
                  value={selectedPocket}
                  onChange={(e) => setSelectedPocket(e.target.value)}
                  className="w-full bg-[#070b19] border border-blue-900/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {pockets.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-blue-950 hover:bg-blue-900 text-blue-200 text-xs rounded-xl border border-blue-800/40"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-cyan-400 hover:bg-cyan-300 text-blue-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-400/20"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}