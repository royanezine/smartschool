import assert from "node:assert/strict";
import test from "node:test";
import { artikelCmsSchema, halamanCmsSchema } from "../src/validations/cms.validation";

test("CMS writes normalize published aliases to dipublikasikan", () => {
  for (const schema of [halamanCmsSchema, artikelCmsSchema]) {
    for (const status of ["dipublikasikan", "publikasi", "aktif"]) {
      assert.equal(schema.parse({judul:"Halaman pengujian",status}).status,"dipublikasikan");
    }
  }
});

test("CMS defaults to draft and retains private statuses", () => {
  assert.equal(halamanCmsSchema.parse({judul:"Halaman baru"}).status,"draft");
  for (const status of ["draft","nonaktif","arsip"]) {
    assert.equal(halamanCmsSchema.parse({judul:"Halaman privat",status}).status,status);
  }
});

test("CMS rejects unrecognized publication statuses", () => {
  for (const schema of [halamanCmsSchema,artikelCmsSchema]) {
    assert.equal(schema.safeParse({judul:"Halaman pengujian",status:"status-tidak-dikenal"}).success,false);
  }
});
