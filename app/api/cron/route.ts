import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const WORKERS = [
  { name: "ZLATKO RADIŠ", medicalExpiry: "2027-09-01", permitExpiry: "2027-01-01" },
  { name: "SINIŠA PRAVICA", medicalExpiry: "2027-07-03", permitExpiry: "2027-09-03" },
  { name: "SLAVEN PUHALO", medicalExpiry: "2027-01-09", permitExpiry: "2027-09-15" },
  { name: "NIKOLA MRDIĆ", medicalExpiry: "2027-04-02", permitExpiry: "2027-09-15" },
  { name: "LJUBIŠA DOŠLO", medicalExpiry: "2026-11-03", permitExpiry: "2027-09-15" },
  { name: "RANKO JANJIĆ", medicalExpiry: "2027-02-05", permitExpiry: "2027-09-15" },
  { name: "BRANISLAV BEGENUŠIĆ", medicalExpiry: "2027-01-09", permitExpiry: "2027-10-15" },
  { name: "MIODRAG ĆERANIĆ", medicalExpiry: "2027-03-04", permitExpiry: "2027-09-15" }
];

const VEHICLES = [
  { model: "Peugeot Boxer 2.2 BlueHDi", reg: "DU-337-JJ", techExpiry: "2027-06-30" },
  { model: "Citroën Jumper 2.0 D", reg: "DU-865-HS", techExpiry: "2027-05-17" },
  { model: "Citroën C3 1.6 Shine BlueHDi", reg: "DU-502-HO", techExpiry: "2027-02-09" },
  { model: "Mercedes GLE 350 de 4MATIC", reg: "VŽ-255-TB", techExpiry: "2027-03-31" },
  { model: "Yamaha Tricity 300", reg: "DU-698-KG", techExpiry: "2027-05-19" },
  { model: "Peugeot e-2008", reg: "DU-315-JJ", techExpiry: "2027-07-01" },
  { model: "Toyota Proace Verso 2.0", reg: "DU-490-KI", techExpiry: "2027-07-27" }
];

const EXTINGUISHERS = [
  { code: "S-6 Ured", location: "Glavni ured", serviceExpiry: "2026-08-22" },
  { code: "S-2 Boxer", location: "Peugeot Boxer", serviceExpiry: "2026-08-28" },
  { code: "S-2 Jumper", location: "Citroën Jumper", serviceExpiry: "2026-11-15" },
  { code: "S-2 Toyota", location: "Toyota Proace", serviceExpiry: "2026-09-01" },
  { code: "CO2 Skladište", location: "Skladište", serviceExpiry: "2027-01-10" }
];

function getDaysLeft(dateStr: string) {
  if (!dateStr) return 999;
  const target = new Date(dateStr).getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

export async function GET() {
  const alerts: string[] = [];

  // Radne dozvole (<= 60 dana) i Liječnički (<= 15 dana)
  WORKERS.forEach((w) => {
    const permitDays = getDaysLeft(w.permitExpiry);
    if (permitDays <= 60) {
      alerts.push(`⚠️ RADNA DOZVOLA: ${w.name} - istječe za ${permitDays} dana (${w.permitExpiry})`);
    }
    const medDays = getDaysLeft(w.medicalExpiry);
    if (medDays <= 15) {
      alerts.push(`🩺 LIJEČNIČKI PREGLED: ${w.name} - istječe za ${medDays} dana (${w.medicalExpiry})`);
    }
  });

  // Vozila (<= 15 dana)
  VEHICLES.forEach((v) => {
    const techDays = getDaysLeft(v.techExpiry);
    if (techDays <= 15) {
      alerts.push(`🚗 VOZILO: ${v.model} (${v.reg}) - tehnički pregled istječe za ${techDays} dana (${v.techExpiry})`);
    }
  });

  // Vatrogasni aparati (<= 15 dana)
  EXTINGUISHERS.forEach((e) => {
    const srvDays = getDaysLeft(e.serviceExpiry);
    if (srvDays <= 15) {
      alerts.push(`🧯 APARAT: ${e.code} (${e.location}) - atest istječe za ${srvDays} dana (${e.serviceExpiry})`);
    }
  });

  // Ako ima isteka, automatski šalje mail
  if (alerts.length > 0) {
    try {
      await resend.emails.send({
        from: 'Evidencija Firme <onboarding@resend.dev>',
        to: 'portal.montaza@du.ht.hr',
        subject: `⚠️ UPOZORENJE: Istek rokova (${alerts.length} stavki)`,
        text: `Poštovani,\n\nOvo je automatska obavijest o isteku rokova:\n\n` + alerts.join("\n\n") + `\n\nOtvorite aplikaciju za detalje: https://dokazi-firme.vercel.app\n\nPortal Montaža d.o.o.`
      });
      return NextResponse.json({ success: true, sent: true, count: alerts.length });
    } catch (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, sent: false, message: "Nema kritičnih rokova danas." });
}