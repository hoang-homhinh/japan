// Tab Ngữ pháp (Mẫu câu): xem mẫu → thay thế → tự đặt câu và so với câu mẫu
import { LESSONS } from "../content/lessons";
import { kanaToRomaji, norm, showKana } from "../core/kana";
import { LS_KEY, S, bump, dailyInc, newSentence, saveProgress } from "../core/store";
import { say } from "../core/tts";
import { savedHTML } from "../core/cards";
import { $, esc, toast } from "../core/util";

let curL=0, curP=0;
try{const o=JSON.parse(localStorage.getItem(LS_KEY+"_pos")||"null");if(o){curL=o.l|0;curP=o.p|0;}}catch(e){}
curL=Math.min(Math.max(curL,0),LESSONS.length-1); curP=Math.min(Math.max(curP,0),LESSONS[curL].patterns.length-1);
const passed={}; // drill đã đúng trong lần mở này
function savePos(){try{localStorage.setItem(LS_KEY+"_pos",JSON.stringify({l:curL,p:curP}));}catch(e){}}
function patternDone(p){const d=S.progress.drills[p.id]||[];return d.length>=p.drills.length;}

function exHTML(jp,vi){
  return `<div class="ex"><div class="body"><div class="jp">${esc(jp)}</div><div class="ro">${esc(kanaToRomaji(jp))}</div><div class="vi">${esc(vi)}</div></div><button class="say" data-say="${esc(jp)}" aria-label="Nghe">🔊</button></div>`;
}
function renderLearnChips(){
  const box=$("#lessonChips"); if(!box) return;
  const L=LESSONS[curL];
  $("#patChips").innerHTML=L.patterns.map((p,i)=>`<button class="chip" data-pat="${i}" aria-pressed="${i===curP}">Mẫu ${i+1}${patternDone(p)?'<span class="done">✓</span>':""}</button>`).join("");
}
function renderLearn(){
  const L=LESSONS[curL], P=L.patterns[curP];
  $("#main").innerHTML=`
  <div class="plan"><span>Mỗi ngày <b>10 câu</b>: làm hết 1 mẫu (thay thế + tự đặt câu), rồi qua tab <b>Ôn sổ câu</b>.</span><button class="btn ghost" id="resumeBtn">Học tiếp →</button></div>
  <div class="chips" id="lessonChips">${LESSONS.map((l,i)=>`<button class="chip" data-les="${i}" aria-pressed="${i===curL}">Bài ${l.n}</button>`).join("")}</div>
  <div class="chips" id="patChips"></div>
  <p class="lesson-title">Bài ${L.n} · ${esc(L.title)} · Mẫu ${curP+1}/${L.patterns.length}</p>
  <div class="formula">${esc(P.form)}</div>
  <p class="mean">${esc(P.mean)}</p>

  <section class="step"><h2><span class="k">一</span>Xem mẫu<span class="hint">bấm 🔊 nghe, đọc theo</span></h2>
    <p class="note">${esc(P.explain)}</p>
    <p class="trap"><b>Bẫy:</b> ${esc(P.trap)} <button class="lnk" data-view="notes">Xem tất cả trường hợp đặc biệt →</button></p>
    ${P.more&&P.more.length?`<div class="more"><b>Chú ý thêm</b><ul>${P.more.map(m=>`<li>${esc(m)}</li>`).join("")}</ul></div>`:""}
    ${P.ex.map(e=>exHTML(e[0],e[1])).join("")}
  </section>

  <section class="step"><h2><span class="k">二</span>Thay thế &amp; biến đổi<span class="hint">gõ kana hoặc romaji</span></h2>
    ${P.drills.map((d,i)=>{const key=P.id+"#"+i;const was=(S.progress.drills[P.id]||[]).includes(i);return `
    <div class="drill">
      <div class="q"><span class="jp">${esc(d.base)}</span><span class="cue">${esc(d.cue)}</span></div>
      <div class="row"><input id="d-${P.id}-${i}" data-drill="${i}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${was?"Đã làm đúng. Gõ lại để ôn":"Gõ câu trả lời…"}"><button class="btn" data-check="${i}">Kiểm tra</button></div>
      <div class="preview" id="pv-${P.id}-${i}"></div>
      <div id="r-${P.id}-${i}"></div>
    </div>`}).join("")}
  </section>

  <section class="step"><h2><span class="k">三</span>Tự đặt câu<span class="hint">nói về chính bạn</span></h2>
    ${P.prompts.map((q,i)=>`
    <div class="prompt">
      <div class="ask">${esc(q.vi)}</div><div class="h">Gợi ý: <span class="jp" style="font-size:.95rem">${esc(q.hint)}</span></div>
      <textarea id="p-${P.id}-${i}" data-prompt="${i}" rows="1" placeholder="Viết câu của bạn…" autocapitalize="off" spellcheck="false"></textarea>
      <div class="preview" id="ppv-${P.id}-${i}"></div>
      <div id="pr-${P.id}-${i}"></div>
    </div>`).join("")}
    <div class="prompt">
      <div class="ask">Câu tự do (không bắt buộc)</div><div class="h">Đặt thêm bất kỳ câu nào dùng mẫu này.</div>
      <textarea id="p-${P.id}-free" data-prompt="free" rows="1" placeholder="Viết câu của bạn…" autocapitalize="off" spellcheck="false"></textarea>
      <div class="preview" id="ppv-${P.id}-free"></div>
      <div id="pr-${P.id}-free"></div>
    </div>
    <div class="row" style="align-items:center;flex-wrap:wrap"><button class="btn accent" id="cmpBtn">So với câu mẫu</button><span class="status" id="cmpStatus"></span></div>
    <p class="tip"><span class="k" style="font-family:var(--jp);color:var(--accent)">四</span> <b>Nói to:</b> sau khi so với câu mẫu và chọn lưu, mỗi câu có 🔊 và 3 chấm. Nghe một lần, rồi đọc to theo 3 lần, mỗi lần đọc chạm một chấm. Câu đã lưu vào <b>Sổ câu</b> để hôm sau ôn lại.</p>
  </section>

  <div class="nav">
    <button class="btn ghost" id="prevBtn">← Mẫu trước</button>
    <button class="btn" id="nextBtn">Mẫu tiếp →</button>
  </div>`;
  renderLearnChips();
  $("#prevBtn").disabled=curL===0&&curP===0;
  $("#nextBtn").disabled=curL===LESSONS.length-1&&curP===L.patterns.length-1;
}
function go(l,p){curL=l;curP=p;savePos();renderLearn();window.scrollTo({top:0});}

