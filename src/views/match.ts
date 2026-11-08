// Tab Nối từ: nối nghĩa ↔ từ / chữ — theo ván, cả bài 1 bảng, danh sách
import { KANJI, VOCAB } from "../content/data";
import { kCard, lvDots, vRow } from "../core/cards";
import { KLIST, VFLAT, itemOf, kid, setSrs, srs, vid } from "../core/srs";
import { LS_KEY, bump } from "../core/store";
import { say } from "../core/tts";
import { $, addDays, dayStr, esc, pick, segBtns } from "../core/util";
import { setView } from "../app/shell";
import { kC } from "./kanji";
import { vCover, vL } from "./vocab";

const MT_N=6; let MT=null;
// full=true: chia TOÀN BỘ items thành nhiều ván (~6 cặp, không trùng nghĩa/từ trong 1 ván); false: 1 ván 6 cặp ngẫu nhiên
function mtChunks(items,full){
  const xs=pick(items,items.length).filter(x=>x.l&&x.r);
  const nR=full?Math.max(1,Math.ceil(xs.length/MT_N)):1, ch=[]; // chia đều: 43 từ → 8 ván 5–6 cặp
  const cap=k=>full?Math.floor(xs.length/nR)+(k<xs.length%nR?1:0):MT_N;
  for(const x of xs){
    let c=ch.find((c,k)=>c.length<cap(k)&&!c.some(y=>y.l===x.l||y.r===x.r));
    if(!c){if(!full&&ch.length)continue;c=[];ch.push(c);}
    c.push(x); if(!full&&c.length>=MT_N)break;
  }
  return ch;
}
function mtRound(r){const p=MT.rounds[r]||[],ix=p.map((_,i)=>i);Object.assign(MT,{r,p,L:pick(ix,ix.length),R:pick(ix,ix.length),sel:null,done:new Set<any>(),bad:new Set<any>()});}
function mtStart(key,items,lt,rt,full){
  MT={key,lt,rt,full:!!full,rounds:mtChunks(items,full),miss:0,wrong:[]};
  MT.total=MT.rounds.reduce((a,c)=>a+c.length,0); mtRound(0);
}
function mtRetry(){const w=[...new Set<any>(MT.wrong)];MT.rounds=mtChunks(w,true);MT.total=w.length;MT.miss=0;MT.wrong=[];MT.retry=true;mtRound(0);}
function mtHTML(){
  if(!MT||(MT.p.length<2&&MT.rounds.length<2)) return `<p class="tip">Phạm vi này không đủ cặp để nối. Chọn phạm vi rộng hơn.</p>`;
  const cell=(side,i)=>{const x=MT.p[i],d=MT.done.has(i),s=MT.sel&&MT.sel.side===side&&MT.sel.i===i;
    return `<button class="mt${d?" ok":""}${s?" sel":""}" data-mt="${side}${i}"${d?" disabled":""}>${side==="L"?x.lh:x.rh}</button>`;};
  const nR=MT.rounds.length, fin=MT.done.size===MT.p.length, last=MT.r>=nR-1;
  const head=nR>1||MT.retry?`<div class="tip">Ván ${MT.r+1}/${nR} · ${MT.total} cặp${MT.retry?" (luyện lại từ sai)":""}</div>`:"";
  let foot;
  if(!fin) foot=`<button class="btn ghost" data-mtnew="1">${nR>1?"Xáo lại từ đầu":"Xáo ván khác"}</button><span class="status">Đã nối ${MT.done.size}/${MT.p.length}${MT.miss?` · sai ${MT.miss}`:""}</span>`;
  else if(!last) foot=`<button class="btn accent" data-mtnext="1">Ván tiếp →</button><span class="status">Xong ván ${MT.r+1}/${nR}${MT.miss?` · sai ${MT.miss} lần`:""}</span>`;
  else{const w=[...new Set<any>(MT.wrong)];
    foot=`${w.length?`<button class="btn accent" data-mtretry="1">Luyện lại ${w.length} cặp sai</button>`:""}<button class="btn ${w.length?"ghost":"accent"}" data-mtnew="1">${nR>1?"Làm lại từ đầu":"Ván mới →"}</button>
      <span class="status">${nR>1?`Xong ${MT.total} cặp · `:""}${MT.miss?`nối sai ${MT.miss} lần`:"Hoàn hảo, không sai lần nào!"}</span>`;
    if(w.length) foot+=`<div class="vlist" style="width:100%">${w.map(x=>`<div class="vrow" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)"><div>${x.lh}</div><div>${x.rh}</div></div>`).join("")}</div>`;}
  return `${head}<div class="mtgrid"><div class="mtcol"><div class="mth">${MT.lt}</div>${MT.L.map(i=>cell("L",i)).join("")}</div>
    <div class="mtcol"><div class="mth">${MT.rt}</div>${MT.R.map(i=>cell("R",i)).join("")}</div></div>
    <div class="row" style="align-items:center;flex-wrap:wrap">${foot}</div>`;
}
function mtDraw(){const b=$("#mtBox");if(b)b.innerHTML=mtHTML();}
function mtTap(side,i){
  if(!MT||MT.done.has(i)) return;
  if(side==="R"&&MT.p[i].say) say(MT.p[i].say);
  if(!MT.sel||MT.sel.side===side){MT.sel={side,i};return mtDraw();}
  const a=MT.sel.i; MT.sel=null;
  if(a===i){MT.done.add(i);if(!MT.bad.has(i))mCredit(MT.p[i].id,true);if(MT.done.size===MT.p.length)bump(1);return mtDraw();}
  MT.miss++; MT.wrong.push(MT.p[a],MT.p[i]); [a,i].forEach(k=>{if(!MT.bad.has(k)){MT.bad.add(k);mCredit(MT.p[k].id,false);}}); mtDraw();
  const bs=[$(`[data-mt="L${side==="L"?i:a}"]`),$(`[data-mt="R${side==="R"?i:a}"]`)];
  bs.forEach(b=>b&&b.classList.add("no")); setTimeout(()=>bs.forEach(b=>b&&b.classList.remove("no")),450);
}
const M_LEARNED=30; // số cặp mỗi phiên "đã học" (≈5 ván)
let MS:any={kind:"v",scope:"l",li:0,kc:0,vm:"m",km:"m",sub:"play"};
try{Object.assign(MS,JSON.parse(localStorage.getItem(LS_KEY+"_match")||"{}"));}catch(e){}
MS.li=Math.min(Math.max(MS.li|0,0),VOCAB.length-1); MS.kc=Math.min(Math.max(MS.kc|0,0),KANJI.length-1);
function mSave(){try{localStorage.setItem(LS_KEY+"_match",JSON.stringify(MS));}catch(e){}}
const vPair=(w,mode,id)=>mode==="m"
  ?{id,l:w[3],r:w[0],lh:esc(w[3]),rh:`<span class="jp">${esc(w[0])}</span>${w[1]?`<small class="jp">${esc(w[1])}</small>`:""}`,say:w[0]}
  :{id,l:w[1],r:w[0],lh:`<span class="jp">${esc(w[1])}</span><small>${esc(w[3])}</small>`,rh:`<span class="jp">${esc(w[0])}</span>`,say:w[0]};
