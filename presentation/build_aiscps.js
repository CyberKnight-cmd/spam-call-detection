// AISCPS 2026 submission deck (Paper ID 810), following the conference PPT guidelines:
// 4:3, white background, Calibri, text >= 24 pt, >= 0.5" margins, dark text, <= 2 plots per slide,
// logos only on the title page, 8 slides, one references slide with 5-9 IEEE references.
// Build:  node build_aiscps.js   (needs pptxgenjs + jszip; run `python make_assets.py` first)
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const APPLY_THEME = process.env.APPLY_THEME_JS;
const { applyTheme } = APPLY_THEME ? require(APPLY_THEME) : { applyTheme: null };

const A = (p) => path.join(__dirname, "assets", p);
const EQ = JSON.parse(fs.readFileSync(A("eq/sizes.json"), "utf8"));
const THEME = {
  name: "AISCPS 2026", headFontFace: "Calibri", bodyFontFace: "Calibri",
  colors: { dk1: "000000", lt1: "FFFFFF", dk2: "002060", lt2: "F2F2F2", accent1: "002060", accent2: "C00000", accent3: "4F81BD", accent4: "000000", accent5: "BFBFBF", accent6: "1F497D", hlink: "0563C1", folHlink: "954F72" },
};
const H = THEME.colors;
const pres = new pptxgen();
pres.layout = "LAYOUT_4x3";
pres.theme = { headFontFace: "Calibri", bodyFontFace: "Calibri" };
pres.title = "Real-Time Multimodal Detection of Fraud and Scam Calls Using Conversation Stage Modeling and Ensemble Learning";
pres.author = "Subhalaxmi Chakraborty, Krishna Kumar Jha, Pritam Paul, Arya Gupta, Srijan Sarkar, Shinjan Saha";
pres.subject = "AISCPS 2026, Paper ID 810";
const C = pres.SchemeColor;
const BLACK = C.text1, NAVY = C.text2, RED = C.accent2;
const MIN_PT = 24;

pres.defineSlideMaster({
  title: "AISCPS_CONTENT", background: { color: "FFFFFF" },
  objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 9.0, h: 1.0, fontSize: 40, color: C.text1, align: "center", valign: "middle", margin: 0 }, text: "" } }],
  slideNumber: { x: 7.17, y: 6.95, w: 2.33, h: 0.4, fontSize: 12, color: H.dk1, align: "right" },
});

// ---------------------------------------------------------------- helpers
const T = (s, text, o = {}) => s.addText(text, Object.assign({ isTextBox: true, fontSize: MIN_PT, color: BLACK, valign: "top", margin: 0 }, o));
const runs = (str) => str.split("**").map((p, i) => ({ text: p, options: i % 2 ? { bold: true, color: NAVY } : {} })).filter((r) => r.text.length);
// items: string (level 1, 28 pt) or ["text"] (level 2, 24 pt)
const bullets = (items, gap = 6) => {
  const out = [];
  items.forEach((it, i) => {
    const sub = Array.isArray(it);
    const rs = runs(sub ? it[0] : it);
    rs.forEach((r) => { r.options.fontSize = sub ? 24 : 28; });
    Object.assign(rs[0].options, { bullet: sub ? { code: "2013", indent: 22 } : { indent: 24 }, indentLevel: sub ? 1 : 0, paraSpaceAfter: gap });
    rs[rs.length - 1].options.breakLine = i < items.length - 1;
    out.push(...rs);
  });
  return out;
};
const frame = (s, x, y, w, h, text, o = {}) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: o.fill || "FFFFFF" }, line: { color: o.line || H.dk2, width: 2 } });
  T(s, text, { x: x + 0.05, y, w: w - 0.1, h, fontSize: o.fontSize || 24, bold: o.bold ?? true, color: o.color || NAVY, align: "center", valign: "middle" });
};
const eq = (s, name, y, o = {}) => {
  let [w, h] = EQ[name];
  const sc = Math.min(1, o.maxW ? o.maxW / w : 1);
  if (28 * sc < MIN_PT) console.warn(`equation ${name} would render at ${(28 * sc).toFixed(1)} pt`);
  w *= sc; h *= sc;
  const x = o.x ?? (0.5 + (9.0 - w) / 2);
  s.addImage({ path: A(`eq/${name}.png`), x, y, w, h, altText: o.alt || `Equation ${name}` });
  return { x, w, h };
};
const line = (s, x1, y1, x2, y2) => s.addShape(pres.shapes.LINE, {
  x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001), flipH: x2 < x1, flipV: y2 < y1,
  line: { color: H.dk2, width: 2.25, endArrowType: "triangle" },
});
const chartBase = {
  catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 24, catAxisLabelColor: H.dk1,
  valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 24, valAxisLabelColor: H.dk1,
  catAxisLineShow: true, valAxisLineShow: true, catAxisLineColor: H.dk1, valAxisLineColor: H.dk1, catAxisLineSize: 2.25, valAxisLineSize: 2.25,
  valGridLine: { style: "none" }, catGridLine: { style: "none" },
};
const slide = (title, notes) => {
  const s = pres.addSlide({ masterName: "AISCPS_CONTENT", sectionTitle: "AISCPS 2026" });
  s.addText(title, { placeholder: "title" });
  s.addNotes(notes);
  return s;
};
pres.addSection({ title: "AISCPS 2026" });

