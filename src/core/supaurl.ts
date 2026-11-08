// Project URL của Supabase: người dùng hay dán kèm đuôi /rest/v1/ (copy từ trang API) → cắt về địa chỉ gốc.
export const baseUrl = (u: string) => String(u || "").trim().replace(/\/+(rest|auth|storage|realtime|functions)\/v1\/?$/i, "").replace(/\/+$/, "");