const kPairs=(ks,mode)=>mode==="m"
  ?ks.map(k=>({id:kid(k.k),l:k.hv+"|"+k.mean,r:k.k,lh:`<b>${esc(k.hv)}</b><small>${esc(k.mean)}</small>`,rh:`<span class="jp" style="font-size:1.9rem;line-height:1.1">${esc(k.k)}</span>`,say:""}))
  :ks.flatMap(k=>k.ex.map(e=>({id:kid(k.k),l:e[0],r:e[1],lh:`<span class="jp">${esc(e[0])}</span><small>${esc(e[2])}</small>`,rh:`<span class="jp">${esc(e[1])}</span>`,say:e[1]})));
// ưu tiên mục chưa thuộc (bậc < 3) và hay sai, vẫn có yếu tố ngẫu nhiên
const mWeight=st=>Math.random()+((st.lv||0)<3?.6:0)+Math.min(st.wr||0,3)*.2;
function mLearnedV(){const out=[];VFLAT.forEach((ws,li)=>ws.forEach((w,i)=>{const id=vid(li,i),st=srs(id);if(st)out.push({w,id,st});}));return out;}
function mLearnedK(){return KLIST.map(x=>({k:x.k,st:srs(kid(x.k.k))})).filter(x=>x.st);}
function mItems(){
  const md=MS.kind==="v"?MS.vm:MS.km;
  if(MS.kind==="v"){
    const ws=MS.scope==="l"?VFLAT[MS.li].map((w,i)=>({w,id:vid(MS.li,i)})):mLearnedV().map(x=>({x,s:mWeight(x.st)})).sort((a,b)=>b.s-a.s).map(o=>o.x);
    const ps=ws.filter(x=>md==="m"||x.w[1]).map(x=>vPair(x.w,md,x.id));
    return MS.scope==="l"?ps:ps.slice(0,M_LEARNED);
  }
  if(MS.scope==="l") return kPairs(KANJI[MS.kc].groups.flatMap(g=>g.kanji),md);
  const ks=mLearnedK().map(x=>({k:x.k,s:mWeight(x.st)})).sort((a,b)=>b.s-a.s).map(o=>o.k);
  return kPairs(ks,md).slice(0,M_LEARNED);
}
// Nối là 1 cách học: nối đúng ngay lần đầu → lên bậc (tối đa bậc 2, mỗi ngày 1 lần/mục; bậc 3 "thuộc" vẫn phải gõ lại ở Hôm nay)
// nối sai → ôn lại ngay hôm nay; mục chưa gặp sẽ được tính là đã học hôm nay
function mCredit(id,ok){
  if(!id) return;
  const st=srs(id), t=dayStr();
  if(ok){ if(st&&(st.lv>=2||st.mt===t)) return; setSrs(id,{lv:Math.min(2,(st?st.lv:0)+1),next:addDays(t,1),mt:t}); }
  else setSrs(id,st&&st.lv>=3?{lv:2,box:0,next:t,wr:(st.wr||0)+1}:{next:t,wr:((st&&st.wr)||0)+1});
}
function mEnsure(force?){
  const md=MS.kind==="v"?MS.vm:MS.km, key=["M",MS.kind,MS.scope,MS.scope==="l"?(MS.kind==="v"?MS.li:MS.kc):"",md].join(":");
  if(!force&&MT&&MT.key===key) return;
  const lt=MS.kind==="v"?(md==="m"?"Nghĩa":"Kanji"):(md==="m"?"Hán Việt · nghĩa":"Từ có kanji"), rt=MS.kind==="v"?"Từ":(md==="m"?"Chữ":"Cách đọc");
  mtStart(key,mItems(),lt,rt,true);
}
// tab con "Toàn bộ": bài/chương → đủ hết; đã học → các mục của phiên đang nối. Đánh dấu mục vừa nối sai.
// tab con "Nối cả bài": 1 bảng duy nhất, hiện toàn bộ cặp, nối xong cặp nào thì cặp đó biến mất
// từ trùng nghĩa / trùng cách đọc: nối với ô nào có cùng chữ cũng tính đúng
let MB=null;
function mbKey(){return ["B",MS.kind,MS.scope,MS.scope==="l"?(MS.kind==="v"?MS.li:MS.kc):"",MS.kind==="v"?MS.vm:MS.km].join(":");}
function mbStart(items?){
  const p=(items||mItems()).filter(x=>x.l&&x.r), ix=p.map((_,i)=>i);
  const V=MS.kind==="v", md=V?MS.vm:MS.km;
  MB={key:mbKey(),retry:!!items,p,L:pick(ix,ix.length),R:pick(ix,ix.length),dl:new Set<any>(),dr:new Set<any>(),bad:new Set<any>(),sel:null,miss:0,wrong:[],
    lt:V?(md==="m"?"Nghĩa":"Kanji"):(md==="m"?"Hán Việt · nghĩa":"Từ có kanji"),rt:V?"Từ":(md==="m"?"Chữ":"Cách đọc")};
}
function mbHTML(){
  if(!MB||MB.p.length<2) return `<p class="tip">Phạm vi này không đủ cặp để nối.</p>`;
  const n=MB.p.length, d=MB.dl.size, fin=d===n;
  const cell=(side,i)=>{const s=MB.sel&&MB.sel.side===side&&MB.sel.i===i;return `<button class="mbc${s?" sel":""}" data-mb="${side}${i}">${side==="L"?MB.p[i].lh:MB.p[i].rh}</button>`;};
  const selTxt=MB.sel?`Đang chọn: <b>${MB.sel.side==="L"?MB.p[MB.sel.i].lh:MB.p[MB.sel.i].rh}</b> → tìm ô khớp ở cột ${MB.sel.side==="L"?"phải":"trái"}`:"Chạm 1 ô bất kỳ để bắt đầu";
  if(fin){const w=[...new Set<any>(MB.wrong)];
    return `<div class="res ok" style="font-size:1rem">Xong cả ${n} cặp${MB.retry?" (luyện lại từ sai)":""} · ${MB.miss?`nối sai ${MB.miss} lần`:"hoàn hảo, không sai lần nào!"}</div>
    <div class="row" style="flex-wrap:wrap">${w.length?`<button class="btn accent" data-mbretry="1">Luyện lại ${w.length} cặp sai</button>`:""}<button class="btn ${w.length?"ghost":"accent"}" data-mbnew="1">Nối lại từ đầu</button></div>
    ${w.length?`<div class="vlist">${w.map(x=>`<div class="vrow" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)"><div>${x.lh}</div><div>${x.rh}</div></div>`).join("")}</div>`:""}`;}
  return `<div class="mbbar"><div class="row" style="align-items:center;justify-content:space-between;flex-wrap:wrap"><b>Đã nối ${d}/${n}${MB.miss?` · sai ${MB.miss}`:""}</b><span class="row" style="align-items:center;gap:6px;flex-wrap:wrap"><span class="tip">Cỡ chữ</span>${segBtns("mbsz",MS.mbsz||"m",[["s","Nhỏ"],["m","Vừa"],["l","Lớn"]]).replace(/class="chip"/g,'class="chip" style="padding:3px 10px"')}<button class="btn ghost" data-mbnew="1" style="padding:4px 10px">Xáo lại</button></span></div>
    <span class="bar wide"><i style="width:${Math.round(d/n*100)}%"></i></span><div class="tip">${selTxt}</div></div>
    <div class="mbgrid sz-${MS.mbsz||"m"}"><div class="mbside"><div class="mth">${MB.lt} · còn ${n-d}</div><div class="mbcol">${MB.L.filter(i=>!MB.dl.has(i)).map(i=>cell("L",i)).join("")}</div></div>
    <div class="mbside"><div class="mth">${MB.rt} · còn ${n-d}</div><div class="mbcol">${MB.R.filter(i=>!MB.dr.has(i)).map(i=>cell("R",i)).join("")}</div></div></div>`;
}
function mbDraw(){const b=$("#mbBox");if(!b)return;const st=[...b.querySelectorAll(".mbcol")].map(c=>c.scrollTop);b.innerHTML=mbHTML();b.querySelectorAll(".mbcol").forEach((c,k)=>c.scrollTop=st[k]||0);}
function mbTap(side,i){
  if(!MB||(side==="L"?MB.dl:MB.dr).has(i)) return;
  if(side==="R"&&MB.p[i].say) say(MB.p[i].say);
  if(!MB.sel||MB.sel.side===side){MB.sel=(MB.sel&&MB.sel.side===side&&MB.sel.i===i)?null:{side,i};return mbDraw();}
  const li=side==="L"?i:MB.sel.i, ri=side==="R"?i:MB.sel.i, a=MB.p[li], b=MB.p[ri]; MB.sel=null;
  if(li===ri||a.l===b.l||a.r===b.r){
    MB.dl.add(li);MB.dr.add(ri);
    [li,ri].forEach(k=>{if(!MB.bad.has(k))mCredit(MB.p[k].id,true);});
    if(MB.dl.size===MB.p.length)bump(1);
    return mbDraw();
  }
  MB.miss++; MB.wrong.push(a,b); [li,ri].forEach(k=>{if(!MB.bad.has(k)){MB.bad.add(k);mCredit(MB.p[k].id,false);}}); mbDraw();
  const bs=[$(`[data-mb="L${li}"]`),$(`[data-mb="R${ri}"]`)];
  bs.forEach(x=>x&&x.classList.add("no")); setTimeout(()=>bs.forEach(x=>x&&x.classList.remove("no")),450);
}
function mListHTML(){
  const V=MS.kind==="v", bad=new Set<any>((MT&&MT.key.startsWith("M:")?MT.wrong:[]).map(x=>x.id));
  const badTag=id=>bad.has(id)?'<span class="cue" style="background:var(--bad-soft);color:var(--bad)">vừa nối sai</span>':"";
  const row=(w,id)=>vRow(w).replace('<div class="vmean">',`<div class="vmean">${lvDots(srs(id))}${badTag(id)}`);
  const sess=()=>[...new Set<any>((MT?MT.rounds.flat():[]).map(x=>x.id))].map(itemOf).filter(Boolean);
  if(V){
    const cov=`<div class="chips" style="margin-top:0">${segBtns("vcover",vCover,[["","Hiện hết"],["m","Che nghĩa"],["w","Che từ"]])}</div>`;
    let body;
    if(MS.scope==="l"){let off=0;body=VOCAB[MS.li].groups.map(g=>{const st=off;off+=g.w.length;
      return `<h3 class="nh">${esc(g.t)}</h3><div class="vlist">${g.w.map((w,k)=>row(w,vid(MS.li,st+k))).join("")}</div>`;}).join("");}
    else body=`<div class="vlist">${sess().map(it=>row(it.w,it.id)).join("")}</div>`;
    return `${cov}<div class="${vCover?"cover-"+vCover:""}">${body}</div>`;
  }
  const card=k=>kCard(k).replace('<div class="kbody"><div>',`<div class="kbody"><div>${lvDots(srs(kid(k.k)))}${badTag(kid(k.k))} `);
  if(MS.scope==="l") return KANJI[MS.kc].groups.map(g=>`<h3 class="nh">${esc(g.title)}</h3>${g.kanji.map(card).join("")}`).join("");
  return sess().map(it=>card(it.k)).join("");
}
function renderMatch(){
  mEnsure();
  if(MS.sub==="all"&&(!MB||MB.key!==mbKey()||(MS.scope==="d"&&!MB.p.length))) mbStart();
  const V=MS.kind==="v", md=V?MS.vm:MS.km;
  const nLv=V?mLearnedV().length:mLearnedK().length;
  let scopeRow, info;
  if(MS.scope==="l"){
    scopeRow=V?segBtns("mli",MS.li,VOCAB.map((l,i)=>[i,"Bài "+l.n])):segBtns("mkc",MS.kc,KANJI.map((c,i)=>[i,esc(c.name)]));
    info=V?`Bài ${VOCAB[MS.li].n} · ${esc(VOCAB[MS.li].topic)}`:`${esc(KANJI[MS.kc].name)} · ${esc(KANJI[MS.kc].title)}`;
  }else{
    scopeRow="";
    info=nLv?`Bạn đã học ${nLv} ${V?"từ":"chữ"}. Mỗi phiên lấy ngẫu nhiên tối đa ${M_LEARNED} cặp, ưu tiên ${V?"từ":"chữ"} chưa thuộc và hay sai.`
      :`Chưa có ${V?"từ":"chữ"} nào đã học. Học ở <button class="lnk" data-view="journey">Lộ trình</button> trước, hoặc chọn “Theo bài”.`;
  }
  $("#main").innerHTML=`
  <div class="chips">${segBtns("mk",MS.kind,[["v","Từ vựng"],["k","Kanji"]])}</div>
  <div class="chips" style="margin-top:8px">${segBtns("ms",MS.scope,[["l",V?"Theo bài (đầy đủ)":"Theo chương (đầy đủ)"],["d",(V?"Từ":"Chữ")+" đã học (ngẫu nhiên)"]])}</div>
  ${scopeRow?`<div class="chips" style="margin-top:8px">${scopeRow}</div>`:""}
  <p class="tip" style="margin:12px 0 0">${info}</p>
  ${MS.scope==="d"&&!nLv?"":`<div class="chips">${segBtns("msub",MS.sub,[["play","結 Nối theo ván"],["all",`全 Nối cả ${MS.scope==="l"?(V?"bài":"chương"):"phiên"} 1 lần`],["list",`一覧 Toàn bộ ${V?"từ vựng":"kanji"} (${MS.scope==="l"?(V?VFLAT[MS.li].length:KANJI[MS.kc].groups.reduce((a,g)=>a+g.kanji.length,0)):(MT?MT.total:0)})`]])}</div>`}
  ${MS.sub==="all"&&!(MS.scope==="d"&&!nLv)?`<section class="step"><h2><span class="k">全</span>Nối toàn bộ ${MS.scope==="l"?(V?"Bài "+VOCAB[MS.li].n:esc(KANJI[MS.kc].name)):"phiên này"} trong 1 bảng<span class="hint">nối đúng thì cặp biến mất</span></h2>
    <div class="chips" style="margin-top:0">${V?segBtns("mvm",md,[["m","Nghĩa ↔ Từ"],["k","Kanji ↔ Kana"]]):segBtns("mkm",md,[["m","Nghĩa ↔ Chữ"],["r","Từ ↔ Cách đọc"]])}</div>
    <div id="mbBox">${mbHTML()}</div>
  </section>`:MS.sub==="list"&&!(MS.scope==="d"&&!nLv)?`<section class="step"><h2><span class="k">一</span>${MS.scope==="l"?(V?"Toàn bộ từ vựng Bài "+VOCAB[MS.li].n:"Toàn bộ kanji "+esc(KANJI[MS.kc].name)):"Các mục trong phiên nối này"}<span class="hint">${V&&vCover?"chạm vào dòng để lật":"bấm <svg class='i' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8'/></svg> để nghe · chấm = bậc thuộc"}</span></h2>
    ${mListHTML()}
    <div class="row"><button class="btn accent" data-msub="play">結 Bắt đầu nối →</button></div>
  </section>`:`
  <section class="step"><h2><span class="k">結</span>Nối cặp<span class="hint">chạm 1 ô bên này rồi ô khớp bên kia</span></h2>
    <p class="tip" style="margin:0">Được tính vào tiến độ học: nối đúng ngay lần đầu thì ${V?"từ":"chữ"} lên bậc (tối đa ●●○, bậc ●●● cần tự gõ lại ở mục Ôn tập); nối sai thì được hỏi lại trong lượt ôn hôm nay.</p>
    <div class="chips" style="margin-top:0">${V?segBtns("mvm",md,[["m","Nghĩa ↔ Từ"],["k","Kanji ↔ Kana"]]):segBtns("mkm",md,[["m","Nghĩa ↔ Chữ"],["r","Từ ↔ Cách đọc"]])}</div>
    <div id="mtBox">${MS.scope==="d"&&!nLv?"":mtHTML()}</div>
  </section>`}`;
}
function mSet(o){Object.assign(MS,o);mSave();renderMatch();}

