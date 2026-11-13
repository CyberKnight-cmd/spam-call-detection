// 8-slide version of the conference deck (same design as build.js)
// Build:  node build8.js   (needs pptxgenjs + jszip; run `python make_assets.py` first)
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const APPLY_THEME = process.env.APPLY_THEME_JS;
const { applyTheme } = APPLY_THEME ? require(APPLY_THEME) : { applyTheme: null };

const A = (p) => path.join(__dirname, "assets", p);
const EQ = JSON.parse(fs.readFileSync(A("eq/sizes.json"), "utf8"));
const THEME = {
  name: "Lecture Blue", headFontFace: "Calibri", bodyFontFace: "Calibri",
  colors: { dk1: "000000", lt1: "FFFFFF", dk2: "002060", lt2: "DEEBF7", accent1: "0070C0", accent2: "C00000", accent3: "2E7D32", accent4: "595959", accent5: "BDD7EE", accent6: "ED7D31", hlink: "0563C1", folHlink: "954F72" },
};
const H = THEME.colors;
const pres = new pptxgen();
pres.layout = "LAYOUT_4x3";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Real-Time Multimodal Detection of Fraud and Scam Calls (8 slides)";
pres.author = "Subhalaxmi Chakraborty, Krishna Kumar Jha, Pritam Paul, Arya Gupta, Srijan Sarkar, Shinjan Saha";
const C = pres.SchemeColor;
const BLUE = C.accent1, NAVY = C.text2, RED = C.accent2, GREY = C.accent4, TINT = C.background2, EDGE = C.accent5;
const titleShadow = () => ({ type: "outer", angle: 45, blur: 3, offset: 2, color: "000000", opacity: 0.45 });

