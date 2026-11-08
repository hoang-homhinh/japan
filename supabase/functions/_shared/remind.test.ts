import { localParts, shouldSend, streakFrom, mailContent } from "./remind";

const r = { user_id: "u", email: "a@b.c", time_local: "21:00", tz: "Asia/Tokyo", enabled: true, last_sent: null as string | null };
// 2026-11-08 12:10 UTC = 21:10 giờ Tokyo
const now = new Date("2026-11-08T12:10:00Z");

test("giờ địa phương theo múi giờ", () => {
  expect(localParts(now, "Asia/Tokyo")).toEqual({ date: "2026-11-08", hm: "21:10" });
  expect(localParts(now, "Asia/Ho_Chi_Minh")).toEqual({ date: "2026-11-08", hm: "19:10" });
  expect(localParts(new Date("2026-11-08T15:00:00Z"), "Asia/Tokyo")).toEqual({ date: "2026-11-09", hm: "00:00" });
});
test("gửi khi đã tới giờ (trong vòng 60 phút), hôm nay chưa học, chưa gửi", () => {
  expect(shouldSend(r, now, [])).toBe(true);
});
test("không gửi: chưa tới giờ, quá 60 phút, đã học hôm nay, đã gửi, đang tắt, thiếu email", () => {
  expect(shouldSend({ ...r, time_local: "21:30" }, now, [])).toBe(false);
  expect(shouldSend({ ...r, time_local: "19:30" }, now, [])).toBe(false);
  expect(shouldSend(r, now, ["2026-11-08"])).toBe(false);
  expect(shouldSend({ ...r, last_sent: "2026-11-08" }, now, [])).toBe(false);
  expect(shouldSend({ ...r, enabled: false }, now, [])).toBe(false);
  expect(shouldSend({ ...r, email: "" }, now, [])).toBe(false);
});
test("chuỗi ngày tính tới hôm qua nếu hôm nay chưa học", () => {
  expect(streakFrom(["2026-11-05", "2026-11-06", "2026-11-07"], "2026-11-08")).toBe(3);
  expect(streakFrom(["2026-11-06"], "2026-11-08")).toBe(0);
});
test("nội dung mail có tên, chuỗi ngày, link app; không chèn HTML lạ", () => {
  const m = mailContent({ name: "Hoàng<b>", streak: 3, lesson: 13, title: "Muốn có", app: "https://michi.example" });
  expect(m.subject).toContain("Michi");
  expect(m.text).toContain("3 ngày");
  expect(m.html).toContain("https://michi.example");
  expect(m.html).not.toContain("<b>");
  expect(m.html).toContain("Hoàng&lt;b&gt;");
});
