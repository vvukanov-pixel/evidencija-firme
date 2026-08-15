"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, Car, ShieldAlert, AlertTriangle, 
  Trash2, Plus, Volume2, ShieldCheck, Bell, Mail, UserPlus
} from "lucide-react";

// --- Početni podaci ---
const INITIAL_WORKERS = [
  { id: "w1", name: "Ivan Horvat", role: "Vozač / Radnik", medicalExpiry: "2026-11-15", permitExpiry: "2026-10-10" },
  { id: "w2", name: "Marko Marić", role: "Voditelj", medicalExpiry: "2027-04-20", permitExpiry: "2026-09-30" },
  { id: "w3", name: "Petar Kovač", role: "Radnik", medicalExpiry: "2026-09-05", permitExpiry: "2027-01-15" }
];

const INITIAL_VEHICLES = [
  { id: "v1", model: "Kombi teretni 1 (Bijeli)", reg: "DU-101-AA", techExpiry: "2026-08-28", insuranceExpiry: "2026-08-28", kaskoExpiry: "2026-08-28" },
  { id: "v2", model: "Kombi teretni 2 (Sivi)", reg: "DU-102-BB", techExpiry: "2026-11-15", insuranceExpiry: "2026-11-15", kaskoExpiry: "2026-11-15" },
  { id: "v3", model: "Citroën (Osobno)", reg: "DU-203-CC", techExpiry: "2026-09-10", insuranceExpiry: "2026-09-10", kaskoExpiry: "2026-09-10" },
  { id: "v4", model: "Peugeot 2008", reg: "DU-304-DD", techExpiry: "2027-02-01", insuranceExpiry: "2027-02-01", kaskoExpiry: "2027-02-01" },
  { id: "v5", model: "Kia kombi putnički", reg: "DU-405-EE", techExpiry: "2026-08-19", insuranceExpiry: "2026-08-19", kaskoExpiry: "2026-08-19" },
  { id: "v6", model: "Yamaha Tricity (Motor)", reg: "DU-506-FF", techExpiry: "2026-10-05", insuranceExpiry: "2026-10-05", kaskoExpiry: "2026-10-05" }
];

