const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/375616bb-11f8-4ea3-a3ae-03a445fa84e4_ca505d72-44c8-4802-aa48-ba161898e700/pptx/scripts/apply_theme.js");

const THEME = {
  name: "Plain Academic", headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: "222222", lt1: "FFFFFF", dk2: "1F3864", lt2: "EEF2F8",
    accent1: "1F3864", accent2: "A4262C", accent3: "2E7D32", accent4: "7F8C9D",
    accent5: "D9E1EE", accent6: "C9A227", hlink: "1F3864", folHlink: "5B6B82" },
};
const HEX = THEME.colors;
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Real-Time Multimodal Detection of Fraud and Scam Calls";
pres.author = "Pritam Paul, Arya Gupta, Srijan Sarkar, Shinjan Saha, Subhalaxmi Chakraborty";
const C = pres.SchemeColor;
const NAVY = C.text2, RED = C.accent2, GREEN = C.accent3, GREY = C.accent4, TINT = C.background2;

pres.defineSlideMaster({
  title: "CONTENT", background: { color: "FFFFFF" },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.85, fontSize: 32, bold: true, color: NAVY, fontFace: "Cambria", valign: "middle", margin: 0 }, text: "" } },
    { text: { text: "Real-Time Multimodal Scam Call Detection", options: { x: 0.6, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: GREY, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: GREY, align: "right" },
});
pres.defineSlideMaster({
  title: "SECTION", background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.9, y: 2.8, w: 11.5, h: 1.2, fontSize: 40, bold: true, color: C.background1, fontFace: "Cambria", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.9, y: 4.0, w: 11.5, h: 0.8, fontSize: 20, color: C.accent5, margin: 0 }, text: "" } },
  ],
});

const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, fontSize: 16, color: C.text1, valign: "top", margin: 0 }, o));
const bullets = (items, o = {}) => items.map((t, i) => {
  const run = typeof t === "string" ? { text: t, options: {} } : t;
  return { text: run.text, options: Object.assign({ bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 8 }, run.options) };
});
const box = (s, x, y, w, h, fill, name) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: C.accent5, width: 1 }, objectName: name });
let sec = "";
const slide = (title, notes, master = "CONTENT") => {
  const s = pres.addSlide({ masterName: master, sectionTitle: sec });
  s.addText(title, { placeholder: "title" });
  if (notes) s.addNotes(notes);
  return s;
};
const section = (title, sub, notes) => { sec = title; pres.addSection({ title }); const s = slide(title, notes, "SECTION"); s.addText(sub, { placeholder: "body" }); };

// ---------- 1. Title ----------
sec = "Introduction"; pres.addSection({ title: sec });
{
  const s = pres.addSlide({ sectionTitle: sec }); s.background = { color: "FFFFFF" };
  T(s, "Real-Time Multimodal Detection of Fraud and Scam Calls Using Conversation Stage Modeling and Ensemble Learning",
    { x: 0.9, y: 1.2, w: 11.5, h: 1.9, fontSize: 34, bold: true, color: NAVY, fontFace: "Cambria", align: "center", valign: "middle" });
  T(s, "Pritam Paul  ·  Arya Gupta  ·  Srijan Sarkar  ·  Shinjan Saha  ·  Subhalaxmi Chakraborty",
    { x: 0.9, y: 3.6, w: 11.5, h: 0.5, fontSize: 20, align: "center" });
  T(s, "Institute of Engineering & Management  /  University of Engineering and Management, Kolkata, India",
    { x: 0.9, y: 4.2, w: 11.5, h: 0.4, fontSize: 16, color: GREY, align: "center" });
  T(s, "Code: github.com/CyberKnight-cmd/spam-call-detection",
    { x: 0.9, y: 5.6, w: 11.5, h: 0.4, fontSize: 14, color: GREY, align: "center" });
  s.addNotes("Good morning. Our paper is about detecting scam phone calls while the call is still happening, by understanding how the conversation develops, not just which words are spoken. I will start from the basics, then explain our system, the results, and what we plan next.");
}

// ---------- 2. Outline ----------
{
  const s = slide("Outline", "This is the flow of the talk. First the problem and basic concepts, then our method step by step, then results and discussion.");
  const items = ["The problem: why scam calls are hard to catch", "Basic concepts we build on", "Proposed system, step by step", "Evaluation: dataset, results, ablation", "Discussion: strengths, limitations, future work", "Conclusion"];
  items.forEach((t, i) => {
    const y = 1.6 + i * 0.85;
    s.addShape(pres.shapes.OVAL, { x: 1.2, y, w: 0.5, h: 0.5, fill: { color: NAVY }, objectName: "num" + i });
    T(s, String(i + 1), { x: 1.2, y, w: 0.5, h: 0.5, color: C.background1, bold: true, align: "center", valign: "middle" });
    T(s, t, { x: 2.0, y, w: 9, h: 0.5, fontSize: 20, valign: "middle" });
  });
}

