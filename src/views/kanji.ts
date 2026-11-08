// Tab Kanji: 10 chương — hình · Hán Việt · mẹo, đọc từ, chọn chữ, đặt câu
import { KANJI } from "../content/data";
import { CONFUSE, HVRULE, KPAIRS } from "../content/kanji-extra";
import { examplesHTML, hasAncient, kCard, savedHTML, writeBoxHTML } from "../core/cards";
import { findExamples } from "../core/corpus";
import { norm, showKana } from "../core/kana";
import { LS_KEY, S, bump, newSentence, saveProgress } from "../core/store";
import { say } from "../core/tts";
import { $, esc, pick, tbl, toast } from "../core/util";

let kC=0,kG=0;
try{const o=JSON.parse(localStorage.getItem(LS_KEY+"_kpos")||"null");if(o){kC=o.c|0;kG=o.g|0;}}catch(e){}
kC=Math.min(Math.max(kC,0),KANJI.length-1); kG=Math.min(Math.max(kG,0),KANJI[kC].groups.length-1);
const kpassed={};
const gid=()=>"k"+(kC+1)+"-"+(kG+1);
function kGroup(){return KANJI[kC].groups[kG];}
function kReadItems(g){const seen=new Set<any>(),out=[];g.kanji.forEach(k=>k.ex.forEach(e=>{if(!seen.has(e[0])){seen.add(e[0]);out.push(e);}}));return out;}
const KORDER={};
function kChoiceItems(g){
  const chapterChars=KANJI[kC].groups.flatMap(x=>x.kanji.map(k=>k.k));
  return g.kanji.map((k,ki)=>{
    const ex=k.ex.find(e=>e[0].includes(k.k)&&e[0].length>1)||k.ex.find(e=>e[0].includes(k.k));
    if(!ex) return null;
    const fam=(CONFUSE.find(c=>c.includes(k.k))||[]).filter(c=>c!==k.k);
    const pool=[...fam,...g.kanji.map(x=>x.k).filter(c=>c!==k.k&&!fam.includes(c)),...chapterChars.filter(c=>c!==k.k)];
    const opts=[ex[0]];
    for(const c of pool){const w=ex[0].split(k.k).join(c);if(!opts.includes(w))opts.push(w);if(opts.length>=3)break;}
    // trộn ngẫu nhiên 1 lần mỗi lần mở app, nhớ lại để không đổi khi vẽ lại
    const order=KORDER[ex[0]]||(KORDER[ex[0]]=pick(opts,opts.length));
    return {k:k.k,word:ex[0],read:ex[1],mean:ex[2],opts:order};
  }).filter(Boolean);
}
function kDone(c,g){const grp=KANJI[c].groups[g];const d=(S.progress.kanji||{})["k"+(c+1)+"-"+(g+1)]||[];return d.length>=kReadItems(grp).length;}
function renderKanji(){
  const C=KANJI[kC], G=kGroup(), id=gid();
  const reads=kReadItems(G), choices=kChoiceItems(G);
  const was=(S.progress.kanji||{})[id]||[];
  $("#main").innerHTML=`
  <div class="chips">${KANJI.map((c,i)=>`<button class="chip" data-kc="${i}" aria-pressed="${i===kC}">${esc(c.name)}</button>`).join("")}</div>
  <div class="chips">${C.groups.map((g,i)=>`<button class="chip" data-kg="${i}" aria-pressed="${i===kG}">Nhóm ${kC+1}.${i+1}${kDone(kC,i)?'<span class="done">✓</span>':""}</button>`).join("")}</div>
  <p class="lesson-title">${esc(C.name)} · ${esc(C.title)}</p>
  <div class="formula">${esc(G.title)}</div>

  <section class="step"><h2><span class="k">一</span>Hình · Hán Việt · mẹo nhớ<span class="hint">đọc mẹo, nhắm mắt tưởng tượng 3 giây</span></h2>
  ${G.kanji.map(kCard).join("")}
  <p class="tip">Bấm vào từ ví dụ để nghe. Viết tay mỗi chữ 3 lần, vừa viết vừa nói câu chuyện. Thứ tự nét xem trong slide pptx của chương.${hasAncient()?" Hình chữ cổ: Wikimedia Commons (giữ chuột/chạm vào hình để xem nguồn).":""}</p>
  </section>

  <div class="row"><button class="btn ghost" data-mgo="k">結 Luyện nối nghĩa ↔ chữ của chương này →</button></div>

  <section class="step"><h2><span class="k">二</span>Đọc từ<span class="hint">dạng đề 漢字読み · gõ cách đọc</span></h2>
  ${reads.map((e,i)=>`<div class="drill">
    <div class="q"><span class="jp" style="font-size:1.5rem">${esc(e[0])}</span><span class="cue">${esc(e[2])}</span></div>
    <div class="row"><input id="kr-${id}-${i}" data-kread="${i}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${was.includes(i)?"Đã đọc đúng. Gõ lại để ôn":"Cách đọc (kana hoặc romaji)…"}"><button class="btn" data-kcheck="${i}">Kiểm tra</button></div>
    <div class="preview" id="kpv-${id}-${i}"></div><div id="krr-${id}-${i}"></div></div>`).join("")}
  </section>

  <section class="step"><h2><span class="k">三</span>Chọn chữ đúng<span class="hint">dạng đề 表記 · chữ na ná nhau</span></h2>
  ${choices.map((q,i)=>`<div class="drill">
    <div class="q"><span class="jp" style="font-size:1.2rem">${esc(q.read)}</span><span class="cue">${esc(q.mean)}</span></div>
    <div class="opts">${q.opts.map(o=>`<button class="opt" data-kopt="${i}" data-w="${esc(o)}">${esc(o)}</button>`).join("")}</div>
    <div id="kcr-${id}-${i}"></div></div>`).join("")}
  </section>

  <section class="step"><h2><span class="k">四</span>Đặt câu có kanji<span class="hint">viết câu · so với ví dụ · lưu vào sổ câu</span></h2>
  ${writeBoxHTML("ks-"+id,"Đặt 1–3 câu về bạn, mỗi câu dùng ít nhất 1 từ ở nhóm này.",`Gõ kanji nếu bàn phím có, không thì gõ kana hoặc romaji. Ví dụ: <span class="jp">まいあさ 7じに おきます。/ 雨の日は 電車で 会社へ 行きます。</span>`)}
  </section>

  <details class="more" style="margin-top:22px"><summary><b>Mẹo: Hán Việt → đoán âm On</b></summary>${tbl([["Hán Việt kết thúc bằng","→ âm On kết thúc bằng","Ví dụ"],...HVRULE])}</details>
  <details class="more" style="margin-top:10px"><summary><b>Các cặp chữ dễ nhầm</b></summary>${tbl([["Cặp","Phân biệt bằng","Câu nhớ"],...KPAIRS])}</details>

  <div class="nav">
    <button class="btn ghost" id="kPrev">← Nhóm trước</button>
    <button class="btn" id="kNext">Nhóm tiếp →</button>
  </div>`;
  $("#kPrev").disabled=kC===0&&kG===0;
  $("#kNext").disabled=kC===KANJI.length-1&&kG===C.groups.length-1;
}
function kGo(c,g){kC=c;kG=g;try{localStorage.setItem(LS_KEY+"_kpos",JSON.stringify({c,g}));}catch(e){}renderKanji();window.scrollTo({top:0});}
function kCheck(i){
  const id=gid(), e=kReadItems(kGroup())[i], inp=$(`#kr-${id}-${i}`), out=$(`#krr-${id}-${i}`);
  const v=inp.value.trim(); if(!v){inp.focus();toast("Gõ cách đọc vào ô trước rồi bấm Kiểm tra.");return;}
  if(norm(v)===norm(e[1])){
    out.innerHTML=`<div class="res ok">✓ Đúng! <span class="jp">${esc(e[0])}</span> = <span class="jp">${esc(e[1])}</span></div>`;
    const key=id+"#"+i; if(!kpassed[key]){kpassed[key]=true;bump(1);}
    S.progress.kanji=S.progress.kanji||{}; const arr=S.progress.kanji[id]||[];
    if(!arr.includes(i)){arr.push(i);S.progress.kanji[id]=arr;saveProgress();}
  }else{
    out.innerHTML=`<div class="res bad">Chưa đúng. <span class="jp">${esc(e[0])}</span> đọc là <span class="jp">${esc(e[1])}</span> <button class="say" style="display:inline-grid;vertical-align:middle;width:28px;height:28px" data-say="${esc(e[1])}" aria-label="Nghe"><svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/></svg></button></div>`;
  }
}
function kPick(btn){
  const id=gid(), i=+btn.dataset.kopt, q=kChoiceItems(kGroup())[i], w=btn.dataset.w;
  const box=btn.parentElement; box.querySelectorAll(".opt").forEach(b=>{b.disabled=true;if(b.dataset.w===q.word)b.classList.add("right");});
  const ok=w===q.word; if(!ok) btn.classList.add("wrong");
  $(`#kcr-${id}-${i}`).innerHTML=ok?`<div class="res ok">✓ Đúng: <span class="jp">${esc(q.word)}</span> (${esc(q.read)})</div>`:`<div class="res bad">Sai. Đúng là <span class="jp">${esc(q.word)}</span>. Xem bảng “Các cặp chữ dễ nhầm” ở cuối trang.</div>`;
  if(ok&&!kpassed[id+"c"+i]){kpassed[id+"c"+i]=true;bump(1);}
}

