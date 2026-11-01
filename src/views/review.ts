// Tab Sổ câu: ôn câu tự đặt theo hộp Leitner (1 → 3 → 7 → 14 → 30 ngày)
import { kanaToRomaji } from "../core/kana";
import { S, bump, delSentence, dueList, renderStats, saveSentence } from "../core/store";
import { say } from "../core/tts";
import { $, addDays, dayStr, esc } from "../core/util";

const lessonLabel=l=>typeof l==="number"||/^\d+$/.test(String(l))?"Bài "+l:String(l);
const BOX_DAYS=[0,1,3,7,14,30];
let queue=[], revealed=false;
function renderReview(){
  if(!queue.length) queue=dueList().map(s=>s.id);
  const cur=S.sentences.find(s=>s.id===queue[0]);
  const all=[...S.sentences].sort((a,b)=>String(b.created||"").localeCompare(String(a.created||""))); // created có thể là số trong file nhập
  $("#main").innerHTML=`
  ${cur?`<div class="card">
    <div class="tip">Còn ${queue.length} câu cần ôn hôm nay · ${esc(lessonLabel(cur.lesson))}</div>
    <div class="big">${esc(cur.vi)}</div>
    <div class="tip">Nói câu này bằng tiếng Nhật (nói to), rồi mới bấm xem.</div>
    ${revealed?`<div class="row" style="align-items:center"><div style="flex:1;min-width:0"><div class="jp" style="font-size:1.4rem">${esc(cur.jp)}</div><div class="ro">${esc(kanaToRomaji(cur.kana||cur.jp))}</div></div><button class="say" data-say="${esc(cur.kana||cur.jp)}" aria-label="Nghe">🔊</button></div>
      <div class="row"><button class="btn ghost" data-rev="0" style="flex:1">Quên, ôn lại</button><button class="btn accent" data-rev="1" style="flex:1">Nhớ rồi</button></div>`
    :`<button class="btn" id="showBtn">Xem câu</button>`}
  </div>`:`<div class="card"><div class="big">${S.sentences.length?"Hôm nay ôn xong rồi 🎉":"Sổ câu đang trống"}</div><div class="tip">${S.sentences.length?"Câu mới đặt sẽ đến lượt ôn từ ngày mai. Quay lại tab Học bài để đặt thêm câu.":"Vào tab Học bài, làm bước 三 “Tự đặt câu”. Câu bạn chọn lưu sẽ vào đây."}</div></div>`}
  <h2 style="font-size:1rem;margin:26px 0 0">Tất cả câu của bạn (${S.sentences.length})</h2>
  <div class="list">${all.length?all.map(s=>`<div class="item"><div class="body"><div class="jp" style="font-size:1.05rem">${esc(s.jp)}</div><div class="vi" style="font-size:.85rem">${esc(s.vi)}</div><div class="meta">${esc(lessonLabel(s.lesson))} · ôn lại ngày ${esc(s.next)}</div></div><button class="say" data-say="${esc(s.kana||s.jp)}" aria-label="Nghe">🔊</button><button class="x" data-del="${esc(s.id)}" aria-label="Xoá">✕</button></div>`).join(""):`<div class="empty">Chưa có câu nào.</div>`}</div>`;
}
function answer(remember){
  const s=S.sentences.find(x=>x.id===queue[0]); queue.shift(); revealed=false;
  if(s){
    if(remember){ s.box=Math.min(5,(s.box||1)+1); s.next=addDays(dayStr(),BOX_DAYS[s.box]); bump(1); }
    else{ s.box=1; s.next=dayStr(); queue.push(s.id); }
    saveSentence(s);
  }
  renderStats(); renderReview();
}

// mở tab Sổ câu từ đầu hàng đợi
function openReview(){queue=[];revealed=false;renderReview();}
function onClick(t){
  if(t.id==="showBtn"){revealed=true;renderReview();const c=S.sentences.find(x=>x.id===queue[0]);if(c)say(c.kana||c.jp);return true;}
  if(t.dataset.rev!==undefined){answer(t.dataset.rev==="1");return true;}
  if(t.dataset.del&&!t.dataset.armed){ t.dataset.armed="1"; t.textContent="Xoá?"; setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent="✕";}},3000); return true; }
  if(t.dataset.del){ const id=t.dataset.del; delSentence(id).then(()=>{queue=queue.filter(q=>q!==id);renderStats();renderReview();}); return true; }
  return false;
}

export { onClick, openReview, lessonLabel, BOX_DAYS, queue, revealed, renderReview, answer };
