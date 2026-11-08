// Project URL của Supabase: người dùng hay dán kèm đuôi /rest/v1/ (copy từ trang API) → cắt về địa chỉ gốc.
export const baseUrl = (u: string) => String(u || "").trim().replace(/\/+(rest|auth|storage|realtime|functions)\/v1\/?$/i, "").replace(/\/+$/, "");

const isJwt = (s: string) => /^eyJ[\w-]+\.[\w-]+\.[\w-]*$/.test(s);
const isUrl = (s: string) => /^https:\/\/\S+$/.test(s);
// mã dự án (ref) nằm trong phần giữa của anon key
function refOf(jwt: string): string {
  try {
    const p = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = p + "===".slice((p.length + 3) % 4);
    const txt = atob(padded);
    const ref = JSON.parse(txt).ref;
    return /^[a-z0-9]{3,40}$/.test(ref || "") ? ref : "";
  } catch (e) { return ""; }
}

// Đọc cấu hình, tự sửa các kiểu dán nhầm hay gặp trên Vercel: đảo 2 ô, hoặc dán khoá vào ô URL.
export function resolveConfig(urlIn: string, keyIn: string): { url: string; key: string; fixed: boolean } {
  const url = String(urlIn || "").trim(), key = String(keyIn || "").trim();
  if (isJwt(url) && isUrl(key)) return { url: baseUrl(key), key: url, fixed: true };
  if (isJwt(url)) {
    const k = isJwt(key) ? key : url, ref = refOf(k);
    if (ref) return { url: `https://${ref}.supabase.co`, key: k, fixed: true };
  }
  return { url: baseUrl(url), key, fixed: false };
}
