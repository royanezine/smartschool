import os
import urllib.request
import cv2
import numpy as np
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile

# --- Link Download Otomatis Model AI Ringan OpenCV ---
YUNET_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
SFACE_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"

def download_model(url, filename):
    if not os.path.exists(filename):
        print(f"Mengunduh model ringan {filename} (Hanya sekali)...")
        urllib.request.urlretrieve(url, filename)
        print(f"{filename} berhasil diunduh!")

download_model(YUNET_URL, "yunet.onnx")
download_model(SFACE_URL, "sface.onnx")

app = FastAPI(title="Face Verification Service (Lightweight SFace)")

# Muat model ke dalam memori (Sangat ringan)
detector = cv2.FaceDetectorYN.create("yunet.onnx", "", (320, 320))
recognizer = cv2.FaceRecognizerSF.create("sface.onnx", "")

def get_face_feature(image_bytes: bytes):
    """Membaca gambar, mendeteksi lokasi wajah, lalu mengekstrak pola unik tulang wajah."""
    img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    if img is None: return None

    # Sesuaikan ukuran detektor dengan ukuran asli gambar
    height, width, _ = img.shape
    detector.setInputSize((width, height))
    
    _, faces = detector.detect(img)
    if faces is None: return None
        
    # Ambil wajah yang paling dominan di kamera
    face = faces[0]
    
    # Potong dan ekstrak 128 titik fitur wajah (mirip Face ID)
    aligned_face = recognizer.alignCrop(img, face)
    feature = recognizer.feature(aligned_face)
    return feature

@app.post("/verify-face")
async def verify_face(
    master_image: UploadFile = File(...),
    snapshot_image: UploadFile = File(...)
):
    try:
        master_bytes = await master_image.read()
        snapshot_bytes = await snapshot_image.read()

        feature_master = get_face_feature(master_bytes)
        if feature_master is None:
            return {"matched": False, "message": "Wajah pada foto profil tidak terdeteksi."}

        feature_snapshot = get_face_feature(snapshot_bytes)
        if feature_snapshot is None:
            return {"matched": False, "message": "Wajah tidak terdeteksi di kamera."}

        # Hitung skor kemiripan (Skala SFace: Jika > 0.363 berarti orang yang sama)
        score = recognizer.match(feature_master, feature_snapshot, cv2.FaceRecognizerSF_FR_COSINE)
        is_matched = bool(score >= 0.363)

        return {
            "matched": is_matched,
            "similarity_score": round(float(score) * 100, 2),
            "message": "Wajah terverifikasi cocok!" if is_matched else "Wajah tidak cocok dengan profil siswa"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)