// ---------- 3. Problem ----------
section("1. The Problem", "Scam calls are rising, and today's defences react too late",
  "Let us begin with why this problem matters.");
{
  const s = slide("Why scam calls are a serious problem",
    "Scam calls are social engineering. The attacker does not break any software; they convince a person to hand over an OTP, password or money. Because the attack happens through natural conversation, it is very hard to block with simple rules. And the damage happens during the call, so detection after the call ends is too late.");
  T(s, bullets([
    "Digital communication is growing, and fraud calls are growing with it",
    "Scammers use social engineering: they manipulate people through a planned conversation",
    "Goal: steal sensitive information (OTP, bank details) or money",
    "Modern scammers speak fluently, use emotional pressure and change numbers often",
    { text: "The harm happens during the call, so a warning must come during the call", options: { bold: true, color: RED } },
  ]), { x: 0.6, y: 1.5, w: 7.4, h: 5, fontSize: 18 });
  box(s, 8.5, 1.6, 4.2, 4.6, TINT, "callout");
  T(s, "Key question", { x: 8.8, y: 1.9, w: 3.6, h: 0.4, fontSize: 18, bold: true, color: NAVY });
  T(s, "Can we warn a user that a call is a scam while they are still talking, early enough to stop them from sharing anything?",
    { x: 8.8, y: 2.5, w: 3.6, h: 3.4, fontSize: 20, italic: true, color: NAVY });
}
{
  const s = slide("How a typical scam call unfolds",
    "This is the central observation of our paper. Scam calls follow a script with a fixed order. First a greeting, then the caller claims authority, like a bank or police. Then they describe a problem, such as a blocked account. Then they create urgency, act now. Finally they ask for data. Real calls rarely follow this exact sequence. If we can track which stage the call has reached, we know how dangerous it is.");
  const st = [["Greeting", "\"Hello, am I speaking with…\""], ["Authority", "\"I am calling from your bank\""], ["Problem", "\"Your account is blocked\""], ["Urgency", "\"Act now or lose access\""], ["Data Request", "\"Tell me the OTP\""]];
  st.forEach(([h, e], i) => {
    const x = 0.6 + i * 2.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.0, w: 2.1, h: 1.1, rectRadius: 0.08, fill: { color: i === 4 ? RED : NAVY }, objectName: "stage" + i });
    T(s, h, { x, y: 2.0, w: 2.1, h: 1.1, fontSize: 18, bold: true, color: C.background1, align: "center", valign: "middle" });
    T(s, e, { x, y: 3.3, w: 2.1, h: 1.0, fontSize: 14, italic: true, color: GREY, align: "center" });
    if (i < 4) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.14, y: 2.35, w: 0.32, h: 0.4, fill: { color: GREY }, objectName: "arr" + i });
  });
  T(s, "Risk increases as the call moves forward  →", { x: 0.6, y: 4.6, w: 12, h: 0.4, fontSize: 16, bold: true, color: RED, align: "center" });
  T(s, "Scam calls follow a structured script (Wood et al., 2023). Legitimate calls rarely follow this exact order. So the stage the call has reached is a strong sign of fraud.",
    { x: 1.2, y: 5.3, w: 10.9, h: 1.0, fontSize: 18, align: "center" });
}
{
  const s = slide("Why existing approaches fall short",
    "Here are the existing approaches. Blacklists and rules are cheap, but scammers just change numbers. Call-record methods use metadata like call duration and frequency, but they never listen to what is said. Content-based methods do analyse the conversation, but most analyse it after the call is over. None of them combine voice, text and the order of the conversation in real time. That gap is what we address.");
  const cols = [
    ["Blacklists & rules", "Block known numbers; rules on duration and frequency", "Scammers change numbers; many false alarms"],
    ["Call-record ML (CDR)", "Clustering (K-means, DBSCAN), DTW on call statistics", "Ignore what is actually said in the call"],
    ["Content analysis", "Deep learning / NLP on transcripts", "Mostly after the call ends; usually one modality"],
  ];
  cols.forEach(([h, how, gap], i) => {
    const x = 0.6 + i * 4.1;
    box(s, x, 1.5, 3.8, 4.4, TINT, "col" + i);
    T(s, h, { x: x + 0.25, y: 1.7, w: 3.3, h: 0.5, fontSize: 20, bold: true, color: NAVY });
    T(s, "How it works", { x: x + 0.25, y: 2.4, w: 3.3, h: 0.3, fontSize: 14, bold: true, color: GREY });
    T(s, how, { x: x + 0.25, y: 2.75, w: 3.3, h: 1.2, fontSize: 16 });
    T(s, "Weakness", { x: x + 0.25, y: 4.0, w: 3.3, h: 0.3, fontSize: 14, bold: true, color: RED });
    T(s, gap, { x: x + 0.25, y: 4.35, w: 3.3, h: 1.3, fontSize: 16 });
  });
  T(s, "Gap: no system combines voice, text and conversation order in real time.", { x: 0.6, y: 6.2, w: 12.1, h: 0.5, fontSize: 18, bold: true, color: NAVY, align: "center" });
}
{
  const s = slide("Our contributions",
    "These are our four contributions. Please remember the first one most: conversation stage modelling. The rest of the talk explains each of these.");
  const c = [
    ["Conversation stage modelling", "Tracks Greeting → Authority → Problem → Urgency → Data Request live, in English and Hindi"],
    ["Multimodal ensemble", "Four models in parallel: phoneme, prosody/urgency, script repetition, conversation stage"],
    ["Real-time risk", "Weighted risk fusion + EMA smoothing gives a stable risk score every 4 seconds"],
    ["Working, open system", "Android app + FastAPI server, with code released publicly"],
  ];
  c.forEach(([h, d], i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.5 + Math.floor(i / 2) * 2.6;
    box(s, x, y, 5.95, 2.3, TINT, "contrib" + i);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.3, w: 0.6, h: 0.6, fill: { color: NAVY }, objectName: "cn" + i });
    T(s, String(i + 1), { x: x + 0.3, y: y + 0.3, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: C.background1, align: "center", valign: "middle" });
    T(s, h, { x: x + 1.1, y: y + 0.35, w: 4.6, h: 0.5, fontSize: 20, bold: true, color: NAVY });
    T(s, d, { x: x + 1.1, y: y + 1.0, w: 4.6, h: 1.1, fontSize: 16 });
  });
}

