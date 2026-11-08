import { S, mergeProgress } from "./store";
import { getName, setName, initials, greeting } from "./profile";

beforeEach(() => { S.progress = { days: [], counts: {}, drills: {} }; });
test("đặt / đọc tên, cắt khoảng trắng, giới hạn độ dài", () => {
  expect(getName()).toBe("");
  setName("  Hoàng  "); expect(getName()).toBe("Hoàng");
  setName("x".repeat(80)); expect(getName().length).toBe(40);
});
test("chữ viết tắt từ tên, rồi từ email", () => {
  expect(initials("Phạm Bá Hoàng", "")).toBe("PH");
  expect(initials("Hoàng", "")).toBe("HO");
  expect(initials("", "datpq@sankei.jp")).toBe("DA");
  expect(initials("", "")).toBe("?");
});
test("lời chào theo giờ", () => {
  expect(greeting(new Date(2026, 10, 8, 8), "Hoàng")).toBe("Chào buổi sáng, Hoàng");
  expect(greeting(new Date(2026, 10, 8, 14), "")).toBe("Chào buổi chiều");
  expect(greeting(new Date(2026, 10, 8, 20), "Hoàng")).toBe("Chào buổi tối, Hoàng");
});
test("gộp 2 máy: tên đổi sau thắng", () => {
  const m = mergeProgress({ profile: { name: "A", t: 5 } }, { profile: { name: "B", t: 9 } });
  expect(m.profile.name).toBe("B");
  expect(mergeProgress({ profile: { name: "A", t: 5 } }, {}).profile.name).toBe("A");
});