pres.defineSlideMaster({
  title: "CONTENT", background: { color: "FFFFFF" },
  objects: [
    { rect: { x: 0, y: 0, w: 10, h: 1.03, fill: { color: H.accent1 } } },
    { image: { x: 0, y: 0, w: 0.82, h: 1.03, path: A("tile.png") } },
    { placeholder: { options: { name: "title", type: "title", x: 0.95, y: 0.08, w: 8.9, h: 0.87, fontSize: 28, bold: true, color: C.background1, align: "center", valign: "middle", charSpacing: 1, shadow: titleShadow(), margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 4.5, y: 7.12, w: 1.0, h: 0.28, fontSize: 10, bold: true, color: H.dk2, align: "center" },
});

// ---------------------------------------------------------------- helpers
const T = (s, text, o = {}) => s.addText(text, Object.assign({ isTextBox: true, fontSize: 13, color: C.text1, valign: "top", margin: 0 }, o));
const runs = (str) => str.split("**").map((p, i) => ({ text: p, options: i % 2 ? { bold: true, color: BLUE } : {} })).filter((r) => r.text.length);
const arrows = (items, gap = 5) => {
  const out = [];
  items.forEach((it, i) => {
    const rs = runs(it);
    Object.assign(rs[0].options, { bullet: { code: "27A2" }, paraSpaceAfter: gap });
    rs[rs.length - 1].options.breakLine = i < items.length - 1;
    out.push(...rs);
  });
  return out;
};
const box = (s, x, y, w, h, fill = TINT) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.05, fill: { color: fill }, line: { color: EDGE, width: 1 } });
const panel = (s, x, y, w, h, title, fill = TINT, color = BLUE) => { box(s, x, y, w, h, fill); T(s, title, { x: x + 0.15, y: y + 0.07, w: w - 0.3, h: 0.32, fontSize: 14, bold: true, color }); };
const eq = (s, name, x, y, o = {}) => {
  let [w, h] = EQ[name];
  const sc = Math.min(o.scale ?? 1, o.maxW ? o.maxW / w : 9, o.maxH ? o.maxH / h : 9);
  w *= sc; h *= sc;
  if (o.cw) x += (o.cw - w) / 2;
  s.addImage({ path: A(`eq/${name}.png`), x, y, w, h, altText: `Equation: ${name}` });
  return h;
};
const seg = (s, x1, y1, x2, y2, o = {}) => s.addShape(pres.shapes.LINE, {
  x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001), flipH: x2 < x1, flipV: y2 < y1,
  line: { color: o.color || H.accent4, width: o.width || 1.25, endArrowType: o.arrow === false ? undefined : "triangle", dashType: o.dash },
});
const rarrow = (s, x, y, w = 0.16, h = 0.2) => s.addShape(pres.shapes.RIGHT_ARROW, { x, y, w, h, fill: { color: H.accent4 }, line: { color: H.accent4, width: 0 } });
const solid = (s, x, y, w, h, fill, text, o = {}) => {
  s.addShape(o.oval ? pres.shapes.OVAL : pres.shapes.ROUNDED_RECTANGLE, Object.assign({ x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 } }, o.oval ? {} : { rectRadius: 0.05 }));
  T(s, text, { x: x - 0.03, y, w: w + 0.06, h, fontSize: o.fontSize || 11, bold: true, color: o.color || C.background1, align: "center", valign: "middle" });
};
const tbl = (s, rows, o) => s.addTable(rows.map((r, i) => r.map((c, j) => ({
  text: c, options: { bold: i === 0 || j === 0, color: i === 0 ? C.background1 : (j === 0 ? NAVY : C.text1), fill: { color: i === 0 ? H.accent1 : (i % 2 ? "FFFFFF" : H.lt2) }, fontSize: o.fontSize || 12, align: (o.align && o.align[j]) || "left", valign: "middle" },
}))), Object.assign({ border: { type: "solid", pt: 0.75, color: H.accent5 }, margin: 0.04 }, o.pos));
const slide = (title, notes) => { const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Talk" }); s.addText(title, { placeholder: "title" }); s.addNotes(notes); return s; };
pres.addSection({ title: "Talk" });

// ================================================================ 1. Title
{
  const s = pres.addSlide({ sectionTitle: "Talk" });
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
  s.addNotes("Good morning. Our paper detects scam phone calls while the call is still happening. In the next seven slides: the problem and our key idea, the framework, our four models with their maths, how we combine them, the results, and our conclusions.");
}

// ================================================================ 2. Problem and key idea
{
  const s = slide("Problem and Key Idea",
    "A scam call is social engineering: nothing is hacked, a person is persuaded to give an OTP, bank details or money, and the damage happens during the call. Earlier work uses blacklists and rules, which fail when numbers change; statistics of call records, which never listen to the conversation; or transcript analysis, usually after the call ends. Our key observation, supported by Wood et al., is that scam calls follow a script in a fixed order: greeting, a claim of authority, a made-up problem, pressure, and the request for data. Each step is more dangerous, and we give each a risk value from 0.10 to 0.95. If we track the step live, we know the danger. Our four contributions are listed at the bottom.");
  T(s, arrows(["**Social engineering:** the caller persuades; nothing is hacked", "**Damage happens during the call**, so the warning must too", "**Prior work:** blacklists [1], [2]; call records [3], [4]; transcripts after the call [5]"], 5), { x: 0.4, y: 1.2, w: 5.3, h: 1.6, fontSize: 13 });
  const st = [["Greeting", "0.10"], ["Authority", "0.25"], ["Problem", "0.50"], ["Urgency", "0.70"], ["Data request", "0.95"]];
  st.forEach(([n, r], i) => {
    const x = 0.55 + i * 1.82, y = 3.95 - i * 0.4;
    solid(s, x, y, 1.62, 0.62, i === 4 ? H.accent2 : H.accent1, [{ text: n, options: { breakLine: true } }, { text: "R = " + r, options: { fontSize: 11 } }], { fontSize: 13 });
  });
  seg(s, 0.4, 4.65, 0.4, 2.6, { color: H.accent2, width: 2 });
  T(s, "risk", { x: 0.45, y: 2.6, w: 0.6, h: 0.3, fontSize: 12, bold: true, color: RED });
  T(s, "Scam calls follow a fixed script [6]: know the stage → know the danger", { x: 0.4, y: 4.7, w: 9.2, h: 0.35, fontSize: 14, bold: true, color: NAVY, align: "center" });
  const c = [["1", "Conversation-stage", "modelling, live"], ["2", "Four-model", "ensemble"], ["3", "Weighted fusion", "+ EMA smoothing"], ["4", "Working open system", "app + server + code"]];
  c.forEach(([n, a, b], i) => {
    const x = 0.4 + i * 2.33;
    box(s, x, 5.25, 2.15, 1.6);
    solid(s, x + 0.8, 5.35, 0.55, 0.55, H.accent1, n, { oval: true, fontSize: 16 });
    T(s, [{ text: a, options: { bold: true, color: NAVY, breakLine: true } }, { text: b }], { x: x + 0.1, y: 6.0, w: 1.95, h: 0.75, fontSize: 13, align: "center" });
  });
}

// ================================================================ 3. Framework
{
  const s = slide("Framework: From Audio to Features",
    "Every 4 seconds the Android app sends 16 kHz audio to our FastAPI server over a WebSocket. Four models run in parallel and their scores are fused with the weights shown, smoothed, and a label goes back to the phone. Step one cleans each window. Voice activity detection compares, for each 30 ms frame, the likelihood under a speech model and a noise model; windows with under a second of speech are skipped. The RMS energy of each frame then picks out the dominant speaker: runs of at least 1.2 seconds above 0.6 times the mean energy. Step two turns sound into MFCCs: FFT, Mel filterbank that mimics the ear, log, and a DCT, shown here for a real scam call from our dataset. With first and second derivatives this gives the 370 by 120 input of the phoneme CNN.");
  const mid = 2.33;
  solid(s, 0.3, mid - 0.47, 1.35, 0.94, H.accent1, [{ text: "Android app", options: { breakLine: true } }, { text: "4-s audio, 16 kHz", options: { fontSize: 10 } }], { fontSize: 13 });
  solid(s, 1.95, mid - 0.47, 1.35, 0.94, H.accent1, [{ text: "Preprocess", options: { breakLine: true } }, { text: "VAD + speaker", options: { fontSize: 10 } }], { fontSize: 13 });
  solid(s, 6.6, mid - 0.47, 1.4, 0.94, H.dk2, [{ text: "Fusion + EMA", options: { breakLine: true } }, { text: "one risk score", options: { fontSize: 10 } }], { fontSize: 13 });
  solid(s, 8.35, mid - 0.47, 1.3, 0.94, H.accent2, [{ text: "Risk label", options: { breakLine: true } }, { text: "5 levels", options: { fontSize: 10 } }], { fontSize: 13 });
  seg(s, 1.65, mid, 1.95, mid, { width: 1.75 });
  seg(s, 8.0, mid, 8.35, mid, { width: 1.75 });
  ["① Phoneme CNN · w = 0.10", "② Prosody / urgency · w = 0.10", "③ Repetition CNN · w = 0.20", "④ Stage model · w = 0.60"].forEach((m, i) => {
    const y = 1.2 + i * 0.58, yc = y + 0.24;
    box(s, 3.7, y, 2.55, 0.48);
    T(s, m, { x: 3.75, y, w: 2.45, h: 0.48, fontSize: 11.5, bold: true, color: NAVY, align: "center", valign: "middle" });
    seg(s, 3.3, mid, 3.7, yc);
    seg(s, 6.25, yc, 6.6, mid);
  });
  panel(s, 0.4, 3.7, 4.5, 3.25, "Step 1 · Cleaning each window");
  eq(s, "vad", 0.55, 4.12, { cw: 4.2, maxW: 4.0, maxH: 0.6 });
  T(s, "Voice activity [7]: 30 ms frames · skip window if speech < 1 s", { x: 0.55, y: 4.8, w: 4.2, h: 0.3, fontSize: 11.5, color: GREY, align: "center" });
  eq(s, "rms", 0.55, 5.15, { cw: 4.2, maxH: 0.72 });
  eq(s, "dom", 0.55, 5.98, { cw: 4.2, maxH: 0.34 });
  T(s, "dominant speaker: runs ≥ 1.2 s", { x: 0.55, y: 6.42, w: 4.2, h: 0.3, fontSize: 11.5, color: GREY, align: "center" });
  panel(s, 5.1, 3.7, 4.5, 3.25, "Step 2 · MFCC: FFT → Mel → log → DCT [8]");
  s.addImage({ path: A("mfcc.png"), x: 5.45, y: 4.08, w: 3.8, h: 1.95, altText: "Waveform of a 4-second scam window and its 40 MFCCs" });
  eq(s, "dct", 5.25, 6.05, { cw: 4.2, maxW: 4.1, maxH: 0.5 });
  T(s, "40 MFCC + Δ + ΔΔ [9] → input 370 × 120", { x: 5.25, y: 6.6, w: 4.2, h: 0.28, fontSize: 11.5, bold: true, color: NAVY, align: "center" });
}

// ================================================================ 4. Acoustic models (CNNs)
{
  const s = slide("Acoustic Models: Two 1-D CNNs",
    "Models one and three are both 1-D convolutional networks with the same design, shown at the top. A convolution filter looks at K neighbouring 10 ms frames, multiplies by learned weights, adds a bias and applies ReLU, then slides along; the same weights at every position means a pattern is found wherever it occurs. Batch norm stabilises training, max-pooling halves the length, dropout prevents overfitting on our small data, and global average pooling gives a fixed-size vector before the sigmoid outputs a probability. The phoneme CNN takes the 370 by 120 MFCC matrix and has about 80,600 parameters; its receptive field of about 120 ms matches a phoneme. The repetition CNN splits the window into four 1-second segments and takes the maximum probability, because one scripted phrase anywhere is enough; it has about 17,200 parameters and follows the keyword-spotting CNN idea. Both are trained with binary cross-entropy and Adam.");
  const L = ["MFCC input", "Conv1D k=5 BN·ReLU", "MaxPool ÷2 Dropout", "Conv1D k=3 BN·ReLU", "MaxPool ÷2 Dropout", [{ text: "Global", options: { breakLine: true } }, { text: "avg pool" }], "Dense ReLU", "Sigmoid → p"];
  L.forEach((t, i) => {
    const x = 0.4 + i * 1.165;
    solid(s, x, 1.2, 0.98, 0.8, i === 0 ? H.accent4 : i === 7 ? H.accent2 : i % 2 ? H.accent1 : H.dk2, t, { fontSize: 11 });
    if (i < 7) rarrow(s, x + 0.985, 1.5, 0.17, 0.2);
  });
  tbl(s, [["", "Model 1 · Phoneme CNN", "Model 3 · Repetition CNN"],
    ["Input", "370 × 120 (MFCC + Δ + ΔΔ)", "4 segments × (470 × 40 MFCC)"],
    ["Filters", "64 (k = 5) → 128 (k = 3)", "32 (k = 5) → 64 (k = 3)"],
    ["Parameters", "≈ 80.6 k", "≈ 17.2 k"],
    ["Learns", "phoneme-scale sound (≈ 120 ms)", "scripted, repeated phrases [15]"],
    ["Output", "scam probability", "max of 4 segment probabilities"]],
  { pos: { x: 0.4, y: 2.2, w: 9.2, colW: [1.5, 3.85, 3.85], rowH: 0.36 }, fontSize: 12 });
  panel(s, 0.4, 4.55, 4.5, 2.4, "1-D convolution [10]");
  eq(s, "conv", 0.55, 4.98, { cw: 4.2, maxW: 4.15, maxH: 0.8 });
  T(s, arrows(["Same weights W at every time step", "BatchNorm [11] · Dropout [12] · GAP [13]"], 3), { x: 0.6, y: 5.95, w: 4.2, h: 0.9, fontSize: 12 });
  panel(s, 5.1, 4.55, 4.5, 2.4, "Segment max · training [14]");
  eq(s, "rep", 5.25, 4.98, { cw: 4.2, maxW: 4.1, maxH: 0.55 });
  eq(s, "bce", 5.25, 5.65, { cw: 4.2, maxW: 4.15, maxH: 0.6 });
  T(s, "Adam, η = 5×10⁻⁴ (phoneme) · 10⁻³ (repetition)", { x: 5.25, y: 6.42, w: 4.2, h: 0.3, fontSize: 12, color: GREY, align: "center" });
}

// ================================================================ 5. Prosody + stage models
{
  const s = slide("Prosody and Conversation-Stage Models",
    "Model two listens to how something is said. We measure five cues: pitch mean and variation, RMS loudness, spectral centroid, which rises with a sharp tense voice, and speech rate as onsets per second. Each cue fires if it exceeds the speaker baseline b by its factor lambda, for example 1.8 times for energy. We count the cues, cap at 3, and a lookup that grows faster than linear turns the count into a risk: one cue is weak evidence, three are strong. It needs no labelled data and is easy to explain. Model four understands what is being said. Whisper transcribes the window; MiniLM turns the text into a 384-dimensional meaning vector; cosine similarity, the cosine of the angle between two vectors, compares it with about twenty example sentences per stage. The best stage is accepted only above 0.55, and the stage can only move forward, so one innocent sentence cannot hide earlier pressure. Each stage maps to the risk value shown.");
  panel(s, 0.4, 1.2, 4.5, 5.75, "Model 2 · Urgency from prosody");
  tbl(s, [["Cue  fᵢ", "Factor λᵢ"], ["RMS energy", "1.8"], ["Pitch mean", "1.3"], ["Pitch variation", "1.5"], ["Speech rate", "1.5"], ["Spectral centroid", "1.25"]],
    { pos: { x: 0.6, y: 1.6, w: 4.1, colW: [2.9, 1.2], rowH: 0.3 }, align: ["left", "center"], fontSize: 12 });
  eq(s, "urg", 0.55, 3.55, { cw: 4.2, maxW: 4.0, maxH: 0.7 });
  eq(s, "urgmap", 0.55, 4.38, { cw: 4.2, maxW: 4.15 });
  s.addChart(pres.charts.BAR, [{ name: "g(u)", labels: ["u = 0", "u = 1", "u = 2", "u = 3"], values: [0, 0.2, 0.5, 0.9] }], {
    x: 0.6, y: 4.8, w: 4.1, h: 2.05, barDir: "col", chartColors: [H.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0",
    dataLabelFontFace: "+mn-lt", dataLabelFontSize: 11, dataLabelColor: H.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 11, catAxisLabelColor: H.dk1,
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 1.1, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
  });
  panel(s, 5.1, 1.2, 4.5, 5.75, "Model 4 · Conversation stage");
  [["Whisper [16]", "speech → text"], ["MiniLM [17], [18]", "text → ℝ³⁸⁴"], ["Cosine", "vs intent bank"]].forEach(([a, b], i) => {
    const x = 5.27 + i * 1.45;
    solid(s, x, 1.62, 1.22, 0.6, i === 2 ? H.dk2 : H.accent1, [{ text: a, options: { breakLine: true } }, { text: b, options: { fontSize: 10 } }], { fontSize: 11 });
    if (i < 2) rarrow(s, x + 1.23, 1.82, 0.2, 0.2);
  });
  eq(s, "cos", 5.25, 2.38, { cw: 4.2, maxW: 4.0, maxH: 0.62 });
  eq(s, "intent", 5.25, 3.12, { cw: 4.2, maxW: 4.15 });
  eq(s, "stage", 5.25, 3.58, { cw: 4.2, maxW: 4.15 });
  T(s, "otherwise unchanged: the stage only moves forward", { x: 5.25, y: 3.95, w: 4.2, h: 0.28, fontSize: 11.5, italic: true, color: GREY, align: "center" });
  const nm = ["None", "Greet", "Auth.", "Problem", "Urgency", "Data"], rk = ["0.05", "0.10", "0.25", "0.50", "0.70", "0.95"];
  const fl = ["7F7F7F", "2E75B6", "0070C0", "1F4E79", "C55A11", "C00000"];
  nm.forEach((n, i) => {
    const x = 5.3 + i * 0.72;
    solid(s, x, 4.45, 0.55, 0.55, fl[i], String(i), { oval: true, fontSize: 15 });
    if (i < 5) seg(s, x + 0.56, 4.725, x + 0.71, 4.725, { width: 1.25 });
    T(s, n, { x: x - 0.1, y: 5.05, w: 0.75, h: 0.25, fontSize: 10, bold: true, color: NAVY, align: "center" });
    T(s, rk[i], { x: x - 0.1, y: 5.3, w: 0.75, h: 0.25, fontSize: 10.5, bold: true, color: BLUE, align: "center" });
  });
  eq(s, "stagerisk", 5.25, 5.7, { cw: 4.2, maxH: 0.4 });
  T(s, "5 stages × ~20 example sentences · gate 0.55", { x: 5.25, y: 6.35, w: 4.2, h: 0.3, fontSize: 12, color: GREY, align: "center" });
}

// ================================================================ 6. Ensemble
{
  const R = (rs) => { let r = 0; return rs.map((x) => +(r = 0.7 * r + 0.3 * x).toFixed(3)); };
  const sus = R(Array(8).fill(0.8));
  const spike = R([0.1, 0.1, 1.0, 0.1, 0.1, 0.1, 0.1, 0.1]);
  const s = slide("Ensemble: Weighted Fusion and EMA",
    "The four scores, each between 0 and 1, are combined with a weighted sum, called late fusion or weighted soft voting. The weights add up to one, so the result stays between 0 and 1. The stage gets 0.60 because it is the most reliable cue and gave the largest gain in the ablation. In the example, a call at the PROBLEM stage with moderate acoustic scores gives a raw risk of 0.55 for this window. One noisy window should not raise an alarm, so we smooth with an exponential moving average: 70 percent of the previous running risk plus 30 percent of the new one, which remembers about 3 windows. The chart shows a single spike lifting the risk only to 0.34, moderate, and fading, while a consistently suspicious call crosses the 0.60 scam-alert line after four windows, 16 seconds. The running risk maps to the five labels on the right. The four models run in parallel, so each window finishes before the next arrives.");
  eq(s, "fuse", 0.4, 1.15, { cw: 9.2, maxW: 8.0, maxH: 0.45 });
  const ins = [["Stage", "0.60"], ["Repetition", "0.20"], ["Phoneme", "0.10"], ["Urgency", "0.10"]];
  const sx = 2.85, sy = 2.73;
  ins.forEach(([n, w], i) => {
    const y = 1.8 + i * 0.47, yc = y + 0.2;
    box(s, 0.4, y, 1.45, 0.4);
    T(s, n, { x: 0.4, y, w: 1.45, h: 0.4, fontSize: 12, bold: true, color: NAVY, align: "center", valign: "middle" });
    seg(s, 1.85, yc, sx, sy, { width: 1.25 });
    T(s, "×" + w, { x: 1.9, y: i < 2 ? yc - 0.26 : yc + 0.02, w: 0.6, h: 0.24, fontSize: 10.5, bold: true, color: BLUE });
  });
  solid(s, sx, sy - 0.35, 0.7, 0.7, H.accent1, "Σ", { oval: true, fontSize: 22 });
  seg(s, sx + 0.7, sy, sx + 1.1, sy, { width: 1.75 });
  T(s, "rₜ", { x: sx + 1.15, y: sy - 0.2, w: 0.4, h: 0.4, fontSize: 18, bold: true, color: RED, valign: "middle" });
  tbl(s, [["Input (illustrative)", "value", "× w", "="], ["Stage: PROBLEM", "0.50", "0.60", "0.30"], ["Repetition", "0.70", "0.20", "0.14"], ["Phoneme", "0.60", "0.10", "0.06"], ["Urgency (u = 2)", "0.50", "0.10", "0.05"], ["Raw risk rₜ", "", "", "0.55"]],
    { pos: { x: 4.75, y: 1.75, w: 4.85, colW: [2.2, 0.88, 0.88, 0.89], rowH: 0.3 }, align: ["left", "center", "center", "center"], fontSize: 12 });
  eq(s, "ema", 0.4, 3.72, { cw: 9.2, maxH: 0.42 });
  const labels = sus.map((_, i) => String(i + 1));
  s.addChart(pres.charts.LINE, [
    { name: "Sustained scam (rₜ = 0.8)", labels, values: sus },
    { name: "Single noisy spike", labels, values: spike },
    { name: "SCAM ALERT (0.60)", labels, values: Array(8).fill(0.6) },
  ], {
    x: 0.4, y: 4.2, w: 5.9, h: 2.8, chartColors: [H.accent2, H.accent1, "7F7F7F"], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 5,
    catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 10, catAxisLabelColor: H.dk1, valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 10, valAxisLabelColor: H.dk1,
    valAxisMinVal: 0, valAxisMaxVal: 1, valAxisMajorUnit: 0.2, valAxisLabelFormatCode: "0.0", valGridLine: { color: H.accent5, size: 0.5 }, catGridLine: { style: "none" },
    showCatAxisTitle: true, catAxisTitle: "window (4 s each) [20]", catAxisTitleFontFace: "+mn-lt", catAxisTitleFontSize: 10, catAxisTitleColor: H.dk1,
    showLegend: true, legendPos: "t", legendFontFace: "+mn-lt", legendFontSize: 10, legendColor: H.dk1,
  });
  T(s, "Risk label from Rₜ", { x: 6.55, y: 4.25, w: 3.0, h: 0.3, fontSize: 13, bold: true, color: BLUE });
  [["SAFE", "< 0.15", "2E7D32", "FFFFFF"], ["LOW", "< 0.25", "FFC000", "000000"], ["MODERATE", "< 0.45", "ED7D31", "FFFFFF"], ["HIGH", "< 0.60", "C00000", "FFFFFF"], ["SCAM ALERT", "≥ 0.60", "7B0000", "FFFFFF"]].forEach(([n, r, f, tc], i) => {
    const y = 4.62 + i * 0.44;
    s.addShape(pres.shapes.RECTANGLE, { x: 6.55, y, w: 3.05, h: 0.38, fill: { color: f }, line: { color: f, width: 0 } });
    T(s, n, { x: 6.65, y, w: 1.9, h: 0.38, fontSize: 12, bold: true, color: tc, valign: "middle" });
    T(s, r, { x: 8.5, y, w: 1.0, h: 0.38, fontSize: 12, bold: true, color: tc, valign: "middle", align: "right" });
  });
  T(s, "weighted soft voting [19]", { x: 2.45, y: 3.2, w: 2.2, h: 0.28, fontSize: 11, italic: true, color: GREY });
}

// ================================================================ 7. Results
{
  const s = slide("Results",
    "We evaluated 16 full calls, 7 normal and 9 scam, through exactly the live pipeline; a call's score is its final running risk. At threshold 0.40 we catch 7 of 9 scams with one false alarm: 81.25 percent accuracy, weighted F1 0.813, and precision 0.875, so when we warn we are usually right. The ROC-AUC of 0.873 means a random scam call scores higher than a random normal call 87 percent of the time, independent of any threshold. Youden's J, TPR minus FPR, peaks at 0.279, where all nine scams are caught with the same single false alarm, but that is tuned on these same 16 calls, so we report the stricter 0.40. The ablation shows the stage model alone at 75 percent, and accuracy rising with every added model to 81.25.");
  [["81.25%", "Accuracy"], ["0.813", "Weighted F1"], ["0.873", "ROC-AUC"], ["0.875", "Scam precision"]].forEach(([n, l], i) => {
    const x = 0.4 + i * 2.33;
    box(s, x, 1.15, 2.15, 0.92);
    T(s, n, { x, y: 1.17, w: 2.15, h: 0.55, fontSize: 24, bold: true, color: NAVY, align: "center", valign: "middle" });
    T(s, l, { x, y: 1.72, w: 2.15, h: 0.28, fontSize: 11.5, color: GREY, align: "center" });
  });
  s.addImage({ path: path.join(__dirname, "cm.png"), x: 0.4, y: 2.2, w: 3.0, h: 2.49, altText: "Confusion matrix: 6 normal correct, 1 false alarm, 2 scams missed, 7 scams caught" });
  ["prec", "rec", "f1"].forEach((e, i) => eq(s, e, 3.5, 2.35 + i * 0.78, { cw: 3.0, maxW: 2.95, maxH: 0.66 }));
  s.addImage({ path: path.join(__dirname, "roc.png"), x: 6.6, y: 2.2, w: 3.0, h: 2.51, altText: "ROC curve, AUC 0.873" });
  s.addChart(pres.charts.BAR, [{ name: "Accuracy (%)", labels: ["Stage only", "+ Phoneme", "+ Prosody", "Full"], values: [75.0, 77.5, 79.38, 81.25] }], {
    x: 0.4, y: 4.82, w: 5.0, h: 2.18, barDir: "col", chartColors: ["7F7F7F", "7F7F7F", "7F7F7F", H.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00",
    dataLabelFontFace: "+mn-lt", dataLabelFontSize: 10, dataLabelColor: H.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 10, catAxisLabelColor: H.dk1,
    valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 9, valAxisLabelColor: H.dk1, valAxisMinVal: 70, valAxisMaxVal: 85, valAxisMajorUnit: 5,
    valGridLine: { color: H.accent5, size: 0.5 }, catGridLine: { style: "none" }, showLegend: false,
    showTitle: true, title: "Ablation: accuracy (%), axis from 70", titleFontFace: "+mn-lt", titleFontSize: 11, titleColor: H.dk1,
  });
  tbl(s, [["Threshold", "TPR", "FPR", "J"], ["0.279 (max J)", "1.000", "0.143", "0.857"], ["0.40 (reported)", "0.778", "0.143", "0.635"]],
    { pos: { x: 5.6, y: 4.9, w: 4.0, colW: [1.6, 0.8, 0.8, 0.8], rowH: 0.3 }, align: ["left", "center", "center", "center"], fontSize: 11.5 });
  eq(s, "youden", 5.6, 5.92, { cw: 4.0, maxH: 0.32 });
  T(s, "16 calls (7 normal, 9 scam), live pipeline. 0.279 is tuned on these calls, so we report 0.40 [21], [22].", { x: 5.6, y: 6.32, w: 4.0, h: 0.62, fontSize: 11, italic: true, color: NAVY });
}

// ================================================================ 8. Discussion, conclusion, references
{
  const s = slide("Discussion, Conclusion and References",
    "Strengths: the system understands intent, not just keywords; it gives a risk every 4 seconds during the call; four modalities back each other up; smoothing keeps false alarms low; and it is a complete open system. Limitations, with our answer: 16 test calls, because no public real-time dataset exists, so this is a proof of concept evaluated with the live pipeline; Whisper errors on noisy audio, softened by three acoustic models and the EMA; hand-set urgency thresholds, which keep it explainable and which we will learn from data next; and the need for internet, to be removed by on-device models. In short: tracking the scam script live, together with how the caller sounds, gives a stable real-time warning. Thank you; I am happy to take questions.");
  panel(s, 0.4, 1.15, 4.5, 1.95, "Strengths");
  T(s, arrows(["Understands **intent**, not keywords", "Live risk **every 4 s**", "Four modalities back each other up", "EMA → few false alarms (87.5% precision)", "Complete, **open** system"], 3), { x: 0.6, y: 1.52, w: 4.15, h: 1.55, fontSize: 12.5 });
  panel(s, 5.1, 1.15, 4.5, 1.95, "Limitations → our answer", "FFFFFF", RED);
  T(s, arrows(["16 test calls → proof of concept (no public dataset)", "Whisper noise errors → 3 acoustic models + EMA", "Hand-set thresholds → explainable; learn next", "Needs internet → on-device models next"], 3), { x: 5.3, y: 1.52, w: 4.15, h: 1.55, fontSize: 12.5 });
  box(s, 0.4, 3.25, 6.55, 1.05, "FFFFFF");
  T(s, [{ text: "Conclusion: ", options: { bold: true, color: BLUE } }, { text: "tracking the scam script live, fused with three acoustic cues and smoothed, gives a stable real-time warning: 81.25% accuracy, 0.873 ROC-AUC. ", options: { bold: true, color: NAVY } }, { text: "Next: larger multilingual data, on-device inference, learned weights.", options: { color: GREY } }], { x: 0.55, y: 3.3, w: 6.3, h: 0.95, fontSize: 12.5, valign: "middle" });
  T(s, [{ text: "Thank you", options: { breakLine: true } }, { text: "Questions?" }], { x: 7.1, y: 3.25, w: 2.5, h: 1.05, fontFace: "Arial", fontSize: 22, bold: true, color: RED, align: "center", valign: "middle", shadow: titleShadow() });
  const REFS = [
    "R. S. S. Kumar et al., Proc. IEEE AMLAI, 2023.", "M. Young, A. West, J. Telecommun. Security, 2019.", "N. Hidayati et al., ASTES J., vol. 5, 2020.",
    "X. Yin, Y. Li, Z. Chen, IEEE Access, vol. 8, 2020.", "B. Hong et al., IEEE Access, vol. 13, 2025.", "I. Wood et al., arXiv:2307.01965, 2023.",
    "Google, WebRTC voice activity detector (VAD).", "S. Davis, P. Mermelstein, IEEE Trans. ASSP, 1980.", "S. Furui, IEEE Trans. ASSP, vol. 34, 1986.",
    "Y. LeCun et al., Proc. IEEE, vol. 86, 1998.", "S. Ioffe, C. Szegedy, Proc. ICML, 2015.", "N. Srivastava et al., JMLR, vol. 15, 2014.",
    "M. Lin, Q. Chen, S. Yan, Proc. ICLR, 2014.", "D. P. Kingma, J. Ba, Proc. ICLR, 2015.", "T. N. Sainath, C. Parada, Proc. Interspeech, 2015.",
    "A. Radford et al., Proc. ICML, 2023 (Whisper).", "N. Reimers, I. Gurevych, Proc. EMNLP, 2019.", "W. Wang et al., Proc. NeurIPS, 2020 (MiniLM).",
    "J. Kittler et al., IEEE Trans. PAMI, vol. 20, 1998.", "S. W. Roberts, Technometrics, vol. 1, 1959.", "T. Fawcett, Pattern Recognit. Lett., 2006.",
    "W. J. Youden, Cancer, vol. 3, 1950.",
  ];
  T(s, "References (full entries in the paper)", { x: 0.4, y: 4.48, w: 9.2, h: 0.28, fontSize: 12, bold: true, color: BLUE });
  [[0, 11], [11, 22]].forEach(([a, b], k) => {
    T(s, REFS.slice(a, b).map((r, i) => ({ text: `[${a + i + 1}] ${r}`, options: { breakLine: i < b - a - 1 } })), { x: 0.4 + k * 4.7, y: 4.82, w: 4.5, h: 2.2, fontSize: 10.5, color: C.text1 });
  });
}

(async () => {
  const out = path.join(__dirname, "Scam_Call_Detection_8_Slides.pptx");
  await pres.writeFile({ fileName: out });
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