// ================================================================ 1. Title (conference template layout)
{
  const s = pres.addSlide({ sectionTitle: "AISCPS 2026" });
  s.background = { color: "FFFFFF" };
  s.addImage({ path: A("aiscps_strip.png"), x: 1.25, y: 0.33, w: 7.5, h: 0.79, altText: "Conference sponsor logos" });
  s.addImage({ path: A("logo_uem.png"), x: 0.5, y: 1.2, w: 1.69, h: 0.95, altText: "University of Engineering & Management logo" });
  s.addImage({ path: A("aiscps_logo.png"), x: 3.43, y: 1.2, w: 3.14, h: 1.0, altText: "AISCPS 2026 logo" });
  s.addImage({ path: A("logo_iem.png"), x: 8.14, y: 1.2, w: 1.36, h: 0.95, altText: "Institute of Engineering & Management logo" });
  T(s, "2026 International Conference on AI-Driven Sustainable Cyber-Physical Systems (AISCPS)", { x: 1.0, y: 2.3, w: 8.0, h: 0.7, fontSize: 20, bold: true, align: "center", valign: "middle" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.1, w: 9.0, h: 1.0, fill: { color: "FFFFFF" }, line: { color: "4F81BD", width: 1 } });
  T(s, "Real-Time Multimodal Detection of Fraud and Scam Calls Using Conversation Stage Modeling and Ensemble Learning", { x: 0.6, y: 3.1, w: 8.8, h: 1.0, fontSize: 24, bold: true, color: NAVY, align: "center", valign: "middle" });
  s.addShape(pres.shapes.RECTANGLE, { x: 2.75, y: 4.28, w: 4.5, h: 0.46, fill: { color: "BFBFBF" }, line: { color: "BFBFBF", width: 0 } });
  T(s, "Paper ID: 810", { x: 2.75, y: 4.28, w: 4.5, h: 0.46, fontFace: "Arial", fontSize: 18, bold: true, align: "center", valign: "middle" });
  T(s, [
    { text: "Subhalaxmi Chakraborty¹, Krishna Kumar Jha², Pritam Paul¹, Arya Gupta³, Srijan Sarkar³, Shinjan Saha³", options: { fontSize: 17, bold: true, breakLine: true, paraSpaceAfter: 6 } },
    { text: "¹Department of CST & CSIT, Institute of Engineering & Management, University of Engineering & Management, Kolkata, India", options: { fontSize: 14, italic: true, breakLine: true, paraSpaceAfter: 2 } },
    { text: "²Guru Nanak Institute of Technology, Kolkata, India", options: { fontSize: 14, italic: true, breakLine: true, paraSpaceAfter: 2 } },
    { text: "³Department of CSE, Institute of Engineering & Management, University of Engineering & Management, Kolkata, India", options: { fontSize: 14, italic: true } },
  ], { x: 0.5, y: 4.88, w: 9.0, h: 2.05, align: "center" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 7.04, w: 4.96, h: 0.46, fill: { color: "BFBFBF" }, line: { color: "BFBFBF", width: 0 } });
  T(s, "Date: ", { x: 0.2, y: 7.04, w: 4.6, h: 0.46, fontFace: "Arial", fontSize: 16, bold: true, align: "left", valign: "middle" });
  s.addShape(pres.shapes.RECTANGLE, { x: 4.92, y: 7.04, w: 5.08, h: 0.46, fill: { color: "BFBFBF" }, line: { color: "BFBFBF", width: 0 } });
  T(s, "Track: ", { x: 5.1, y: 7.04, w: 4.7, h: 0.46, fontFace: "Arial", fontSize: 16, bold: true, align: "left", valign: "middle" });
  s.addNotes("Good morning. I am presenting paper 810: real-time multimodal detection of scam calls using conversation-stage modelling and ensemble learning. In eight minutes: our objectives, the framework, our four models, how we combine them, and the results.");
}