function checkDrill(i){
  const P=LESSONS[curL].patterns[curP], d=P.drills[i];
  const inp=$(`#d-${P.id}-${i}`), out=$(`#r-${P.id}-${i}`);
  const v=inp.value.trim(); if(!v){inp.focus();return;}
  const ok=d.a.some(a=>norm(a)===norm(v));
  if(ok){
    out.innerHTML=`<div class="res ok">✓ Đúng rồi! <span class="jp">${esc(d.a[0])}</span> <button class="say" style="display:inline-grid;vertical-align:middle;width:28px;height:28px" data-say="${esc(d.a[0])}" aria-label="Nghe">🔊</button></div>`;
    const key=P.id+"#"+i;
    if(!passed[key]){passed[key]=true;bump(1);dailyInc("gram");}
    const arr=S.progress.drills[P.id]||[]; if(!arr.includes(i)){arr.push(i);S.progress.drills[P.id]=arr;saveProgress();renderLearnChips();}
  }else{
    out.innerHTML=`<div class="res bad">Chưa khớp. Đáp án mẫu: <span class="jp">${esc(d.a[0])}</span> <button class="say" style="display:inline-grid;vertical-align:middle;width:28px;height:28px" data-say="${esc(d.a[0])}" aria-label="Nghe">🔊</button><br><span style="font-size:.82rem">Nếu bạn viết kanji hoặc cách nói khác, có thể câu vẫn đúng. Hãy tự so với đáp án mẫu, hoặc viết câu đó ở phần “Câu tự do” để lưu vào sổ.</span></div>`;
  }
}

function fixHTML(ok,own,jp,vi,note,kana?){
  const rd=kana||jp;
  return `<div class="fix ${ok?"ok":"bad"}">
    <span class="badge">${ok?"✓ Đúng":"✎ Sửa lại"}</span>
    ${ok?"":`<div><del>${esc(own)}</del></div>`}
    <div class="row" style="align-items:center"><div style="flex:1;min-width:0"><div class="jp">${esc(jp)}</div><div class="ro">${esc(kanaToRomaji(rd))}</div></div><button class="say" data-say="${esc(rd)}" aria-label="Nghe">🔊</button></div>
    <div class="vi">${esc(vi)}</div>
    ${note?`<div style="font-size:.88rem">${esc(note)}</div>`:""}
    <div class="dots">Đọc to: <button class="dot" aria-pressed="false" aria-label="Lần 1"></button><button class="dot" aria-pressed="false" aria-label="Lần 2"></button><button class="dot" aria-pressed="false" aria-label="Lần 3"></button></div>
  </div>`;
}

