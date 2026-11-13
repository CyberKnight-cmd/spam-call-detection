// Conference deck: Real-Time Multimodal Detection of Fraud and Scam Calls
// Build:  node build.js   (needs pptxgenjs; run `python make_assets.py` first)
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const APPLY_THEME = process.env.APPLY_THEME_JS;
const { applyTheme } = APPLY_THEME ? require(APPLY_THEME) : { applyTheme: null };

const A = (p) => path.join(__dirname, "assets", p);
const EQ = JSON.parse(fs.readFileSync(A("eq/sizes.json"), "utf8"));

const THEME = {
  name: "Lecture Blue", headFontFace: "Calibri", bodyFontFace: "Calibri",
  colors: {
    dk1: "000000", lt1: "FFFFFF", dk2: "002060", lt2: "DEEBF7",
    accent1: "0070C0", accent2: "C00000", accent3: "2E7D32", accent4: "595959",
    accent5: "BDD7EE", accent6: "ED7D31", hlink: "0563C1", folHlink: "954F72",
  },
};
const H = THEME.colors;
const pres = new pptxgen();
pres.layout = "LAYOUT_4x3"; // 10 x 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Real-Time Multimodal Detection of Fraud and Scam Calls";
pres.author = "Subhalaxmi Chakraborty, Krishna Kumar Jha, Pritam Paul, Arya Gupta, Srijan Sarkar, Shinjan Saha";
const C = pres.SchemeColor;
const BLUE = C.accent1, NAVY = C.text2, RED = C.accent2, GREY = C.accent4, TINT = C.background2, EDGE = C.accent5;

const titleShadow = () => ({ type: "outer", angle: 45, blur: 3, offset: 2, color: "000000", opacity: 0.45 });

// ---------------------------------------------------------------- layouts
pres.defineSlideMaster({
  title: "CONTENT", background: { color: "FFFFFF" },
  objects: [
    { rect: { x: 0, y: 0, w: 10, h: 1.03, fill: { color: H.accent1 } } },
    { image: { x: 0, y: 0, w: 0.82, h: 1.03, path: A("tile.png") } },
    { placeholder: { options: { name: "title", type: "title", x: 0.95, y: 0.08, w: 8.9, h: 0.87, fontSize: 30, bold: true, color: C.background1, align: "center", valign: "middle", charSpacing: 1, shadow: titleShadow(), margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 4.5, y: 7.1, w: 1.0, h: 0.3, fontSize: 10, bold: true, color: H.dk2, align: "center" },
});
pres.defineSlideMaster({
  title: "SECTION", background: { color: "FFFFFF" },
  objects: [
    { rect: { x: 0, y: 0, w: 10, h: 1.03, fill: { color: H.accent1 } } },
    { image: { x: 0, y: 0, w: 0.82, h: 1.03, path: A("tile.png") } },
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 2.9, w: 9.0, h: 1.3, fontFace: "Arial", fontSize: 44, bold: true, color: C.accent2, align: "center", valign: "middle", shadow: titleShadow(), margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.5, y: 4.3, w: 9.0, h: 0.6, fontSize: 20, italic: true, color: C.text2, align: "center", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 4.5, y: 7.1, w: 1.0, h: 0.3, fontSize: 10, bold: true, color: H.dk2, align: "center" },
});

// ---------------------------------------------------------------- helpers
let SEC = "";
const T = (s, text, o = {}) => s.addText(text, Object.assign({ isTextBox: true, fontSize: 18, color: C.text1, valign: "top", margin: 0 }, o));
// "**bold blue**" markup -> runs
const runs = (str, base = {}) => str.split("**").map((p, i) => ({ text: p, options: Object.assign({}, base, i % 2 ? { bold: true, color: BLUE } : {}) })).filter((r) => r.text.length);
const arrows = (items, o = {}) => {
  const out = [];
  items.forEach((it, i) => {
    const rs = runs(it);
    Object.assign(rs[0].options, { bullet: { code: "27A2" }, paraSpaceAfter: o.gap ?? 10 });
    rs[rs.length - 1].options.breakLine = i < items.length - 1;
    out.push(...rs);
  });
  return out;
};
const box = (s, x, y, w, h, fill = TINT, name) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: EDGE, width: 1 }, objectName: name });
const eq = (s, name, x, y, o = {}) => {
  let [w, h] = EQ[name];
  const sc = Math.min(o.scale ?? 1, o.maxW ? o.maxW / w : 9, o.maxH ? o.maxH / h : 9);
  w *= sc; h *= sc;
  if (o.cw) x += (o.cw - w) / 2;
  if (o.ch) y += (o.ch - h) / 2;
  s.addImage({ path: A(`eq/${name}.png`), x, y, w, h, altText: o.alt || `Equation: ${name}` });
  return { w, h };
};
const seg = (s, x1, y1, x2, y2, o = {}) => {
  const x = Math.min(x1, x2), y = Math.min(y1, y2);
  s.addShape(pres.shapes.LINE, {
    x, y, w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001),
    flipH: x2 < x1, flipV: y2 < y1,
    line: { color: o.color || H.accent4, width: o.width || 1.5, endArrowType: o.arrow === false ? undefined : "triangle", dashType: o.dash },
  });
};
const rarrow = (s, x, y, w = 0.22, h = 0.26) => s.addShape(pres.shapes.RIGHT_ARROW, { x, y, w, h, fill: { color: H.accent4 }, line: { color: H.accent4, width: 0 } });
const tbl = (s, rows, o) => s.addTable(rows.map((r, i) => r.map((c, j) => ({
  text: c, options: { bold: i === 0 || (o.boldCol0 && j === 0), color: i === 0 ? C.background1 : C.text1, fill: { color: i === 0 ? H.accent1 : (i % 2 ? "FFFFFF" : H.lt2) }, fontSize: o.fontSize || 15, align: (o.align && o.align[j]) || "left", valign: "middle" },
}))), Object.assign({ border: { type: "solid", pt: 0.75, color: H.accent5 }, margin: 0.06 }, o.pos));
const slide = (title, notes) => {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: SEC });
  s.addText(title, { placeholder: "title" });
  if (notes) s.addNotes(notes);
  return s;
};
const section = (title, sub, notes) => {
  SEC = title; pres.addSection({ title });
  const s = pres.addSlide({ masterName: "SECTION", sectionTitle: SEC });
  s.addText(title, { placeholder: "title" });
  s.addText(sub, { placeholder: "body" });
  if (notes) s.addNotes(notes);
};
const label = (s, text, x, y, w, o = {}) => T(s, text, Object.assign({ x, y, w, h: 0.4, fontSize: 17, bold: true, color: BLUE }, o));

// ================================================================ 1. Title
SEC = "Introduction"; pres.addSection({ title: SEC });
{
  const s = pres.addSlide({ sectionTitle: SEC });
  s.background = { color: "FFFFFF" };
  s.addImage({ path: A("logo_uem.png"), x: 0.25, y: 0.2, w: 2.05, h: 1.15, altText: "University of Engineering & Management logo" });
  s.addImage({ path: A("logo_iem.png"), x: 8.1, y: 0.2, w: 1.65, h: 1.15, altText: "Institute of Engineering & Management logo" });
  s.addShape(pres.shapes.RECTANGLE, { x: 3.9, y: 0.52, w: 2.2, h: 0.5, fill: { color: "2E75B6" }, line: { color: "2E75B6", width: 0 }, shadow: { type: "outer", angle: 45, blur: 3, offset: 2, color: "000000", opacity: 0.4 } });
  s.addText("Paper ID: 810", { isTextBox: true, x: 3.9, y: 0.52, w: 2.2, h: 0.5, fontSize: 18, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0 });
  s.addImage({ path: A("banner.png"), x: 0.35, y: 1.5, w: 9.3, h: 1.4, altText: "Title banner" });
  s.addText("Real-Time Multimodal Detection of Fraud and Scam Calls Using Conversation Stage Modeling and Ensemble Learning", { isTextBox: true, x: 0.6, y: 1.55, w: 8.8, h: 1.22, fontSize: 22, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, shadow: titleShadow() });
  const AUTHORS = [
    [["Subhalaxmi Chakraborty", "n"], ["Department of CST & CSIT", "i"], ["Institute of Engineering and Management", "i"], ["University of Engineering & Management", "i"], ["Kolkata, India", ""], ["subhalaxmi2008@gmail.com", ""]],
    [["Krishna Kumar Jha", "n"], ["Guru Nanak Institute of Technology", "i"], ["Kolkata, India", ""], ["krishnakumar.jha@gnit.ac.in", ""], ["ORCID: 0000-0002-3210-5187", ""]],
    [["Pritam Paul", "n"], ["Department of CST & CSIT", "i"], ["Institute of Engineering and Management", "i"], ["University of Engineering & Management", "i"], ["Kolkata, India", ""], ["paulpritam417@gmail.com", ""]],
    [["Arya Gupta", "n"], ["Department of CST & CSIT", "i"], ["Institute of Engineering and Management", "i"], ["University of Engineering & Management", "i"], ["Kolkata, India", ""], ["aryagupta.dev@gmail.com", ""]],
    [["Srijan Sarkar", "n"], ["Department of CST & CSIT", "i"], ["IEM & UEM", ""], ["Kolkata, India", ""], ["srijansarkar.coding@gmail.com", ""]],
    [["Shinjan Saha", "n"], ["Department of CST & CSIT", "i"], ["IEM & UEM", "i"], ["Kolkata, India", ""], ["shinjansaha00@gmail.com", ""]],
  ];
  AUTHORS.forEach((lines, k) => {
    const x = 0.2 + (k % 3) * 3.2, y = 3.15 + Math.floor(k / 3) * 1.75;
    s.addText(lines.map(([t, st], j) => ({ text: t, options: { breakLine: j < lines.length - 1, bold: st === "n", italic: st === "i", fontSize: st === "n" ? 14 : 11, color: st === "n" ? C.text2 : C.text1 } })),
      { isTextBox: true, x, y, w: 3.2, h: 1.6, align: "center", valign: "top", margin: 0 });
  });
  s.addText([{ text: "github.com/CyberKnight-cmd/spam-call-detection", options: { hyperlink: { url: "https://github.com/CyberKnight-cmd/spam-call-detection" } } }], { isTextBox: true, x: 2.0, y: 6.75, w: 6.0, h: 0.3, fontSize: 11, color: C.hyperlink, align: "center", margin: 0 });
  s.addNotes("Good morning. Our paper detects scam phone calls while the call is still happening. I will start from the basics, explain each of our four models with its maths, show how we combine them, and then present results and limitations.");
}

