import assert from "node:assert/strict";
import test from "node:test";
import { attendanceDateFilter, localClockMinutes, parseDateOnly, todayDateOnly } from "../src/utils/dateOnly";

test("calendar dates retain the requested date instead of shifting to the previous day", () => {
  for (const value of ["2026-09-14", "2026-09-15", "2026-10-18", "2024-02-29"]) {
    assert.equal(parseDateOnly(value).toISOString(), `${value}T00:00:00.000Z`);
  }
});

test("invalid and ambiguous calendar date inputs are rejected", () => {
  for (const value of ["2026-02-29", "2026-02-30", "2026-13-01", "2026-00-01", "18/10/2026", "2026-10-18T00:00:00Z", ""]) {
    assert.throws(() => parseDateOnly(value), { statusCode: 400 });
  }
});

test("today and shift clock follow the application timezone across UTC midnight", () => {
  const now = new Date("2026-10-25T18:30:00.000Z");
  assert.equal(todayDateOnly(now, "Asia/Jakarta").toISOString(), "2026-10-26T00:00:00.000Z");
  assert.equal(localClockMinutes(now, "Asia/Jakarta"), 90);
  assert.equal(todayDateOnly(now, "UTC").toISOString(), "2026-10-25T00:00:00.000Z");
  assert.equal(localClockMinutes(now, "UTC"), 18 * 60 + 30);
});

test("date ranges are inclusive and reject reversed or conflicting filters", () => {
  const filter = attendanceDateFilter({tanggalMulai:"2026-09-14", tanggalSelesai:"2026-09-15"});
  assert.deepEqual(filter, {gte:parseDateOnly("2026-09-14"),lte:parseDateOnly("2026-09-15")});
  assert.equal(attendanceDateFilter({}), undefined);
  assert.throws(() => attendanceDateFilter({tanggalMulai:"2026-09-15",tanggalSelesai:"2026-09-14"}), {statusCode:400});
  assert.throws(() => attendanceDateFilter({tanggal:"2026-09-14",tanggalMulai:"2026-09-14"}), {statusCode:400});
});
