"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, Car, ShieldAlert, AlertTriangle, 
  Trash2, Plus, Volume2, ShieldCheck, Bell, Mail, UserPlus, Edit3, Lock
} from "lucide-react";

// --- Osnovni podaci ---
const INITIAL_WORKERS = [
  { id: "w1", name: "ZLATKO RADIŠ", role: "MONTER", medicalExpiry: "2027-09-01", permitExpiry: "2027-01-01" },
  { id: "w2", name: "SINIŠA PRAVICA", role: "Monter", medicalExpiry: "2027-07-03", permitExpiry: "2027-09-03" },
  { id: "w3", name: "SLAVEN PUHALO", role: "MONTER", medicalExpiry: "2027-01-09", permitExpiry: "2027-09-15" },
  { id: "w4", name: "NIKOLA MRDIĆ", role: "Monter", medicalExpiry: "2027-04-02", permitExpiry: "2027-09-15" },
  { id: "w5", name: "LJUBIŠA DOŠLO", role: "POMOĆNI MONTER", medicalExpiry: "2026-11-03", permitExpiry: "2027-09-15" },
  { id: "w6", name: "RANKO JANJIĆ", role: "POMOĆNI MONTER", medicalExpiry: "2027-02-05", permitExpiry: "2027-09-15" },
  { id: "w7", name: "BRANISLAV BEGENUŠIĆ", role: "POMOĆNI MONTER", medicalExpiry: "2027-01-09", permitExpiry: "2027-10-15" },
  { id: "w8", name: "MIODRAG ĆERANIĆ", role: "POMOĆNI MONTER", medicalExpiry: "2027-03-04", permitExpiry: "2027-09-15" }
];

const INITIAL_VEHICLES = [
  { id: "v1", model: "Peugeot Boxer 2.2 BlueHDi", reg: "DU-337-JJ", techExpiry: "2027-06-30", insuranceExpiry: "2027-06-30", kaskoExpiry: "2027-06-30" },
  { id: "v2", model: "Citroën Jumper 2.0 D", reg: "DU-865-HS", techExpiry: "2027-05-17", insuranceExpiry: "2027-05-17", kaskoExpiry: "2027-05-17" },
  { id: "v3", model: "Citroën C3 1.6 Shine BlueHDi", reg: "DU-502-HO", techExpiry: "2027-02-09", insuranceExpiry: "2027-02-09", kaskoExpiry: "2027-02-09" },
  { id: "v4", model: "Mercedes GLE 350 de 4MATIC", reg: "VŽ-255-TB", techExpiry: "2027-03-31", insuranceExpiry: "2027-03-31", kaskoExpiry: "2027-03-31" },
  { id: "v5", model: "Yamaha Tricity 300", reg: "DU-698-KG", techExpiry: "2027-05-19", insuranceExpiry: "2027-05-19", kaskoExpiry: "2027-05-19" },
  { id: "v6", model: "Peugeot e-2008", reg: "DU-315-JJ", techExpiry: "2027-07-01", insuranceExpiry: "2027-07-01", kaskoExpiry: "2027-07-01" },
  { id: "v7", model: "Toyota Proace Verso 2.0 Shuttle", reg: "DU-490-KI", techExpiry: "2027-07-27", insuranceExpiry: "2027-07-27", kaskoExpiry: "2027-07-27" }
];

