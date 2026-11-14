"""Builds the image assets for the conference deck (equations, MFCC figure, icon, banner).

Run:  python make_assets.py   (needs numpy, scipy, matplotlib, Pillow)
"""
import json
import os
import sys

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw, ImageFilter
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets")
EQ = os.path.join(OUT, "eq")
os.makedirs(EQ, exist_ok=True)
DPI = 300

plt.rcParams["mathtext.fontset"] = "cm"

# ---------------------------------------------------------------- equations
EQUATIONS = {
    # preprocessing
    "norm": (r"$x[n]=\dfrac{s[n]}{32768},\qquad n=0,\dots,63999$", 22),
    "vad": (r"$\Lambda_\ell=\log\dfrac{p(\mathbf{x}_\ell\,|\,\mathrm{speech})}{p(\mathbf{x}_\ell\,|\,\mathrm{noise})}>\tau$", 22),
    "rms": (r"$E_t=\sqrt{\dfrac{1}{N}\sum_{n=0}^{N-1}x_t[n]^2}$", 22),
    "dom": (r"$\mathrm{keep}\ t\quad\mathrm{if}\quad E_t>0.6\,\bar{E}$", 22),
    # MFCC
    "frame": (r"$x_t[n]=x[tH+n]\,w[n]$", 20),
    "fft": (r"$P_t(k)=\left|\sum_{n=0}^{N-1}x_t[n]\,e^{-j2\pi kn/N}\right|^2$", 20),
    "mel": (r"$m(f)=2595\,\log_{10}\left(1+\dfrac{f}{700}\right)$", 20),
    "dct": (r"$c_t(i)=\sum_{m=1}^{M}\log S_t(m)\,\cos\left[\dfrac{\pi i\,(m-\frac{1}{2})}{M}\right]$", 20),
    "delta": (r"$\Delta c_t=\dfrac{(c_{t+1}-c_{t-1})+2\,(c_{t+2}-c_{t-2})}{10}$", 20),
    "cmvn": (r"$\hat{c}_t=\dfrac{c_t-\mu}{\sigma}$", 20),
    # CNN
    "conv": (r"$h_{t,f}=\mathrm{ReLU}\left(b_f+\sum_{k=0}^{K-1}\sum_{c=1}^{C}W_{f,k,c}\;x_{t+k,\,c}\right)$", 22),
    "convlen": (r"$T^{\prime}=T-K+1$", 22),
    "relu": (r"$\mathrm{ReLU}(z)=\max(0,z)$", 20),
    "bn": (r"$\hat{x}=\dfrac{x-\mu_B}{\sqrt{\sigma_B^2+\epsilon}},\quad y=\gamma\hat{x}+\beta$", 20),
    "pool": (r"$p_t=\max(h_{2t},\,h_{2t+1})$", 20),
    "drop": (r"$\tilde{h}=\dfrac{m\odot h}{1-q},\quad m_i\sim\mathrm{Bernoulli}(1-q)$", 20),
    "gap": (r"$g_f=\dfrac{1}{T}\sum_{t=1}^{T}h_{t,f}$", 20),
    "sigmoid": (r"$p=\sigma(z)=\dfrac{1}{1+e^{-z}}$", 20),
    "bce": (r"$\mathcal{L}=-\dfrac{1}{N}\sum_{i=1}^{N}\left[y_i\log p_i+(1-y_i)\log(1-p_i)\right]$", 22),
    "grad": (r"$\dfrac{\partial\ell_i}{\partial z_i}=p_i-y_i$", 22),
    "adam1": (r"$m_t=\beta_1m_{t-1}+(1-\beta_1)\,g_t,\qquad v_t=\beta_2v_{t-1}+(1-\beta_2)\,g_t^2$", 20),
    "adam2": (r"$\theta_t=\theta_{t-1}-\eta\,\dfrac{\hat{m}_t}{\sqrt{\hat{v}_t}+\epsilon}$", 22),
    # model 1
    "phon": (r"$p_{\mathrm{phon}}=f_\theta(\mathbf{X})\in(0,1),\qquad\mathbf{X}\in\mathbb{R}^{370\times120}$", 22),
    # model 2
    "pitch": (r"$\mu_{f_0}=\dfrac{1}{|V|}\sum_{t\in V}f_0(t),\quad\sigma_{f_0}=\sqrt{\dfrac{1}{|V|}\sum_{t\in V}\left(f_0(t)-\mu_{f_0}\right)^2}$", 18),
    "energy": (r"$\bar{E}=\dfrac{1}{T}\sum_{t=1}^{T}E_t$", 18),
    "centroid": (r"$SC_t=\dfrac{\sum_k f_k\,|X_t(k)|}{\sum_k|X_t(k)|}$", 18),
    "rate": (r"$\mathrm{SR}=\dfrac{\#\,\mathrm{onset\ peaks}}{\mathrm{duration\ (s)}}$", 18),
    "urg": (r"$u=\min\left(3,\ \sum_{i=1}^{5}\mathbf{1}\left[f_i>\lambda_i\,b_i\right]\right)$", 22),
    "urgmap": (r"$r_{\mathrm{urg}}=g(u),\qquad g:\ 0\mapsto0,\ 1\mapsto0.2,\ 2\mapsto0.5,\ 3\mapsto0.9$", 20),
    # model 3
    "rep": (r"$p_{\mathrm{rep}}=\max_{j=1,\dots,4}\ g_\phi\left(\mathrm{MFCC}_{40}(s_j)\right)$", 22),
    # model 4
    "embed": (r"$\mathbf{e}_t=\mathrm{MiniLM}\left(\mathrm{Whisper}(x_t)\right)\in\mathbb{R}^{384}$", 22),
    "att": (r"$\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\left(\dfrac{QK^{\top}}{\sqrt{d_k}}\right)V$", 22),
    "qkv": (r"$Q=XW_Q,\quad K=XW_K,\quad V=XW_V$", 20),
    "meanpool": (r"$\mathbf{e}=\dfrac{1}{n}\sum_{i=1}^{n}\mathbf{h}_i$", 20),
    "cos": (r"$\cos(\mathbf{u},\mathbf{v})=\dfrac{\mathbf{u}\cdot\mathbf{v}}{\Vert\mathbf{u}\Vert\,\Vert\mathbf{v}\Vert}=\cos\theta$", 24),
    "intent": (r"$s_i=\max_{j}\ \cos(\mathbf{e}_t,\mathbf{e}_{i,j}),\qquad i^{*}=\mathrm{arg\,max}_i\ s_i$", 22),
    "stage": (r"$\mathrm{stage}_t=\max\left(\mathrm{stage}_{t-1},\ \pi(i^{*})\right)\quad\mathrm{if}\ \ s_{i^{*}}\geq0.55$", 22),
    "stagerisk": (r"$r_{\mathrm{stage}}=R(\mathrm{stage}_t)$", 22),
    # ensemble
    "fuse": (r"$r_t=0.60\,r_{\mathrm{stage}}+0.20\,p_{\mathrm{rep}}+0.10\,p_{\mathrm{phon}}+0.10\,r_{\mathrm{urg}}$", 22),
    "fusegen": (r"$r_t=w_1p_1+\dots+w_4p_4,\qquad w_1+\dots+w_4=1\ \Rightarrow\ r_t\in[0,1]$", 22),
    "ema": (r"$R_t=\alpha R_{t-1}+\beta\,r_t,\qquad\alpha=0.7,\ \beta=0.3$", 22),
    "emaunroll": (r"$R_t=\beta\sum_{k=0}^{t-1}\alpha^{k}\,r_{t-k}\qquad(R_0=0)$", 20),
    "emamem": (r"$\mathrm{memory}\approx\dfrac{1}{1-\alpha}\approx3.3\ \mathrm{windows}\approx13\,\mathrm{s}$", 20),
    "parallel": (r"$T_{\mathrm{window}}=\max(T_1,T_2,T_3,T_4)\ <\ T_1+T_2+T_3+T_4$", 22),
    # evaluation
    "acc": (r"$\mathrm{Accuracy}=\dfrac{TP+TN}{N}=\dfrac{7+6}{16}=0.8125$", 20),
    "prec": (r"$\mathrm{Precision}=\dfrac{TP}{TP+FP}=\dfrac{7}{8}=0.875$", 20),
    "rec": (r"$\mathrm{Recall}=\dfrac{TP}{TP+FN}=\dfrac{7}{9}=0.778$", 20),
    "f1": (r"$F_1=\dfrac{2PR}{P+R}=0.824$", 20),
    "tprfpr": (r"$\mathrm{TPR}=\dfrac{TP}{TP+FN},\qquad\mathrm{FPR}=\dfrac{FP}{FP+TN}$", 20),
    "auc": (r"$\mathrm{AUC}=P\left(s_{\mathrm{scam}}>s_{\mathrm{normal}}\right)=\dfrac{1}{n_{+}n_{-}}\sum_{i\in+}\sum_{j\in-}\mathbf{1}[s_i>s_j]$", 18),
    "youden": (r"$J=\mathrm{TPR}-\mathrm{FPR}$", 20),
    # large versions for the AISCPS deck (rendered at >= 26 pt so they stay >= 24 pt on the slide)
    "convL": (r"$h_t=\mathrm{ReLU}\left(b+\sum_{k=0}^{K-1}W_k\,x_{t+k}\right)$", 28),
    "repL": (r"$p_{\mathrm{rep}}=\max_{j=1,\dots,4}\ \mathrm{CNN}(s_j)$", 28),
    "urgL": (r"$u=\min\left(3,\ \sum_{i=1}^{5}\mathbf{1}\left[f_i>\lambda_i\,b_i\right]\right)$", 28),
    "fuseL": (r"$r_t=0.6\,r_{\mathrm{stage}}+0.2\,p_{\mathrm{rep}}+0.1\,p_{\mathrm{phon}}+0.1\,r_{\mathrm{urg}}$", 28),
    "emaL": (r"$R_t=0.7\,R_{t-1}+0.3\,r_t$", 28),
}