// ---- bước 四: viết câu → so với ví dụ (không dùng AI) ----
const kSaved={};
function kCompare(){
  const id=gid(), G=kGroup(), el=$(`#ks-${id}-txt`), text=el?el.value.trim():"";
  const terms=G.kanji.flatMap(k=>k.ex.map(e=>({kana:e[1],kanji:e[0]})));
  $(`#ks-${id}-res`).innerHTML=examplesHTML(text,showKana(text),findExamples(terms,8),"Chưa có câu ví dụ nào chứa từ của nhóm này. Xem lại các từ ví dụ trên thẻ chữ ở bước 一.");
}
function kSave(){
  const id=gid(), G=kGroup(), el=$(`#ks-${id}-txt`), text=el?el.value.trim():"";
  if(!text){toast("Hãy viết ít nhất một câu trước.");return;}
  if(kSaved[id]===text){toast("Câu này đã lưu rồi. Hãy viết câu mới.");return;}
  kSaved[id]=text;
  const vi=($(`#ks-${id}-vi`)||{}).value?.trim()||"Câu có kanji: "+G.kanji.map(k=>k.k).join(" ");
  const s=newSentence({jp:showKana(text),vi,own:text,lesson:"Kanji "+(kC+1)+"."+(kG+1),pid:id});
  bump(1);
  $(`#ks-${id}-res`).innerHTML=savedHTML(s.jp,s.vi,"");
  ($(`#ks-${id}-st`)||{}).textContent="Đã lưu vào sổ câu.";
}
function onClick(t){
  if(t.dataset.kc!==undefined){kGo(+t.dataset.kc,0);return true;}
  if(t.dataset.kg!==undefined){kGo(kC,+t.dataset.kg);return true;}
  if(t.dataset.kcheck!==undefined){kCheck(+t.dataset.kcheck);return true;}
  if(t.dataset.kopt!==undefined){kPick(t);return true;}
  if(t.dataset.wcmp&&t.dataset.wcmp.startsWith("ks-")){kCompare();return true;}
  if(t.dataset.wsave&&t.dataset.wsave.startsWith("ks-")){kSave();return true;}
  if(t.id==="kPrev"){ if(kG>0)kGo(kC,kG-1); else if(kC>0)kGo(kC-1,KANJI[kC-1].groups.length-1); return true; }
  if(t.id==="kNext"){ if(kG<KANJI[kC].groups.length-1)kGo(kC,kG+1); else if(kC<KANJI.length-1)kGo(kC+1,0); return true; }
  return false;
}

export { onClick, kC, kG, kpassed, gid, kGroup, kReadItems, kChoiceItems, kDone, renderKanji, kGo, kCheck, kPick };