// ================================================================ 2. Outline
{
  const s = slide("Outline", "This is the plan. First the problem, then the signal processing, the CNN maths, the four models one by one, how they are combined, and finally results.");
  T(s, arrows(["Introduction and motivation", "Signal processing: cleaning audio, MFCC features", "CNN fundamentals: the maths", "The four models, one by one", "Ensemble: weighted fusion and EMA smoothing", "Results and discussion", "Conclusion and references"], { gap: 18 }), { x: 1.0, y: 1.55, w: 8.2, h: 5.3, fontSize: 22 });
}

// ================================================================ 3–7 Introduction
section("Introduction", "Why scam calls need real-time detection", "Let us start with the problem.");
{
  const s = slide("Why Scam Calls Are a Problem",
    "A scam call is social engineering: nothing is hacked, a person is persuaded. The caller wants an OTP, bank details or money. Modern scammers speak fluently and change numbers daily, so blacklists fail. And because the damage happens during the call, a warning after the call is useless.");
  T(s, arrows(["**Social engineering:** a person is persuaded; nothing is hacked", "**Goal:** OTP, bank details or money", "**Hard to block:** fluent speech, new numbers every day", "**Damage happens during the call**"], { gap: 16 }), { x: 0.5, y: 1.5, w: 5.5, h: 5, fontSize: 19 });
  box(s, 6.35, 1.6, 3.2, 3.6, TINT, "question");
  T(s, "Key question", { x: 6.6, y: 1.8, w: 2.8, h: 0.4, fontSize: 18, bold: true, color: BLUE });
  T(s, "Can we warn the user while the call is still going on?", { x: 6.6, y: 2.35, w: 2.8, h: 2.6, fontSize: 22, italic: true, color: NAVY });
}
{
  const s = slide("How a Scam Call Unfolds",
    "This is the key observation of the paper. Scam calls follow a script in a fixed order: greeting, a claim of authority, a made-up problem, pressure, and finally the request for data. Each step up the staircase is more dangerous. If we know which step the call has reached, we know the risk. Wood et al. showed this staged structure in real scam-baiting calls.");
  const st = [["Greeting", "“Hello sir, good morning”"], ["Authority", "“Calling from your bank”"], ["Problem", "“Your KYC is incomplete”"], ["Urgency", "“Do it right now”"], ["Data request", "“Tell me the OTP”"]];
  st.forEach(([h, e], i) => {
    const x = 0.65 + i * 1.8, y = 4.35 - i * 0.6;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.66, h: 0.75, rectRadius: 0.06, fill: { color: i === 4 ? H.accent2 : H.accent1 }, line: { color: i === 4 ? H.accent2 : H.accent1, width: 0 }, objectName: "step" + i });
    T(s, h, { x, y, w: 1.66, h: 0.75, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle" });
    T(s, e, { x, y: y + 0.85, w: 1.66, h: 0.6, fontSize: 13, italic: true, color: GREY, align: "center" });
  });
  seg(s, 0.4, 5.95, 0.4, 1.45, { color: H.accent2, width: 2 });
  seg(s, 0.4, 5.95, 9.6, 5.95, { color: H.accent4, width: 1.5 });
  T(s, "risk", { x: 0.5, y: 1.4, w: 0.8, h: 0.35, fontSize: 15, bold: true, color: RED });
  T(s, "call progresses →", { x: 7.2, y: 5.6, w: 2.4, h: 0.3, fontSize: 13, italic: true, color: GREY, align: "right" });
  T(s, "Scam calls follow a fixed script [6]. Know the stage → know the danger.", { x: 0.5, y: 6.2, w: 9.0, h: 0.5, fontSize: 18, bold: true, color: NAVY, align: "center" });
}
{
  const s = slide("Related Work and the Gap",
    "Three families of earlier work. Blacklists and rules are cheap but scammers change numbers. Call-record methods cluster call statistics or use dynamic time warping, but never listen to the conversation. Content methods analyse transcripts, but usually after the call ends and with one modality. Nobody combines voice, text and conversation order in real time. That is our gap.");
  tbl(s, [["Approach", "Main idea", "Limitation"],
    ["Blacklists & rules [1], [2]", "Block known numbers; rules on call duration", "Numbers change; false alarms"],
    ["Call-record ML [3], [4]", "Clustering / DTW on call statistics", "Never listens to the call"],
    ["Content analysis [5], [6]", "NLP / deep learning on transcripts", "After the call; one modality"]],
  { pos: { x: 0.4, y: 1.5, w: 9.2, colW: [2.9, 3.4, 2.9], rowH: [0.5, 0.85, 0.85, 0.85] }, boldCol0: true, fontSize: 15 });
  box(s, 0.4, 5.0, 9.2, 1.2, TINT, "gap");
  T(s, [{ text: "Gap: ", options: { bold: true, color: RED } }, { text: "no real-time system combines voice + text + conversation order.", options: { bold: true, color: NAVY } }], { x: 0.6, y: 5.0, w: 8.8, h: 1.2, fontSize: 19, align: "center", valign: "middle" });
}
{
  const s = slide("Our Contributions",
    "Four contributions. Conversation-stage modelling is the main one. Around it we build a four-model ensemble, fuse the scores with fixed weights, smooth them over time, and run the whole thing live in a working app with public code.");
  const c = [["Conversation-stage modelling", "Track the scam script live"], ["Four-model ensemble", "Phoneme, prosody, repetition, stage"], ["Weighted fusion + EMA", "A stable risk score every 4 s"], ["Working open system", "Android app + FastAPI server + public code"]];
  c.forEach(([h, d], i) => {
    const x = 0.4 + (i % 2) * 4.7, y = 1.5 + Math.floor(i / 2) * 2.6;
    box(s, x, y, 4.5, 2.3, TINT, "contrib" + i);
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.3, w: 0.62, h: 0.62, fill: { color: H.accent1 }, line: { color: H.accent1, width: 0 }, objectName: "num" + i });
    T(s, String(i + 1), { x: x + 0.25, y: y + 0.3, w: 0.62, h: 0.62, fontSize: 22, bold: true, color: C.background1, align: "center", valign: "middle" });
    T(s, h, { x: x + 1.05, y: y + 0.3, w: 3.25, h: 0.65, fontSize: 19, bold: true, color: NAVY, valign: "middle" });
    T(s, d, { x: x + 1.05, y: y + 1.15, w: 3.25, h: 0.9, fontSize: 17 });
  });
}

