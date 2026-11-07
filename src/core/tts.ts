// đọc tiếng Nhật bằng speechSynthesis của trình duyệt
import { toast } from "./util";

let jaVoice=null, warnedVoice=false;
function pickVoice(){ try{ jaVoice=speechSynthesis.getVoices().find(v=>/^ja/i.test(v.lang))||null; }catch(e){} }
if("speechSynthesis" in window){ pickVoice(); speechSynthesis.onvoiceschanged=pickVoice; }
function say(text){
  if(!("speechSynthesis" in window)){toast("Trình duyệt này không có chức năng đọc.");return;}
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text.replace(/[ 　]/g,""));
    u.lang="ja-JP"; u.rate=0.85; if(jaVoice) u.voice=jaVoice;
    speechSynthesis.speak(u);
    if(!jaVoice&&!warnedVoice){warnedVoice=true;toast("Máy chưa cài giọng tiếng Nhật, có thể đọc sai. Hãy cài giọng Japanese trong cài đặt máy.");}
  }catch(e){toast("Không phát được âm thanh.");}
}
function speakSeq(list){
  if(!("speechSynthesis" in window)){toast("Trình duyệt này không có chức năng đọc.");return;}
  try{speechSynthesis.cancel();list.forEach(([t,p])=>{const u=new SpeechSynthesisUtterance(String(t).replace(/[ 　]/g,""));u.lang="ja-JP";u.rate=.9;u.pitch=p||1;if(jaVoice)u.voice=jaVoice;speechSynthesis.speak(u);});}catch(e){}
}

// có đọc được tiếng Nhật không: không có speechSynthesis → không; danh sách giọng đã có mà không có giọng ja → không
function canListen(){
  if(typeof window==="undefined"||!("speechSynthesis" in window)) return false;
  try{ const vs=speechSynthesis.getVoices(); return !vs.length || vs.some(v=>/^ja/i.test(v.lang)); }catch(e){ return true; }
}

export { pickVoice, say, speakSeq, canListen };