// ---------- Basics ----------
section("2. Basic Concepts", "The building blocks, explained from scratch",
  "Before the system itself, I will quickly explain the basic tools we use, so everyone can follow.");
{
  const s = slide("From sound to numbers: audio features",
    "A computer cannot understand sound directly. Sound is a wave, a long list of numbers, 16,000 per second in our case. We cut the call into 4-second windows. From each window we compute MFCCs. MFCC stands for Mel-Frequency Cepstral Coefficients. In simple words, it is a compact summary of how the voice sounds, designed to match how human hearing works. We also compute prosody features: how high the pitch is, how much it varies, how loud the voice is, how bright it sounds, and how fast the person speaks. A stressed, pushy scammer shows up in these numbers.");
  const steps = ["Phone audio\n16,000 samples / sec", "Cut into\n4-second windows", "Compute features\n(MFCC, prosody)", "Feed to\nML models"];
  steps.forEach((t, i) => {
    const x = 0.6 + i * 3.15;
    box(s, x, 1.5, 2.7, 1.3, TINT, "flow" + i);
    T(s, t, { x, y: 1.5, w: 2.7, h: 1.3, fontSize: 16, bold: true, color: NAVY, align: "center", valign: "middle" });
    if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.75, y: 1.95, w: 0.35, h: 0.4, fill: { color: GREY }, objectName: "fa" + i });
  });
  T(s, "MFCC (Mel-Frequency Cepstral Coefficients)", { x: 0.6, y: 3.3, w: 5.9, h: 0.4, fontSize: 18, bold: true, color: NAVY });
  T(s, bullets(["A compact \"fingerprint\" of how speech sounds", "Modelled on how the human ear hears pitch", "Standard input for speech recognition (Davis & Mermelstein, 1980)"]), { x: 0.6, y: 3.8, w: 5.9, h: 2.5 });
  T(s, "Prosody (how something is said)", { x: 6.8, y: 3.3, w: 5.9, h: 0.4, fontSize: 18, bold: true, color: NAVY });
  T(s, bullets(["Pitch mean and pitch variation", "Loudness (RMS energy)", "Brightness (spectral centroid)", "Speech rate: how fast the person talks"]), { x: 6.8, y: 3.8, w: 5.9, h: 2.5 });
}
{
  const s = slide("The learning tools we use",
    "Four tools. A CNN is a neural network that is good at finding local patterns; we treat the MFCC grid like an image. Whisper is OpenAI's speech-to-text model; it turns speech into text and is robust to noise. Sentence-BERT, specifically all-MiniLM-L6-v2, turns a sentence into a list of numbers so that sentences with similar meaning get similar numbers. Cosine similarity measures how close two such vectors are: 1 means the same meaning, 0 means unrelated. That is how we match what the caller said to a scam stage.");
  const g = [
    ["CNN (Convolutional Neural Network)", "Finds local patterns in a grid of numbers. We treat MFCCs like an image of the voice."],
    ["Whisper (speech-to-text)", "Converts speech into text. Robust to noisy audio (Radford et al., 2022)."],
    ["Sentence embeddings", "all-MiniLM-L6-v2 turns a sentence into a vector; similar meaning → similar vector."],
    ["Cosine similarity", "Measures how close two vectors are: 1 = same meaning, 0 = unrelated."],
  ];
  g.forEach(([h, d], i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.5 + Math.floor(i / 2) * 2.6;
    box(s, x, y, 5.95, 2.3, TINT, "tool" + i);
    T(s, h, { x: x + 0.3, y: y + 0.3, w: 5.35, h: 0.5, fontSize: 20, bold: true, color: NAVY });
    T(s, d, { x: x + 0.3, y: y + 0.95, w: 5.35, h: 1.2, fontSize: 16 });
  });
}

