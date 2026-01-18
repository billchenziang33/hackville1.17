import { useState } from "react";

interface UserPreferencesProps {
  onSubmit: () => void;
  onBack: () => void;
}

type Step = "language" | "cultural";

const LANGUAGES = [
  { value: "en", label: "English", emoji: "🌍" },
  { value: "zh", label: "中文", emoji: "🇨🇳" },
  { value: "es", label: "Español", emoji: "🇪🇸" },
  { value: "fr", label: "Français", emoji: "🇫🇷" },
  { value: "ja", label: "日本語", emoji: "🇯🇵" },
  { value: "ko", label: "한국어", emoji: "🇰🇷" },
];

const CULTURAL_BACKGROUNDS = [
  { value: "chinese", label: "Chinese", emoji: "🀄" },
  { value: "indian", label: "Indian", emoji: "🪷" },
  { value: "middle-eastern", label: "Middle Eastern", emoji: "🕌" },
  { value: "french", label: "French", emoji: "🥖" },
  { value: "korean", label: "Korean", emoji: "🍜" },
  { value: "other", label: "Other", emoji: "🌎" },
];

export default function UserPreferences({ onSubmit, onBack }: UserPreferencesProps) {
  const [step, setStep] = useState<Step>("language");

  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [culturalBackground, setCulturalBackground] = useState("");

  const [ethnicity, setEthnicity] = useState("");
  const [background, setBackground] = useState("");
  const [nationality, setNationality] = useState("");
  const [religion, setReligion] = useState("");
  const [timeInCanada, setTimeInCanada] = useState<number | "">("");
  const [city, setCity] = useState("");

  const canSave = preferredLanguage && culturalBackground;

  const handleSave = () => {
    if (!canSave) return;

    const preferences = {
      preferredLanguage,
      culturalBackground,
      ethnicity: ethnicity || undefined,
      background: background || undefined,
      nationality: nationality || undefined,
      religion: religion || undefined,
      time_in_canada_months:
        timeInCanada === "" ? undefined : Number(timeInCanada),
      city: city || undefined,
    };

    // ✅ 本地保存（MVP）
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
    localStorage.setItem("onboardingCompleted", "true");

    console.log("Saved preferences:", preferences);

    // ✅ 只通知 App：可以去下一页了
    onSubmit();
  };

  return (
    <div style={cardStyle}>
      {/* Back */}
      <button onClick={onBack} style={backButton}>
        ← Back
      </button>

      <h1 style={titleStyle}>👋 Welcome</h1>
      <p style={subtitleStyle}>Help us personalize your experience.</p>

      <div style={gridStyle}>
        {/* LEFT */}
        <div>
          {step === "language" && (
            <Section title="🌍 Choose Your Language">
              {LANGUAGES.map((l) => (
                <OptionCard
                  key={l.value}
                  selected={preferredLanguage === l.value}
                  onClick={() => {
                    setPreferredLanguage(l.value);
                    setStep("cultural");
                  }}
                >
                  <span>{l.emoji}</span>
                  <span>{l.label}</span>
                </OptionCard>
              ))}
            </Section>
          )}

          {step === "cultural" && (
            <Section title="🎏 Choose Your Cultural Background">
              {CULTURAL_BACKGROUNDS.map((c) => (
                <OptionCard
                  key={c.value}
                  selected={culturalBackground === c.value}
                  onClick={() => setCulturalBackground(c.value)}
                >
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                </OptionCard>
              ))}
            </Section>
          )}
        </div>

        {/* RIGHT */}
        <div style={rightColumn}>
          <Section title="🧾 Other Details">
            <div style={rightInner}>
              <Input placeholder="Ethnicity" value={ethnicity} onChange={setEthnicity} />
              <Input placeholder="Family / Cultural Background" value={background} onChange={setBackground} />
              <Input placeholder="Nationality" value={nationality} onChange={setNationality} />
              <Input placeholder="Religion (optional)" value={religion} onChange={setReligion} />
              <Input
                type="number"
                placeholder="Time in Canada (months)"
                value={timeInCanada}
                onChange={(v) => setTimeInCanada(v === "" ? "" : Number(v))}
              />
              <Input placeholder="City" value={city} onChange={setCity} />
            </div>
          </Section>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!canSave}
        style={{ ...buttonStyle, opacity: canSave ? 1 : 0.4 }}
      >
        💾 Save & Continue
      </button>
    </div>
  );
}

/* ===== Components & Styles（保持你原来的） ===== */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={sectionStyle}>
      <h3 style={sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function OptionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        ...optionCard,
        borderColor: selected ? "#4f5dff" : "#ccc",
        backgroundColor: selected ? "#eef0ff" : "#fff",
      }}
    >
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  ...props
}: {
  value: any;
  onChange: (v: any) => void;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
    />
  );
}

/* ===== Styles ===== */

const cardStyle: React.CSSProperties = {
  width: "780px",
  height: "720px",
  backgroundColor: "#fff",
  borderRadius: "22px",
  padding: "2.4rem",
  boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
  display: "flex",
  flexDirection: "column",
  color: "#000",
  position: "relative",
};

const backButton = {
  position: "absolute" as const,
  top: "20px",
  left: "20px",
  border: "none",
  background: "none",
  fontSize: "1rem",
  cursor: "pointer",
  fontWeight: 600,
};

const titleStyle = { fontSize: "2rem", marginBottom: "0.3rem" };
const subtitleStyle = { marginBottom: "1.6rem" };

const gridStyle: React.CSSProperties = {
  flex: 1,
  display: "grid",
  gridTemplateColumns: "2fr 1.3fr",
  gap: "1.6rem",
};

const rightColumn = { overflowY: "auto" };

const rightInner = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
};

const sectionStyle = {
  backgroundColor: "#f5f5f5",
  borderRadius: "18px",
  padding: "1.3rem",
};

const sectionTitle = {
  fontSize: "1rem",
  fontWeight: 600,
  marginBottom: "1rem",
};

const optionCard = {
  display: "flex",
  alignItems: "center",
  gap: "0.8rem",
  padding: "1rem",
  borderRadius: "14px",
  border: "2px solid #ccc",
  cursor: "pointer",
  marginBottom: "0.7rem",
};

const inputStyle = {
  width: "90%",
  height: "48px",
  borderRadius: "14px",
  padding: "0 14px",
  border: "1px solid #bbb",
  marginBottom: "0.9rem",
};

const buttonStyle = {
  marginTop: "1.6rem",
  height: "54px",
  borderRadius: "16px",
  border: "none",
  backgroundColor: "#4f5dff",
  color: "#fff",
  fontSize: "1.05rem",
  fontWeight: 600,
  cursor: "pointer",
};