// ---- bước 三: tự đặt câu → so với câu mẫu (không dùng AI) ----
const cmpTxt={}; // "pid|k" → câu đã đem so (tránh lưu trùng)
function cmpHTML(k,own,q){
  const kana=showKana(own);
  return `<div class="fix"><span class="badge">So với câu mẫu</span>
    <div class="cmp"><div><div class="tip">Câu của bạn</div><div class="jp">${esc(kana)}</div>${kana!==own?`<div class="ro">${esc(own)}</div>`:""}</div>
    <div><div class="tip">Câu mẫu</div><div class="row" style="align-items:center"><div style="flex:1;min-width:0"><div class="jp">${esc(q.ex)}</div><div class="ro">${esc(kanaToRomaji(q.ex))}</div></div><button class="say" data-say="${esc(q.ex)}" aria-label="Nghe">🔊</button></div></div></div>
    <div class="tip">Câu mẫu chỉ là một cách nói. Câu của bạn khác chữ vẫn có thể đúng: để ý trợ từ, đuôi câu và đúng ý câu hỏi.</div>
    <div class="row" style="flex-wrap:wrap"><button class="btn ghost" data-cmpok="${k}">Câu tôi đúng ý</button><button class="btn ghost" data-cmpfix="${k}">Tôi viết sai, lưu câu mẫu</button></div></div>`;
}
function runCompare(){
  const L=LESSONS[curL], P=L.patterns[curP];
  let n=0;
  [...P.prompts.map((_,i)=>i),"free"].forEach(k=>{
    const el=$(`#p-${P.id}-${k}`), t=el?el.value.trim():"", key=P.id+"|"+k;
    if(!t||cmpTxt[key]===t) return;
    cmpTxt[key]=t; n++;
    const box=$(`#pr-${P.id}-${k}`)||{};
    if(k==="free"){
      const s=newSentence({jp:showKana(t),vi:"Câu tự do dùng mẫu "+P.form,own:t,lesson:L.n,pid:P.id});
      bump(1);
      box.innerHTML=savedHTML(s.jp,s.vi,"Câu tự do không chấm. Tự đọc lại, thấy sai thì sửa rồi bấm so lại.");
      return;
    }
    box.innerHTML=cmpHTML(k,t,P.prompts[k]);
  });
  if(!n){toast("Chưa có câu mới. Hãy viết câu (hoặc sửa câu cũ) rồi bấm lại.");return;}
  ($("#cmpStatus")||{}).textContent="Đọc câu mẫu, tự so với câu của bạn rồi chọn cách lưu.";
}
function saveCompared(k,mine){
  const L=LESSONS[curL], P=L.patterns[curP], q=P.prompts[k], own=cmpTxt[P.id+"|"+k];
  if(!q||own==null) return;
  const s=newSentence({jp:mine?showKana(own):q.ex,vi:q.vi,own,lesson:L.n,pid:P.id});
  bump(1);
  ($(`#pr-${P.id}-${k}`)||{}).innerHTML=fixHTML(mine,own,s.jp,s.vi,mine?"Đã lưu câu của bạn vào Sổ câu.":"Đã lưu câu mẫu vào Sổ câu. Hôm sau ôn lại câu này.");
}
// mở một mẫu (dùng khi đi từ tab khác sang)
function gotoPattern(l,p){curL=l;curP=p;savePos();}
const curPattern=()=>LESSONS[curL]?.patterns[curP];
function onClick(t){
  if(t.dataset.les!==undefined){go(+t.dataset.les,0);return true;}
  if(t.dataset.pat!==undefined){go(curL,+t.dataset.pat);return true;}
  if(t.dataset.check!==undefined){checkDrill(+t.dataset.check);return true;}
  if(t.id==="cmpBtn"){runCompare();return true;}
  if(t.dataset.cmpok!==undefined){saveCompared(+t.dataset.cmpok,true);return true;}
  if(t.dataset.cmpfix!==undefined){saveCompared(+t.dataset.cmpfix,false);return true;}
  if(t.id==="resumeBtn"){ for(let l=0;l<LESSONS.length;l++)for(let p=0;p<LESSONS[l].patterns.length;p++) if(!patternDone(LESSONS[l].patterns[p])){go(l,p);return true;} toast("Bạn đã làm hết bài tập Bài 1–"+LESSONS[LESSONS.length-1].n+"!"); return true; }
  if(t.id==="prevBtn"){ if(curP>0)go(curL,curP-1); else if(curL>0)go(curL-1,LESSONS[curL-1].patterns.length-1); return true; }
  if(t.id==="nextBtn"){ if(curP<LESSONS[curL].patterns.length-1)go(curL,curP+1); else if(curL<LESSONS.length-1)go(curL+1,0); return true; }
  return false;
}

export { onClick, gotoPattern, curPattern, curL, curP, passed, savePos, patternDone, exHTML, renderLearnChips, renderLearn, go, checkDrill, fixHTML };