// ---------- Method ----------
section("3. Proposed System", "From the phone to a live risk warning",
  "Now our system, step by step.");
{
  const s = slide("System overview",
    "This is the whole pipeline. During a call, the Android app captures the caller's audio and sends it to our FastAPI server over a WebSocket, in 4-second chunks, 16 kHz, 16-bit. The server cleans the audio, runs four models in parallel, fuses their outputs into one risk number, smooths it over time, and sends back one of five labels: Safe, Low Risk, Moderate, High Risk, or Scam Alert. A session state object remembers the running risk and the conversation stage for the whole call.");
  const blocks = [["Android app", "Captures caller audio"], ["Preprocessing", "VAD + dominant speaker"], ["4 models", "Run in parallel"], ["Decision engine", "Fusion + EMA"], ["Warning", "5 risk levels"]];
  blocks.forEach(([h, d], i) => {
    const x = 0.6 + i * 2.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.8, w: 2.1, h: 1.5, rectRadius: 0.08, fill: { color: i === 4 ? RED : NAVY }, objectName: "ov" + i });
    T(s, h, { x, y: 1.95, w: 2.1, h: 0.5, fontSize: 18, bold: true, color: C.background1, align: "center" });
    T(s, d, { x, y: 2.5, w: 2.1, h: 0.6, fontSize: 14, color: C.background1, align: "center" });
    if (i < 4) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.14, y: 2.35, w: 0.32, h: 0.4, fill: { color: GREY }, objectName: "oa" + i });
  });
  T(s, "4-second chunks · 16 kHz · 16-bit PCM · over WebSocket to a FastAPI server", { x: 0.6, y: 3.6, w: 12.1, h: 0.4, fontSize: 16, color: GREY, align: "center" });
  const lv = [["SAFE", GREEN], ["LOW RISK", C.accent6], ["MODERATE", C.accent6], ["HIGH RISK", RED], ["SCAM ALERT", RED]];
  T(s, "Output shown to the user every window:", { x: 0.6, y: 4.5, w: 12.1, h: 0.4, fontSize: 18, bold: true, color: NAVY });
  lv.forEach(([t, c], i) => {
    const x = 0.6 + i * 2.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 5.1, w: 2.1, h: 0.7, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: c, width: 2 }, objectName: "lv" + i });
    T(s, t, { x, y: 5.1, w: 2.1, h: 0.7, fontSize: 16, bold: true, color: c, align: "center", valign: "middle" });
  });
}
{
  const s = slide("Step 1: Cleaning the audio",
    "Before any model sees the audio, we clean it in two steps. First, voice activity detection removes silence and non-speech. If a window has almost no speech, we skip it, which saves computation and avoids false alarms from noise. Second, a dominant speaker filter keeps the main speaker's voice. If that filter leaves too little speech, for example because of noise or overlapping speakers, we fall back to the VAD output so we never lose the window.");
  const st = [["Raw 4-second window", "May contain silence, noise, two speakers"], ["Voice Activity Detection", "Removes silence; windows with almost no speech are skipped"], ["Dominant speaker filter", "Keeps the main speaker's voice"], ["Clean speech", "Ready for the 4 models"]];
  st.forEach(([h, d], i) => {
    const y = 1.45 + i * 1.25;
    box(s, 1.5, y, 10.3, 1.0, i === 3 ? C.accent5 : TINT, "pre" + i);
    T(s, h, { x: 1.8, y, w: 3.8, h: 1.0, fontSize: 18, bold: true, color: NAVY, valign: "middle" });
    T(s, d, { x: 5.8, y, w: 5.8, h: 1.0, fontSize: 16, valign: "middle" });
  });
  T(s, "Fallback: if too little speech remains after the speaker filter, the VAD output is used.", { x: 1.5, y: 6.5, w: 10.3, h: 0.35, fontSize: 14, italic: true, color: GREY });
}
{
  const s = slide("Step 2: Four models in parallel",
    "Each clean window goes to four models at the same time. Each looks at a different clue. Phoneme CNN: how the speech sounds, using MFCCs padded or trimmed to 370 frames. Prosody: is the speaker stressed or rushing; we compare five features with thresholds, giving a score from 0 to 3. Script repetition CNN: splits the window into four one-second pieces and looks for repeated, scripted phrases; because it learns sound patterns, not words, it can work for regional languages. And conversation stage, which I explain on the next slide.");
  const m = [
    ["Phoneme CNN", "How the speech sounds", "MFCCs of the dominant speaker, padded/trimmed to 370 frames → scam probability"],
    ["Prosody / Urgency", "Is the caller rushing or pressuring?", "5 features vs. thresholds → urgency score 0–3 → normalised risk"],
    ["Script Repetition CNN", "Is this a recorded or scripted phrase?", "Four 1-second segments, 470 frames each; highest probability is used. Works on acoustic patterns, so it is language-independent"],
    ["Conversation Stage", "What is the caller trying to do?", "Whisper → sentence embedding → match to 5 scam stages (next slide)"],
  ];
  m.forEach(([h, q, d], i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.45 + Math.floor(i / 2) * 2.7;
    box(s, x, y, 5.95, 2.45, i === 3 ? C.accent5 : TINT, "model" + i);
    T(s, h, { x: x + 0.3, y: y + 0.2, w: 5.35, h: 0.45, fontSize: 20, bold: true, color: NAVY });
    T(s, q, { x: x + 0.3, y: y + 0.7, w: 5.35, h: 0.4, fontSize: 16, italic: true, color: RED });
    T(s, d, { x: x + 0.3, y: y + 1.15, w: 5.35, h: 1.2, fontSize: 15 });
  });
}
{
  const s = slide("Step 3: Conversation stage detection",
    "This is the heart of the system. Every window is transcribed by Whisper. The text is turned into an embedding and compared with example sentences for each of the five stages, written in English and Hindi. If the best similarity is at least 0.55, we move to that stage. Importantly, the stage can only move forward, never backward, because scam scripts follow a fixed order. Each stage has a risk value, from 0.05 when nothing is detected up to 0.95 at Data Request.");
  const rows = [["Stage", "Example (EN / HI)", "Risk"], ["None yet", "—", "0.05"], ["Greeting", "\"Hello sir, good morning\"", "0.10"], ["Authority", "\"I am calling from SBI\"", "0.25"], ["Problem", "\"Your KYC has expired\"", "0.50"], ["Urgency", "\"Turant karna hoga, warna block\"", "0.70"], ["Data Request", "\"OTP bata dijiye\"", "0.95"]];
  s.addTable(rows.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: i === 0 || j === 2, color: i === 0 ? C.background1 : (i === 6 ? RED : C.text1), fill: { color: i === 0 ? HEX.dk2 : (i % 2 ? "FFFFFF" : HEX.lt2) }, fontSize: 16, align: j === 2 ? "center" : "left", valign: "middle" } }))),
    { x: 0.6, y: 1.5, w: 7.2, colW: [2.0, 4.0, 1.2], rowH: 0.62, border: { type: "solid", pt: 0.5, color: HEX.accent5 } });
  box(s, 8.3, 1.5, 4.4, 4.35, TINT, "rules");
  T(s, "Rules", { x: 8.6, y: 1.7, w: 3.8, h: 0.4, fontSize: 20, bold: true, color: NAVY });
  T(s, bullets(["Match only if cosine similarity ≥ 0.55", "Stage moves forward only, never back", "English + Hindi examples, for Indian users", "Gets the highest weight in the final score"]), { x: 8.6, y: 2.3, w: 3.8, h: 3.4, fontSize: 16 });
  T(s, "Example phrases are illustrative.", { x: 0.6, y: 6.0, w: 7.2, h: 0.3, fontSize: 12, italic: true, color: GREY });
}
{
  const s = slide("Step 4: Combining and smoothing the scores",
    "Now we have four numbers. We combine them with fixed weights: 60 percent conversation stage, 20 percent repetition, 10 percent phoneme, 10 percent urgency. The stage gets the most weight because the scam script is the most reliable signal. But one noisy window could cause a false alarm, so we smooth over time with an exponential moving average: 70 percent of the previous running risk plus 30 percent of the new one. So risk rises steadily when a call is consistently suspicious, and a single spike barely moves it.");
  T(s, "Weighted risk fusion (per 4-second window)", { x: 0.6, y: 1.4, w: 6, h: 0.4, fontSize: 20, bold: true, color: NAVY });
  s.addChart(pres.charts.BAR, [{ name: "Weight", labels: ["Conversation stage", "Script repetition", "Phoneme CNN", "Prosody / urgency"], values: [0.6, 0.2, 0.1, 0.1] }], {
    x: 0.6, y: 1.9, w: 6.0, h: 3.0, barDir: "bar", chartColors: [HEX.dk2], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00",
    dataLabelFontFace: "+mn-lt", dataLabelFontSize: 14, dataLabelColor: HEX.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk1,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, catAxisOrientation: "maxMin", valAxisMaxVal: 0.75, valAxisMinVal: 0,
  });
  box(s, 0.6, 5.1, 6.0, 1.3, TINT, "f1");
  T(s, "raw_risk = 0.60 × stage + 0.20 × repetition + 0.10 × phoneme + 0.10 × urgency", { x: 0.8, y: 5.1, w: 5.6, h: 1.3, fontSize: 16, fontFace: "Cambria", italic: true, valign: "middle", align: "center" });
  T(s, "Smoothing over time (EMA)", { x: 7.1, y: 1.4, w: 5.6, h: 0.4, fontSize: 20, bold: true, color: NAVY });
  box(s, 7.1, 1.9, 5.6, 1.3, TINT, "f2");
  T(s, "running_risk(t) = 0.7 × running_risk(t−1) + 0.3 × raw_risk(t)", { x: 7.3, y: 1.9, w: 5.2, h: 1.3, fontSize: 16, fontFace: "Cambria", italic: true, valign: "middle", align: "center" });
  T(s, bullets(["One noisy window or transcription error cannot trigger an alert by itself", "Consistent suspicious behaviour makes the risk rise step by step", "The final value is mapped to one of 5 risk levels"]), { x: 7.1, y: 3.5, w: 5.6, h: 2.9, fontSize: 16 });
}
{
  const s = slide("Step 5: Real-time deployment",
    "Finally, deployment. The server uses FastAPI with WebSockets, so many users can connect at once. All four models run at the same time using a thread pool with four workers, so each window's result is ready within the 4-second window, before the next chunk arrives. Models are loaded once at start-up. When the call ends we log summary statistics, such as final risk and highest stage reached, for later analysis.");
  const p = [["FastAPI + WebSocket", "Many users can connect at the same time"], ["ThreadPoolExecutor (4 workers)", "All four models run simultaneously"], ["Under 4 seconds per window", "Result is ready before the next chunk arrives"], ["Models loaded once", "At server start, not per request"], ["Post-call log", "Final risk, keyword density, highest stage reached"]];
  p.forEach(([h, d], i) => {
    const y = 1.45 + i * 1.02;
    s.addShape(pres.shapes.OVAL, { x: 0.9, y: y + 0.15, w: 0.5, h: 0.5, fill: { color: NAVY }, objectName: "dp" + i });
    T(s, String(i + 1), { x: 0.9, y: y + 0.15, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle" });
    T(s, h, { x: 1.7, y, w: 5.0, h: 0.8, fontSize: 18, bold: true, color: NAVY, valign: "middle" });
    T(s, d, { x: 6.8, y, w: 5.9, h: 0.8, fontSize: 16, valign: "middle" });
  });
}

// ---------- Evaluation ----------
section("4. Evaluation", "Dataset, setup and results", "Now, how well does it work?");
{
  const s = slide("Dataset and evaluation setup",
    "There is no public real-time scam call dataset, so we built a modular dataset for each model. The phoneme and urgency models used about 28 minutes of scam and 23 minutes of normal speech, in 4-second windows. Keyword and repetition used about 80 samples for each of 15 fraud keywords plus 800 to 900 negatives. For evaluation, we used the exact same pipeline as live deployment: each recording is fed window by window, and the final running risk is the prediction. The threshold of 0.40 was chosen with Youden's J statistic on the ROC curve.");
  T(s, "Training data (built by us, released publicly)", { x: 0.6, y: 1.4, w: 6, h: 0.4, fontSize: 20, bold: true, color: NAVY });
  T(s, bullets(["No public real-time scam-call dataset exists, so we built one per model", "Phoneme CNN & urgency: ~28 min scam + ~23 min normal speech, 4-s windows", "Keyword / repetition: ~80 samples × 15 fraud keywords + 800–900 negatives", "Stage model: transcripts + predefined intent examples (EN + HI)"]), { x: 0.6, y: 1.9, w: 6.0, h: 4.5, fontSize: 16 });
  T(s, "Evaluation protocol", { x: 7.1, y: 1.4, w: 5.6, h: 0.4, fontSize: 20, bold: true, color: NAVY });
  const st = [["16", "full calls (7 normal, 9 scam)"], ["Same", "pipeline as live deployment"], ["0.40", "threshold (Youden's J on ROC)"]];
  st.forEach(([n, l], i) => {
    const y = 1.95 + i * 1.45;
    box(s, 7.1, y, 5.6, 1.25, TINT, "ev" + i);
    T(s, n, { x: 7.3, y, w: 1.8, h: 1.25, fontSize: 32, bold: true, color: NAVY, fontFace: "Cambria", valign: "middle" });
    T(s, l, { x: 9.2, y, w: 3.3, h: 1.25, fontSize: 16, valign: "middle" });
  });
}
{
  const s = slide("Main results",
    "Our headline results. 81.25 percent accuracy at the call level. ROC-AUC of 0.873, meaning that if you pick a random scam call and a random normal call, the system gives the scam call a higher risk score 87 percent of the time. Average precision is 0.84. And precision on the scam class is 0.875: when we raise an alarm, we are right most of the time, which matters because false alarms annoy users.");
  const k = [["81.25%", "Accuracy"], ["0.873", "ROC-AUC"], ["0.841", "Average precision"], ["0.875", "Scam-class precision"]];
  k.forEach(([n, l], i) => {
    const x = 0.6 + i * 3.1;
    box(s, x, 1.6, 2.85, 2.2, TINT, "kpi" + i);
    T(s, n, { x, y: 1.75, w: 2.85, h: 1.2, fontSize: 44, bold: true, color: NAVY, fontFace: "Cambria", align: "center", valign: "middle" });
    T(s, l, { x, y: 2.95, w: 2.85, h: 0.6, fontSize: 16, color: GREY, align: "center" });
  });
  const rows = [["Class", "Precision", "Recall", "F1-score", "Calls"], ["Normal", "0.750", "0.857", "0.800", "7"], ["Scam", "0.875", "0.778", "0.824", "9"], ["Weighted avg", "0.820", "0.813", "0.813", "16"]];
  s.addTable(rows.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: i === 0 || i === 3, color: i === 0 ? C.background1 : C.text1, fill: { color: i === 0 ? HEX.dk2 : (i % 2 ? "FFFFFF" : HEX.lt2) }, fontSize: 16, align: j ? "center" : "left", valign: "middle" } }))),
    { x: 2.2, y: 4.3, w: 8.9, colW: [2.5, 1.6, 1.6, 1.6, 1.6], rowH: 0.5, border: { type: "solid", pt: 0.5, color: HEX.accent5 } });
}
{
  const s = slide("What the errors look like",
    "On the left is the confusion matrix. Thirteen of sixteen calls are correct: six of seven normal calls and seven of nine scam calls. On the right, the risk scores. Normal calls cluster at low risk, around 0.1 to 0.2. Scam calls are mostly high. The two missed scams sit just below the threshold, at around 0.3, and the one false alarm is a normal call at about 0.67. Note that the PR curve shows a lower threshold of 0.28 would give an F1 of 0.947; we report the more conservative 0.40 to avoid false alarms.");
  s.addImage({ path: "cm.png", x: 0.6, y: 1.5, w: 5.3, h: 4.38, altText: "Confusion matrix: 6 normal correct, 1 normal flagged, 2 scams missed, 7 scams caught" });
  s.addImage({ path: "dist.png", x: 6.4, y: 1.5, w: 6.3, h: 3.55, altText: "Histogram of final risk scores: normal calls low, scam calls mostly above 0.4" });
  T(s, bullets(["13 of 16 calls correct", "Normal calls cluster at low risk (≈0.1–0.2)", "The 2 missed scams sit just under the threshold"]), { x: 6.4, y: 5.2, w: 6.3, h: 1.5, fontSize: 16 });
}
{
  const s = slide("Ablation study: every module helps",
    "The ablation study answers: does every model actually help? We start with conversation stage alone, 75 percent. Adding the phoneme CNN gives 77.5. Adding prosody gives 79.4. The full system with repetition gives 81.25. Accuracy rises at every step, so no module is dead weight, and the conversation stage alone is already a strong baseline, confirming our main idea.");
  s.addChart(pres.charts.BAR, [{ name: "Accuracy (%)", labels: ["Stage only", "+ Phoneme CNN", "+ Prosody / urgency", "Full framework"], values: [75.0, 77.5, 79.38, 81.25] }], {
    x: 0.6, y: 1.4, w: 7.4, h: 5.2, barDir: "col", chartColors: [HEX.accent4, HEX.accent4, HEX.accent4, HEX.dk2], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00",
    dataLabelFontFace: "+mn-lt", dataLabelFontSize: 14, dataLabelColor: HEX.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk1,
    valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 12, valAxisLabelColor: HEX.accent4, valAxisMinVal: 70, valAxisMaxVal: 85, valAxisMajorUnit: 5,
    valGridLine: { color: HEX.accent5, size: 0.5 }, catGridLine: { style: "none" }, showLegend: false,
    showTitle: true, title: "Accuracy (%)", titleFontFace: "+mn-lt", titleFontSize: 14, titleColor: HEX.dk1,
  });
  box(s, 8.4, 1.6, 4.3, 4.6, TINT, "abl");
  T(s, "Take-aways", { x: 8.7, y: 1.8, w: 3.7, h: 0.4, fontSize: 20, bold: true, color: NAVY });
  T(s, bullets(["Conversation stage alone: already 75%", "Each added modality raises accuracy", "Full ensemble: +6.25 points over stage only", "No module is redundant"]), { x: 8.7, y: 2.4, w: 3.7, h: 3.6, fontSize: 16 });
  T(s, "Note: y-axis starts at 70%.", { x: 0.6, y: 6.6, w: 7, h: 0.3, fontSize: 12, italic: true, color: GREY });
}

