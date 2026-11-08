// Tab Từ vựng: 25 bài — các lô, đặt câu, bảng từ (che nghĩa / che từ), tìm kiếm
import { VOCAB } from "../content/data";
import { LESSONS } from "../content/lessons";
import { examplesHTML, lvDots, savedHTML, vRow, writeBoxHTML } from "../core/cards";
import { findExamples } from "../core/corpus";
import { IV, setSrs } from "../core/srs";
import { gotoPattern } from "./learn";
import { MB, MS, mSave, mbHTML, mbKey, mbStart, renderMatch } from "./match";
import { setView, view } from "../app/shell";
import { norm, showKana } from "../core/kana";
import { LOTS, VFLAT, srs, vid } from "../core/srs";
import { LS_KEY, S, bump, newSentence, saveProgress } from "../core/store";
import { say } from "../core/tts";
import { $, addDays, dayStr, esc, fold, pick, segBtns, toast } from "../core/util";

let vCover=""; // bảng từ: "" hiện hết · "m" che nghĩa · "w" che từ
// ================= TỪ VỰNG (Bài 1–25, từ n5/baiXX_tuvung.md) =================
let vL=0, vQuiz=null, vWords3=null; const vpassed={}; const vSaved={};
try{const o=JSON.parse(localStorage.getItem(LS_KEY+"_vpos")||"null");if(o)vL=o.l|0;}catch(e){}
vL=Math.min(Math.max(vL,0),VOCAB.length-1);
const vFlat=l=>VOCAB[l].groups.flatMap(g=>g.w);
const vKnown=l=>new Set<any>(((S.progress.vocab||{})[VOCAB[l].n])||[]);
function vVariants(kana){
  // ／ = hai cách nói; [..] = phần có thể bỏ; （..） = cách nói khác
  const out=new Set<any>();
  String(kana).split(/[／/]/).forEach(p=>{p=p.trim();if(!p)return;
    const noOpt=p.replace(/[\[［][^\]］]*[\]］]/g,""), withOpt=p.replace(/[\[\]［］]/g,"");
    [noOpt,withOpt].forEach(x=>{
      out.add(x.replace(/[（(][^）)]*[）)]/g,""));
      const m=x.match(/[（(]([^）)]*)[）)]/); if(m) out.add(m[1]);
    });});
  return [...out].map(x=>x.trim()).filter(Boolean);
}
function newQuiz(){
  const all=vFlat(vL).map((w,i)=>({w,i})), known=vKnown(vL);
  const fresh=all.filter(x=>!known.has(x.i)); const pool=fresh.length>=10?fresh:[...fresh,...pick(all.filter(x=>known.has(x.i)),10-fresh.length)];
  vQuiz={l:vL,items:pick(pool,10)};
}
// bảng nối cả bài (dùng chung bộ máy với tab Nối từ): trái = nghĩa, phải = từ tiếng Nhật
function vMatchHTML(){
  Object.assign(MS,{kind:"v",scope:"l",li:vL,vm:"m"}); mSave();
  if(!MB||MB.key!==mbKey()) mbStart();
  return mbHTML();
}
function renderVocab(){
  const L=VOCAB[vL], flat=vFlat(vL), known=vKnown(vL);
  if(!vQuiz||vQuiz.l!==vL) newQuiz();
  if(!vWords3||vWords3.l!==vL) vWords3={l:vL,w:pick(flat,3)};
  $("#main").innerHTML=`
  <div class="row" style="margin-top:14px"><input id="vSearch" placeholder="Tìm từ trong cả 25 bài (kana, kanji, romaji hoặc nghĩa)…" autocomplete="off" spellcheck="false" style="font-family:var(--vi);font-size:.95rem"></div>
  <div id="vResults"></div>
  <div id="vLesson">
  <div class="chips">${VOCAB.map((l,i)=>`<button class="chip" data-vl="${i}" aria-pressed="${i===vL}">Bài ${l.n}${VFLAT[i].every((_,k)=>(srs(vid(i,k))?.lv||0)>=3)?'<span class="done">✓</span>':""}</button>`).join("")}</div>
  <p class="lesson-title">Bài ${L.n} · ${flat.length} từ · đã thuộc ${flat.filter((_,i)=>(srs(vid(vL,i))?.lv||0)>=3).length}</p>
  <div class="formula" style="font-size:1.25rem;font-family:var(--vi)">${esc(L.topic)}</div>
  ${L.n<=LESSONS.length?`<p class="tip"><button class="lnk" data-gogram="${L.n-1}">Mở ngữ pháp Bài ${L.n} →</button></p>`:""}

  <section class="step"><h2><span class="k">一</span>Các lô của bài<span class="hint">học theo lô ở bước Từ mới của bài</span></h2>
    <div class="vlist">${LOTS[vL].map(l=>{const lv=l.ids.map(i=>srs(vid(vL,i))?.lv??-1);const done=lv.filter(x=>x>=3).length, learn=lv.filter(x=>x>=0&&x<3).length;
      return `<div class="vrow" style="grid-template-columns:minmax(0,1fr) auto"><div><b>${esc(l.t)}</b><div class="tip">${l.ids.map(i=>esc(VFLAT[vL][i][0])).join("、")}</div></div><div class="tip" style="text-align:right">${l.ids.length} từ<br>${done?`<span style="color:var(--ok)">thuộc ${done}</span>`:""}${learn?` · đang học ${learn}`:""}${!done&&!learn?"chưa học":""}</div></div>`;}).join("")}</div>
    <div class="row"><button class="btn ghost" data-vknown="${vL}">Bài này tôi đã biết</button></div>
  </section>

  <section class="step" id="vMatch"><h2><span class="k">結</span>Nối từ cả Bài ${L.n}<span class="hint">nghĩa ↔ tiếng Nhật</span></h2>
    <div id="mbBox">${vMatchHTML()}</div>
    <p class="tip">Chạm 1 nghĩa bên trái, rồi chạm từ tiếng Nhật khớp bên phải, nối đúng thì cặp biến mất. Nối đúng ngay lần đầu thì từ được tính là đã học (lên bậc). Nối sai thì từ đó được hỏi lại trong buổi ôn hôm nay. Muốn nối theo ván nhỏ 6 cặp hoặc nối kanji: <button class="lnk" data-mgo="v">mở tab Nối từ →</button></p>
  </section>

  <section class="step"><h2><span class="k">二</span>Đặt câu với từ mới<span class="hint">viết câu · so với ví dụ · lưu vào sổ câu</span></h2>
    ${writeBoxHTML("vs-"+vL,"Đặt 1–3 câu về bạn, dùng các từ sau:",`<div class="kex">${vWords3.w.map(w=>`<button class="kw" data-say="${esc(w[0])}"><span class="jp">${esc(w[0])}</span><span class="m">${esc(w[3])}</span></button>`).join("")}<button class="btn ghost" id="vNew3" style="align-self:center">Đổi từ</button></div>`)}
  </section>

  <section class="step"><h2><span class="k">三</span>Kiểm tra nhanh 10 từ<span class="hint">nhìn nghĩa · gõ từ (kana hoặc romaji)</span></h2>
    ${vQuiz.items.map((x,qi)=>`<div class="drill"><div class="q"><b>${esc(x.w[3])}</b>${x.w[1]?`<span class="cue jp">${esc(x.w[1])}</span>`:""}</div>
      <div class="row"><input id="vq-${vL}-${qi}" data-vq="${qi}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Gõ từ tiếng Nhật…"><button class="btn" data-vcheck="${qi}">Kiểm tra</button></div>
      <div class="preview" id="vpv-${vL}-${qi}"></div><div id="vr-${vL}-${qi}"></div></div>`).join("")}
    <div class="row"><button class="btn ghost" id="vNewQuiz">10 từ khác</button></div>
  </section>

  <section class="step"><h2><span class="k">四</span>Toàn bộ từ vựng Bài ${L.n}<span class="hint">${vCover?"chạm vào dòng để lật":"bấm 🔊 để nghe"}</span></h2>
    <div class="chips" style="margin-top:0">${segBtns("vcover",vCover,[["","Hiện hết"],["m","Che nghĩa"],["w","Che từ"]])}</div>
    <div class="${vCover?"cover-"+vCover:""}">
    ${(()=>{let off=0;return L.groups.map(g=>{const st=off;off+=g.w.length;return `<h3 class="nh">${esc(g.t)}</h3><div class="vlist">${g.w.map((w,k)=>vRow(w).replace('<div class="vmean">',`<div class="vmean">${lvDots(srs(vid(vL,st+k)))}`)).join("")}</div>`;}).join("");})()}
    </div>
  </section>
  <div class="nav"><button class="btn ghost" id="vPrev">← Bài trước</button><button class="btn" id="vNext">Bài tiếp →</button></div>
  </div>`;
  $("#vPrev").disabled=vL===0; $("#vNext").disabled=vL===VOCAB.length-1;
}
function vGo(l){vL=l;vQuiz=null;vWords3=null;try{localStorage.setItem(LS_KEY+"_vpos",JSON.stringify({l}));}catch(e){}renderVocab();window.scrollTo({top:0});}
function vSearch(q){
  const box=$("#vResults"), les=$("#vLesson"); q=q.trim();
  if(!q){box.innerHTML="";les.hidden=false;return;}
  les.hidden=true;
  const fq=fold(q), kq=norm(q), res=[];
  VOCAB.forEach(l=>l.groups.forEach(g=>g.w.forEach(w=>{
    if(res.length>=80) return;
    if(fold(w[3]).includes(fq)||fold(w[2]).replace(/\s/g,"").includes(fq.replace(/\s/g,""))||(w[1]&&w[1].includes(q))||(kq&&norm(w[0]).includes(kq))) res.push([l.n,w]);
  })));
  box.innerHTML=`<p class="tip" style="margin-top:12px">${res.length?`Tìm thấy ${res.length>=80?"hơn 80":res.length} từ`:"Không tìm thấy từ nào."}</p><div class="vlist">${res.map(([n,w])=>vRow(w).replace('<div class="vmean">',`<div class="vmean"><span class="cue">Bài ${n}</span>`)).join("")}</div>`;
}
function vCheck(qi){
  const x=vQuiz.items[qi], inp=$(`#vq-${vL}-${qi}`), out=$(`#vr-${vL}-${qi}`), w=x.w;
  const v=inp.value.trim(); if(!v){inp.focus();return;}
  const ok=vVariants(w[0]).some(a=>norm(a)===norm(v))||(w[1]&&vVariants(w[1]).includes(v));
  const ans=`<span class="jp">${esc(w[0])}</span>${w[1]?` (<span class="jp">${esc(w[1])}</span>)`:""}`;
  if(ok){
    out.innerHTML=`<div class="res ok">✓ Đúng! ${ans}</div>`; say(w[0]);
    const key=vL+"#"+x.i; if(!vpassed[key]){vpassed[key]=true;bump(1);}
    S.progress.vocab=S.progress.vocab||{}; const arr=S.progress.vocab[VOCAB[vL].n]||[];
    if(!arr.includes(x.i)){arr.push(x.i);S.progress.vocab[VOCAB[vL].n]=arr;saveProgress();}
  }else{
    out.innerHTML=`<div class="res bad">Chưa đúng. Đáp án: ${ans} <button class="say" style="display:inline-grid;vertical-align:middle;width:28px;height:28px" data-say="${esc(w[0])}" aria-label="Nghe">🔊</button>${w[4]?`<br><span style="font-size:.82rem">Mẹo: ${esc(w[4])}</span>`:""}</div>`;
  }
}