// ================================================================ 8–26 Proposed framework
section("Proposed Framework", "From raw audio to a live risk score", "Now the method, step by step, with the maths.");
{
  const s = slide("System Architecture",
    "The full pipeline. Every 4 seconds the Android app sends the caller's audio to a FastAPI server over a WebSocket. The server cleans the audio, then runs four models at the same time. Their scores are combined with fixed weights, smoothed over time, and one of five risk labels goes back to the phone. The weights you see, 0.60, 0.20, 0.10 and 0.10, are the ensemble, explained later.");
  const mid = 3.55;
  const big = (x, w, t1, t2, fill) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: mid - 0.6, w, h: 1.2, rectRadius: 0.06, fill: { color: fill }, line: { color: fill, width: 0 } });
    T(s, [{ text: t1, options: { bold: true, breakLine: true } }, { text: t2, options: { fontSize: 12 } }], { x, y: mid - 0.6, w, h: 1.2, fontSize: 14, color: C.background1, align: "center", valign: "middle" });
  };
  big(0.3, 1.45, "Android app", "captures caller audio", H.accent1);
  big(2.1, 1.45, "Preprocess", "VAD + dominant speaker", H.accent1);
  big(6.75, 1.45, "Fusion + EMA", "one risk score", H.dk2);
  big(8.55, 1.2, "Risk label", "5 levels", H.accent2);
  seg(s, 1.75, mid, 2.1, mid, { width: 2 });
  seg(s, 8.2, mid, 8.55, mid, { width: 2 });
  const models = [["① Phoneme CNN", "w = 0.10"], ["② Prosody / urgency", "w = 0.10"], ["③ Repetition CNN", "w = 0.20"], ["④ Stage (Whisper + MiniLM)", "w = 0.60"]];
  models.forEach(([m, w], i) => {
    const y = 1.6 + i * 1.0, yc = y + 0.38;
    box(s, 4.0, y, 2.4, 0.76, TINT, "model" + i);
    T(s, [{ text: m, options: { bold: true, color: NAVY, breakLine: true } }, { text: w, options: { color: BLUE, bold: true } }], { x: 4.05, y, w: 2.3, h: 0.76, fontSize: 13, align: "center", valign: "middle" });
    seg(s, 3.55, mid, 4.0, yc);
    seg(s, 6.4, yc, 6.75, mid);
  });
  T(s, "Every 4 s:  16 kHz · 16-bit PCM over WebSocket → 4 models in parallel → label back to the phone", { x: 0.3, y: 5.75, w: 9.4, h: 0.6, fontSize: 15, color: GREY, align: "center" });
}
{
  const s = slide("Step 1: Cleaning the Audio",
    "Before any model, we clean the audio. The phone sends 16-bit integers; we divide by 32768 to get values between minus one and one. 4 seconds at 16 kHz is 64,000 samples. Voice activity detection checks each 30 ms frame: it compares how likely the frame is under a speech model versus a noise model, a log-likelihood ratio. Windows with under one second of speech are skipped. Then the dominant-speaker filter computes the RMS energy of each frame and keeps only long, loud runs, at least 1.2 seconds above 0.6 times the mean energy. If too little remains, we fall back to the VAD output.");
  const rows = [
    ["Normalise", "int16 → [−1, 1]", "norm"],
    ["Voice activity [25]", "30 ms frames; skip window if speech < 1 s", "vad"],
    ["Frame energy (RMS)", "loudness of frame t", "rms"],
    ["Dominant speaker", "runs ≥ 1.2 s; else fall back to VAD", "dom"],
  ];
  rows.forEach(([l, d, e], i) => {
    const y = 1.35 + i * 1.38;
    box(s, 0.4, y, 9.2, 1.22, i % 2 ? "FFFFFF" : TINT, "row" + i);
    T(s, [{ text: l, options: { bold: true, color: BLUE, fontSize: 17, breakLine: true } }, { text: d, options: { fontSize: 13, color: GREY } }], { x: 0.6, y, w: 3.0, h: 1.22, valign: "middle" });
    eq(s, e, 3.8, y, { cw: 5.6, ch: 1.22, maxH: 1.1, maxW: 5.6 });
  });
}
{
  const s = slide("Step 2: From Sound to MFCC Features",
    "A computer cannot use raw sound well, so we turn it into MFCCs: Mel-frequency cepstral coefficients. The chain is: cut into 25 ms frames every 10 ms, take the FFT, pass through a Mel filterbank that mimics the human ear, take the log, then a DCT. We add first and second time-derivatives, called deltas. This picture is a real 4-second scam window from our dataset and its 40 MFCCs. Each column is one 10 ms frame. The phoneme CNN receives a 370 by 120 matrix: 40 MFCCs plus 40 deltas plus 40 delta-deltas.");
  const steps = ["Frames 25 ms", "FFT", "Mel filters", "log", "DCT", "+ Δ, ΔΔ"];
  steps.forEach((t, i) => {
    const x = 0.35 + i * 1.57;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.3, w: 1.33, h: 0.6, rectRadius: 0.06, fill: { color: H.accent1 }, line: { color: H.accent1, width: 0 }, objectName: "mf" + i });
    T(s, t, { x, y: 1.3, w: 1.33, h: 0.6, fontSize: 15, bold: true, color: C.background1, align: "center", valign: "middle" });
    if (i < 5) rarrow(s, x + 1.34, 1.47, 0.22, 0.26);
  });
  s.addImage({ path: A("mfcc.png"), x: 0.6, y: 2.1, w: 8.8, h: 4.51, altText: "Waveform of a 4-second scam-call window and its 40 MFCCs" });
  T(s, "Phoneme CNN input per window:  370 × 120  (40 MFCC + 40 Δ + 40 ΔΔ)  [7], [9]", { x: 0.4, y: 6.65, w: 9.2, h: 0.35, fontSize: 15, bold: true, color: NAVY, align: "center" });
}
{
  const s = slide("MFCC: The Maths",
    "The same chain as equations. Frame t is a 400-sample slice, hopped by 160 samples, times a Hann window. The FFT gives the power at each frequency. The Mel scale compresses high frequencies the way our ears do. We sum the power in each Mel filter, take the log, and a DCT decorrelates the result; we keep 40 coefficients. Deltas measure how fast each coefficient changes over time. Finally CMVN subtracts the mean and divides by the standard deviation, so loud and quiet phones look alike.");
  const rows = [["Framing", "N = 400, H = 160", "frame"], ["Power spectrum", "FFT of each frame", "fft"], ["Mel scale [8]", "ear-like frequency axis", "mel"], ["Filterbank → log → DCT", "keep i = 0 … 39", "dct"], ["Deltas [9]", "change over time", "delta"], ["Normalise (CMVN)", "per coefficient", "cmvn"]];
  rows.forEach(([l, d, e], i) => {
    const y = 1.25 + i * 0.93;
    if (i % 2 === 0) s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 9.2, h: 0.93, fill: { color: H.lt2 }, line: { color: H.lt2, width: 0 } });
    T(s, [{ text: l, options: { bold: true, color: BLUE, fontSize: 16, breakLine: true } }, { text: d, options: { fontSize: 12, color: GREY } }], { x: 0.55, y, w: 3.0, h: 0.93, valign: "middle" });
    eq(s, e, 3.7, y, { cw: 5.8, ch: 0.93, maxH: 0.86, maxW: 5.8 });
  });
}
{
  const s = slide("CNN Basics: 1-D Convolution",
    "Both of our audio networks are 1-D convolutional neural networks. Think of the MFCC matrix as a row of columns, one per 10 ms frame. A filter, or kernel, looks at K neighbouring frames at once, here 5 frames, multiplies by learned weights, adds a bias, and applies ReLU. Then it slides one step and repeats. The same weights are used at every position, called weight sharing, so a pattern is recognised wherever it occurs in time. With 64 filters we get 64 output channels. With no padding, the output is K minus 1 frames shorter.");
  T(s, "input X  (time × 120 features)", { x: 0.5, y: 1.25, w: 5, h: 0.35, fontSize: 14, bold: true, color: GREY });
  for (let i = 0; i < 16; i++) {
    const hl = i >= 4 && i < 9;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6 + i * 0.55, y: 1.65, w: 0.45, h: 1.35, fill: { color: hl ? H.accent1 : H.lt2 }, line: { color: hl ? H.dk2 : H.accent5, width: hl ? 1.5 : 0.75 } });
  }
  T(s, "kernel W: K = 5 frames", { x: 2.8, y: 3.05, w: 2.8, h: 0.3, fontSize: 13, bold: true, color: BLUE, align: "center" });
  seg(s, 4.18, 3.35, 4.18, 3.85, { color: H.accent1, width: 2 });
  for (let i = 0; i < 12; i++) {
    const hl = i === 4;
    s.addShape(pres.shapes.RECTANGLE, { x: 1.7 + i * 0.55, y: 3.9, w: 0.45, h: 0.45, fill: { color: hl ? H.accent2 : "FFFFFF" }, line: { color: hl ? H.accent2 : H.accent5, width: 1 } });
  }
  T(s, "output h  (time − 4) × 64", { x: 5.2, y: 4.45, w: 4.3, h: 0.3, fontSize: 14, bold: true, color: GREY, align: "right" });
  eq(s, "conv", 0.4, 4.85, { cw: 9.2, maxH: 0.95 });
  T(s, arrows(["**Weight sharing:** same W at every time step [10]", "**Output length:** T′ = T − K + 1 (no padding)"], { gap: 4 }), { x: 0.8, y: 5.95, w: 8.6, h: 0.9, fontSize: 16 });
}
{
  const s = slide("CNN Building Blocks: The Maths",
    "Each block has one job. ReLU adds non-linearity and keeps gradients healthy. Batch normalisation rescales each channel using the batch mean and variance, then learns a scale gamma and shift beta; this stabilises training. Max-pooling halves the length and keeps the strongest response. Dropout randomly switches off neurons during training, with probability q, so the network cannot memorise our small dataset. Global average pooling turns any number of frames into one fixed vector. The sigmoid squashes the final number into a probability between 0 and 1.");
  const rows = [["ReLU [11]", "relu", "non-linearity"], ["BatchNorm [12]", "bn", "stable training"], ["MaxPool", "pool", "halve length"], ["Dropout [13]", "drop", "stop overfitting"], ["Global avg pool [14]", "gap", "fixed-size vector"], ["Sigmoid", "sigmoid", "probability (0, 1)"]];
  rows.forEach(([l, e, why], i) => {
    const y = 1.25 + i * 0.93;
    if (i % 2 === 0) s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 9.2, h: 0.93, fill: { color: H.lt2 }, line: { color: H.lt2, width: 0 } });
    T(s, l, { x: 0.55, y, w: 2.2, h: 0.93, fontSize: 16, bold: true, color: BLUE, valign: "middle" });
    eq(s, e, 2.8, y, { cw: 4.6, ch: 0.93, maxH: 0.85, maxW: 4.6 });
    T(s, why, { x: 7.55, y, w: 2.0, h: 0.93, fontSize: 14, color: GREY, valign: "middle" });
  });
}
{
  const s = slide("How the CNNs Are Trained",
    "Both CNNs are binary classifiers: label 1 for scam, 0 for normal. The loss is binary cross-entropy, the negative log-likelihood of a coin flip with probability p. It punishes confident wrong answers heavily. With a sigmoid output its gradient is simply p minus y, the error itself, which makes training simple and stable. Weights are updated with Adam, which keeps a running average of the gradient, m, and of its square, v, so each weight gets its own step size. We used learning rates of 0.0005 for the phoneme CNN and 0.001 for the repetition CNN.");
  label(s, "Binary cross-entropy loss   (y = 1 scam, 0 normal)", 0.5, 1.3, 9);
  eq(s, "bce", 0.4, 1.75, { cw: 9.2, maxH: 0.9 });
  label(s, "Gradient at the output = the error", 0.5, 2.85, 9);
  eq(s, "grad", 0.4, 3.25, { cw: 9.2, maxH: 0.75 });
  label(s, "Adam optimiser [15]", 0.5, 4.15, 9);
  eq(s, "adam1", 0.4, 4.55, { cw: 9.2, maxW: 9.0, maxH: 0.5 });
  eq(s, "adam2", 0.4, 5.15, { cw: 9.2, maxH: 0.75 });
  T(s, "η = 5×10⁻⁴ (phoneme CNN) · 10⁻³ (repetition CNN) · β₁ = 0.9, β₂ = 0.999", { x: 0.4, y: 6.2, w: 9.2, h: 0.4, fontSize: 15, color: NAVY, bold: true, align: "center" });
}
{
  const s = slide("Model 1: Phoneme CNN",
    "Model one looks at how the voice sounds at the level of phonemes. Input: the 370 by 120 MFCC matrix of the dominant speaker. Two convolution blocks with 64 and 128 filters, each followed by batch norm, max-pooling and dropout. The numbers under each block are the shapes: 370 frames shrink to 90. Global average pooling gives 128 numbers, a dense layer, and a sigmoid gives the scam probability. The whole network has about 80,600 parameters, small enough to run in real time. Its receptive field is about 12 frames, 120 milliseconds, which is roughly one phoneme or syllable. That is exactly why a CNN fits here.");
  eq(s, "phon", 0.4, 1.25, { cw: 9.2, maxH: 0.55 });
  const L = [["Input", "MFCC"], ["Conv1D", "64, k=5", "BN·ReLU"], ["MaxPool ÷2", "Drop 0.3"], ["Conv1D", "128, k=3", "BN·ReLU"], ["MaxPool ÷2", "Drop 0.3"], ["Global", "avg pool"], ["Dense 128", "Drop 0.4"], ["Dense 1", "sigmoid"]];
  const hts = [2.0, 1.95, 1.4, 1.4, 1.0, 0.8, 0.9, 0.75];
  const shapes = ["370×120", "366×64", "183×64", "181×128", "90×128", "128", "128", "1"];
  const mid = 3.2;
  L.forEach((t, i) => {
    const x = 0.4 + i * 1.17, h = hts[i];
    const fill = i === 0 ? H.accent4 : i === 7 ? H.accent2 : i % 2 ? H.accent1 : H.dk2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: mid - h / 2, w: 0.95, h, rectRadius: 0.05, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: "layer" + i });
    T(s, t.map((u, j) => ({ text: u, options: { breakLine: j < t.length - 1, bold: j === 0 } })), { x: x - 0.05, y: mid - h / 2, w: 1.05, h, fontSize: 12, color: C.background1, align: "center", valign: "middle" });
    T(s, shapes[i], { x: x - 0.1, y: 4.3, w: 1.15, h: 0.3, fontSize: 13, bold: true, color: BLUE, align: "center" });
    if (i < 7) rarrow(s, x + 0.96, mid - 0.11, 0.2, 0.22);
  });
  const facts = [["≈ 80.6 k", "parameters → fast"], ["≈ 120 ms", "receptive field ≈ one phoneme"], ["Why CNN?", "local patterns, shared weights [10]"]];
  facts.forEach(([a, b], i) => {
    const x = 0.4 + i * 3.1;
    box(s, x, 4.95, 2.9, 1.6, TINT, "fact" + i);
    T(s, a, { x, y: 5.05, w: 2.9, h: 0.6, fontSize: 26, bold: true, color: NAVY, align: "center", valign: "middle" });
    T(s, b, { x: x + 0.15, y: 5.7, w: 2.6, h: 0.7, fontSize: 14, color: GREY, align: "center" });
  });
}
{
  const s = slide("Model 2: Prosody Features",
    "Model two listens to how something is said, not what. Four measurements. Pitch: the mean and standard deviation of the fundamental frequency over voiced frames; a raised, agitated voice increases both. Loudness: the average RMS energy. Spectral centroid: the centre of mass of the spectrum; a sharp, tense voice has a higher centroid. Speech rate: the number of onset peaks per second; scammers rush their victims.");
  const rows = [["Pitch mean & variation", "raised, agitated voice", "pitch"], ["Loudness (RMS)", "speaking forcefully", "energy"], ["Spectral centroid", "sharp, tense tone", "centroid"], ["Speech rate", "rushing the victim", "rate"]];
  rows.forEach(([l, d, e], i) => {
    const y = 1.35 + i * 1.38;
    box(s, 0.4, y, 9.2, 1.22, i % 2 ? "FFFFFF" : TINT, "pr" + i);
    T(s, [{ text: l, options: { bold: true, color: BLUE, fontSize: 17, breakLine: true } }, { text: d, options: { fontSize: 14, color: GREY, italic: true } }], { x: 0.6, y, w: 2.7, h: 1.22, valign: "middle" });
    eq(s, e, 3.4, y, { cw: 6.1, ch: 1.22, maxH: 1.1, maxW: 6.0 });
  });
}
{
  const s = slide("Model 2: Urgency Score",
    "We turn the prosody features into an urgency score with a transparent rule. For each of the five cues we check whether it is above the speaker baseline b times a factor lambda; for example energy must be 1.8 times the baseline. We count how many cues fire, capped at 3. The count goes through a lookup table that grows faster than linear: one cue alone is weak evidence, three cues together strongly suggest pressure. If the window is nearly silent, the score is zero. Being rule-based, it needs no labelled urgency data and it is easy to explain.");
  eq(s, "urg", 0.4, 1.25, { cw: 9.2, maxH: 0.8 });
  tbl(s, [["Cue  fᵢ", "Factor λᵢ"], ["RMS energy", "1.8"], ["Pitch mean", "1.3"], ["Pitch variation", "1.5"], ["Speech rate", "1.5"], ["Spectral centroid", "1.25"]],
    { pos: { x: 0.5, y: 2.35, w: 4.0, colW: [2.7, 1.3], rowH: 0.48 }, align: ["left", "center"], fontSize: 15 });
  s.addChart(pres.charts.BAR, [{ name: "g(u)", labels: ["u = 0", "u = 1", "u = 2", "u = 3"], values: [0, 0.2, 0.5, 0.9] }], {
    x: 4.9, y: 2.2, w: 4.7, h: 3.0, barDir: "col", chartColors: [H.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0",
    dataLabelFontFace: "+mn-lt", dataLabelFontSize: 12, dataLabelColor: H.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 12, catAxisLabelColor: H.dk1,
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 1, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
    showTitle: true, title: "Lookup g(u): grows faster than linear", titleFontFace: "+mn-lt", titleFontSize: 13, titleColor: H.dk1,
  });
  eq(s, "urgmap", 0.4, 5.55, { cw: 9.2, maxW: 9.0, maxH: 0.5 });
  T(s, "bᵢ = baseline from normal speech · silence gate: Ē < 0.005 ⇒ u = 0", { x: 0.4, y: 6.3, w: 9.2, h: 0.35, fontSize: 14, color: GREY, align: "center" });
}
{
  const s = slide("Model 3: Script-Repetition CNN",
    "Model three catches recorded or scripted phrases, the kind a scam call centre repeats all day. The 4-second window is cut into four 1-second segments. Each segment becomes a 40-MFCC matrix padded to 470 frames, and the same small CNN gives a probability. We take the maximum: one scripted phrase anywhere in the window is enough. The CNN has the same design as model one but is smaller, about 17,200 parameters. It learns sound patterns, not words, so it can work in regional languages. To make it robust to different speakers we trained with time-stretching, pitch shifting and volume changes. This follows the CNN keyword-spotting idea of Sainath and Parada.");
  for (let j = 0; j < 4; j++) {
    const x = 0.6 + j * 2.25;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.3, w: 2.15, h: 0.55, fill: { color: j % 2 ? H.accent1 : H.dk2 }, line: { color: "FFFFFF", width: 1 } });
    T(s, `s${"₁₂₃₄"[j]}   ${j}–${j + 1} s`, { x, y: 1.3, w: 2.15, h: 0.55, fontSize: 15, bold: true, color: C.background1, align: "center", valign: "middle" });
    seg(s, x + 1.075, 1.85, x + 1.075, 2.2, { width: 1.5 });
    box(s, x + 0.4, 2.2, 1.35, 0.5, TINT, "cnn" + j);
    T(s, "CNN", { x: x + 0.4, y: 2.2, w: 1.35, h: 0.5, fontSize: 14, bold: true, color: NAVY, align: "center", valign: "middle" });
    T(s, `p${"₁₂₃₄"[j]}`, { x: x + 0.6, y: 2.75, w: 0.95, h: 0.3, fontSize: 15, bold: true, color: BLUE, align: "center" });
    seg(s, x + 1.075, 3.05, 4.85, 3.35, { width: 1.25 });
  }
  s.addShape(pres.shapes.OVAL, { x: 4.4, y: 3.35, w: 0.9, h: 0.55, fill: { color: H.accent2 }, line: { color: H.accent2, width: 0 }, objectName: "max" });
  T(s, "max", { x: 4.4, y: 3.35, w: 0.9, h: 0.55, fontSize: 15, bold: true, color: C.background1, align: "center", valign: "middle" });
  T(s, "one scripted phrase anywhere is enough", { x: 5.45, y: 3.42, w: 4.2, h: 0.4, fontSize: 14, italic: true, color: GREY });
  eq(s, "rep", 0.4, 4.05, { cw: 9.2, maxH: 0.6 });
  const L = ["470×40", "Conv 32, k5", "Pool·Drop", "Conv 64, k3", "Pool·Drop", "GAP", "Dense 64", "σ → p"];
  L.forEach((t, i) => {
    const x = 0.45 + i * 1.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.95, w: 0.98, h: 0.6, rectRadius: 0.05, fill: { color: i === 7 ? H.accent2 : i === 0 ? H.accent4 : H.accent1 }, line: { color: "FFFFFF", width: 0 } });
    T(s, t, { x: x - 0.04, y: 4.95, w: 1.06, h: 0.6, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle" });
    if (i < 7) rarrow(s, x + 0.985, 5.15, 0.16, 0.2);
  });
  T(s, "≈ 17.2 k parameters · augmentation: time-stretch 0.85× / 1.15×, pitch ±2 semitones, volume 0.8–1.2× · keyword-spotting CNN idea [16]", { x: 0.4, y: 5.8, w: 9.2, h: 0.7, fontSize: 14, color: GREY, align: "center" });
}
{
  const s = slide("Model 4: Conversation Stage",
    "Model four understands what the caller is trying to do. Whisper turns the audio into text. MiniLM turns the text into a vector of 384 numbers that captures its meaning. We compare that vector with an intent bank: five stages, about twenty example sentences each, in English and Hindi. The best match updates the conversation stage, and the stage gives a risk value. Because we compare meaning, a scammer who rephrases the script is still caught. The values here are illustrative.");
  const B = [["4-s audio", "xₜ", "speech"], ["Whisper [18]", "speech → text", "“your KYC update is pending”"], ["MiniLM [20]", "text → meaning", "eₜ ∈ ℝ³⁸⁴"], ["Intent bank", "5 stages × ~20 examples", "best: PROBLEM"], ["Stage update", "forward only", "stage 3 → r = 0.50"]];
  B.forEach(([a, b, c], i) => {
    const x = 0.35 + i * 1.88;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.4, w: 1.6, h: 1.2, rectRadius: 0.06, fill: { color: i === 4 ? H.accent2 : H.accent1 }, line: { color: "FFFFFF", width: 0 }, objectName: "m4b" + i });
    T(s, [{ text: a, options: { bold: true, breakLine: true } }, { text: b, options: { fontSize: 12 } }], { x: x + 0.03, y: 1.4, w: 1.54, h: 1.2, fontSize: 14, color: C.background1, align: "center", valign: "middle" });
    T(s, c, { x: x - 0.05, y: 2.7, w: 1.7, h: 0.85, fontSize: 13, italic: true, color: GREY, align: "center" });
    if (i < 4) rarrow(s, x + 1.62, 1.88, 0.22, 0.26);
  });
  T(s, "illustrative example", { x: 0.35, y: 3.55, w: 3, h: 0.3, fontSize: 11, italic: true, color: GREY });
  eq(s, "embed", 0.4, 4.0, { cw: 9.2, maxH: 0.6 });
  T(s, arrows(["**Meaning, not exact words:** a rephrased script still matches", "**Intent bank:** English and Hindi examples, for Indian users"], { gap: 8 }), { x: 0.8, y: 5.05, w: 8.6, h: 1.4, fontSize: 17 });
}
{
  const s = slide("Inside Whisper and MiniLM",
    "Both tools are Transformers. Whisper takes an 80-channel log-Mel spectrogram, very close to our MFCC pipeline, and its encoder actually begins with two 1-D convolution layers, so there is a CNN here too, before an encoder-decoder Transformer writes out the text. MiniLM is a small 6-layer Transformer that outputs one 384-dimensional vector per sentence by averaging its token vectors. The core operation of every Transformer is self-attention: each word builds a query, key and value; the softmax of query times key, scaled by the square root of the dimension, says how much each word should look at every other word.");
  box(s, 0.4, 1.3, 4.45, 2.75, TINT, "whisper");
  T(s, "Whisper [18]: speech → text", { x: 0.6, y: 1.4, w: 4.1, h: 0.4, fontSize: 17, bold: true, color: BLUE });
  T(s, arrows(["80-channel log-Mel input", "**CNN stem:** 2 × Conv1D (k = 3, GELU)", "Encoder–decoder Transformer → text"], { gap: 6 }), { x: 0.6, y: 1.9, w: 4.1, h: 2.0, fontSize: 15 });
  box(s, 5.15, 1.3, 4.45, 2.75, TINT, "minilm");
  T(s, "MiniLM-L6-v2 [19], [20]: text → meaning", { x: 5.35, y: 1.4, w: 4.1, h: 0.4, fontSize: 17, bold: true, color: BLUE });
  T(s, arrows(["6 Transformer layers, 384-d", "Mean pooling over tokens:"], { gap: 6 }), { x: 5.35, y: 1.9, w: 4.1, h: 1.0, fontSize: 15 });
  eq(s, "meanpool", 5.35, 2.95, { cw: 4.1, maxH: 0.85 });
  label(s, "Self-attention [17]: every word looks at every other word", 0.5, 4.3, 9);
  eq(s, "att", 0.4, 4.8, { cw: 9.2, maxH: 0.85 });
  eq(s, "qkv", 0.4, 5.85, { cw: 9.2, maxH: 0.45 });
}
{
  const s = slide("Matching Meaning: Cosine Similarity",
    "How do we compare two meanings? Each sentence is an arrow in 384-dimensional space. Cosine similarity is the cosine of the angle between two arrows: 1 means same direction, same meaning; near 0 means unrelated. For each stage we take its best-matching example sentence, then pick the stage with the highest score. If even the best score is below 0.55, we ignore the window; this gate stops random small talk from moving the stage.");
  eq(s, "cos", 0.4, 1.25, { cw: 9.2, maxH: 0.85 });
  eq(s, "intent", 0.4, 2.25, { cw: 9.2, maxW: 9.0, maxH: 0.55 });
  const ox = 0.9, oy = 6.5;
  seg(s, ox, oy, ox + 3.9, oy, { color: H.accent5, width: 1, arrow: false });
  seg(s, ox, oy, ox, 3.2, { color: H.accent5, width: 1, arrow: false });
  seg(s, ox, oy, 3.2, 3.55, { color: H.accent1, width: 3 });
  seg(s, ox, oy, 3.75, 4.1, { color: H.accent3, width: 3 });
  seg(s, ox, oy, 3.9, 5.85, { color: H.accent4, width: 3 });
  T(s, "eₜ (caller)", { x: 2.4, y: 3.15, w: 1.6, h: 0.35, fontSize: 14, bold: true, color: BLUE });
  T(s, [{ text: "PROBLEM", options: { breakLine: true } }, { text: "small θ" }], { x: 3.85, y: 3.85, w: 1.4, h: 0.55, fontSize: 13, bold: true, color: C.accent3 });
  T(s, [{ text: "GREETING", options: { breakLine: true } }, { text: "large θ" }], { x: 4.0, y: 5.55, w: 1.3, h: 0.55, fontSize: 13, bold: true, color: GREY });
  box(s, 5.35, 3.3, 4.25, 3.2, TINT, "rules");
  T(s, arrows(["Score each stage by its **best** example", "Pick the highest-scoring stage i*", "Accept only if s(i*) ≥ **0.55**", "Small talk below the gate is ignored"], { gap: 8 }), { x: 5.55, y: 3.5, w: 3.9, h: 2.9, fontSize: 15 });
}
{
  const s = slide("Stage Tracking: A Forward-Only State Machine",
    "The stage is a counter from 0 to 5 that can only go up. If the best intent passes the 0.55 gate, the new stage is the maximum of the old stage and the matched one. Otherwise it stays. Real scam scripts move forward, so going backwards adds nothing, and this rule means one innocent sentence cannot hide earlier pressure. Each stage maps to a risk value, from 0.05 when nothing is detected to 0.95 when the caller asks for data.");
  const names = ["None", "Greeting", "Authority", "Problem", "Urgency", "Data req."];
  const risk = ["0.05", "0.10", "0.25", "0.50", "0.70", "0.95"];
  const fills = ["7F7F7F", "2E75B6", "0070C0", "1F4E79", "C55A11", "C00000"];
  names.forEach((n, i) => {
    const x = 0.45 + i * 1.55;
    s.addShape(pres.shapes.OVAL, { x, y: 1.45, w: 1.0, h: 1.0, fill: { color: fills[i] }, line: { color: "FFFFFF", width: 0 }, objectName: "st" + i });
    T(s, String(i), { x, y: 1.45, w: 1.0, h: 1.0, fontSize: 26, bold: true, color: C.background1, align: "center", valign: "middle" });
    T(s, n, { x: x - 0.25, y: 2.55, w: 1.5, h: 0.35, fontSize: 14, bold: true, color: NAVY, align: "center" });
    T(s, "R = " + risk[i], { x: x - 0.25, y: 2.9, w: 1.5, h: 0.35, fontSize: 14, bold: true, color: BLUE, align: "center" });
    if (i < 5) seg(s, x + 1.02, 1.95, x + 1.53, 1.95, { width: 2 });
  });
  eq(s, "stage", 0.4, 3.55, { cw: 9.2, maxW: 9.0, maxH: 0.55 });
  T(s, "otherwise the stage stays the same", { x: 0.4, y: 4.15, w: 9.2, h: 0.35, fontSize: 15, italic: true, color: GREY, align: "center" });
  eq(s, "stagerisk", 0.4, 4.6, { cw: 9.2, maxH: 0.5 });
  T(s, arrows(["Scam scripts move forward, so the stage never steps back", "One innocent sentence cannot hide earlier pressure"], { gap: 8 }), { x: 0.8, y: 5.4, w: 8.6, h: 1.2, fontSize: 17 });
}
{
  const s = slide("Ensemble: Weighted Late Fusion",
    "Now the ensemble. Each model gives a number between 0 and 1. We combine them with a weighted sum, called late fusion or weighted soft voting. The weights add up to one, so the result also stays between 0 and 1. The stage gets 0.60 because it is the most reliable signal and gave the largest gain in the ablation; repetition gets 0.20; phoneme and urgency 0.10 each. Example: stage at PROBLEM gives 0.50 times 0.60, which is 0.30; repetition 0.70 gives 0.14; phoneme 0.60 gives 0.06; urgency 0.5 gives 0.05; total 0.55 for this window.");
  eq(s, "fuse", 0.4, 1.25, { cw: 9.2, maxW: 9.0, maxH: 0.5 });
  const ins = [["Stage", "0.60"], ["Repetition", "0.20"], ["Phoneme", "0.10"], ["Urgency", "0.10"]];
  const sx = 3.25, sy = 3.45;
  ins.forEach(([n, w], i) => {
    const y = 2.1 + i * 0.75, yc = y + 0.27;
    box(s, 0.4, y, 1.8, 0.55, TINT, "in" + i);
    T(s, n, { x: 0.4, y, w: 1.8, h: 0.55, fontSize: 15, bold: true, color: NAVY, align: "center", valign: "middle" });
    seg(s, 2.2, yc, sx, sy, { width: 1.5 });
    T(s, "× " + w, { x: 2.25, y: i < 2 ? yc - 0.3 : yc + 0.03, w: 0.7, h: 0.27, fontSize: 12, bold: true, color: BLUE });
  });
  s.addShape(pres.shapes.OVAL, { x: sx, y: sy - 0.45, w: 0.9, h: 0.9, fill: { color: H.accent1 }, line: { color: H.accent1, width: 0 }, objectName: "sum" });
  T(s, "Σ", { x: sx, y: sy - 0.45, w: 0.9, h: 0.9, fontSize: 28, bold: true, color: C.background1, align: "center", valign: "middle" });
  seg(s, sx + 0.9, sy, sx + 1.4, sy, { width: 2 });
  T(s, "rₜ", { x: sx + 1.45, y: sy - 0.25, w: 0.5, h: 0.5, fontSize: 20, bold: true, color: RED, valign: "middle" });
  tbl(s, [["Input", "value", "× w", "="], ["Stage (PROBLEM)", "0.50", "0.60", "0.30"], ["Repetition", "0.70", "0.20", "0.14"], ["Phoneme", "0.60", "0.10", "0.06"], ["Urgency (u = 2)", "0.50", "0.10", "0.05"], ["Raw risk rₜ", "", "", "0.55"]],
    { pos: { x: 5.3, y: 2.0, w: 4.3, colW: [1.75, 0.85, 0.85, 0.85], rowH: 0.42 }, align: ["left", "center", "center", "center"], fontSize: 14 });
  T(s, "illustrative values", { x: 5.3, y: 4.55, w: 4.3, h: 0.3, fontSize: 11, italic: true, color: GREY, align: "right" });
  eq(s, "fusegen", 0.4, 5.05, { cw: 9.2, maxW: 9.0, maxH: 0.6 });
  T(s, "Weighted soft voting [21]: the stage gets the largest weight because it is the most reliable cue", { x: 0.4, y: 5.85, w: 9.2, h: 0.6, fontSize: 15, color: NAVY, align: "center" });
}
{
  const R = (rs) => { let r = 0; return rs.map((x) => +(r = 0.7 * r + 0.3 * x).toFixed(3)); };
  const sus = R(Array(8).fill(0.8));
  const spike = R([0.1, 0.1, 1.0, 0.1, 0.1, 0.1, 0.1, 0.1]);
  const s = slide("Smoothing Over Time: EMA",
    "One noisy window should not raise an alarm. So we smooth the raw risk with an exponential moving average: 70 percent of the previous running risk plus 30 percent of the new raw risk. Unrolled, it is a weighted sum of all past windows with weights that shrink geometrically; it remembers roughly the last 3.3 windows, about 13 seconds. The chart shows the effect. A single spike to 1.0 only lifts the running risk to 0.34, which is MODERATE, and then it fades. A call that is consistently suspicious, at 0.8 per window, crosses the 0.60 scam-alert line after four windows, 16 seconds.");
  eq(s, "ema", 0.4, 1.2, { cw: 9.2, maxH: 0.5 });
  eq(s, "emaunroll", 0.4, 1.8, { cw: 4.6, maxW: 4.5, maxH: 0.65 });
  eq(s, "emamem", 5.0, 1.8, { cw: 4.6, maxW: 4.5, maxH: 0.65 });
  const labels = sus.map((_, i) => String(i + 1));
  s.addChart(pres.charts.LINE, [
    { name: "Sustained scam (rₜ = 0.8)", labels, values: sus },
    { name: "Single noisy spike", labels, values: spike },
    { name: "SCAM ALERT line (0.60)", labels, values: Array(8).fill(0.6) },
  ], {
    x: 0.4, y: 2.6, w: 9.2, h: 3.7, chartColors: [H.accent2, H.accent1, "7F7F7F"], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 12, catAxisLabelColor: H.dk1, valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 12, valAxisLabelColor: H.dk1,
    valAxisMinVal: 0, valAxisMaxVal: 1, valAxisMajorUnit: 0.2, valAxisLabelFormatCode: "0.0", valGridLine: { color: H.accent5, size: 0.5 }, catGridLine: { style: "none" },
    showCatAxisTitle: true, catAxisTitle: "window (4 s each)", catAxisTitleFontFace: "+mn-lt", catAxisTitleFontSize: 12, catAxisTitleColor: H.dk1,
    showValAxisTitle: true, valAxisTitle: "running risk Rₜ", valAxisTitleFontFace: "+mn-lt", valAxisTitleFontSize: 12, valAxisTitleColor: H.dk1,
    showLegend: true, legendPos: "t", legendFontFace: "+mn-lt", legendFontSize: 12, legendColor: H.dk1,
  });
  T(s, `Spike → only ${spike[2].toFixed(2)} (MODERATE), then fades · Sustained scam crosses 0.60 at window 4 (16 s) · [22]`, { x: 0.4, y: 6.4, w: 9.2, h: 0.4, fontSize: 14, bold: true, color: NAVY, align: "center" });
}
{
  const s = slide("Risk Levels and Real-Time Execution",
    "The running risk is mapped to five labels using these cut-offs from our server: below 0.15 safe, up to 0.25 low, up to 0.45 moderate, up to 0.60 high, and above 0.60 scam alert. To stay real-time, the four models run at the same time in a thread pool with four workers. So the time per window is the slowest model, not the sum of all four, and the answer is ready before the next 4-second chunk arrives. Bar lengths here are illustrative.");
  const segs = [["SAFE", 0.15, "2E7D32", "FFFFFF"], ["LOW", 0.10, "FFC000", "000000"], ["MODERATE", 0.20, "ED7D31", "FFFFFF"], ["HIGH", 0.15, "C00000", "FFFFFF"], ["SCAM ALERT", 0.40, "7B0000", "FFFFFF"]];
  let x = 0.5;
  const ticks = [0, 0.15, 0.25, 0.45, 0.6, 1.0];
  segs.forEach(([n, w, f, tc]) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.4, w: w * 9, h: 0.7, fill: { color: f }, line: { color: "FFFFFF", width: 1 } });
    T(s, n, { x, y: 1.4, w: w * 9, h: 0.7, fontSize: 14, bold: true, color: tc, align: "center", valign: "middle" });
    x += w * 9;
  });
  ticks.forEach((t) => T(s, t.toFixed(2).replace(/0$/, "").replace(/\.$/, ".0"), { x: 0.5 + t * 9 - 0.35, y: 2.15, w: 0.7, h: 0.3, fontSize: 13, color: GREY, align: "center" }));
  T(s, "running risk Rₜ", { x: 3.5, y: 2.45, w: 3, h: 0.3, fontSize: 13, italic: true, color: GREY, align: "center" });
  const names = ["Stage (Whisper)", "Repetition", "Phoneme", "Urgency"];
  const lens = [2.2, 1.0, 0.7, 0.5];
  const cols = [H.dk2, H.accent1, "2E75B6", "9DC3E6"];
  T(s, "Sequential: time = sum", { x: 0.5, y: 2.95, w: 5, h: 0.35, fontSize: 15, bold: true, color: GREY });
  let sx = 2.2;
  lens.forEach((l, i) => { s.addShape(pres.shapes.RECTANGLE, { x: sx, y: 3.35, w: l, h: 0.32, fill: { color: cols[i] }, line: { color: "FFFFFF", width: 1 } }); sx += l; });
  T(s, "Parallel, 4 workers: time = max", { x: 0.5, y: 3.85, w: 5, h: 0.35, fontSize: 15, bold: true, color: BLUE });
  lens.forEach((l, i) => {
    const y = 4.25 + i * 0.4;
    T(s, names[i], { x: 0.4, y, w: 1.7, h: 0.32, fontSize: 12, color: C.text1, align: "right", valign: "middle" });
    s.addShape(pres.shapes.RECTANGLE, { x: 2.2, y, w: l, h: 0.32, fill: { color: cols[i] }, line: { color: "FFFFFF", width: 0 } });
  });
  seg(s, 2.2 + 2.2, 3.3, 2.2 + 2.2, 5.85, { color: H.accent1, width: 1.5, dash: "dash", arrow: false });
  seg(s, 2.2 + 4.4, 3.3, 2.2 + 4.4, 5.85, { color: H.accent4, width: 1.5, dash: "dash", arrow: false });
  T(s, "done", { x: 4.0, y: 5.85, w: 0.8, h: 0.3, fontSize: 12, bold: true, color: BLUE, align: "center" });
  T(s, "done", { x: 6.2, y: 5.85, w: 0.8, h: 0.3, fontSize: 12, bold: true, color: GREY, align: "center" });
  eq(s, "parallel", 0.4, 6.25, { cw: 9.2, maxH: 0.55 });
}