// ================================================================ 2. Objectives
slide("Objectives",
  "Scam calls are social engineering: nothing is hacked, a person is persuaded to give an OTP, bank details or money, and the harm happens during the call, so a warning after the call is too late. Our key observation, supported by Wood et al., is that scam calls follow a script in a fixed order: greeting, a claim of authority, a made-up problem, pressure, and finally the request for data. So our goals were: warn the user live, every four seconds; track which stage of the script the call has reached; combine how the caller sounds with what the caller says in one ensemble; keep false alarms low so users keep trusting the warning; and deliver a complete working system, an Android app and a server.")
  .addText(bullets([
    "Scammers persuade, not hack: harm happens **during the call**",
    "Scam calls follow a script [1]:",
    ["Greeting → Authority → Problem → Urgency → Data"],
    "**Goals**",
    ["Warn the user live, every 4 seconds"],
    ["Track the stage of the conversation"],
    ["Fuse voice cues and meaning in one ensemble"],
    ["Keep false alarms low"],
    ["Deliver a working Android app and server"],
  ], 4), { isTextBox: true, x: 0.5, y: 1.5, w: 9.0, h: 5.4, color: BLACK, valign: "top", margin: 0 });

// ================================================================ 3. Proposed framework
{
  const s = slide("Proposed Framework",
    "Every four seconds the Android app sends the caller's audio to our server. We first clean it: voice activity detection removes silence, and an energy filter keeps the main speaker. Then four models look at the same window in parallel. Model one, a phoneme CNN, listens to how speech sounds. Model two scores urgency from the voice: pitch, loudness, speed. Model three, a repetition CNN, catches scripted phrases. Model four transcribes the speech and tracks the stage of the conversation. Their scores are combined with fixed weights: 0.6 for the stage, 0.2 for repetition, 0.1 each for the other two. The result is smoothed over time and turned into one of five risk labels on the phone.");
  frame(s, 0.5, 1.55, 4.1, 0.85, "Phone audio · 4 s");
  frame(s, 5.4, 1.55, 4.1, 0.85, "Clean: VAD + speaker");
  line(s, 4.6, 1.975, 5.4, 1.975);
  line(s, 7.45, 2.4, 7.45, 2.72);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 2.72, w: 9.0, h: 2.0, fill: { color: "FFFFFF" }, line: { color: H.dk1, width: 1.5, dashType: "dash" } });
  [["Phoneme CNN", "0.10"], ["Prosody rules", "0.10"], ["Repetition CNN", "0.20"], ["Stage model", "0.60"]].forEach(([n, w], i) => {
    const x = 0.7 + (i % 2) * 4.4, y = 2.88 + Math.floor(i / 2) * 0.92;
    frame(s, x, y, 4.2, 0.76, [{ text: n + "   " }, { text: "w = " + w, options: { color: RED } }]);
  });
  line(s, 2.55, 4.72, 2.55, 5.0);
  frame(s, 0.5, 5.0, 4.1, 0.85, "Weighted fusion + EMA");
  frame(s, 5.4, 5.0, 4.1, 0.85, "Risk label → phone", { line: H.accent2, color: RED });
  line(s, 4.6, 5.425, 5.4, 5.425);
  T(s, "All four models run in parallel on every window", { x: 0.5, y: 6.1, w: 9.0, h: 0.5, align: "center" });
}

