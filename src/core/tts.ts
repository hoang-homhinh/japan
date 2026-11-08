// đọc tiếng Nhật bằng speechSynthesis của trình duyệt. Nút đang đọc được gắn lớp .speaking để thấy đã bấm.
import { toast } from "./util";

let jaVoice: any = null, lastWarn = 0, active: HTMLElement | null = null;
function pickVoice() { try { jaVoice = speechSynthesis.getVoices().find(v => /^ja/i.test(v.lang)) || null; } catch (e) {} }
if (typeof window !== "undefined" && "speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

const NO_VOICE = "Máy chưa có giọng đọc tiếng Nhật nên âm thanh có thể sai hoặc im lặng. Máy tính Windows: Cài đặt → Thời gian và ngôn ngữ → Giọng nói → Thêm giọng Japanese. Điện thoại: cài giọng tiếng Nhật trong mục Chuyển văn bản thành giọng nói.";
function warnNoVoice() {
  let loaded = 0; try { loaded = speechSynthesis.getVoices().length; } catch (e) {}
  if (jaVoice || !loaded || Date.now() - lastWarn < 60000) return;
  lastWarn = Date.now(); toast(NO_VOICE);
}
function mark(el: HTMLElement | null | undefined) {
  if (active) active.classList.remove("speaking");
  active = el || null; if (active) active.classList.add("speaking");
}
const unmark = (el: HTMLElement | null) => () => { if (active === el) mark(null); };

function say(text: string, el?: HTMLElement | null) {
  if (!("speechSynthesis" in window)) { toast("Trình duyệt này không có chức năng đọc."); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/[ 　]/g, ""));
    u.lang = "ja-JP"; u.rate = 0.85; if (jaVoice) u.voice = jaVoice;
    mark(el); u.onend = u.onerror = unmark(el || null);
    speechSynthesis.speak(u);
    warnNoVoice();
  } catch (e) { mark(null); toast("Không phát được âm thanh."); }
}
function speakSeq(list: [string, number][], el?: HTMLElement | null) {
  if (!("speechSynthesis" in window)) { toast("Trình duyệt này không có chức năng đọc."); return; }
  try {
    speechSynthesis.cancel(); mark(el);
    list.forEach(([t, p], i) => {
      const u = new SpeechSynthesisUtterance(String(t).replace(/[ 　]/g, ""));
      u.lang = "ja-JP"; u.rate = .9; u.pitch = p || 1; if (jaVoice) u.voice = jaVoice;
      if (i === list.length - 1) u.onend = u.onerror = unmark(el || null);
      speechSynthesis.speak(u);
    });
    warnNoVoice();
  } catch (e) { mark(null); }
}

// có đọc được tiếng Nhật không: không có speechSynthesis → không; danh sách giọng đã có mà không có giọng ja → không
function canListen() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try { const vs = speechSynthesis.getVoices(); return !vs.length || vs.some(v => /^ja/i.test(v.lang)); } catch (e) { return true; }
}

export { pickVoice, say, speakSeq, canListen };