function onClick(t){
  if(t.dataset.mt){mtTap(t.dataset.mt[0],+t.dataset.mt.slice(1));return true;}
  if(t.dataset.mgo){Object.assign(MS,t.dataset.mgo==="v"?{kind:"v",scope:"l",li:vL}:{kind:"k",scope:"l",kc:kC});mSave();setView("match");return true;}
  if(t.dataset.msub){mSet({sub:t.dataset.msub});const bx=$("#mbBox");if(bx)bx.scrollIntoView({block:"start"});else window.scrollTo({top:0});return true;}
  if(t.dataset.mk){mSet({kind:t.dataset.mk});return true;}
  if(t.dataset.ms){mSet({scope:t.dataset.ms});return true;}
  if(t.dataset.mli!==undefined){mSet({li:+t.dataset.mli});return true;}
  if(t.dataset.mkc!==undefined){mSet({kc:+t.dataset.mkc});return true;}
  if(t.dataset.mvm){mSet({vm:t.dataset.mvm});return true;}
  if(t.dataset.mkm){mSet({km:t.dataset.mkm});return true;}
  if(t.dataset.mb){mbTap(t.dataset.mb[0],+t.dataset.mb.slice(1));return true;}
  if(t.dataset.mbsz){MS.mbsz=t.dataset.mbsz;mSave();mbDraw();return true;}
  if(t.dataset.mbnew){mbStart();mbDraw();return true;}
  if(t.dataset.mbretry){mbStart([...new Set<any>(MB.wrong)]);mbDraw();return true;}
  if(t.dataset.mtnext){mtRound(MT.r+1);mtDraw();return true;}
  if(t.dataset.mtretry){mtRetry();mtDraw();return true;}
  if(t.dataset.mtnew){mEnsure(true);mtDraw();return true;}
  return false;
}

export { onClick, MT_N, MT, mtChunks, mtRound, mtStart, mtRetry, mtHTML, mtDraw, mtTap, M_LEARNED, MS, mSave, vPair, kPairs, mWeight, mLearnedV, mLearnedK, mItems, mCredit, mEnsure, MB, mbKey, mbStart, mbHTML, mbDraw, mbTap, mListHTML, renderMatch, mSet };
