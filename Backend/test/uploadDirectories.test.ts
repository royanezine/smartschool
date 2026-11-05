import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { ensureUploadDirectories } from "../src/utils/uploadDirectories";

test("upload startup creates all required directories and preserves existing files", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "smartschool-uploads-"));
  try {
    ensureUploadDirectories(root);
    for (const folder of ["materi","absensi","biometrik","izin","ppdb","buku","nilai","siswa","logo","avatar"]) {
      assert.ok(fs.statSync(path.join(root,"uploads",folder)).isDirectory());
    }
    const file = path.join(root,"uploads","materi","existing.txt");
    fs.writeFileSync(file,"preserve"); ensureUploadDirectories(root);
    assert.equal(fs.readFileSync(file,"utf8"),"preserve");
  } finally {
    assert.equal(path.dirname(path.resolve(root)),path.resolve(os.tmpdir()));
    fs.rmSync(root,{recursive:true,force:true});
  }
});