// ================================================================ 4. Acoustic models
{
  const s = slide("Acoustic Models (CNNs)",
    "Models one and three are small 1-D convolutional networks with the same design. The audio is turned into MFCCs, a compact description of how speech sounds, one column every 10 milliseconds. Two convolution layers slide learned filters along time, as the equation shows: each output is a weighted sum of K neighbouring frames passed through ReLU, and the same weights are used at every position, so a pattern is found wherever it occurs. Global pooling and a sigmoid give a scam probability. The phoneme CNN reads the whole window, about 80,600 parameters, and learns phoneme-level sound. The repetition CNN cuts the window into four one-second segments and keeps the highest probability, because one scripted phrase anywhere is enough; it has about 17,200 parameters.");
  ["MFCC [2]", "2 × Conv1D", "Global pool", "Sigmoid"].forEach((t, i) => {
    const x = 0.5 + i * 2.36;
    frame(s, x, 1.5, 1.9, 0.8, t);
    if (i < 3) line(s, x + 1.92, 1.9, x + 2.35, 1.9);
  });
  T(s, bullets(["**Phoneme CNN [3]**", ["Input 370 × 120"], ["≈ 80.6 k parameters"], ["Phoneme sounds"]], 2), { x: 0.5, y: 2.55, w: 4.4, h: 2.2 });
  T(s, bullets(["**Repetition CNN [4]**", ["4 × 1-s segments"], ["≈ 17.2 k parameters"], ["Scripted phrases"]], 2), { x: 5.1, y: 2.55, w: 4.4, h: 2.2 });
  eq(s, "convL", 4.8, { alt: "h_t = ReLU(b + sum over k of W_k x_{t+k})" });
  eq(s, "repL", 6.0, { alt: "p_rep = max over 4 segments of CNN(s_j)" });
}

// ================================================================ 5. Prosody and stage models
{
  const s = slide("Prosody and Stage Models",
    "Model two listens to how something is said. Five voice cues, pitch, pitch variation, loudness, brightness of the voice and speech rate, are each compared with the speaker's normal level. We count how many are clearly raised, cap the count at three, and map it to a risk, so several cues together count much more than one. Model four understands what is being said. Whisper transcribes the speech, MiniLM turns the sentence into a meaning vector, and cosine similarity compares it with example sentences for each stage. A stage is accepted only above 0.55, and the stage can only move forward, so one innocent sentence cannot hide earlier pressure. Each stage carries a risk value, from 0.10 at the greeting to 0.95 when the caller asks for data.");
  T(s, "Prosody: urgency score", { x: 0.5, y: 1.45, w: 9.0, h: 0.5, fontSize: 28, bold: true, color: NAVY });
  eq(s, "urgL", 2.02, { alt: "u = min(3, number of cues f_i above lambda_i times baseline b_i)" });
  T(s, "5 cues: pitch, pitch range, loudness, brightness, speed", { x: 0.5, y: 3.2, w: 9.0, h: 0.45, align: "center" });
  T(s, "Conversation stage [5], [6]", { x: 0.5, y: 3.75, w: 9.0, h: 0.5, fontSize: 28, bold: true, color: NAVY });
  T(s, "Whisper → MiniLM → cosine ≥ 0.55 → forward only", { x: 0.5, y: 4.3, w: 9.0, h: 0.45, align: "center" });
  [["Greeting", "0.10"], ["Authority", "0.25"], ["Problem", "0.50"], ["Urgency", "0.70"], ["Data", "0.95"]].forEach(([n, r], i) => {
    const x = 0.5 + i * 1.85;
    frame(s, x, 4.95, 1.6, 1.0, [{ text: n, options: { breakLine: true } }, { text: r, options: { color: RED } }], i === 4 ? { line: H.accent2, color: RED } : {});
    if (i < 4) line(s, x + 1.6, 5.45, x + 1.85, 5.45);
  });
  T(s, "Risk rises with each stage and never goes back", { x: 0.5, y: 6.15, w: 9.0, h: 0.45, align: "center" });
}