// ================================================================ 27–33 Results & discussion
section("Results and Discussion", "Does it work, and where are its limits?", "Now, how well does it work?");
{
  const s = slide("Dataset and Evaluation Setup",
    "There is no public dataset of real-time scam calls, so we built our own, one part per model, and released it. The phoneme and urgency models used about 28 minutes of scam and 23 minutes of normal speech in 4-second windows. The repetition CNN used about 80 clips for each of 15 fraud keywords, plus 800 to 900 negative clips with noise and other speech. For evaluation we played 16 full calls, 7 normal and 9 scam, through exactly the same pipeline as live use, window by window. The prediction for a call is its final running risk.");
  T(s, "Training data (built by us, public)", { x: 0.4, y: 1.3, w: 5, h: 0.4, fontSize: 18, bold: true, color: BLUE });
  T(s, arrows(["No public real-time scam-call dataset exists", "Phoneme & urgency: ≈ 28 min scam + ≈ 23 min normal", "Repetition: ≈ 80 clips × 15 keywords + 800–900 negatives", "Stage model: intent example sentences"], { gap: 10 }), { x: 0.4, y: 1.85, w: 4.9, h: 4.6, fontSize: 16 });
  const st = [["16", "full calls: 7 normal, 9 scam"], ["Same", "pipeline as live deployment"], ["Final Rₜ", "of each call = its score"]];
  st.forEach(([n, l], i) => {
    const y = 1.4 + i * 1.7;
    box(s, 5.6, y, 4.0, 1.45, TINT, "ev" + i);
    T(s, n, { x: 5.75, y, w: 1.75, h: 1.45, fontSize: 30, bold: true, color: NAVY, valign: "middle", align: "center" });
    T(s, l, { x: 7.55, y, w: 1.95, h: 1.45, fontSize: 15, valign: "middle" });
  });
}
{
  const s = slide("From Confusion Matrix to Metrics",
    "The confusion matrix at threshold 0.40. Of 9 scam calls, 7 were caught: true positives. 2 were missed: false negatives. Of 7 normal calls, 6 were correct and 1 was a false alarm. From these four numbers: accuracy is 13 out of 16, 81.25 percent. Precision for the scam class is 7 out of 8, 0.875: when we raise an alarm we are usually right, which matters for user trust. Recall is 7 out of 9. F1, the harmonic mean of precision and recall, is 0.824.");
  s.addImage({ path: path.join(__dirname, "cm.png"), x: 0.35, y: 1.35, w: 4.35, h: 3.61, altText: "Confusion matrix: 6 normal correct, 1 false alarm, 2 scams missed, 7 scams caught" });
  ["acc", "prec", "rec", "f1"].forEach((e, i) => eq(s, e, 4.85, 1.45 + i * 0.92, { maxW: 4.8, maxH: 0.78 }));
  box(s, 0.4, 5.2, 9.2, 1.4, TINT, "legend");
  T(s, arrows(["TP = 7 caught · FN = 2 missed · FP = 1 false alarm · TN = 6", "**High precision** → few false alarms → users keep trusting the alert"], { gap: 6 }), { x: 0.6, y: 5.35, w: 8.8, h: 1.2, fontSize: 16 });
}
{
  const s = slide("ROC Curve, AUC and the Threshold",
    "The ROC curve plots true-positive rate against false-positive rate as the threshold moves. The area under it, 0.873, has a simple meaning: pick a random scam call and a random normal call, and 87 percent of the time the scam call gets the higher risk score. It does not depend on any threshold. Youden's J, TPR minus FPR, is highest at 0.279, where all 9 scams are caught with the same single false alarm. But that threshold is tuned on the same 16 calls, so it would be optimistic. We report the stricter 0.40.");
  s.addImage({ path: path.join(__dirname, "roc.png"), x: 0.35, y: 1.3, w: 4.35, h: 3.64, altText: "ROC curve with AUC 0.873" });
  eq(s, "tprfpr", 4.9, 1.35, { maxW: 4.7, maxH: 0.7 });
  eq(s, "youden", 4.9, 2.2, { maxW: 4.7, maxH: 0.45 });
  tbl(s, [["Threshold", "TPR", "FPR", "J"], ["0.279 (max J)", "1.000", "0.143", "0.857"], ["0.40 (reported)", "0.778", "0.143", "0.635"]],
    { pos: { x: 4.9, y: 2.85, w: 4.7, colW: [1.85, 0.95, 0.95, 0.95], rowH: 0.42 }, align: ["left", "center", "center", "center"], fontSize: 14 });
  T(s, "0.279 is tuned on the same 16 calls, so we report the stricter 0.40.", { x: 4.9, y: 4.2, w: 4.7, h: 0.75, fontSize: 14, italic: true, color: NAVY });
  T(s, "AUC = chance a random scam call scores higher than a random normal call [23], [24]", { x: 0.4, y: 5.15, w: 9.2, h: 0.35, fontSize: 15, bold: true, color: BLUE, align: "center" });
  eq(s, "auc", 0.4, 5.6, { cw: 9.2, maxW: 9.0, maxH: 1.0 });
}
{
  const s = slide("Results and Ablation Study",
    "The headline numbers: 81.25 percent accuracy, weighted F1 of 0.813, ROC-AUC of 0.873 and scam precision of 0.875. The ablation answers whether every model earns its place. The stage model alone gives 75 percent. Adding the phoneme CNN gives 77.5, prosody 79.4, and the full system with repetition 81.25. Accuracy rises at every step: no module is dead weight, and the stage model alone is already a strong baseline, which supports our main idea.");
  const k = [["81.25%", "Accuracy"], ["0.813", "Weighted F1"], ["0.873", "ROC-AUC"], ["0.875", "Scam precision"]];
  k.forEach(([n, l], i) => {
    const x = 0.4 + i * 2.33;
    box(s, x, 1.3, 2.13, 1.25, TINT, "kpi" + i);
    T(s, n, { x, y: 1.35, w: 2.13, h: 0.75, fontSize: 30, bold: true, color: NAVY, align: "center", valign: "middle" });
    T(s, l, { x, y: 2.1, w: 2.13, h: 0.35, fontSize: 14, color: GREY, align: "center" });
  });
  s.addChart(pres.charts.BAR, [{ name: "Accuracy (%)", labels: ["Stage only", "+ Phoneme", "+ Prosody", "Full"], values: [75.0, 77.5, 79.38, 81.25] }], {
    x: 0.4, y: 2.8, w: 5.6, h: 3.9, barDir: "col", chartColors: ["7F7F7F", "7F7F7F", "7F7F7F", H.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00",
    dataLabelFontFace: "+mn-lt", dataLabelFontSize: 12, dataLabelColor: H.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 12, catAxisLabelColor: H.dk1,
    valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 12, valAxisLabelColor: H.dk1, valAxisMinVal: 70, valAxisMaxVal: 85, valAxisMajorUnit: 5,
    valGridLine: { color: H.accent5, size: 0.5 }, catGridLine: { style: "none" }, showLegend: false,
    showTitle: true, title: "Ablation: accuracy (%), axis from 70", titleFontFace: "+mn-lt", titleFontSize: 13, titleColor: H.dk1,
  });
  box(s, 6.2, 2.9, 3.4, 3.7, TINT, "take");
  T(s, "Take-aways", { x: 6.4, y: 3.05, w: 3.0, h: 0.4, fontSize: 17, bold: true, color: BLUE });
  T(s, arrows(["Stage alone: already 75%", "Every module adds accuracy", "Full ensemble: +6.25 points"], { gap: 10 }), { x: 6.4, y: 3.6, w: 3.0, h: 2.9, fontSize: 16 });
}
{
  const s = slide("Strengths and Limitations",
    "Strengths first: the system understands intent rather than keywords, gives a risk every 4 seconds during the call, uses four modalities that back each other up, keeps false alarms low thanks to smoothing, and is a complete open system. We are open about the limits too. The test set has 16 calls because no public real-time dataset exists; this paper is a proof of concept, evaluated with the exact live pipeline. Whisper can mis-hear noisy audio, but three acoustic models and the EMA soften single errors. Urgency thresholds are hand-set, which keeps them explainable; learning them is next. And the server needs internet; on-device models are the next step.");
  box(s, 0.4, 1.3, 4.5, 5.4, TINT, "str");
  T(s, "Strengths", { x: 0.6, y: 1.4, w: 4.1, h: 0.45, fontSize: 19, bold: true, color: BLUE });
  T(s, arrows(["Understands **intent**, not keywords", "Live risk **every 4 s**", "Four modalities back each other up", "EMA → few false alarms (87.5% precision)", "Complete, **open** system"], { gap: 10 }), { x: 0.6, y: 1.95, w: 4.15, h: 4.6, fontSize: 15 });
  box(s, 5.1, 1.3, 4.5, 5.4, "FFFFFF", "lim");
  T(s, "Limitations → our answer", { x: 5.3, y: 1.4, w: 4.1, h: 0.45, fontSize: 19, bold: true, color: RED });
  T(s, arrows(["16 test calls → proof of concept; no public dataset exists", "Whisper errors on noise → 3 acoustic models + EMA", "Hand-set urgency thresholds → explainable; learn next", "Needs internet → on-device models next"], { gap: 10 }), { x: 5.3, y: 1.95, w: 4.15, h: 4.6, fontSize: 15 });
}
{
  const s = slide("Conclusion and Future Work",
    "To conclude: scam calls follow a script, and tracking its stage live reveals the caller's intent. Four models, phoneme, prosody, repetition and stage, are fused with fixed weights and smoothed over time to give a stable live risk score: 81.25 percent accuracy and 0.873 ROC-AUC, with every module contributing. Next we want a larger multilingual dataset, on-device inference, learned fusion weights and integration with telecom operators. Thank you, I am happy to take questions.");
  T(s, arrows(["Scam calls follow a script; its **stage** reveals intent", "Four models + **weighted fusion** + **EMA** → stable live risk", "**81.25%** accuracy · **0.873** ROC-AUC · every module helps"], { gap: 12 }), { x: 0.5, y: 1.35, w: 9.0, h: 2.5, fontSize: 19 });
  T(s, "Future work", { x: 0.5, y: 3.9, w: 9, h: 0.4, fontSize: 19, bold: true, color: BLUE });
  T(s, arrows(["Larger multilingual dataset · on-device inference", "Learned fusion weights · telecom integration"], { gap: 8 }), { x: 0.5, y: 4.4, w: 9.0, h: 1.2, fontSize: 18 });
  T(s, "Thank you · Questions?", { x: 0.5, y: 5.85, w: 9.0, h: 0.9, fontFace: "Arial", fontSize: 34, bold: true, color: RED, align: "center", valign: "middle", shadow: titleShadow() });
}

// ================================================================ References
SEC = "References"; pres.addSection({ title: SEC });
const REFS = [
  "R. S. S. Kumar et al., “Scam calls detection using machine learning approaches,” in Proc. IEEE Int. Conf. Advanced Machine Learning and Artificial Intelligence, 2023, pp. 1–6.",
  "M. Young and A. West, “Evaluating the limitations of rule-based fraud detection systems,” J. Telecommunication Security, vol. 14, no. 3, pp. 112–120, 2019.",
  "N. Hidayati, M. I. Herdiansyah, and A. S. R. M. Sinaga, “Fraud detection call detail record using machine learning in telecommunications company,” Adv. Sci. Technol. Eng. Syst. J., vol. 5, no. 4, pp. 9–16, 2020.",
  "X. Yin, Y. Li, and Z. Chen, “Temporal pattern recognition in fraudulent call detection using dynamic time warping,” IEEE Access, vol. 8, pp. 45012–45022, 2020.",
  "B. Hong, T. Connie, T. S. Ong, and A. B. J. Teoh, “Classifying scam calls through content analysis with dynamic sparsity top-k attention regularization,” IEEE Access, vol. 13, pp. 111733–111751, 2025.",
  "I. Wood, M. Kepkowski, L. Zinatullin, T. Darnley, and M. A. Kaafar, “An analysis of scam baiting calls: Identifying and extracting scam stages and scripts,” arXiv:2307.01965, 2023.",
  "S. Davis and P. Mermelstein, “Comparison of parametric representations for monosyllabic word recognition in continuously spoken sentences,” IEEE Trans. ASSP, vol. 28, no. 4, pp. 357–366, 1980.",
  "S. S. Stevens, J. Volkmann, and E. B. Newman, “A scale for the measurement of the psychological magnitude pitch,” J. Acoust. Soc. Am., vol. 8, no. 3, pp. 185–190, 1937.",
  "S. Furui, “Speaker-independent isolated word recognition using dynamic features of speech spectrum,” IEEE Trans. ASSP, vol. 34, no. 1, pp. 52–59, 1986.",
  "Y. LeCun, L. Bottou, Y. Bengio, and P. Haffner, “Gradient-based learning applied to document recognition,” Proc. IEEE, vol. 86, no. 11, pp. 2278–2324, 1998.",
  "V. Nair and G. E. Hinton, “Rectified linear units improve restricted Boltzmann machines,” in Proc. ICML, 2010, pp. 807–814.",
  "S. Ioffe and C. Szegedy, “Batch normalization: Accelerating deep network training by reducing internal covariate shift,” in Proc. ICML, 2015, pp. 448–456.",
  "N. Srivastava, G. Hinton, A. Krizhevsky, I. Sutskever, and R. Salakhutdinov, “Dropout: A simple way to prevent neural networks from overfitting,” JMLR, vol. 15, pp. 1929–1958, 2014.",
  "M. Lin, Q. Chen, and S. Yan, “Network in network,” in Proc. ICLR, 2014.",
  "D. P. Kingma and J. Ba, “Adam: A method for stochastic optimization,” in Proc. ICLR, 2015.",
  "T. N. Sainath and C. Parada, “Convolutional neural networks for small-footprint keyword spotting,” in Proc. Interspeech, 2015, pp. 1478–1482.",
  "A. Vaswani et al., “Attention is all you need,” in Proc. NeurIPS, 2017, pp. 5998–6008.",
  "A. Radford, J. W. Kim, T. Xu, G. Brockman, C. McLeavey, and I. Sutskever, “Robust speech recognition via large-scale weak supervision,” in Proc. ICML, 2023, pp. 28492–28518.",
  "N. Reimers and I. Gurevych, “Sentence-BERT: Sentence embeddings using Siamese BERT-networks,” in Proc. EMNLP-IJCNLP, 2019, pp. 3982–3992.",
  "W. Wang, F. Wei, L. Dong, H. Bao, N. Yang, and M. Zhou, “MiniLM: Deep self-attention distillation for task-agnostic compression of pre-trained transformers,” in Proc. NeurIPS, 2020.",
  "J. Kittler, M. Hatef, R. P. W. Duin, and J. Matas, “On combining classifiers,” IEEE Trans. PAMI, vol. 20, no. 3, pp. 226–239, 1998.",
  "S. W. Roberts, “Control chart tests based on geometric moving averages,” Technometrics, vol. 1, no. 3, pp. 239–250, 1959.",
  "T. Fawcett, “An introduction to ROC analysis,” Pattern Recognition Letters, vol. 27, no. 8, pp. 861–874, 2006.",
  "W. J. Youden, “Index for rating diagnostic tests,” Cancer, vol. 3, no. 1, pp. 32–35, 1950.",
  "Google, “WebRTC voice activity detector (VAD),” WebRTC open-source project; used via the py-webrtcvad interface.",
];
[[0, 12], [12, 25]].forEach(([a, b], k) => {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: SEC });
  s.addText(`References (${k + 1}/2)`, { placeholder: "title" });
  const items = REFS.slice(a, b).map((r, i) => ({ text: `[${a + i + 1}]  ${r}`, options: { breakLine: i < b - a - 1, paraSpaceAfter: 5, indentLevel: 0 } }));
  T(s, items, { x: 0.45, y: 1.25, w: 9.1, h: 5.75, fontSize: 12 });
  s.addNotes(k ? "References continued: Transformers, Whisper, Sentence-BERT and MiniLM, classifier fusion, EMA, ROC analysis, Youden's index and the WebRTC VAD." : "References: related work, MFCC and Mel scale, deltas, and the CNN building blocks we use.");
});

(async () => {
  const out = path.join(__dirname, "Scam_Call_Detection_Presentation.pptx");
  await pres.writeFile({ fileName: out });
  // pptxgenjs emits an extra <a:pPr> after each run in a mixed-format paragraph (invalid OOXML,
  // and it cancels the bullet). Keep only the paragraph's first pPr.
  const JSZip = require("jszip");
  const zip = await JSZip.loadAsync(fs.readFileSync(out));
  for (const name of Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
    const xml = await zip.file(name).async("string");
    zip.file(name, xml.replace(/(<\/a:r>)<a:pPr(?:[^>]*\/>|[^>]*>[\s\S]*?<\/a:pPr>)/g, "$1"));
  }
  fs.writeFileSync(out, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  if (applyTheme) await applyTheme(out, THEME);
  console.log("wrote", out);
})();