const INITIAL_EXTINGUISHERS = [
  { id: "e1", code: "S-6 Ured", location: "Glavni ured", serviceExpiry: "2026-08-22" },
  { id: "e2", code: "S-2 Kombi 1", location: "Kombi teretni 1", serviceExpiry: "2026-08-28" },
  { id: "e3", code: "S-2 Kombi 2", location: "Kombi teretni 2", serviceExpiry: "2026-11-15" },
  { id: "e4", code: "S-2 Kia", location: "Kia putnički", serviceExpiry: "2026-09-01" },
  { id: "e5", code: "CO2 Skladište", location: "Skladište materijala", serviceExpiry: "2027-01-10" }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"radnici" | "vozila" | "aparati">("radnici");
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [extinguishers, setExtinguishers] = useState(INITIAL_EXTINGUISHERS);

  const [pinModal, setPinModal] = useState<{ open: boolean; itemType: string; itemId: string; field?: string }>({
    open: false,
    itemType: "",
    itemId: ""
  });
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const playAlarmSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      console.log("Audio nije dostupan");
    }
  };

  useEffect(() => {
    const savedWorkers = localStorage.getItem("app_workers");
    const savedVehicles = localStorage.getItem("app_vehicles");
    const savedExtinguishers = localStorage.getItem("app_extinguishers");
    if (savedWorkers) setWorkers(JSON.parse(savedWorkers));
    if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
    if (savedExtinguishers) setExtinguishers(JSON.parse(savedExtinguishers));
  }, []);

  useEffect(() => {
    localStorage.setItem("app_workers", JSON.stringify(workers));
    localStorage.setItem("app_vehicles", JSON.stringify(vehicles));
    localStorage.setItem("app_extinguishers", JSON.stringify(extinguishers));
  }, [workers, vehicles, extinguishers]);

  const getDaysLeft = (dateStr: string) => {
    if (!dateStr) return 999;
    const target = new Date(dateStr).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  };

  const urgentAlerts = useMemo(() => {
    const alerts: { title: string; desc: string; days: number; isPermit?: boolean }[] = [];
    
    workers.forEach((w) => {
      const pDays = getDaysLeft(w.permitExpiry);
      if (pDays <= 60) {
        alerts.push({ 
          title: `Radna dozvola: ${w.name}`, 
          desc: `Istječe za ${pDays} dana (${w.permitExpiry})`, 
          days: pDays,
          isPermit: true 
        });
      }
      const mDays = getDaysLeft(w.medicalExpiry);
      if (mDays <= 15) {
        alerts.push({ 
          title: `Liječnički: ${w.name}`, 
          desc: `Istječe za ${mDays} dana (${w.medicalExpiry})`, 
          days: mDays 
        });
      }
    });

    vehicles.forEach((v) => {
      const techDays = getDaysLeft(v.techExpiry);
      if (techDays <= 15) {
        alerts.push({ 
          title: `${v.model} - Tehnički`, 
          desc: `Istječe za ${techDays} dana (${v.techExpiry})`, 
          days: techDays 
        });
      }
    });

    extinguishers.forEach((e) => {
      const srvDays = getDaysLeft(e.serviceExpiry);
      if (srvDays <= 15) {
        alerts.push({ 
          title: `Aparat ${e.code} (${e.location})`, 
          desc: `Servis za ${srvDays} dana (${e.serviceExpiry})`, 
          days: srvDays 
        });
      }
    });

    return alerts.sort((a, b) => a.days - b.days);
  }, [workers, vehicles, extinguishers]);

  const sendEmailAlert = () => {
    const subject = encodeURIComponent("Upozorenje o isteku radnih dozvola i atesta");
    let bodyText = "Poštovani,\n\nOvdje je pregled stavki s kritičnim rokovima:\n\n";
    
    urgentAlerts.forEach((a) => {
      bodyText += `- ${a.title}: ${a.desc}\n`;
    });

    bodyText += "\nEvidencija tvrtke Portal Montaža";
    const mailtoUrl = `mailto:portal.montaza@du.ht.hr?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
  };

  const handleConfirmDelete = () => {
    if (enteredPin !== "2468") {
      setPinError(true);
      return;
    }
    const { itemType, itemId, field } = pinModal;

    if (itemType === "worker") {
      if (field === "medical") {
        setWorkers(workers.map(w => w.id === itemId ? { ...w, medicalExpiry: "" } : w));
      } else if (field === "permit") {
        setWorkers(workers.map(w => w.id === itemId ? { ...w, permitExpiry: "" } : w));
      } else {
        setWorkers(workers.filter((w) => w.id !== itemId));
      }
    }

    if (itemType === "vehicle") {
      if (field === "ao") {
        setVehicles(vehicles.map(v => v.id === itemId ? { ...v, insuranceExpiry: "" } : v));
      } else if (field === "kasko") {
        setVehicles(vehicles.map(v => v.id === itemId ? { ...v, kaskoExpiry: "" } : v));
      } else {
        setVehicles(vehicles.filter((v) => v.id !== itemId));
      }
    }

    if (itemType === "extinguisher") {
      setExtinguishers(extinguishers.filter((e) => e.id !== itemId));
    }

    setPinModal({ open: false, itemType: "", itemId: "" });
    setEnteredPin("");
    setPinError(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Evidencija Tvrtke</h1>
            <p className="text-xs text-slate-400">Radnici, vozila i vatrogasni aparati</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={sendEmailAlert}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition"
            title="Pošalji obavijest na portal.montaza@du.ht.hr"
          >
            <Mail className="h-4 w-4" /> Pošalji na Mail
          </button>
          <button 
            onClick={playAlarmSound}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
          >
            <Volume2 className="h-4 w-4 text-indigo-400" /> Test Alarma
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs font-semibold">
            <Bell className="h-4 w-4 text-rose-400 animate-pulse" />
            <span>Kritični rokovi: {urgentAlerts.length}</span>
          </div>
        </div>
      </header>

      {urgentAlerts.length > 0 && (
        <div className="bg-rose-900/20 border-b border-rose-800/30 px-6 py-3">
          <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold mb-2">
            <AlertTriangle className="h-4 w-4" /> Upozorenja (Dozvole &lt;60 dana | Ostalo &lt;15 dana):
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 text-xs">
            {urgentAlerts.map((a, i) => (
              <div key={i} className="flex-shrink-0 bg-rose-950/80 border border-rose-700/60 rounded-md px-3 py-1.5">
                <span className="font-bold text-rose-200">{a.title}</span> - {a.desc}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        <nav className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: "radnici", label: `Radnici (${workers.length})`, icon: Users },
            { id: "vozila", label: `Vozni Park (${vehicles.length})`, icon: Car },
            { id: "aparati", label: `Vatrogasni Aparati (${extinguishers.length})`, icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
                  active 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* --- KARTICA RADNICI --- */}
        {activeTab === "radnici" && (
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Popis Radnika i Dozvola</h2>
              <button 
                onClick={() => {
                  const name = prompt("Ime i prezime radnika:");
                  if (!name) return;
                  const role = prompt("Radno mjesto / Uloga:", "Radnik") || "Radnik";
                  const medicalExpiry = prompt("Istek liječničkog (GGGG-MM-DD):", "2027-01-01") || "";
                  const permitExpiry = prompt("Istek radne dozvole (GGGG-MM-DD):", "2027-01-01") || "";
                  setWorkers([...workers, { id: Date.now().toString(), name, role, medicalExpiry, permitExpiry }]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition"
              >
                <UserPlus className="h-4 w-4" /> Novi Radnik
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((w) => {
                const permitDays = getDaysLeft(w.permitExpiry);
                const medicalDays = getDaysLeft(w.medicalExpiry);
                const isPermitCritical = permitDays <= 60;

                return (
                  <div key={w.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-base">{w.name}</h3>
                          <span className="text-xs text-indigo-400 font-medium">{w.role}</span>
                        </div>
                        <button
                          onClick={() => setPinModal({ open: true, itemType: "worker", itemId: w.id })}
                          className="p-1.5 hover:bg-rose-950/60 hover:text-rose-400 rounded-lg text-slate-500 transition"
                          title="Obriši radnika uz PIN"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-2 text-xs">
                        {/* Radna dozvola (Alarm 2 mjeseca / 60 dana) */}
                        <div className="flex justify-between items-center py-1.5 px-2 rounded bg-slate-950/50 border border-slate-800">
                          <div>
                            <span className="block text-slate-400 font-semibold">Radna dozvola:</span>
                            <span className={isPermitCritical ? "text-rose-400 font-bold" : "text-slate-200"}>
                              {w.permitExpiry || "Nema unosa"}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                              isPermitCritical ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-slate-800 text-slate-300"
                            }`}>
                              {permitDays < 0 ? "Istekla!" : `${permitDays} d.`}
                            </span>
                            {w.permitExpiry && (
                              <button
                                onClick={() => setPinModal({ open: true, itemType: "worker", itemId: w.id, field: "permit" })}
                                className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                              >
                                Obriši
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Liječnički pregled */}
                        <div className="flex justify-between items-center py-1.5 px-2 rounded bg-slate-950/50 border border-slate-800">
                          <div>
                            <span className="block text-slate-400 font-semibold">Liječnički pregled:</span>
                            <span className={medicalDays <= 15 ? "text-rose-400 font-bold" : "text-slate-200"}>
                              {w.medicalExpiry || "Nema unosa"}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                              medicalDays <= 15 ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-slate-800 text-slate-300"
                            }`}>
                              {medicalDays < 0 ? "Istekao!" : `${medicalDays} d.`}
                            </span>
                            {w.medicalExpiry && (
                              <button
                                onClick={() => setPinModal({ open: true, itemType: "worker", itemId: w.id, field: "medical" })}
                                className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                              >
                                Obriši
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isPermitCritical && (
                      <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-center text-xs font-bold animate-pulse">
                        ⚠️ Radna dozvola istječe unutar 2 mjeseca!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* --- KARTICA VOZILA --- */}
        {activeTab === "vozila" && (
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Vozni Park i Registracije</h2>
              <button 
                onClick={() => {
                  const model = prompt("Marka i model vozila:");
                  if (!model) return;
                  const reg = prompt("Registarska oznaka:", "DU-000-XX") || "DU-000-XX";
                  const techExpiry = prompt("Istek tehničkog (GGGG-MM-DD):", "2027-01-01") || "2027-01-01";
                  setVehicles([...vehicles, { id: Date.now().toString(), model, reg, techExpiry, insuranceExpiry: techExpiry, kaskoExpiry: techExpiry }]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="h-4 w-4" /> Novo Vozilo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => {
                const days = getDaysLeft(v.techExpiry);
                return (
                  <div key={v.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-base">{v.model}</h3>
                          <span className="inline-block mt-1 text-xs bg-slate-800 px-2 py-0.5 rounded font-mono text-indigo-300">{v.reg}</span>
                        </div>
                        <button
                          onClick={() => setPinModal({ open: true, itemType: "vehicle", itemId: v.id })}
                          className="p-1.5 hover:bg-rose-950/60 hover:text-rose-400 rounded-lg text-slate-500 transition"
                          title="Obriši vozilo uz PIN"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Tehnički pregled:</span>
                          <span className={days <= 15 ? "text-rose-400 font-bold" : "text-slate-200"}>{v.techExpiry || "Nije uneseno"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Osiguranje (AO):</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-200">{v.insuranceExpiry || "Nije uneseno"}</span>
                            {v.insuranceExpiry && (
                              <button
                                onClick={() => setPinModal({ open: true, itemType: "vehicle", itemId: v.id, field: "ao" })}
                                className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                              >
                                Obriši AO
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-400">Kasko:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-200">{v.kaskoExpiry || "Nije uneseno"}</span>
                            {v.kaskoExpiry && (
                              <button
                                onClick={() => setPinModal({ open: true, itemType: "vehicle", itemId: v.id, field: "kasko" })}
                                className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                              >
                                Obriši Kasko
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-2 p-2 rounded-lg text-center text-xs font-bold ${
                      days <= 15 ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-emerald-950/50 text-emerald-400 border border-emerald-800/50"
                    }`}>
                      {days < 0 ? "Registracija istekla!" : `Preostalo ${days} dana`}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* --- KARTICA VATROGASNI APARATI --- */}
        {activeTab === "aparati" && (
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Vatrogasni Aparati i Periodički Atesti</h2>
              <button 
                onClick={() => {
                  const code = prompt("Oznaka aparata (npr. S-6):");
                  if (!code) return;
                  const location = prompt("Lokacija (npr. Kombi 1, Radiona):", "Radiona") || "Radiona";
                  const serviceExpiry = prompt("Sljedeći servis (GGGG-MM-DD):", "2027-01-01") || "2027-01-01";
                  setExtinguishers([...extinguishers, { id: Date.now().toString(), code, location, serviceExpiry }]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="h-4 w-4" /> Novi Aparat
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {extinguishers.map((e) => {
                const days = getDaysLeft(e.serviceExpiry);
                return (
                  <div key={e.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-indigo-400 font-mono font-semibold">{e.code}</span>
                          <h3 className="font-bold text-white">{e.location}</h3>
                        </div>
                        <button
                          onClick={() => setPinModal({ open: true, itemType: "extinguisher", itemId: e.id })}
                          className="p-1.5 hover:bg-rose-950/60 hover:text-rose-400 rounded-lg text-slate-500 transition"
                          title="Obriši aparat uz PIN"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 text-xs text-slate-400">
                        Datum servisa: <span className="text-slate-200 font-medium">{e.serviceExpiry}</span>
                      </div>
                    </div>

                    <div className={`mt-3 py-1.5 px-2 rounded-md text-center text-xs font-bold ${
                      days <= 15 ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-slate-800 text-slate-300"
                    }`}>
                      {days < 0 ? "Atest istekao!" : `Servis za ${days} dana`}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* PIN Sigurnosni Modal (2468) */}
      {pinModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
              <ShieldAlert className="h-5 w-5" /> Zaštita Brisanja (PIN)
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Za potvrdu akcije unesite PIN kod:
            </p>
            <input
              type="password"
              maxLength={4}
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                setPinError(false);
              }}
              placeholder="Unesite PIN"
              className="w-full text-center tracking-widest text-2xl font-mono py-2 bg-slate-950 border border-slate-700 rounded-xl focus:border-indigo-500 outline-none mb-3 text-white"
            />
            {pinError && <p className="text-xs text-rose-500 mb-3 text-center">Neispravan PIN kod!</p>}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPinModal({ open: false, itemType: "", itemId: "" });
                  setEnteredPin("");
                  setPinError(false);
                }}
                className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300"
              >
                Odustani
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition"
              >
                Potvrdi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}