const INITIAL_EXTINGUISHERS = [
  { id: "e1", code: "S-6 Ured", location: "Glavni ured", serviceExpiry: "2027-08-22" },
  { id: "e2", code: "S-2 Boxer", location: "Peugeot Boxer", serviceExpiry: "2027-08-28" },
  { id: "e3", code: "S-2 Jumper", location: "Citroën Jumper", serviceExpiry: "2027-11-15" },
  { id: "e4", code: "S-2 Toyota", location: "Toyota Proace", serviceExpiry: "2027-09-01" },
  { id: "e5", code: "CO2 Skladište", location: "Skladište materijala", serviceExpiry: "2027-01-10" }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"radnici" | "vozila" | "aparati">("aparati");
  const [isLoaded, setIsLoaded] = useState(false);

  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [extinguishers, setExtinguishers] = useState(INITIAL_EXTINGUISHERS);

  // Učitavanje iz memorije samo jednom pri pokretanju
  useEffect(() => {
    try {
      const savedWorkers = localStorage.getItem("pm_app_workers");
      const savedVehicles = localStorage.getItem("pm_app_vehicles");
      const savedExtinguishers = localStorage.getItem("pm_app_extinguishers");

      if (savedWorkers) setWorkers(JSON.parse(savedWorkers));
      if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
      if (savedExtinguishers) setExtinguishers(JSON.parse(savedExtinguishers));
    } catch {
      console.log("Učitavanje memorije");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Trajno spremanje samo NAKON što je memorija prvi put sigurno učitana
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("pm_app_workers", JSON.stringify(workers));
      localStorage.setItem("pm_app_vehicles", JSON.stringify(vehicles));
      localStorage.setItem("pm_app_extinguishers", JSON.stringify(extinguishers));
    }
  }, [workers, vehicles, extinguishers, isLoaded]);

  // Modali
  const [workerModal, setWorkerModal] = useState<{ open: boolean; isEdit: boolean; id?: string; name: string; role: string; medicalExpiry: string; permitExpiry: string }>({
    open: false, isEdit: false, name: "", role: "Monter", medicalExpiry: "", permitExpiry: ""
  });

  const [vehicleModal, setVehicleModal] = useState<{ open: boolean; isEdit: boolean; id?: string; model: string; reg: string; techExpiry: string; insuranceExpiry: string; kaskoExpiry: string }>({
    open: false, isEdit: false, model: "", reg: "", techExpiry: "", insuranceExpiry: "", kaskoExpiry: ""
  });

  const [extinguisherModal, setExtinguisherModal] = useState<{ open: boolean; isEdit: boolean; id?: string; code: string; location: string; serviceExpiry: string }>({
    open: false, isEdit: false, code: "", location: "", serviceExpiry: ""
  });

  // PIN Sigurnost
  const [pinPrompt, setPinPrompt] = useState<{ open: boolean; title: string; action: () => void }>({
    open: false, title: "", action: () => {}
  });
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const requirePin = (title: string, onAuthorized: () => void) => {
    setPinPrompt({ open: true, title, action: onAuthorized });
    setEnteredPin("");
    setPinError(false);
  };

  const handleVerifyPin = () => {
    if (enteredPin === "2468") {
      const currentAction = pinPrompt.action;
      setPinPrompt({ open: false, title: "", action: () => {} });
      setEnteredPin("");
      setPinError(false);
      currentAction();
    } else {
      setPinError(true);
    }
  };

  const playAlarmSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      console.log("Audio nije dostupan");
    }
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const cleanStr = dateStr.trim();
    if (cleanStr.includes(".")) {
      const parts = cleanStr.split(".");
      if (parts.length >= 3) {
        if (parts[0].length === 4) return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
    return new Date(cleanStr);
  };

  const getDaysLeft = (dateStr: string) => {
    if (!dateStr) return 999;
    const parsed = parseDate(dateStr);
    if (!parsed || isNaN(parsed.getTime())) return 999;
    const today = new Date().setHours(0, 0, 0, 0);
    return Math.ceil((parsed.getTime() - today) / (1000 * 60 * 60 * 24));
  };

  const urgentAlerts = useMemo(() => {
    const alerts: { title: string; desc: string; days: number }[] = [];
    
    workers.forEach((w) => {
      const pDays = getDaysLeft(w.permitExpiry);
      if (pDays <= 60 && w.permitExpiry) {
        alerts.push({ title: `Radna dozvola: ${w.name}`, desc: `Istječe za ${pDays} dana (${w.permitExpiry})`, days: pDays });
      }
      const mDays = getDaysLeft(w.medicalExpiry);
      if (mDays <= 15 && w.medicalExpiry) {
        alerts.push({ title: `Liječnički: ${w.name}`, desc: `Istječe za ${mDays} dana (${w.medicalExpiry})`, days: mDays });
      }
    });

    vehicles.forEach((v) => {
      const techDays = getDaysLeft(v.techExpiry);
      if (techDays <= 15 && v.techExpiry) {
        alerts.push({ title: `${v.model} (${v.reg}) - Tehnički`, desc: `Istječe za ${techDays} dana (${v.techExpiry})`, days: techDays });
      }
    });

    extinguishers.forEach((e) => {
      const srvDays = getDaysLeft(e.serviceExpiry);
      if (srvDays <= 15 && e.serviceExpiry) {
        alerts.push({ title: `Aparat ${e.code} (${e.location})`, desc: `Servis za ${srvDays} dana (${e.serviceExpiry})`, days: srvDays });
      }
    });

    return alerts.sort((a, b) => a.days - b.days);
  }, [workers, vehicles, extinguishers]);

  const sendEmailAlert = () => {
    const subject = encodeURIComponent("Upozorenje o isteku radnih dozvola i registracija - Portal Montaža");
    let bodyText = "Poštovani,\n\nOvdje je pregled stavki s kritičnim rokovima:\n\n";
    urgentAlerts.forEach((a) => {
      bodyText += `• ${a.title}: ${a.desc}\n`;
    });
    bodyText += "\nEvidencija Firme: Radnici, Vozila i Vatrogasni Aparati\nPortal Montaža d.o.o.";
    window.location.href = `mailto:portal.montaza@du.ht.hr?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ZAGLAVLJE */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Evidencija Firme</h1>
            <p className="text-xs text-slate-400">Radnici, Vozila i Vatrogasni Aparati</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={sendEmailAlert}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition shadow-md"
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

      {/* KRITIČNI ALARMI */}
      {urgentAlerts.length > 0 && (
        <div className="bg-rose-950/40 border-b border-rose-800/50 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold">
            <AlertTriangle className="h-5 w-5 text-rose-400 animate-bounce" />
            <span>Upozorenje: Postoje kritični rokovi (Dozvole &lt;60 dana | Ostalo &lt;15 dana)</span>
          </div>
          <button
            onClick={sendEmailAlert}
            className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition"
          >
            <Mail className="h-3.5 w-3.5" /> Pošalji na Mail
          </button>
        </div>
      )}

      {/* GLAVNI SADRŽAJ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        <nav className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: "aparati", label: `Vatrogasni Aparati (${extinguishers.length})`, icon: ShieldAlert },
            { id: "radnici", label: `Radnici (${workers.length})`, icon: Users },
            { id: "vozila", label: `Vozni Park (${vehicles.length})`, icon: Car },
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

        {/* --- KARTICA VATROGASNI APARATI --- */}
        {activeTab === "aparati" && (
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Vatrogasni Aparati i Periodički Atesti</h2>
              <button 
                onClick={() => requirePin("Unos novog aparata", () => {
                  setExtinguisherModal({
                    open: true,
                    isEdit: false,
                    code: "",
                    location: "",
                    serviceExpiry: ""
                  });
                })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition shadow-md"
              >
                <Plus className="h-4 w-4" /> Novi Aparat
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {extinguishers.map((e) => {
                const days = getDaysLeft(e.serviceExpiry);
                const isUrgent = days <= 15;

                return (
                  <div key={e.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-indigo-400 font-mono font-semibold">{e.code}</span>
                          <h3 className="font-bold text-white text-base mt-0.5">{e.location}</h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => requirePin(`Uređivanje aparata: ${e.code}`, () => {
                              setExtinguisherModal({
                                open: true,
                                isEdit: true,
                                id: e.id,
                                code: e.code,
                                location: e.location,
                                serviceExpiry: e.serviceExpiry
                              });
                            })}
                            className="p-1.5 hover:bg-indigo-950 hover:text-indigo-400 rounded-lg text-slate-400 transition"
                            title="Uredi aparat (uz PIN)"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => requirePin(`Brisanje aparata: ${e.code}`, () => {
                              setExtinguishers(prev => prev.filter(item => item.id !== e.id));
                            })}
                            className="p-1.5 hover:bg-rose-950/60 hover:text-rose-400 rounded-lg text-slate-500 transition"
                            title="Obriši aparat (uz PIN)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 p-2 rounded bg-slate-950/50 border border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-slate-400">Datum servisa:</span>
                        <span className={`font-semibold ${isUrgent ? "text-rose-400 font-bold" : "text-slate-200"}`}>{e.serviceExpiry || "Nema unosa"}</span>
                      </div>
                    </div>

                    <div className={`mt-3 py-2 px-2 rounded-md text-center text-xs font-bold ${
                      isUrgent ? "bg-rose-950 text-rose-300 border border-rose-800 animate-pulse" : "bg-slate-800 text-slate-300"
                    }`}>
                      {days < 0 ? "Atest istekao!" : `Servis za ${days} dana`}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* --- KARTICA RADNICI --- */}
        {activeTab === "radnici" && (
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Popis Radnika i Dozvola</h2>
              <button 
                onClick={() => requirePin("Unos novog radnika", () => {
                  setWorkerModal({
                    open: true,
                    isEdit: false,
                    name: "",
                    role: "Monter",
                    medicalExpiry: "",
                    permitExpiry: ""
                  });
                })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition shadow-md"
              >
                <UserPlus className="h-4 w-4" /> Novi Radnik
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((w) => {
                const permitDays = getDaysLeft(w.permitExpiry);
                const medicalDays = getDaysLeft(w.medicalExpiry);
                const isPermitCritical = w.permitExpiry && permitDays <= 60;

                return (
                  <div key={w.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3 hover:border-slate-700 transition">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-base">{w.name}</h3>
                          <span className="text-xs text-indigo-400 font-medium">{w.role}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => requirePin(`Uređivanje radnika: ${w.name}`, () => {
                              setWorkerModal({
                                open: true,
                                isEdit: true,
                                id: w.id,
                                name: w.name,
                                role: w.role,
                                medicalExpiry: w.medicalExpiry,
                                permitExpiry: w.permitExpiry
                              });
                            })}
                            className="p-1.5 hover:bg-indigo-950 hover:text-indigo-400 rounded-lg text-slate-400 transition"
                            title="Uredi radnika"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => requirePin(`Brisanje radnika: ${w.name}`, () => {
                              setWorkers(prev => prev.filter(item => item.id !== w.id));
                            })}
                            className="p-1.5 hover:bg-rose-950/60 hover:text-rose-400 rounded-lg text-slate-500 transition"
                            title="Obriši radnika"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center py-2 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                          <div>
                            <span className="block text-slate-400 font-semibold mb-0.5">Radna dozvola:</span>
                            <span className={isPermitCritical ? "text-rose-400 font-bold text-sm" : "text-slate-200"}>
                              {w.permitExpiry || "Nema unosa"}
                            </span>
                          </div>
                          {w.permitExpiry && (
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                              isPermitCritical ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-slate-800 text-slate-300"
                            }`}>
                              {permitDays < 0 ? "Istekla!" : `${permitDays} d.`}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center py-2 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                          <div>
                            <span className="block text-slate-400 font-semibold mb-0.5">Liječnički pregled:</span>
                            <span className={w.medicalExpiry && medicalDays <= 15 ? "text-rose-400 font-bold text-sm" : "text-slate-200"}>
                              {w.medicalExpiry || "Nema unosa"}
                            </span>
                          </div>
                          {w.medicalExpiry && (
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                              medicalDays <= 15 ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-slate-800 text-slate-300"
                            }`}>
                              {medicalDays < 0 ? "Istekao!" : `${medicalDays} d.`}
                            </span>
                          )}
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
              <h2 className="text-lg font-bold">Vozni Park i Police Osiguranja</h2>
              <button 
                onClick={() => requirePin("Unos novog vozila", () => {
                  setVehicleModal({
                    open: true,
                    isEdit: false,
                    model: "",
                    reg: "DU-",
                    techExpiry: "",
                    insuranceExpiry: "",
                    kaskoExpiry: ""
                  });
                })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition shadow-md"
              >
                <Plus className="h-4 w-4" /> Novo Vozilo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => {
                const days = getDaysLeft(v.techExpiry);
                const isUrgent = days <= 15;

                return (
                  <div key={v.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3 hover:border-slate-700 transition">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-base">{v.model}</h3>
                          <span className="inline-block mt-1 text-xs bg-slate-800 px-2 py-0.5 rounded font-mono text-indigo-300 font-bold tracking-wider">{v.reg}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => requirePin(`Uređivanje vozila: ${v.model}`, () => {
                              setVehicleModal({
                                open: true,
                                isEdit: true,
                                id: v.id,
                                model: v.model,
                                reg: v.reg,
                                techExpiry: v.techExpiry,
                                insuranceExpiry: v.insuranceExpiry,
                                kaskoExpiry: v.kaskoExpiry
                              });
                            })}
                            className="p-1.5 hover:bg-indigo-950 hover:text-indigo-400 rounded-lg text-slate-400 transition"
                            title="Uredi vozilo"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => requirePin(`Brisanje vozila: ${v.model}`, () => {
                              setVehicles(prev => prev.filter(item => item.id !== v.id));
                            })}
                            className="p-1.5 hover:bg-rose-950/60 hover:text-rose-400 rounded-lg text-slate-500 transition"
                            title="Obriši vozilo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1.5 px-2 rounded bg-slate-950/50 border border-slate-800/80">
                          <span className="text-slate-400 font-medium">Tehnički pregled:</span>
                          <span className={isUrgent ? "text-rose-400 font-bold" : "text-slate-200 font-semibold"}>{v.techExpiry || "Nije uneseno"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 px-2 rounded bg-slate-950/50 border border-slate-800/80">
                          <span className="text-slate-400 font-medium">Osiguranje (AO):</span>
                          <span className="text-slate-200 font-semibold">{v.insuranceExpiry || "Nije uneseno"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 px-2 rounded bg-slate-950/50 border border-slate-800/80">
                          <span className="text-slate-400 font-medium">Kasko osiguranje:</span>
                          <span className="text-slate-200 font-semibold">{v.kaskoExpiry || "Nije uneseno"}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-2 p-2.5 rounded-lg text-center text-xs font-bold ${
                      isUrgent ? "bg-rose-950 text-rose-300 border border-rose-800 animate-pulse" : "bg-emerald-950/50 text-emerald-400 border border-emerald-800/50"
                    }`}>
                      {days < 0 ? "Registracija istekla!" : `Preostalo ${days} dana`}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* --- PIN MODAL (2468) --- */}
      {pinPrompt.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
              <Lock className="h-5 w-5 text-indigo-400" /> Administrator PIN
            </div>
            <p className="text-xs text-slate-300 mb-1 font-semibold">{pinPrompt.title}</p>
            <p className="text-[11px] text-slate-400 mb-4">Unesite PIN (2468) za nastavak:</p>

            <input
              type="password"
              maxLength={4}
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerifyPin();
              }}
              autoFocus
              placeholder="••••"
              className="w-full text-center tracking-widest text-3xl font-mono py-2 bg-slate-950 border border-slate-700 rounded-xl focus:border-indigo-500 outline-none mb-3 text-white"
            />
            {pinError && <p className="text-xs text-rose-500 mb-3 text-center font-bold">Neispravan PIN!</p>}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPinPrompt({ open: false, title: "", action: () => {} });
                  setEnteredPin("");
                  setPinError(false);
                }}
                className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300"
              >
                Odustani
              </button>
              <button
                onClick={handleVerifyPin}
                className="flex-1 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-md"
              >
                Potvrdi PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ZA APARATE --- */}
      {extinguisherModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-400" />
              {extinguisherModal.isEdit ? "Uredi vatrogasni aparat" : "Novi vatrogasni aparat"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Oznaka aparata:</label>
                <input 
                  type="text" 
                  value={extinguisherModal.code}
                  onChange={(e) => setExtinguisherModal({ ...extinguisherModal, code: e.target.value })}
                  placeholder="npr. S-6 Ured"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Lokacija:</label>
                <input 
                  type="text" 
                  value={extinguisherModal.location}
                  onChange={(e) => setExtinguisherModal({ ...extinguisherModal, location: e.target.value })}
                  placeholder="npr. Glavni ured"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Datum servisa (GGGG-MM-DD):</label>
                <input 
                  type="date" 
                  value={extinguisherModal.serviceExpiry}
                  onChange={(e) => setExtinguisherModal({ ...extinguisherModal, serviceExpiry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setExtinguisherModal({ open: false, isEdit: false, code: "", location: "", serviceExpiry: "" })}
                className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300"
              >
                Odustani
              </button>
              <button
                onClick={() => {
                  if (!extinguisherModal.code.trim()) return alert("Unesite oznaku!");
                  if (extinguisherModal.isEdit && extinguisherModal.id) {
                    setExtinguishers(prev => prev.map(e => e.id === extinguisherModal.id ? { ...e, code: extinguisherModal.code, location: extinguisherModal.location, serviceExpiry: extinguisherModal.serviceExpiry } : e));
                  } else {
                    setExtinguishers(prev => [...prev, { id: Date.now().toString(), code: extinguisherModal.code, location: extinguisherModal.location, serviceExpiry: extinguisherModal.serviceExpiry }]);
                  }
                  setExtinguisherModal({ open: false, isEdit: false, code: "", location: "", serviceExpiry: "" });
                }}
                className="flex-1 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-md"
              >
                Spremi Promjene
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ZA RADNIKE --- */}
      {workerModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-400" />
              {workerModal.isEdit ? "Uredi radnika" : "Novi radnik"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Ime i Prezime:</label>
                <input 
                  type="text" 
                  value={workerModal.name}
                  onChange={(e) => setWorkerModal({ ...workerModal, name: e.target.value })}
                  placeholder="npr. Ivan Horvat"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Radno mjesto:</label>
                <input 
                  type="text" 
                  value={workerModal.role}
                  onChange={(e) => setWorkerModal({ ...workerModal, role: e.target.value })}
                  placeholder="npr. Monter"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Istek Radne Dozvole (GGGG-MM-DD):</label>
                <input 
                  type="date" 
                  value={workerModal.permitExpiry}
                  onChange={(e) => setWorkerModal({ ...workerModal, permitExpiry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Istek Liječničkog Pregleda (GGGG-MM-DD):</label>
                <input 
                  type="date" 
                  value={workerModal.medicalExpiry}
                  onChange={(e) => setWorkerModal({ ...workerModal, medicalExpiry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setWorkerModal({ open: false, isEdit: false, name: "", role: "Monter", medicalExpiry: "", permitExpiry: "" })}
                className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300"
              >
                Odustani
              </button>
              <button
                onClick={() => {
                  if (!workerModal.name.trim()) return alert("Unesite ime!");
                  if (workerModal.isEdit && workerModal.id) {
                    setWorkers(prev => prev.map(w => w.id === workerModal.id ? { ...w, name: workerModal.name, role: workerModal.role, medicalExpiry: workerModal.medicalExpiry, permitExpiry: workerModal.permitExpiry } : w));
                  } else {
                    setWorkers(prev => [...prev, { id: Date.now().toString(), name: workerModal.name, role: workerModal.role, medicalExpiry: workerModal.medicalExpiry, permitExpiry: workerModal.permitExpiry }]);
                  }
                  setWorkerModal({ open: false, isEdit: false, name: "", role: "Monter", medicalExpiry: "", permitExpiry: "" });
                }}
                className="flex-1 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-md"
              >
                Spremi Promjene
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ZA VOZILA --- */}
      {vehicleModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Car className="h-5 w-5 text-indigo-400" />
              {vehicleModal.isEdit ? "Uredi vozilo" : "Novo vozilo"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Marka i model:</label>
                <input 
                  type="text" 
                  value={vehicleModal.model}
                  onChange={(e) => setVehicleModal({ ...vehicleModal, model: e.target.value })}
                  placeholder="npr. Peugeot Boxer"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Registarska oznaka:</label>
                <input 
                  type="text" 
                  value={vehicleModal.reg}
                  onChange={(e) => setVehicleModal({ ...vehicleModal, reg: e.target.value })}
                  placeholder="npr. DU-337-JJ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Istek tehničkog (GGGG-MM-DD):</label>
                <input 
                  type="date" 
                  value={vehicleModal.techExpiry}
                  onChange={(e) => setVehicleModal({ ...vehicleModal, techExpiry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Istek AO (GGGG-MM-DD):</label>
                <input 
                  type="date" 
                  value={vehicleModal.insuranceExpiry}
                  onChange={(e) => setVehicleModal({ ...vehicleModal, insuranceExpiry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Istek kaska (GGGG-MM-DD):</label>
                <input 
                  type="date" 
                  value={vehicleModal.kaskoExpiry}
                  onChange={(e) => setVehicleModal({ ...vehicleModal, kaskoExpiry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setVehicleModal({ open: false, isEdit: false, model: "", reg: "", techExpiry: "", insuranceExpiry: "", kaskoExpiry: "" })}
                className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300"
              >
                Odustani
              </button>
              <button
                onClick={() => {
                  if (!vehicleModal.model.trim()) return alert("Unesite model!");
                  if (vehicleModal.isEdit && vehicleModal.id) {
                    setVehicles(prev => prev.map(v => v.id === vehicleModal.id ? { ...v, model: vehicleModal.model, reg: vehicleModal.reg, techExpiry: vehicleModal.techExpiry, insuranceExpiry: vehicleModal.insuranceExpiry, kaskoExpiry: vehicleModal.kaskoExpiry } : v));
                  } else {
                    setVehicles(prev => [...prev, { id: Date.now().toString(), model: vehicleModal.model, reg: vehicleModal.reg, techExpiry: vehicleModal.techExpiry, insuranceExpiry: vehicleModal.insuranceExpiry, kaskoExpiry: vehicleModal.kaskoExpiry }]);
                  }
                  setVehicleModal({ open: false, isEdit: false, model: "", reg: "", techExpiry: "", insuranceExpiry: "", kaskoExpiry: "" });
                }}
                className="flex-1 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-md"
              >
                Spremi Promjene
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}