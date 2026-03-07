import numpy as np
import pandas as pd
from pathlib import Path

sample = np.load(r"rep_features\REPETITIVE\mfcc_scam1_orig.npy")
df = pd.read_csv(r"rep_features\repetition_labels.csv")

print(df.label.value_counts())


max_MFCC = 0
for path in Path("rep_features/NON_REPETITIVE").glob("*.npy"):
    sample = np.load(path)
    if sample.shape[0] > max_MFCC:
        max_MFCC = sample.shape[0]
print("NON_REPETITIVE", max_MFCC)

for path in Path("rep_features/REPETITIVE").glob("*.npy"):
    sample = np.load(path)
    if sample.shape[0] > max_MFCC:
        max_MFCC = sample.shape[0]
print("REPETITIVE", max_MFCC)