"""HTTP regression tests using the real Python server and OpenCV models.

Run: python -m unittest discover -s aiservices -p test_service.py -v
Set AI_TEST_FACE_IMAGE to a local face image to include the two positive tests.
"""

import json
import math
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.error
import urllib.request
import uuid

import cv2
import numpy as np


class FaceServiceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.work_dir = Path(cls.temp.name)
        cls.log_path = cls.work_dir / "server.log"
        cls.log = cls.log_path.open("w", encoding="utf-8")
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            port = probe.getsockname()[1]
        cls.base_url = f"http://127.0.0.1:{port}"
        script = Path(__file__).resolve().with_name("index.py")
        cls.process = subprocess.Popen(
            [sys.executable, str(script)],
            cwd=cls.work_dir,
            env={**os.environ, "PORT": str(port)},
            stdout=cls.log,
            stderr=subprocess.STDOUT,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
        cls.addClassCleanup(cls.stop_server)
        deadline = time.monotonic() + 20
        while time.monotonic() < deadline:
            if cls.process.poll() is not None:
                break
            try:
                cls.get("/health")
                return
            except (urllib.error.URLError, TimeoutError):
                time.sleep(0.1)
        raise RuntimeError(f"AI service failed to start:\n{cls.log_path.read_text()}")

    @classmethod
    def stop_server(cls):
        if cls.process.poll() is None:
            if os.name == "nt":
                subprocess.run(
                    ["taskkill", "/PID", str(cls.process.pid), "/T", "/F"],
                    capture_output=True,
                    check=False,
                )
            else:
                cls.process.terminate()
            cls.process.wait(timeout=10)
        cls.log.close()
        cls.temp.cleanup()

    @classmethod
    def get(cls, endpoint):
        with urllib.request.urlopen(cls.base_url + endpoint, timeout=2) as response:
            return json.load(response)

    def post(self, endpoint, files):
        boundary = uuid.uuid4().hex
        body = bytearray()
        for name, data in files:
            body.extend(
                f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; '
                'filename="photo.jpg"\r\nContent-Type: image/jpeg\r\n\r\n'.encode()
            )
            body.extend(data)
            body.extend(b"\r\n")
        body.extend(f"--{boundary}--\r\n".encode())
        request = urllib.request.Request(
            self.base_url + endpoint,
            data=bytes(body),
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        )
        try:
            response = urllib.request.urlopen(request, timeout=10)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            return response.status, json.load(response)

    def test_health_after_model_loading(self):
        self.assertEqual(self.get("/health")["status"], "ok")

    def test_models_load_from_another_working_directory(self):
        self.assertEqual(list(self.work_dir.glob("*.onnx")), [])

    def test_registration_endpoint_exists(self):
        schema = self.get("/openapi.json")
        self.assertIn("post", schema["paths"]["/extract-embedding"])

    def test_rejects_empty_invalid_and_faceless_images(self):
        _, blank = cv2.imencode(".png", np.zeros((320, 320, 3), dtype=np.uint8))
        for image in [b"", b"not an image", blank.tobytes()]:
            with self.subTest(size=len(image)):
                status, data = self.post("/extract-embedding", [("image", image)])
                self.assertEqual(status, 400)
                self.assertIn("Wajah tidak terdeteksi", data["detail"])

    def test_registration_requires_the_image_field(self):
        status, _ = self.post("/extract-embedding", [("wrong_field", b"image")])
        self.assertEqual(status, 422)

    def test_verification_rejects_images_without_faces(self):
        status, data = self.post(
            "/verify-face", [("master_image", b"invalid"), ("snapshot_image", b"invalid")]
        )
        self.assertEqual(status, 200)
        self.assertFalse(data["matched"])

    @unittest.skipUnless(os.environ.get("AI_TEST_FACE_IMAGE"), "AI_TEST_FACE_IMAGE not set")
    def test_extracts_real_face_embedding(self):
        image = Path(os.environ["AI_TEST_FACE_IMAGE"]).read_bytes()
        status, data = self.post("/extract-embedding", [("image", image)])
        self.assertEqual(status, 200)
        self.assertTrue(data["success"])
        self.assertEqual(len(data["embedding"]), 128)
        self.assertTrue(all(math.isfinite(value) for value in data["embedding"]))

    @unittest.skipUnless(os.environ.get("AI_TEST_FACE_IMAGE"), "AI_TEST_FACE_IMAGE not set")
    def test_matches_the_same_real_face(self):
        image = Path(os.environ["AI_TEST_FACE_IMAGE"]).read_bytes()
        status, data = self.post(
            "/verify-face", [("master_image", image), ("snapshot_image", image)]
        )
        self.assertEqual(status, 200)
        self.assertTrue(data["matched"])


if __name__ == "__main__":
    unittest.main()
