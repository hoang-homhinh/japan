import { baseUrl } from "./supaurl";

test("cắt đuôi /rest/v1/, /auth/v1 và dấu / thừa", () => {
  expect(baseUrl("https://qwjwvsdphvwhnvugcdun.supabase.co/rest/v1/")).toBe("https://qwjwvsdphvwhnvugcdun.supabase.co");
  expect(baseUrl("https://abc.supabase.co/rest/v1")).toBe("https://abc.supabase.co");
  expect(baseUrl("https://abc.supabase.co/auth/v1/")).toBe("https://abc.supabase.co");
  expect(baseUrl(" https://abc.supabase.co/ ")).toBe("https://abc.supabase.co");
  expect(baseUrl("https://abc.supabase.co")).toBe("https://abc.supabase.co");
  expect(baseUrl("")).toBe("");
});
