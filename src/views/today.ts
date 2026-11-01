// Tab Hôm nay: buổi học 3 bậc (nhận ra → nhớ lại → dùng được) + ôn ngắt quãng, bảng tổng quan
import { dailyPanel, examCountdown } from "../app/shell";
import { VOCAB } from "../content/data";
import { CONFUSE } from "../content/kanji-extra";
import { LESSONS } from "../content/lessons";
import { kCard, wordCard } from "../core/cards";
import { norm } from "../core/kana";
import { IV, KLIST, VFLAT, dueItems, introducedToday, itemOf, kid, planNewKanji, planNewLots, setSrs, srs, srsAll, vid } from "../core/srs";
import { S, bump, streak } from "../core/store";
import { say } from "../core/tts";
import { $, $$, addDays, dayStr, esc, pick, toast } from "../core/util";
import { penguin, penLine, penSay } from "../core/mascot";
import { curL, curP, patternDone } from "./learn";
import { renderVocab, setWords3, vL, vVariants, vWords3 } from "./vocab";
import { setView } from "../app/shell";
import { ptStart } from "./particle";
import { exStart } from "./exam";
import { clozeFor } from "../core/corpus";

// ---- buổi học
let SES=null;
function taskFor(it){
  const st=srs(it.id)||{lv:0};
  if(it.kind==="v") return st.lv===0?{type:"mcq",it}:st.lv===1?{type:"recall",it}:st.lv===2?{type:"cloze",it}:{type:"recall",it,review:true};
  return st.lv===0?{type:"kread",it}:st.lv===1?{type:"kpick",it}:{type:"ktype",it,review:st.lv>=3};
}
function buildSession(reviewOnly){
  const tasks=[];
  const due=dueItems().map(x=>itemOf(x.id)).filter(Boolean);
  pick(due,due.length).forEach(it=>tasks.push({...taskFor(it),block:"Ôn tập"}));
  const lots=reviewOnly?[]:planNewLots();
  for(const lot of lots){
    const items=lot.ids.map(i=>itemOf(vid(lot.li,i)));
    const block=`Từ mới · Bài ${VOCAB[lot.li].n} · ${lot.t}`;
    tasks.push({type:"intro",items,block});
    pick(items,items.length).forEach(it=>tasks.push({type:"mcq",it,block}));
    pick(items,items.length).forEach(it=>tasks.push({type:"recall",it,block}));
    pick(items,items.length).forEach(it=>tasks.push({type:"cloze",it,block}));
  }
  const ks=reviewOnly?[]:planNewKanji();
  ks.forEach(x=>{const it=itemOf(kid(x.k.k));tasks.push({type:"kintro",it,block:"Kanji mới"});tasks.push({type:"kread",it,block:"Kanji mới"});});
  // chuẩn bị câu điền từ cho mọi task cloze
  SES={tasks,pos:0,ok:0,bad:0,newWords:lots.flatMap(l=>l.ids.map(i=>VFLAT[l.li][i])),newKanji:ks.length,answered:false,retries:{}};
}
function startSession(reviewOnly){buildSession(reviewOnly);if(!SES.tasks.length){SES=null;toast("Hôm nay không còn gì để học. Quay lại ngày mai nhé!");return renderToday();}renderSession();}
function grade(task,ok){
  const it=task.it, st=srs(it.id)||{lv:0,box:0}, t=dayStr();
  if(ok){bump(1);SES.ok++;
    const up=(lv)=>({lv:Math.max(st.lv,lv),next:addDays(t,1)});
    const done=()=>{const box=st.lv>=3?Math.min(5,(st.box||1)+1):1;return {lv:3,box,next:addDays(t,IV[box])};};
    if(task.type==="mcq"||task.type==="kread") setSrs(it.id,up(1));
    else if(task.type==="recall") setSrs(it.id,(st.lv>=3||task.final)?done():up(2));
    else if(task.type==="kpick") setSrs(it.id,up(2));
    else if(task.type==="cloze"||task.type==="ktype") setSrs(it.id,done());
  }else{SES.bad++;
    setSrs(it.id,st.lv>=3?{lv:2,box:0,next:t,wr:(st.wr||0)+1}:{next:t,wr:(st.wr||0)+1});
    const key=it.id+task.type; SES.retries[key]=(SES.retries[key]||0)+1;
    if(SES.retries[key]<=2) SES.tasks.splice(Math.min(SES.tasks.length,SES.pos+4),0,{...task,retry:true});
  }
}
// ---- câu hỏi trắc nghiệm
function mcqOpts(it){
  const pool=VFLAT[it.li].map(w=>w[3]).filter(m=>m!==it.w[3]);
  const extra=VFLAT[Math.max(0,it.li-1)].map(w=>w[3]);
  const opts=[it.w[3],...pick([...new Set<any>([...pool,...extra])].filter(m=>m!==it.w[3]),3)];
  return pick(opts,opts.length);
}
function kExample(it,avoid?){
  const exs=it.k.ex.filter(e=>e[0].includes(it.k.k));
  return exs.find(e=>e[0]!==avoid&&e[0].length>1)||exs.find(e=>e[0]!==avoid)||exs[0]||it.k.ex[0];
}
function kReadOpts(it,ex){
  const others=KLIST.filter(y=>y.ci===it.ci&&y.k.k!==it.k.k).flatMap(y=>y.k.ex.map(e=>e[1]));
  const opts=[ex[1],...pick([...new Set<any>(others)].filter(r=>r!==ex[1]),3)];
  return pick(opts,opts.length);
}
function kPickOpts(it,ex){
  const fam=(CONFUSE.find(c=>c.includes(it.k.k))||[]).filter(c=>c!==it.k.k);
  const pool=[...fam,...KLIST.filter(y=>y.ci===it.ci&&y.gi===it.gi&&y.k.k!==it.k.k).map(y=>y.k.k),...KLIST.filter(y=>y.ci===it.ci).map(y=>y.k.k)];
  const opts=[ex[0]];for(const c of pool){const w=ex[0].split(it.k.k).join(c);if(c!==it.k.k&&!opts.includes(w))opts.push(w);if(opts.length>=4)break;}
  return pick(opts,opts.length);
}
function renderSession(){
  const T=SES.tasks[SES.pos];
  if(!T){return renderSessionEnd();}
  SES.answered=false;
  const pct=Math.round(SES.pos/SES.tasks.length*100);
  let body="";
  if(T.type==="intro"){
    body=`<div class="sq">Lô mới · ${T.items.length} từ. Đọc từng từ, bấm 🔊 nghe và đọc to theo, nhìn mẹo nhớ rồi bắt đầu luyện.</div><div class="vlist">${T.items.map(it=>wordCard(it.w,true)).join("")}</div>
      <div class="row"><button class="btn accent" data-snext="1">Bắt đầu luyện lô này →</button></div>`;
  }else if(T.type==="kintro"){
    body=`<div class="sq">Chữ mới. Nhìn hình, đọc mẹo, nhắm mắt tưởng tượng 3 giây, rồi viết tay 3 lần.</div>${kCard(T.it.k)}
      <div class="row"><button class="btn accent" data-snext="1">Tôi đã nhìn kỹ →</button></div>`;
  }else if(T.type==="mcq"){
    T.opts=T.opts||mcqOpts(T.it);
    body=`<div class="sq">Bậc 1 · Nhận ra: từ này nghĩa là gì?</div>
      <div class="sbig"><span class="jp">${esc(T.it.w[0])}</span>${T.it.w[1]?`<span class="vk jp">${esc(T.it.w[1])}</span>`:""}<button class="say" data-say="${esc(T.it.w[0])}" aria-label="Nghe">🔊</button></div>
      <div class="sopts">${T.opts.map(o=>`<button class="sopt" data-sopt="${esc(o)}">${esc(o)}</button>`).join("")}</div>`;
    setTimeout(()=>say(T.it.w[0]),150);
  }else if(T.type==="recall"){
    body=`<div class="sq">${T.review?"Ôn":"Bậc 2 · Nhớ lại"}: gõ từ tiếng Nhật có nghĩa</div>
      <div class="sbig vi">${esc(T.it.w[3])}</div>
      <div class="row"><input id="sIn" data-sin="1" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Gõ kana, romaji hoặc kanji…"><button class="btn" data-scheck="1">Kiểm tra</button></div>
      <div class="preview" id="sPv"></div><button class="lnk" data-sidk="1">Không nhớ, cho xem đáp án</button>`;
  }else if(T.type==="cloze"){
    const c=clozeFor(T.it.li,T.it.i);
    if(!c){
      // không có câu ví dụ chứa từ này → nghe rồi gõ lại
      body=`<div class="sq">Bậc 3 · Dùng được: nghe rồi gõ lại từ</div>
        <div class="sbig"><button class="say" data-say="${esc(T.it.w[0])}" aria-label="Nghe">🔊</button><span class="tip">Bấm 🔊 nghe lại</span></div>
        <div class="tip">Gợi ý: <b>${esc(T.it.w[3])}</b></div>
        <div class="row"><input id="sIn" data-sin="1" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Gõ từ vừa nghe (kana hoặc romaji)…"><button class="btn" data-scheck="1">Kiểm tra</button></div>
        <div class="preview" id="sPv"></div><button class="lnk" data-sidk="1">Không nhớ, cho xem đáp án</button>`;
      setTimeout(()=>say(T.it.w[0]),150);
    }else{
      body=`<div class="sq">Bậc 3 · Dùng được: điền từ vào chỗ trống</div>
        <div class="sbig jp" style="font-size:1.3rem">${esc(c.s)}</div>${c.vi?`<div class="tip">${esc(c.vi)}</div>`:""}
        <div class="tip">Gợi ý: <b>${esc(T.it.w[3])}</b></div>
        <div class="row"><input id="sIn" data-sin="1" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Từ cần điền…"><button class="btn" data-scheck="1">Kiểm tra</button></div>
        <div class="preview" id="sPv"></div><button class="lnk" data-sidk="1">Không nhớ, cho xem đáp án</button>`;
    }
  }else if(T.type==="kread"){
    T.ex=T.ex||kExample(T.it); T.opts=T.opts||kReadOpts(T.it,T.ex);
    body=`<div class="sq">Kanji · Nhận ra (漢字読み): đọc từ này thế nào?</div>
      <div class="sbig"><span class="jp" style="font-size:2.2rem">${esc(T.ex[0])}</span></div><div class="tip">${esc(T.ex[2])}</div>
      <div class="sopts">${T.opts.map(o=>`<button class="sopt jp" data-sopt="${esc(o)}">${esc(o)}</button>`).join("")}</div>`;
  }else if(T.type==="kpick"){
    T.ex=T.ex||kExample(T.it); T.opts=T.opts||kPickOpts(T.it,T.ex);
    body=`<div class="sq">Kanji · Phân biệt (表記): chọn cách viết đúng</div>
      <div class="sbig"><span class="jp">${esc(T.ex[1])}</span></div><div class="tip">${esc(T.ex[2])}</div>
      <div class="sopts">${T.opts.map(o=>`<button class="sopt jp" style="font-size:1.4rem" data-sopt="${esc(o)}">${esc(o)}</button>`).join("")}</div>`;
  }else if(T.type==="ktype"){
    T.ex=T.ex||kExample(T.it,T.it.k.ex[0]?.[0]);
    body=`<div class="sq">Kanji · ${T.review?"Ôn":"Tự đọc"}: gõ cách đọc</div>
      <div class="sbig"><span class="jp" style="font-size:2.2rem">${esc(T.ex[0])}</span></div><div class="tip">${esc(T.ex[2])}</div>
      <div class="row"><input id="sIn" data-sin="1" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Cách đọc (kana hoặc romaji)…"><button class="btn" data-scheck="1">Kiểm tra</button></div>
      <div class="preview" id="sPv"></div><button class="lnk" data-sidk="1">Không nhớ, cho xem đáp án</button>`;
  }
  $("#main").innerHTML=`<div class="sess">
    <div class="shead"><span class="cue">${esc(T.block)}${T.retry?" · làm lại":""}</span><span class="tip">${SES.pos+1}/${SES.tasks.length}</span><button class="lnk" data-sstop="1">Dừng</button></div>
    <div class="bar wide"><i style="width:${pct}%"></i></div>
    <div class="scard">${body}<div id="sFb"></div></div></div>`;
  const inp=$("#sIn"); if(inp) inp.focus();
}
function celebrate(ok){
  const c=$(".scard"); if(!c||!c.classList) return;
  c.classList.remove("pop","shake"); void c.offsetWidth; c.classList.add(ok?"pop":"shake");
  if(ok&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
    const cols=["var(--accent)","var(--gold)","var(--sky)","var(--ok)"];
    for(let k=0;k<14;k++){const d=document.createElement("i");d.className="conf";const a=Math.random()*Math.PI*2,r=80+Math.random()*90;
      d.style.cssText=`background:${cols[k%4]};--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r-40}px;--r:${Math.random()*540}deg`;c.appendChild(d);setTimeout(()=>d.remove(),1000);}
  }
}
function feedback(ok,html,T){
  SES.answered=true; grade(T,ok); celebrate(ok);
  const PL=penLine(ok?"happy":"oops");
  $("#sFb").innerHTML=`<div class="res ${ok?"ok":"bad"} withpen" style="margin-top:10px">${penguin(ok?"happy":"oops",52)}<div><b class="jp">${PL[0]}</b> ${PL[1]}<div>${html}</div></div></div><div class="row" style="margin-top:10px"><button class="btn accent" data-snext="1" id="sNextBtn">Tiếp →</button></div>`;
  $$("[data-sopt],[data-scheck],[data-sidk]").forEach(b=>b.disabled=true);
  const n=$("#sNextBtn"); if(n) n.focus();
}
function ansHTML(T){
  if(T.it.kind==="v"){const w=T.it.w;const c=clozeFor(T.it.li,T.it.i);
    return `<span class="jp">${esc(w[0])}</span>${w[1]?` (<span class="jp">${esc(w[1])}</span>)`:""} = ${esc(w[3])}${T.type==="cloze"&&c?`<br><span class="jp">${esc(c.s.replace(/（[\s　]*）/,c.a))}</span>`:""}${w[4]?`<br><span style="font-size:.82rem">Mẹo: ${esc(w[4])}</span>`:""} <button class="say" style="display:inline-grid;vertical-align:middle;width:28px;height:28px" data-say="${esc(w[0])}" aria-label="Nghe">🔊</button>`;}
  return `<span class="jp">${esc(T.ex[0])}</span> = <span class="jp">${esc(T.ex[1])}</span> · ${esc(T.it.k.hv)} (${esc(T.it.k.mean)})<br><span style="font-size:.82rem">${esc(T.it.k.tip)}</span>`;
}
function sAnswerText(v){
  const T=SES.tasks[SES.pos]; if(SES.answered||!T) return;
  let ok=false;
  if(T.type==="recall"){const w=T.it.w;ok=vVariants(w[0]).some(a=>norm(a)===norm(v))||(!!w[1]&&vVariants(w[1]).includes(v.trim()));}
  else if(T.type==="cloze"){const w=T.it.w,c=clozeFor(T.it.li,T.it.i);ok=(!!c&&norm(c.a)===norm(v))||vVariants(w[0]).some(a=>norm(a)===norm(v))||(!!w[1]&&v.trim()===w[1]);}
  else if(T.type==="ktype"){ok=norm(T.ex[1])===norm(v)||v.trim()===T.ex[1];}
  const cz=T.type==="cloze"?clozeFor(T.it.li,T.it.i):null;
  if(ok&&T.it.kind==="v") say(cz?cz.s.replace(/（[\s　]*）/,cz.a):T.it.w[0]);
  if(ok&&T.it.kind==="k") say(T.ex[1]);
  feedback(ok,ansHTML(T),T);
}
function sPick(o){
  const T=SES.tasks[SES.pos]; if(SES.answered||!T) return;
  const right=T.type==="mcq"?T.it.w[3]:T.type==="kread"?T.ex[1]:T.ex[0];
  $$("[data-sopt]").forEach(b=>{if(b.dataset.sopt===right)b.classList.add("right");else if(b.dataset.sopt===o)b.classList.add("wrong");});
  feedback(o===right,ansHTML(T),T);
}
function sNext(){if(!SES)return;const T=SES.tasks[SES.pos];if(T&&!SES.answered&&!["intro","kintro"].includes(T.type))return;SES.pos++;renderSession();window.scrollTo({top:0});}
function renderSessionEnd(){
  const nw=SES.newWords, total=SES.ok+SES.bad;
  const more=planNewKanji(); // kanji mở khoá trong lúc học (từ chứa chữ đạt bậc 2)
  setWords3({l:-1,w:pick(nw.length?nw:VFLAT[0],3)});
  const CL=penLine("cheer");
  $("#main").innerHTML=`<div class="card">${penSay("cheer",CL[0],CL[1],96)}<div class="big">Xong buổi học hôm nay 🎉</div>
    <div>Trả lời đúng <b>${SES.ok}</b>/${total} lượt · từ mới <b>${nw.length}</b> · kanji mới <b>${SES.newKanji}</b></div>
    <div class="tip">Từ nào sai sẽ tự quay lại sớm. Từ nào đúng thì để vài ngày nữa mới hỏi lại.</div>
    ${more.length?`<div class="res ok">Nhờ các từ vừa học, bạn mở khoá thêm ${more.length} kanji: <span class="jp">${more.map(x=>esc(x.k.k)).join(" ")}</span> <button class="btn" id="dStart" style="margin-left:6px">Học luôn ${more.length} chữ →</button></div>`:""}
    <div class="row" style="flex-wrap:wrap"><button class="btn accent" id="dGram">Tiếp: 1 mẫu ngữ pháp →</button><button class="btn ghost" id="dSent">Đặt câu với từ hôm nay</button><button class="btn ghost" id="dHome">Về trang Hôm nay</button></div></div>`;
  SES=null;
}
function stats(){
  const all=srsAll(); let vk=0,vl=0,kk=0,kl=0;
  for(const [id,st] of Object.entries<any>(all)){if(id[0]==="v"){if(st.lv>=3)vk++;else vl++;}else{if(st.lv>=3)kk++;else kl++;}}
  return {vk,vl,kk,kl,vt:VFLAT.reduce((a,b)=>a+b.length,0),kt:KLIST.length};
}
function ringSVG(frac,color,label){
  const r=38,c=2*Math.PI*r,off=c*(1-Math.min(1,Math.max(0,frac)));
  return `<svg viewBox="0 0 92 92" role="img" aria-label="${esc(label)}"><circle class="bg" cx="46" cy="46" r="${r}" fill="none" stroke-width="9"/><circle class="fg" cx="46" cy="46" r="${r}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 46 46)"/><text x="46" y="52" text-anchor="middle">${Math.round(frac*100)}%</text></svg>`;
}
function renderToday(){
  if(SES) return renderSession();
  const due=dueItems(), lots=planNewLots(), ks=planNewKanji(), st=stats();
  const newN=lots.reduce((a,l)=>a+l.ids.length,0), doneNew=introducedToday("v");
  const P=LESSONS[curL].patterns[curP];
  const mins=Math.max(5,Math.round(due.length*0.25+newN*1+ks.length*1.5+5));
  const h=new Date().getHours(), hi=h<11?"おはよう":h<18?"こんにちは":"こんばんは";
  const gramAll=LESSONS.flatMap(l=>l.patterns), gramDone=gramAll.filter(patternDone).length;
  // lịch 5 tuần
  const today=dayStr(), start=addDays(today,-34);
  const cells=[];for(let k=0;k<35;k++){const d=addDays(start,k),n=S.progress.counts[d]||0,act=S.progress.days.includes(d);
    cells.push(`<i class="${n>=40?"l3":n>=15?"l2":(n>0||act)?"l1":""}${d===today?" today":""}" title="${d}: ${n} lượt"></i>`);}
  const dows=[0,1,2,3,4,5,6].map(k=>["CN","T2","T3","T4","T5","T6","T7"][new Date(addDays(start,k)+"T12:00:00").getDay()]);
  // từ hay quên
  const hard=Object.entries<any>(srsAll()).filter(([id,v])=>id[0]==="v"&&(v.wr||0)>0).sort((a,b)=>(b[1].wr||0)-(a[1].wr||0)).slice(0,6).map(([id,v])=>({it:itemOf(id),wr:v.wr})).filter(x=>x.it);
  const sent=S.sentences.length?S.sentences[Math.floor(Math.random()*S.sentences.length)]:null;
  const nothing=!(due.length+newN+ks.length);
  $("#main").innerHTML=`<div class="dash">
  <section class="hero">
    <span class="big-k" aria-hidden="true">今日</span>
    <div class="hero-pen" aria-hidden="true">${penguin(nothing?"cheer":"hi",128)}</div>
    <h2 class="hi">${hi}、ホアンさん</h2>
    <p>${nothing?"Hôm nay bạn đã học xong phần từ vựng và kanji. Còn ngữ pháp, hoặc đặt thêm câu nhé.":`Buổi hôm nay khoảng <b>${mins} phút</b>: ôn ${due.length} lượt, ${newN} từ mới${ks.length?`, ${ks.length} kanji mới`:""}, rồi 1 mẫu ngữ pháp.`}</p>
    <div class="row"><button class="btn accent" id="dStart" ${nothing?"disabled":""}>Bắt đầu học →</button><button class="btn ghost" id="dReview" ${due.length?"":"disabled"}>Chỉ ôn (hôm bận)</button></div>${examCountdown()}
  </section>
  ${dailyPanel(due.length+newN+ks.length)}
  <div class="tile t-rev span3"><span class="tn">復</span><span class="num">${due.length}</span><span class="lab">Ôn đến hạn</span><span class="tip">${due.length?"từ + kanji cần nhắc lại":"hôm nay không có"}</span></div>
  <div class="tile t-new span3"><span class="tn">語</span><span class="num">${newN||doneNew}</span><span class="lab">${newN?"Từ mới hôm nay":"Từ mới đã học"}</span><span class="tip">${newN?lots.map(l=>esc(l.t)).join(" · "):doneNew?"xong phần hôm nay ✓":"đã hết từ vựng 🎉"}</span></div>
  <div class="tile t-kan span3"><span class="tn">漢</span><span class="num">${ks.length}</span><span class="lab">Kanji mới</span><span class="tip">${ks.length?ks.map(x=>`<span class="jp">${esc(x.k.k)}</span> ${esc(x.k.hv)}`).join(" · "):"mở dần theo từ bạn đã nhớ"}</span></div>
  <div class="tile t-gram span3"><span class="tn">文</span><span class="num" style="font-size:1.2rem;font-family:var(--jp)">${esc(P.form)}</span><span class="lab">Ngữ pháp · Bài ${LESSONS[curL].n}</span><span class="tip">làm sau phần từ vựng</span></div>
  <section class="panel span5"><h3>🔥 ${streak()} ngày liên tiếp</h3>
    <div class="heatlbl">${dows.map(d=>`<span>${d}</span>`).join("")}</div><div class="heat">${cells.join("")}</div>
    <div class="tip">5 tuần gần nhất. Ô càng đậm là hôm đó học càng nhiều.</div></section>
  <section class="panel span7"><h3>Tiến độ</h3>
    <div class="rings">
      <div class="ring">${ringSVG(st.vk/st.vt,"var(--accent)","Từ vựng")}<b>Từ vựng</b><span class="tip">${st.vk}/${st.vt} thuộc</span></div>
      <div class="ring">${ringSVG(st.kk/st.kt,"var(--gold)","Kanji")}<b>Kanji</b><span class="tip">${st.kk}/${st.kt} thuộc</span></div>
      <div class="ring">${ringSVG(gramDone/gramAll.length,"var(--ok)","Ngữ pháp")}<b>Ngữ pháp</b><span class="tip">${gramDone}/${gramAll.length} mẫu</span></div>
    </div>
    <div class="tip">Một từ “thuộc” khi qua đủ 3 bậc: nhận ra → nhớ lại → dùng được trong câu. Sau đó app hỏi lại sau 1 → 3 → 7 → 14 → 30 ngày.</div></section>
  <section class="panel span6"><h3>Từ hay quên</h3>${hard.length?`<div class="hard">${hard.map(x=>`<div class="h1"><button class="say" data-say="${esc(x.it.w[0])}" aria-label="Nghe">🔊</button><span class="jp">${esc(x.it.w[0])}</span><span>${esc(x.it.w[3])}</span><span class="wr">sai ${x.wr}</span></div>`).join("")}</div>`:`<div class="tip">Chưa có. Từ nào bạn trả lời sai sẽ hiện ở đây để để ý hơn.</div>`}</section>
  <section class="panel span6"><h3>Một câu của bạn</h3>${sent?`<div class="quote">${esc(sent.jp)}</div><div class="tip">${esc(sent.vi)}</div><div class="row"><button class="say" data-say="${esc(sent.kana||sent.jp)}" aria-label="Nghe">🔊</button><span class="tip">Nghe rồi đọc to theo một lần.</span></div>`:`<div class="tip">Sổ câu đang trống. Câu bạn tự đặt sẽ hiện ở đây.</div>`}</section>
  </div>`;
}

