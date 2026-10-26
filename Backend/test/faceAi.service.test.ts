import assert from "node:assert/strict";
import { createServer, RequestListener, Server } from "node:http";
import { AddressInfo } from "node:net";
import test from "node:test";
import FormData from "form-data";
import { postToFaceAi } from "../src/services/faceAi.service";
import { AppError } from "../src/utils/appError";

function imageForm() {
  const form = new FormData();
  form.append("image", Buffer.from("test-image"), "face.jpg");
  return form;
}

async function withAiServer(
  handler: RequestListener,
  run: (url: string, server: Server) => Promise<void>,
) {
  const server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  const originalUrl = process.env.AI_SERVICE_URL;
  const url = `http://127.0.0.1:${port}`;
  process.env.AI_SERVICE_URL = `${url}/`;
  try {
    await run(url, server);
  } finally {
    if (originalUrl === undefined) delete process.env.AI_SERVICE_URL;
    else process.env.AI_SERVICE_URL = originalUrl;
    if (server.listening) {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  }
}

test("sends the registration photo as multipart and accepts the embedding", async () => {
  await withAiServer(
    (req, res) => {
      assert.equal(req.method, "POST");
      assert.equal(req.url, "/extract-embedding");
      assert.match(req.headers["content-type"] ?? "", /^multipart\/form-data;/);
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        assert.match(body, /name="image"; filename="face.jpg"/);
        assert.match(body, /test-image/);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true, embedding: [0.1, 0.2] }));
      });
    },
    async () => {
      const response = await postToFaceAi("/extract-embedding", imageForm());
      assert.deepEqual(response.data, { success: true, embedding: [0.1, 0.2] });
    },
  );
});

for (const scenario of [
  {
    status: 400,
    body: { detail: "Wajah tidak terdeteksi." },
    expectedStatus: 400,
    expectedCode: "AI_FACE_INVALID_IMAGE",
    expectedMessage: /Wajah tidak terdeteksi\./,
  },
  {
    status: 422,
    body: { detail: [{ loc: ["body", "image"], msg: "Field required" }] },
    expectedStatus: 400,
    expectedCode: "AI_FACE_INVALID_IMAGE",
    expectedMessage: /Foto wajah tidak valid/,
  },
  {
    status: 404,
    body: { detail: "Not Found" },
    expectedStatus: 502,
    expectedCode: "AI_FACE_ENDPOINT_NOT_FOUND",
    expectedMessage: /Endpoint \/extract-embedding tidak ditemukan/,
  },
  {
    status: 500,
    body: { detail: "private Python traceback" },
    expectedStatus: 502,
    expectedCode: "AI_FACE_ERROR",
    expectedMessage: /Periksa log server Python/,
  },
]) {
  test(`maps AI HTTP ${scenario.status} to a useful backend error`, async () => {
    await withAiServer(
      (req, res) => {
        req.resume();
        res.writeHead(scenario.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(scenario.body));
      },
      async () => {
        await assert.rejects(
          postToFaceAi("/extract-embedding", imageForm()),
          (error: unknown) => {
            assert.ok(error instanceof AppError);
            assert.equal(error.statusCode, scenario.expectedStatus);
            assert.equal(error.errorCode, scenario.expectedCode);
            assert.match(error.message, scenario.expectedMessage);
            assert.doesNotMatch(error.message, /private Python traceback/);
            return true;
          },
        );
      },
    );
  });
}

test("reports a refused connection as 503 with the AI server address", async () => {
  await withAiServer(
    (req) => req.socket.destroy(),
    async (url, server) => {
      // Stop the listener before calling AI to reproduce ECONNREFUSED.
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await assert.rejects(
        postToFaceAi("/verify-face", imageForm()),
        (error: unknown) => {
          assert.ok(error instanceof AppError);
          assert.equal(error.statusCode, 503);
          assert.equal(error.errorCode, "AI_FACE_UNAVAILABLE");
          assert.ok(error.message.includes(url));
          assert.match(error.message, /server Python sudah berjalan/);
          return true;
        },
      );
    },
  );
});
