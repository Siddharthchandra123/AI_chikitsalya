"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Activity,
  Thermometer,
  Heart,
  Stethoscope,
} from "lucide-react";

const symptoms = [
  { id: "fever", label: "Fever", icon: Thermometer },
  { id: "cough", label: "Cough", icon: Activity },
  { id: "headache", label: "Headache", icon: Brain },
  { id: "fatigue", label: "Fatigue", icon: Heart },
  { id: "bodyache", label: "Body Ache", icon: Activity },
  { id: "breathing", label: "Breathing Issues", icon: Stethoscope },
  { id: "nausea", label: "Nausea", icon: Activity },
  { id: "sorethroat", label: "Sore Throat", icon: Activity },
];

const mockDiagnosis = {
  condition: "Upper Respiratory Infection",
  confidence: 87,
  severity: "Mild",
  recommendations: [
    "Rest and stay hydrated",
    "Over-the-counter pain relievers for discomfort",
    "Monitor symptoms for 3-5 days",
    "Consult a doctor if symptoms worsen",
  ],
  relatedConditions: [
    { name: "Common Cold", probability: 78 },
    { name: "Seasonal Flu", probability: 45 },
    { name: "Allergies", probability: 23 },
  ],
};

export default function AIDetectionPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<typeof mockDiagnosis | null>(null);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      setDiagnosis(mockDiagnosis);
      setIsAnalyzing(false);
    }, 2500);
  };

  const resetAnalysis = () => {
    setSelectedSymptoms([]);
    setAdditionalInfo("");
    setDiagnosis(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            AI Disease Detection
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Select your symptoms and let our AI analyze them to provide a
            preliminary assessment. This is not a replacement for professional
            medical advice.
          </p>
        </div>

        {!diagnosis ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Select Your Symptoms
                </h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {symptoms.map((symptom) => {
                    const Icon = symptom.icon;
                    const isSelected = selectedSymptoms.includes(symptom.id);
                    return (
                      <button
                        key={symptom.id}
                        onClick={() => toggleSymptom(symptom.id)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            isSelected ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {symptom.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Describe any other symptoms or relevant medical history..."
                    className="h-24 w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedSymptoms.length} symptoms selected
                  </p>
                  <Button
                    onClick={handleAnalyze}
                    disabled={selectedSymptoms.length === 0 || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Symptoms
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Upload className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    Upload Reports
                  </h3>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Upload medical reports or images for more accurate analysis.
                </p>
                <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag files here or click to upload
                  </p>
                </div>
              </Card>

              <Card className="border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Important Notice
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      This AI analysis is for informational purposes only and
                      should not replace professional medical diagnosis.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <div className="bg-primary p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-foreground/80">
                        Predicted Condition
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-primary-foreground">
                        {diagnosis.condition}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-primary-foreground/80">
                        Confidence
                      </p>
                      <p className="mt-1 text-3xl font-bold text-primary-foreground">
                        {diagnosis.confidence}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6 flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        diagnosis.severity === "Mild"
                          ? "bg-green-100 text-green-700"
                          : diagnosis.severity === "Moderate"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {diagnosis.severity} Severity
                    </span>
                  </div>

                  <h3 className="mb-3 font-semibold text-foreground">
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {diagnosis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <span className="text-sm text-muted-foreground">
                          {rec}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button onClick={resetAnalysis} variant="outline">
                  New Analysis
                </Button>
                <Button>Book Doctor Consultation</Button>
              </div>
            </div>

            <Card className="h-fit p-6">
              <h3 className="mb-4 font-semibold text-foreground">
                Related Conditions
              </h3>
              <div className="space-y-4">
                {diagnosis.relatedConditions.map((condition, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{condition.name}</span>
                      <span className="text-muted-foreground">
                        {condition.probability}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{ width: `${condition.probability}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