function onClick(t){
  if(t.dataset.snext){sNext();return true;}
  if(t.dataset.sopt!==undefined){sPick(t.dataset.sopt);return true;}
  if(t.dataset.scheck){const v=($("#sIn")||{}).value||"";if(v.trim())sAnswerText(v);return true;}
  if(t.dataset.sidk){const T=SES&&SES.tasks[SES.pos];if(T&&!SES.answered)feedback(false,ansHTML(T),T);return true;}
  if(t.dataset.sstop){SES=null;renderToday();return true;}
  if(t.id==="dStart"){startSession(false);return true;}
  if(t.id==="dReview"){startSession(true);return true;}
  if(t.id==="dGram"){setView("learn");return true;}
  if(t.id==="dPt"){setView("particle");ptStart("mix");return true;}
  if(t.id==="dEx"){setView("exam");exStart("kind:"+["bun_form","goi_ctx","kj_yomi","ch_sokuji"][new Date().getDay()%4]);return true;}
  if(t.id==="dHome"){renderToday();return true;}
  if(t.id==="dSent"){const w=vWords3?vWords3.w:null;setView("vocab");if(w){setWords3({l:vL,w});renderVocab();}return true;}
  return false;
}
function onKey(e){
  if(SES&&e.key==="Enter"&&!e.isComposing&&e.keyCode!==229){
    if(e.target.id==="sIn"&&!SES.answered){e.preventDefault();if(e.target.value.trim())sAnswerText(e.target.value);return true;}
    if(SES.answered&&e.target.tagName!=="BUTTON"){e.preventDefault();sNext();return true;}
  }
  if(SES&&!SES.answered&&/^[1-4]$/.test(e.key)&&e.target.tagName!=="INPUT"){const b=document.querySelectorAll<HTMLElement>("[data-sopt]")[+e.key-1];if(b){sPick(b.dataset.sopt);return true;}}
  return false;
}

export { onClick, onKey, SES, taskFor, buildSession, startSession, grade, mcqOpts, kExample, kReadOpts, kPickOpts, renderSession, celebrate, feedback, ansHTML, sAnswerText, sPick, sNext, renderSessionEnd, stats, ringSVG, renderToday };