sizes = {}
for name, (tex, pt) in EQUATIONS.items():
    fig = plt.figure(figsize=(0.01, 0.01))
    fig.text(0, 0, tex, fontsize=pt, color="#000000")
    path = os.path.join(EQ, name + ".png")
    fig.savefig(path, dpi=DPI, transparent=True, bbox_inches="tight", pad_inches=0.03)
    plt.close(fig)
    w, h = Image.open(path).size
    sizes[name] = [round(w / DPI, 3), round(h / DPI, 3)]
with open(os.path.join(EQ, "sizes.json"), "w") as f:
    json.dump(sizes, f, indent=1)
print("equations:", len(sizes))

# ---------------------------------------------------------------- MFCC figure (numpy implementation)
def mel(f):
    return 2595 * np.log10(1 + f / 700)


def imel(m):
    return 700 * (10 ** (m / 2595) - 1)


def mfcc(x, sr=16000, n_fft=400, hop=160, n_mels=128, n_mfcc=40):
    win = 0.5 - 0.5 * np.cos(2 * np.pi * np.arange(n_fft) / n_fft)
    x = np.pad(x, n_fft // 2, mode="reflect")
    frames = np.stack([x[i:i + n_fft] * win for i in range(0, len(x) - n_fft + 1, hop)])
    P = np.abs(np.fft.rfft(frames, n=n_fft)) ** 2
    freqs = np.linspace(0, sr / 2, P.shape[1])
    pts = imel(np.linspace(mel(0), mel(sr / 2), n_mels + 2))
    H = np.zeros((n_mels, len(freqs)))
    for m in range(n_mels):
        l, c, r = pts[m], pts[m + 1], pts[m + 2]
        H[m] = np.clip(np.minimum((freqs - l) / (c - l), (r - freqs) / (r - c)), 0, None)
    S = 10 * np.log10(P @ H.T + 1e-10)
    M = S.shape[1]
    i = np.arange(n_mfcc)[:, None]
    m = np.arange(1, M + 1)[None, :]
    D = np.cos(np.pi * i * (m - 0.5) / M)
    return S @ D.T  # (T, n_mfcc)


src = os.path.join(HERE, "..", "processed_dataset", "SCAM_CALLS", "scam_1.wav")
sr, x = wavfile.read(src)
x = x.astype(np.float32)
if x.ndim > 1:
    x = x.mean(axis=1)
x /= (np.abs(x).max() + 1e-9)
start = int(len(x) * 0.3)
x = x[start:start + 4 * sr]
C = mfcc(x, sr)
C = (C - C.mean(0)) / (C.std(0) + 1e-8)

fig, axs = plt.subplots(2, 2, figsize=(8.2, 4.2),
                        gridspec_kw={"height_ratios": [1, 2], "width_ratios": [60, 1]})
ax = axs[:, 0]
axs[0, 1].axis("off")
t = np.arange(len(x)) / sr
ax[0].plot(t, x, color="#0070C0", lw=0.5)
ax[0].set_xlim(0, 4); ax[0].set_yticks([]); ax[0].set_ylabel("x[n]", fontsize=11)
ax[0].set_title("4-second window of a scam call (waveform)", fontsize=12, loc="left")
for s in ("top", "right"):
    ax[0].spines[s].set_visible(False)
im = ax[1].imshow(C.T, aspect="auto", origin="lower", cmap="RdBu_r", vmin=-2.5, vmax=2.5,
                  extent=[0, 4, 0, 40])
ax[1].set_xlabel("time (s)  —  one column every 10 ms", fontsize=11)
ax[1].set_ylabel("MFCC index i", fontsize=11)
ax[1].set_title("40 MFCCs after CMVN", fontsize=12, loc="left")
fig.colorbar(im, cax=axs[1, 1])
fig.tight_layout()
fig.savefig(os.path.join(OUT, "mfcc.png"), dpi=200)
plt.close(fig)
print("mfcc figure ok")

# ---------------------------------------------------------------- top-left icon tile
W, Hh = 328, 412
tile = Image.new("RGB", (W, Hh))
top, bot = np.array([150, 200, 240]), np.array([10, 70, 140])
for yy in range(Hh):
    c = tuple(int(v) for v in top + (bot - top) * yy / (Hh - 1))
    ImageDraw.Draw(tile).line([(0, yy), (W, yy)], fill=c)
ph = Image.open(os.path.join(sys.argv[1] if len(sys.argv) > 1 else HERE, "phone.png")).convert("RGBA").resize((210, 210))
tile.paste(ph, ((W - 210) // 2, (Hh - 210) // 2), ph)
tile.save(os.path.join(OUT, "tile.png"))

# ---------------------------------------------------------------- title banner (gradient + soft shadow)
BW, BH = 2760, 380
banner = Image.new("RGBA", (BW + 40, BH + 40), (0, 0, 0, 0))
shadow = Image.new("RGBA", banner.size, (0, 0, 0, 0))
ImageDraw.Draw(shadow).rectangle([18, 22, BW + 18, BH + 22], fill=(0, 0, 0, 110))
shadow = shadow.filter(ImageFilter.GaussianBlur(10))
banner.alpha_composite(shadow)
grad = Image.new("RGBA", (BW, BH))
gt, gb = np.array([70, 140, 220]), np.array([30, 90, 170])
d = ImageDraw.Draw(grad)
for yy in range(BH):
    c = tuple(int(v) for v in gt + (gb - gt) * yy / (BH - 1)) + (255,)
    d.line([(0, yy), (BW, yy)], fill=c)
banner.alpha_composite(grad, (8, 8))
banner.save(os.path.join(OUT, "banner.png"))
print("tile + banner ok")
