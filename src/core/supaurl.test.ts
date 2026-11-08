import { baseUrl } from "./supaurl";

test("cắt đuôi /rest/v1/, /auth/v1 và dấu / thừa", () => {
  expect(baseUrl("https://qwjwvsdphvwhnvugcdun.supabase.co/rest/v1/")).toBe("https://qwjwvsdphvwhnvugcdun.supabase.co");
  expect(baseUrl("https://abc.supabase.co/rest/v1")).toBe("https://abc.supabase.co");
  expect(baseUrl("https://abc.supabase.co/auth/v1/")).toBe("https://abc.supabase.co");
  expect(baseUrl(" https://abc.supabase.co/ ")).toBe("https://abc.supabase.co");
  expect(baseUrl("https://abc.supabase.co")).toBe("https://abc.supabase.co");
  expect(baseUrl("")).toBe("");
});

import { resolveConfig } from "./supaurl";
const b64 = (o: any) => btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
const JWT = `${b64({ alg: "HS256" })}.${b64({ iss: "supabase", ref: "abcref", role: "anon" })}.sig`;

describe("resolveConfig: tự sửa khi dán nhầm ô", () => {
  test("đúng chuẩn thì giữ nguyên", () => {
    expect(resolveConfig("https://abcref.supabase.co/rest/v1/", JWT)).toEqual({ url: "https://abcref.supabase.co", key: JWT, fixed: false });
  });
  test("hai ô bị đảo: URL nằm ở ô khoá, khoá nằm ở ô URL", () => {
    expect(resolveConfig(JWT, "https://abcref.supabase.co")).toEqual({ url: "https://abcref.supabase.co", key: JWT, fixed: true });
  });
  test("ô URL chứa khoá, ô khoá cũng là khoá: lấy địa chỉ từ mã dự án trong khoá", () => {
    expect(resolveConfig(JWT, JWT)).toEqual({ url: "https://abcref.supabase.co", key: JWT, fixed: true });
  });
  test("ô URL chứa khoá, ô khoá trống", () => {
    expect(resolveConfig(JWT, "")).toEqual({ url: "https://abcref.supabase.co", key: JWT, fixed: true });
  });
  test("không suy ra được thì trả nguyên để báo lỗi", () => {
    expect(resolveConfig("abc", "").url).toBe("abc");
    expect(resolveConfig("", "").url).toBe("");
  });
});