// ================================================================ 6. Fusion and smoothing
{
  const R = (rs) => { let r = 0; return rs.map((x) => +(r = 0.7 * r + 0.3 * x).toFixed(3)); };
  const sus = R(Array(8).fill(0.8));
  const spike = R([0.1, 0.1, 1.0, 0.1, 0.1, 0.1, 0.1, 0.1]);
  const s = slide("Fusion and Smoothing",
    "The four scores, each between zero and one, are combined with a weighted sum, a standard way of combining classifiers. The weights add up to one, so the result stays between zero and one, and the stage gets the largest weight because it is the most reliable cue. One noisy window should not raise an alarm, so we smooth over time with an exponential moving average: seventy percent of the previous running risk plus thirty percent of the new one. The chart shows why. A single noisy spike only lifts the running risk to about 0.34 and then fades. A call that is consistently suspicious crosses the 0.6 scam-alert line after four windows, sixteen seconds.");
  const f = eq(s, "fuseL", 1.5, { alt: "r_t = 0.6 r_stage + 0.2 p_rep + 0.1 p_phon + 0.1 r_urg" });
  T(s, "[7]", { x: f.x + f.w + 0.1, y: 1.5, w: 0.6, h: f.h, valign: "middle" });
  eq(s, "emaL", 2.2, { alt: "R_t = 0.7 R_{t-1} + 0.3 r_t" });
  const labels = sus.map((_, i) => String(i + 1));
  s.addChart(pres.charts.LINE, [
    { name: "Scam call", labels, values: sus },
    { name: "One noisy spike", labels, values: spike },
    { name: "Alert 0.6", labels, values: Array(8).fill(0.6) },
  ], Object.assign({}, chartBase, {
    x: 0.5, y: 2.85, w: 9.0, h: 4.0, chartColors: [H.accent2, H.dk2, H.dk1], lineSize: 4, lineDataSymbol: "circle", lineDataSymbolSize: 9,
    valAxisMinVal: 0, valAxisMaxVal: 1, valAxisMajorUnit: 0.5, valAxisLabelFormatCode: "0.0",
    showCatAxisTitle: true, catAxisTitle: "Window (4 s each)", catAxisTitleFontFace: "+mn-lt", catAxisTitleFontSize: 24, catAxisTitleColor: H.dk1,
    showLegend: true, legendPos: "t", legendFontFace: "+mn-lt", legendFontSize: 24, legendColor: H.dk1,
  }));
}