// ---- bước 二: viết câu → so với ví dụ (không dùng AI) ----
function vCompare(){
  const el=$(`#vs-${vL}-txt`), text=el?el.value.trim():"";
  const terms=vWords3.w.map(w=>({kana:w[0],kanji:w[1]}));
  $(`#vs-${vL}-res`).innerHTML=examplesHTML(text,showKana(text),findExamples(terms,8),"Chưa có câu ví dụ nào chứa các từ này. Bấm “Đổi từ” để thử từ khác, hoặc xem ghi chú trong bảng từ bên dưới.");
}
function vSave(){
  const L=VOCAB[vL], el=$(`#vs-${vL}-txt`), text=el?el.value.trim():"";
  if(!text){toast("Hãy viết ít nhất một câu trước.");return;}
  if(vSaved[vL]===text){toast("Câu này đã lưu rồi. Hãy viết câu mới.");return;}
  vSaved[vL]=text;
  const vi=($(`#vs-${vL}-vi`)||{}).value?.trim()||"Câu với: "+vWords3.w.map(w=>w[0]).join("、");
  const s=newSentence({jp:showKana(text),vi,own:text,lesson:"Từ vựng Bài "+L.n,pid:"v"+L.n});
  bump(1);
  $(`#vs-${vL}-res`).innerHTML=savedHTML(s.jp,s.vi,"");
  ($(`#vs-${vL}-st`)||{}).textContent="Đã lưu vào sổ câu.";
}
const setWords3=o=>{vWords3=o;};
function onClick(t){
  if(t.dataset.vcover!==undefined){vCover=t.dataset.vcover;if(view==="match")renderMatch();else renderVocab();return true;}
  if(t.dataset.vknown){ if(!t.dataset.armed){t.dataset.armed="1";t.textContent="Bấm lần nữa để xác nhận";setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent="Bài này tôi đã biết";}},3000);return true;}
    const li=+t.dataset.vknown;VFLAT[li].forEach((w,i)=>{const st=srs(vid(li,i));if(!st||st.lv<3)setSrs(vid(li,i),{lv:3,box:3,next:addDays(dayStr(),IV[3]),first:st?.first||"known"});});renderVocab();toast("Đã đánh dấu. Các từ sẽ được hỏi lại sau 7 ngày.");return true; }
  if(t.dataset.vl!==undefined){vGo(+t.dataset.vl);return true;}
  if(t.dataset.vcheck!==undefined){vCheck(+t.dataset.vcheck);return true;}
  if(t.id==="vNewQuiz"){newQuiz();renderVocab();return true;}
  if(t.id==="vNew3"){vWords3=null;renderVocab();return true;}
  if(t.dataset.wcmp&&t.dataset.wcmp.startsWith("vs-")){vCompare();return true;}
  if(t.dataset.wsave&&t.dataset.wsave.startsWith("vs-")){vSave();return true;}
  if(t.id==="vPrev"){if(vL>0)vGo(vL-1);return true;}
  if(t.id==="vNext"){if(vL<VOCAB.length-1)vGo(vL+1);return true;}
  if(t.dataset.gogram!==undefined){gotoPattern(+t.dataset.gogram,0);setView("learn");return true;}
  return false;
}

export { onClick, setWords3, vCover, vL, vQuiz, vWords3, vpassed, vSaved, vFlat, vKnown, vVariants, newQuiz, renderVocab, vGo, vSearch, vCheck };