// ---------- Discussion ----------
section("5. Discussion", "Strengths, limitations and next steps", "Let me now discuss the strengths and the limits of this work honestly.");
{
  const s = slide("Strengths of our approach",
    "Five strengths. First, it understands intent: it follows the scam script, so a scammer cannot escape just by changing their number or avoiding a keyword. Second, it works during the call, every 4 seconds. Third, it combines voice and meaning, so if one signal is weak, others help. Fourth, it is stable, thanks to EMA smoothing. Fifth, it is practical: a working Android app, English and Hindi support, and public code anyone can reproduce.");
  const g = [
    ["Understands intent, not just keywords", "Tracks the scam script; changing numbers or words does not escape it"],
    ["Real-time", "A fresh risk score every 4 seconds, while the call is still running"],
    ["Multimodal and robust", "Voice + meaning; if one signal is weak, others compensate"],
    ["Stable, few false alarms", "EMA smoothing; 87.5% precision on scam alerts"],
    ["Built for Indian users", "English + Hindi intents; repetition CNN is language-independent"],
    ["Complete and open", "Working Android app + server; code and data public"],
  ];
  g.forEach(([h, d], i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.4 + Math.floor(i / 2) * 1.8;
    box(s, x, y, 5.95, 1.6, TINT, "str" + i);
    T(s, h, { x: x + 0.3, y: y + 0.15, w: 5.35, h: 0.45, fontSize: 18, bold: true, color: NAVY });
    T(s, d, { x: x + 0.3, y: y + 0.65, w: 5.35, h: 0.85, fontSize: 15 });
  });
}
{
  const s = slide("Limitations and how we address them",
    "We are open about the limits. The biggest is that the evaluation has 16 calls. This is because there is no public real-time scam call dataset; we built our own, and this paper is a proof of concept for the framework. Even so, the ablation results increase consistently, the evaluation uses exactly the live pipeline, and everything is public so others can extend it. Whisper can mis-transcribe noisy phone audio, but the other three models and EMA smoothing reduce the effect. The urgency thresholds are hand-set; we plan to learn them from data. And the server needs internet; on-device TensorFlow Lite models are already part of our repository as a next step.");
  const rows = [
    ["Limitation", "Why / how it is handled", "Next step"],
    ["Small evaluation set (16 calls)", "No public real-time scam dataset exists; this is a proof of concept. Same pipeline as live use; consistent ablation gains", "Larger, more diverse dataset with partners"],
    ["Whisper errors on noisy phone audio", "Three acoustic models + EMA smoothing soften single errors", "Fine-tune ASR on telephone speech"],
    ["Hand-set urgency thresholds", "Simple and explainable", "Learn thresholds from data, per speaker"],
    ["Needs a stable internet connection", "Server-side keeps the phone light", "On-device TFLite models (started in repo)"],
  ];
  s.addTable(rows.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: i === 0 || j === 0, color: i === 0 ? C.background1 : (j === 0 ? NAVY : C.text1), fill: { color: i === 0 ? HEX.dk2 : (i % 2 ? "FFFFFF" : HEX.lt2) }, fontSize: 15, valign: "middle" } }))),
    { x: 0.6, y: 1.4, w: 12.1, colW: [3.3, 5.4, 3.4], rowH: [0.5, 1.1, 0.9, 0.9, 0.9], border: { type: "solid", pt: 0.5, color: HEX.accent5 } });
  T(s, "These are limits of scale, not of the idea: the framework is modular, so each part can be improved on its own.", { x: 0.6, y: 6.1, w: 12.1, h: 0.6, fontSize: 16, italic: true, color: NAVY, align: "center" });
}
{
  const s = slide("Future work",
    "Our roadmap. Scale up the data. Move inference onto the phone for privacy and offline use. Add more Indian languages. Learn the fusion weights and thresholds automatically instead of fixing them. And work with telecom providers so warnings reach users at scale.");
  const f = ["Larger, multi-lingual evaluation with real call data", "On-device inference (TensorFlow Lite) for privacy and offline use", "More regional languages (Bengali, Tamil, …)", "Learn fusion weights and thresholds from data", "Integration with telecom providers and automatic call blocking"];
  f.forEach((t, i) => {
    const y = 1.5 + i * 1.0;
    s.addShape(pres.shapes.RIGHT_ARROW, { x: 1.0, y: y + 0.2, w: 0.5, h: 0.4, fill: { color: NAVY }, objectName: "fw" + i });
    T(s, t, { x: 1.8, y, w: 10.5, h: 0.8, fontSize: 20, valign: "middle" });
  });
}