// ================================================================ 7. Results and conclusion
{
  const s = slide("Results and Conclusion",
    "We tested 16 full calls, 7 normal and 9 scam, through exactly the live pipeline. The system reached 81.25 percent accuracy, an F1-score of 0.81, a ROC-AUC of 0.873, meaning a scam call scores higher than a normal call 87 percent of the time, and precision 0.875, so when we warn we are usually right. The ablation shows that the stage model alone already gives 75 percent, and accuracy rises with every model we add, to 81.25 for the full system. In conclusion, tracking the scam script live and combining it with how the caller sounds gives a stable real-time warning. Next we want a larger multilingual dataset and on-device models.");
  [["81.25%", "Accuracy"], ["0.81", "F1-score"], ["0.873", "ROC-AUC [8]"], ["0.875", "Precision"]].forEach(([n, l], i) => {
    const x = 0.5 + i * 2.3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.45, w: 2.1, h: 1.2, rectRadius: 0.06, fill: { color: "FFFFFF" }, line: { color: H.dk2, width: 2 } });
    T(s, n, { x, y: 1.48, w: 2.1, h: 0.65, fontSize: 36, bold: true, color: NAVY, align: "center", valign: "middle" });
    T(s, l, { x, y: 2.12, w: 2.1, h: 0.45, align: "center" });
  });
  s.addChart(pres.charts.BAR, [{ name: "Accuracy (%)", labels: ["Stage", "+ Phoneme", "+ Prosody", "Full"], values: [75.0, 77.5, 79.38, 81.25] }], Object.assign({}, chartBase, {
    x: 0.5, y: 2.8, w: 9.0, h: 2.95, barDir: "col", chartColors: [H.dk2, H.dk2, H.dk2, H.accent2], barGapWidthPct: 60,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontFace: "+mn-lt", dataLabelFontSize: 24, dataLabelColor: H.dk1, dataLabelFontBold: true,
    valAxisMinVal: 70, valAxisMaxVal: 85, valAxisMajorUnit: 5, showLegend: false,
    showTitle: true, title: "Ablation on 16 test calls: accuracy (%)", titleFontFace: "+mn-lt", titleFontSize: 24, titleColor: H.dk1,
  }));
  T(s, bullets([["Stage tracking + 3 voice cues → stable live warning"], ["Next: larger multilingual data, on-device models"]], 4), { x: 0.5, y: 5.85, w: 9.0, h: 1.05 });
}

// ================================================================ 8. References
{
  const s = slide("References",
    "These are the key references behind each part: scam-call stages, MFCC features, convolutional networks, keyword-spotting CNNs, Whisper, Sentence-BERT, classifier fusion and ROC analysis. Thank you; I am happy to take questions.");
  const REFS = [
    "I. Wood, M. Kepkowski, L. Zinatullin, T. Darnley, and M. A. Kaafar, “An analysis of scam baiting calls: Identifying and extracting scam stages and scripts,” arXiv:2307.01965, 2023.",
    "S. Davis and P. Mermelstein, “Comparison of parametric representations for monosyllabic word recognition in continuously spoken sentences,” IEEE Trans. Acoust., Speech, Signal Process., vol. 28, no. 4, pp. 357–366, 1980.",
    "Y. LeCun, L. Bottou, Y. Bengio, and P. Haffner, “Gradient-based learning applied to document recognition,” Proc. IEEE, vol. 86, no. 11, pp. 2278–2324, 1998.",
    "T. N. Sainath and C. Parada, “Convolutional neural networks for small-footprint keyword spotting,” in Proc. Interspeech, 2015, pp. 1478–1482.",
    "A. Radford, J. W. Kim, T. Xu, G. Brockman, C. McLeavey, and I. Sutskever, “Robust speech recognition via large-scale weak supervision,” in Proc. ICML, 2023, pp. 28492–28518.",
    "N. Reimers and I. Gurevych, “Sentence-BERT: Sentence embeddings using Siamese BERT-networks,” in Proc. EMNLP-IJCNLP, 2019, pp. 3982–3992.",
    "J. Kittler, M. Hatef, R. P. W. Duin, and J. Matas, “On combining classifiers,” IEEE Trans. Pattern Anal. Mach. Intell., vol. 20, no. 3, pp. 226–239, 1998.",
    "T. Fawcett, “An introduction to ROC analysis,” Pattern Recognit. Lett., vol. 27, no. 8, pp. 861–874, 2006.",
  ];
  T(s, REFS.map((r, i) => ({ text: `[${i + 1}] ${r}`, options: { breakLine: i < REFS.length - 1, paraSpaceAfter: 2 } })), { x: 0.5, y: 1.35, w: 9.0, h: 4.75, fontSize: 16 });
  T(s, "Thank You · Questions?", { x: 0.5, y: 6.32, w: 9.0, h: 0.55, fontSize: 32, bold: true, color: NAVY, align: "center", valign: "middle" });
}

(async () => {
  const out = path.join(__dirname, "AISCPS2026_Paper810_Presentation.pptx");
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
