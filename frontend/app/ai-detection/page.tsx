"use client";

import { useMemo, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle, ArrowRight, Brain, CheckCircle2, Loader2, RotateCcw,
  ShieldCheck, Stethoscope, Thermometer, Activity, HeartPulse, Wind,
  FileText, Sparkles
} from "lucide-react";

const symptoms = [
  ["fever","Fever",Thermometer],["cough","Cough",Activity],["headache","Headache",Brain],
  ["fatigue","Fatigue",HeartPulse],["bodyache","Body ache",Activity],["breathing","Breathing difficulty",Wind],
  ["nausea","Nausea",Activity],["sorethroat","Sore throat",Stethoscope],
  ["runny_nose","Runny nose",Wind],["sneezing","Sneezing",Activity],["vomiting","Vomiting",Activity],
  ["diarrhea","Diarrhea",Activity],["abdominal_pain","Abdominal pain",HeartPulse],
  ["chest_pain","Chest pain",HeartPulse],["dizziness","Dizziness",Activity],
  ["rash","Rash",Activity],["joint_pain","Joint pain",Activity],
  ["loss_of_smell","Loss of smell",Activity],["loss_of_taste","Loss of taste",Activity],
  ["urinary_burning","Urinary burning",Activity],
] as const;

type Result = {
  primary: { condition: string; probability: number };
  alternatives: { condition: string; probability: number }[];
  symptoms_used: string[];
  model_version: string;
  clinical_validation: boolean;
  disclaimer: string;
};

export default function AIDetectionPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [info, setInfo] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedLabels = useMemo(
    () => symptoms.filter(([id]) => selected.includes(id)).map(([,label]) => label),
    [selected]
  );

  const toggle = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  async function analyze() {
    if (!selected.length) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: selected, additional_info: info }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Prediction failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to reach the AI service.");
    } finally { setLoading(false); }
  }

  function reset() { setSelected([]); setInfo(""); setResult(null); setError(""); }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-background to-accent/[0.08] p-6 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI-assisted health screening
              </span>
              <h1 className="max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
                Understand your symptoms before your consultation.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Select symptoms to get a transparent, preliminary model ranking.
                The result is decision support—not a medical diagnosis.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border bg-background/70 px-4 py-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-success" /> Privacy-first prototype
            </div>
          </div>
        </section>

        {!result ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <Card className="rounded-3xl p-5 md:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">1. Select symptoms</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Choose all that apply.</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {selected.length} selected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                {symptoms.map(([id,label,Icon]) => {
                  const active = selected.includes(id);
                  return (
                    <button key={id} type="button" onClick={() => toggle(id)}
                      className={`group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 ${
                        active ? "border-primary bg-primary/8 ring-2 ring-primary/15" : "bg-card"
                      }`}>
                      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <div className={`mt-3 text-sm font-semibold ${active ? "text-primary" : ""}`}>{label}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-7">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4" /> Additional context
                </label>
                <textarea value={info} onChange={e => setInfo(e.target.value)}
                  placeholder="Optional: duration, recent exposure, relevant history, or other context..."
                  className="min-h-28 w-full resize-y rounded-2xl border bg-background p-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
              </div>

              {error && <div className="mt-5 flex gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0" /> <span>{error}</span>
              </div>}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="outline" onClick={reset} disabled={loading}>Clear</Button>
                <Button size="lg" onClick={analyze} disabled={!selected.length || loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running model…</> :
                    <>Run symptom assessment <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
            </Card>

            <aside className="space-y-5">
              <Card className="rounded-3xl p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">What happens next?</h3>
                <ol className="mt-4 space-y-4 text-sm text-muted-foreground">
                  {["Symptoms are encoded as model features.","The model ranks the closest prototype conditions.","You get alternatives and a safety reminder."].map((x,i) =>
                    <li key={x} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">{i+1}</span>{x}</li>
                  )}
                </ol>
              </Card>
              <Card className="rounded-3xl border-amber-200 bg-amber-50/70 p-5">
                <div className="flex gap-3"><AlertCircle className="h-5 w-5 shrink-0 text-amber-600"/>
                  <div><p className="font-semibold text-amber-900">Safety first</p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">Do not use this tool for emergencies or to decide whether urgent care is needed. Seek professional care for severe or rapidly worsening symptoms.</p></div>
                </div>
              </Card>
            </aside>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <Card className="overflow-hidden rounded-3xl">
                <div className="bg-primary p-6 text-primary-foreground md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <p className="text-sm text-primary-foreground/75">Top model ranking</p>
                      <h2 className="mt-1 text-2xl font-black md:text-3xl">{result.primary.condition}</h2>
                    </div>
                    <div className="rounded-2xl bg-primary-foreground/10 px-4 py-3 text-right">
                      <p className="text-xs text-primary-foreground/70">Model score</p>
                      <p className="text-2xl font-black">{result.primary.probability}%</p>
                    </div>
                  </div>
                  <p className="mt-5 text-xs leading-5 text-primary-foreground/75">
                    This percentage is a model ranking score, not the probability that you have the condition.
                  </p>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="font-bold">Symptoms considered</h3>
                  <div className="mt-3 flex flex-wrap gap-2">{selectedLabels.map(x => <span key={x} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">{x}</span>)}</div>
                  <div className="mt-7 rounded-2xl border border-success/20 bg-success/5 p-4">
                    <div className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-success"/>
                      <p className="text-sm leading-6">Use this output as a conversation starter with a qualified clinician. Bring your symptom history and any relevant reports to your appointment.</p>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={reset} variant="outline"><RotateCcw className="mr-2 h-4 w-4"/> New assessment</Button>
                <Button onClick={() => window.location.href="/doctors"}>Find a doctor <ArrowRight className="ml-2 h-4 w-4"/></Button>
              </div>
            </div>

            <Card className="h-fit rounded-3xl p-6">
              <h3 className="font-bold">Alternative rankings</h3>
              <p className="mt-1 text-xs text-muted-foreground">Other conditions the model ranked highly.</p>
              <div className="mt-5 space-y-5">
                {result.alternatives.map((x) => <div key={x.condition}>
                  <div className="flex justify-between gap-3 text-sm"><span>{x.condition}</span><span className="font-semibold">{x.probability}%</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary/60" style={{width:`${x.probability}%`}}/></div>
                </div>)}
              </div>
              <div className="mt-7 border-t pt-5 text-xs text-muted-foreground">
                Model {result.model_version} · Clinical validation: {result.clinical_validation ? "yes" : "no"}
              </div>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
