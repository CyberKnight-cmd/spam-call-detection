import tensorflow as tf

# Load model
model = tf.keras.models.load_model(r"models\best_phoneme_model.keras")

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save model
with open(r"models\best_phoneme_model.tflite", "wb") as f:
    f.write(tflite_model)

print("Model converted to TFLite successfully!")