// ---------- Conclusion ----------
sec = "Conclusion"; pres.addSection({ title: sec });
{
  const s = slide("Conclusion",
    "To conclude: scam calls follow a script, and by tracking that script live, together with how the voice sounds, we can warn users during the call. Our system reaches 81 percent accuracy and 0.87 ROC-AUC on our evaluation, every module contributes, and the full system is open source.");
  T(s, bullets([
    "Scam calls follow a script; tracking the conversation stage reveals fraud intent",
    "Four models (phoneme, prosody, repetition, stage) run in parallel on 4-second windows",
    "Weighted fusion + EMA smoothing gives a stable, live risk score",
    { text: "81.25% accuracy · 0.812 F1 · 0.873 ROC-AUC", options: { bold: true, color: NAVY } },
    "Ablation shows every module adds value; stage modelling contributes the most",
  ]), { x: 0.6, y: 1.5, w: 12.1, h: 4.3, fontSize: 20 });
}
{
  const s = pres.addSlide({ masterName: "SECTION", sectionTitle: sec });
  s.addText("Thank you", { placeholder: "title" });
  s.addText("Questions?   ·   github.com/CyberKnight-cmd/spam-call-detection", { placeholder: "body" });
  s.addNotes("Thank you. I am happy to take questions.");
}

(async () => {
  await pres.writeFile({ fileName: "Scam_Call_Detection_Presentation.pptx" });
  await applyTheme("Scam_Call_Detection_Presentation.pptx", THEME);
})();
