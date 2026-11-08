// Tab Luyện thi N5: 10 dạng đề, thi thử, kết quả
import { EXAM_BANK } from "../content/exam/index";
import { genKanji, genNarabe } from "../core/examgen";
import { S, bump, dailyInc, saveProgress, setSetting } from "../core/store";
import { say, speakSeq } from "../core/tts";
import { $, addDays, dayStr, esc, toast } from "../core/util";
import { PT_IV, ptBadge, ptUpto } from "./particle";

const EX_KINDS=[
 {k:"kj_yomi",sec:"moji",t:"Đọc kanji",jp:"漢字読み",ask:"Từ trong 【】 đọc thế nào?"},
 {k:"kj_hyoki",sec:"moji",t:"Viết kanji",jp:"表記",ask:"Từ trong 【】 viết bằng kanji thế nào?"},
 {k:"goi_ctx",sec:"moji",t:"Chọn từ hợp câu",jp:"文脈規定",ask:"Chọn từ đúng điền vào （　）."},
 {k:"goi_para",sec:"moji",t:"Câu cùng nghĩa",jp:"言い換え類義",ask:"Câu nào gần nghĩa nhất với câu có phần gạch chân?"},
 {k:"bun_form",sec:"bun",t:"Chọn trợ từ / dạng đúng",jp:"文法形式",ask:"Chọn từ đúng điền vào （　）."},
 {k:"narabe",sec:"bun",t:"Xếp câu ★",jp:"文の組み立て",ask:"Xếp 4 cụm thành câu đúng. Cụm nào nằm ở ô ★?"},
 {k:"dokkai",sec:"bun",t:"Đọc hiểu",jp:"読解",ask:"Đọc đoạn văn rồi trả lời."},
 {k:"ch_kadai",sec:"cho",t:"Nghe hội thoại",jp:"課題理解",ask:"Nghe hội thoại rồi chọn câu trả lời."},
 {k:"ch_hatsuwa",sec:"cho",t:"Tình huống: nói gì?",jp:"発話表現",ask:"Nghe 3 câu, chọn câu nói phù hợp."},
 {k:"ch_sokuji",sec:"cho",t:"Đáp nhanh",jp:"即時応答",ask:"Nghe câu nói, chọn câu đáp phù hợp."}
];
const EX_SEC={moji:"Chữ & từ vựng",bun:"Ngữ pháp & đọc hiểu",cho:"Nghe"};
const EX_KIND=new Map<any,any>(EX_KINDS.map(k=>[k.k,k]));
const EX_MOCK={kj_yomi:7,kj_hyoki:5,goi_ctx:6,goi_para:3,bun_form:9,narabe:4,dokkai:4,ch_kadai:5,ch_hatsuwa:3,ch_sokuji:4};
let EXQ=null, EXM=null;
function exBuild(){
  if(EXQ) return;
  const bank=EXAM_BANK;
  const flat=[];
  bank.forEach(q=>{ if(q.k==="dokkai") q.qs.forEach((x,i)=>flat.push(Object.assign({},x,{id:q.id+"#"+i,k:"dokkai",l:q.l,text:q.text,tvi:q.vi,grp:q.id}))); else flat.push(q); });
  EXQ=[...genKanji(),...genNarabe(),...flat];
  EXM=new Map<any,any>(EXQ.map(q=>[q.id,q]));
}
let exTab="kind", XS=null, exShowText=false;
const exData=()=>{const e=S.progress.ex||(S.progress.ex={q:{},mocks:[]});if(!e.q)e.q={};return e;}; // ex từ file sao lưu / máy khác có thể thiếu q
const exScopeAll=()=>!!S.progress.exAll;
const exPool=(k?)=>{exBuild();const L=exScopeAll()?25:ptUpto();return EXQ.filter(q=>(!k||q.k===k)&&(q.l||1)<=L);};
function exKindStats(){const r={};for(const [id,v] of Object.entries<any>(exData().q||{})){const q=EXM.get(id);if(!q)continue;const x=r[q.k]||(r[q.k]={c:0,w:0});x.c+=v.c||0;x.w+=v.w||0;}return r;}
function exRank(q,T){const s=(exData().q||{})[q.id];if(s&&s.w>0&&(s.next||"")<=T)return 0;if(!s)return 1;if((s.next||"")<=T)return 2;return 3;}
function exPick(pool,n){const T=dayStr();return pool.map(q=>[q,exRank(q,T),Math.random()]).sort((a,b)=>a[1]-b[1]||a[2]-b[2]).slice(0,n).map(x=>x[0]);}
function exStart(mode){
  exBuild(); let items=[];
  if(mode==="mock"){
    for(const k of Object.keys(EX_MOCK)){
      const pool=exPool(k);
      if(k==="dokkai"){ // lấy trọn đoạn văn
        const grps=[...new Set<any>(pool.map(q=>q.grp))].sort(()=>Math.random()-.5); let n=0;
        for(const g of grps){if(n>=EX_MOCK[k])break;const qs=pool.filter(q=>q.grp===g);items.push(...qs);n+=qs.length;}
      } else items.push(...pool.sort(()=>Math.random()-.5).slice(0,EX_MOCK[k]));
    }
  } else if(mode==="weak"){
    const T=dayStr(); items=exPool().filter(q=>{const s=exData().q[q.id];return s&&s.w>0&&(s.next||"")<=T;}).slice(0,10);
  } else {
    const k=mode.slice(5), pool=exPool(k);
    if(k==="dokkai"){const first=exPick(pool,1)[0];items=first?pool.filter(q=>q.grp===first.grp):[];
      const more=exPick(pool.filter(q=>q.grp!==(first||{}).grp),1)[0]; if(more) items.push(...pool.filter(q=>q.grp===more.grp));}
    else items=exPick(pool,10);
  }
  if(!items.length){toast(mode==="weak"?"Không có câu sai nào đến hạn ôn 👍":"Chưa có câu cho dạng này ở phạm vi bài bạn chọn.");return;}
  XS={mode,mock:mode==="mock",ids:items.map(q=>q.id),pos:0,ans:{},start:Date.now()};
  exTab="run"; renderExam(); window.scrollTo({top:0}); exAutoPlay();
}
const NUMV=["いちばん","にばん","さんばん","よんばん"];
function exAudio(q,what?){
  if(q.k==="ch_kadai") return speakSeq([[q.intro||q.q,1],...q.script.map(([r,t])=>[t,r==="M"?.75:1.3]),[q.q,1]]);
  if(q.k==="ch_hatsuwa") return speakSeq(what!=null?[[q.opts[what],1.1]]:q.opts.map((o,i)=>[[NUMV[i],1],[o,1.1]]).flat());
  if(q.k==="ch_sokuji") return speakSeq(what!=null?[[q.opts[what],.8]]:[[q.line,1.3],...q.opts.map((o,i)=>[[NUMV[i],1],[o,.8]]).flat()]);
}
function exAutoPlay(){if(!XS)return;const q=EXM.get(XS.ids[XS.pos]);if(q&&EX_KIND.get(q.k).sec==="cho"&&XS.ans[q.id]==null)setTimeout(()=>exAudio(q),300);}
function exAnswer(i){
  if(!XS) return; const q=EXM.get(XS.ids[XS.pos]); if(XS.ans[q.id]!=null) return;
  XS.ans[q.id]=i; const ok=i===q.a, T=dayStr();
  const s=Object.assign({c:0,w:0,box:0},exData().q[q.id]||{});
  if(ok){s.c++;s.box=Math.min(s.box+1,5);s.next=addDays(T,PT_IV[s.box]);bump(1);}else{s.w++;s.box=1;s.next=T;}
  exData().q[q.id]=s; exData().t=Date.now(); dailyInc("ex"); saveProgress();
  if(XS.mock) return exNext();
  renderExam();
}
function exNext(){if(!XS)return;XS.pos++;if(XS.pos>=XS.ids.length&&XS.mock)exFinishMock();renderExam();window.scrollTo({top:0});exAutoPlay();}
function exScore(ids,ans){
  const r={moji:[0,0],bun:[0,0],cho:[0,0]};
  ids.forEach(id=>{const q=EXM.get(id);const sec=EX_KIND.get(q.k).sec;r[sec][1]++;if(ans[id]===q.a)r[sec][0]++;});
  const A=(r.moji[0]+r.bun[0])/Math.max(1,r.moji[1]+r.bun[1]), B=r.cho[0]/Math.max(1,r.cho[1]);
  const a=Math.round(A*120), b=Math.round(B*60);
  return {r,a,b,tot:a+b,pass:a>=38&&b>=19&&a+b>=80};
}
function exFinishMock(){
  const sc=exScore(XS.ids,XS.ans); XS.score=sc;
  const m=exData().mocks||(exData().mocks=[]);
  m.push({d:dayStr(),a:sc.a,b:sc.b,tot:sc.tot,min:Math.round((Date.now()-XS.start)/60000)}); if(m.length>30) m.splice(0,m.length-30);
  exData().t=Date.now(); saveProgress();
}
function exStem(q,done){
  const blank=s=>esc(s).replace("（　）",`<span class="blank${done?(" "+(XS.ans[q.id]===q.a?"ok":"bad")):""}">${done?esc(q.opts[q.a]):"&nbsp;?&nbsp;"}</span>`);
  const under=s=>esc(s).replace(/【(.+?)】/,"<u class=\"xu\">$1</u>");
  switch(q.k){
    case "kj_yomi": case "kj_hyoki": return `<div class="xbig jp">${under(q.q)}</div>`;
    case "goi_ctx": case "bun_form": return `<div class="ptsent jp">${blank(q.q)}</div>`;
    case "goi_para": return `<div class="ptsent jp">${under(q.q)}</div>`;
    case "narabe": return `<div class="ptsent jp">${esc(q.head)} <span class="nb">＿＿</span> <span class="nb">＿＿</span> <span class="nb star">★</span> <span class="nb">＿＿</span> ${esc(q.tail)}</div>`;
    case "dokkai": return `<div class="xtext jp">${esc(q.text)}</div><div class="ptsent jp" style="font-size:1.1rem">${esc(q.q)}</div>`;
    case "ch_kadai": return `<div class="row" style="align-items:center"><button class="btn" data-xplay="1"><svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/></svg> Nghe lại</button><span class="tip">Đi thi chỉ được nghe 1 lần. Khi luyện, cố gắng chỉ nghe lại 1 lần.</span></div><div class="ptsent jp" style="font-size:1.1rem">${esc(q.q)}</div>${done?"":`<div class="tip">${esc(q.qvi||"")}</div>`}`;
    case "ch_hatsuwa": return `<div class="xsit">${esc(q.sit)}</div><div class="row"><button class="btn" data-xplay="1"><svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/></svg> Nghe 3 câu</button></div>`;
    case "ch_sokuji": return `<div class="row"><button class="btn" data-xplay="1"><svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/></svg> Nghe câu nói + 3 câu đáp</button></div>${done||exShowText?`<div class="ptsent jp" style="font-size:1.1rem">${esc(q.line)}</div>`:""}`;
  }
  return "";
}
function exOptLabel(q,i,done){
  const listen=q.k==="ch_hatsuwa"||q.k==="ch_sokuji";
  if(listen&&!done&&!exShowText) return `${i+1}`;
  if(q.k==="kj_yomi"||q.k==="kj_hyoki"||q.k==="narabe"||q.k==="bun_form") return `${i+1}. <span class="jp">${esc(q.opts[i])}</span>`;
  return `${i+1}. <span class="jp">${esc(q.opts[i])}</span>`;
}
function exQuestionHTML(){
  const q=EXM.get(XS.ids[XS.pos]), K=EX_KIND.get(q.k), a=XS.ans[q.id], done=a!=null&&!XS.mock, listen=q.k==="ch_hatsuwa"||q.k==="ch_sokuji";
  const elapsed=Math.round((Date.now()-XS.start)/60000);
  return `<div class="ptprog"><span class="tip">${XS.mock?"Thi thử":"Luyện"} · ${esc(EX_SEC[K.sec])} · <span class="jp">${esc(K.jp)}</span></span><span class="tip">Câu ${XS.pos+1}/${XS.ids.length}${XS.mock?` · ${elapsed} phút`:""}</span><button class="lnk" id="xQuit">Thoát</button></div>
  <span class="bar wide"><i style="width:${100*XS.pos/XS.ids.length}%"></i></span>
  <section class="step ptcard">
    <p class="tip">${esc(K.ask)}</p>
    ${exStem(q,done)}
    <div class="xopts">${q.opts.map((o,i)=>`<div class="xrow"><button class="xopt${done&&i===q.a?" right":""}${done&&i===a&&a!==q.a?" wrong":""}" data-xa="${i}" ${done?"disabled":""}>${exOptLabel(q,i,done)}</button>${listen?`<button class="say" data-xplayo="${i}" aria-label="Nghe câu ${i+1}"><svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/></svg></button>`:""}</div>`).join("")}</div>
    ${listen&&!done?`<label class="tip"><input type="checkbox" id="xShowText" ${exShowText?"checked":""}> Hiện chữ (khi mới luyện; đi thi không có chữ)</label>`:""}
    ${done?exExplainHTML(q,a):""}
  </section>`;
}
function exExplainHTML(q,a){
  const ok=a===q.a;
  const script=q.k==="ch_kadai"?`<details class="more"><summary>Lời thoại</summary>${q.script.map(([r,t])=>`<div><b>${r==="M"?"Nam":"Nữ"}:</b> <span class="jp">${esc(t)}</span></div>`).join("")}${q.vi?`<div class="tip" style="margin-top:6px">${esc(q.vi)}</div>`:""}</details>`:"";
  const tvi=q.k==="dokkai"&&q.tvi?`<details class="more"><summary>Dịch đoạn văn</summary><div class="tip">${esc(q.tvi)}</div></details>`:"";
  return `<div class="res ${ok?"ok":"bad"}">${ok?"✓ Đúng!":"✗ Chưa đúng. Đáp án: "+(q.a+1)+". <span class=\"jp\">"+esc(q.opts[q.a])+"</span>"}</div>
    <div class="ptwhy">${q.k==="narabe"?`<div class="jp" style="font-size:1.1rem">${esc(q.full)}</div>`:""}${q.vi&&q.k!=="ch_kadai"?`<div class="tip">${esc(q.vi)}</div>`:""}${q.why?`<div><b>Vì sao:</b> ${esc(q.why)}</div>`:""}${script}${tvi}</div>
    <div class="row"><button class="btn" id="xNext">${XS.pos+1<XS.ids.length?"Câu tiếp →":"Xem kết quả"}</button><span class="tip kbdhint">(Enter)</span></div>`;
}
function renderExam(){
  exBuild();
  const L=ptUpto(), all=exScopeAll(), st=exKindStats();
  const days=S.progress.examDate?Math.ceil((+new Date(S.progress.examDate+"T09:00:00")-+new Date())/86400000):null;
  let body="";
  if(exTab==="run"&&XS){
    if(XS.pos<XS.ids.length) body=exQuestionHTML();
    else if(XS.mock){
      const sc=XS.score||exScore(XS.ids,XS.ans);
      const wrong=XS.ids.filter(id=>XS.ans[id]!==EXM.get(id).a);
      body=`<section class="step"><h2><span class="k">結</span>Kết quả thi thử</h2>
        <div class="xscore"><div><b>${sc.a}</b>/120<span class="tip">Chữ · từ · ngữ pháp · đọc (cần ≥ 38)</span></div><div><b>${sc.b}</b>/60<span class="tip">Nghe (cần ≥ 19)</span></div><div><b>${sc.tot}</b>/180<span class="tip">Tổng (cần ≥ 80)</span></div></div>
        <div class="res ${sc.pass?"ok":"bad"}">${sc.pass?"Nếu thi thật với phong độ này: ĐẬU 🎉":"Chưa đủ điểm đậu. Xem phần sai bên dưới, luyện thêm đúng dạng đó."}</div>
        <p class="tip">${Object.entries<any>(sc.r).map(([k,v])=>`${EX_SEC[k]}: ${v[0]}/${v[1]}`).join(" · ")}. Điểm quy đổi chỉ là ước lượng; đề thật có thang điểm riêng.</p>
        ${wrong.length?`<h3 class="nh">Câu sai (${wrong.length})</h3>${wrong.map(id=>{const q=EXM.get(id);return `<div class="ptrev"><div class="tip">${esc(EX_KIND.get(q.k).t)}</div><div class="jp">${esc(q.q||q.line||q.sit||q.head+" … "+q.tail)}</div><div>Đáp án: <span class="jp">${esc(q.opts[q.a])}</span>${XS.ans[id]!=null?` · bạn chọn: <span class="jp">${esc(q.opts[XS.ans[id]])}</span>`:""}</div>${q.why?`<div class="tip">${esc(q.why)}</div>`:""}</div>`;}).join("")}`:""}
        <div class="row" style="margin-top:12px"><button class="btn accent" data-xmode="mock">Thi thử đề khác</button><button class="btn ghost" data-xtab="kind">Luyện theo dạng</button></div></section>`;
    } else {
      const n=XS.ids.filter(id=>XS.ans[id]===EXM.get(id).a).length;
      body=`<section class="step"><h2><span class="k">終</span>Xong: ${n}/${XS.ids.length} câu đúng</h2>
        <div class="row" style="flex-wrap:wrap"><button class="btn accent" data-xmode="${esc(XS.mode)}">Làm thêm 10 câu</button><button class="btn ghost" data-xtab="kind">Chọn dạng khác</button></div></section>`;
    }
  } else {
    const head=`<div class="ptbar"><label class="tip" for="ptUpto2">Phạm vi đề:</label>
      <select id="ptUpto2"><option value="upto" ${all?"":"selected"}>Đến Bài ${L} (bài đang học)</option><option value="all" ${all?"selected":""}>Toàn bộ Bài 1–25</option></select>
      <label class="tip" for="xDate">Ngày thi:</label><input type="date" id="xDate" value="${esc(S.progress.examDate||"")}">
      ${days!=null?`<span class="pill">${days>0?`còn ${days} ngày`:days===0?"hôm nay thi!":"đã thi"}</span>`:""}</div>
      <div class="chips"><button class="chip" data-xtab="kind" aria-pressed="${exTab!=="mock"}">Luyện theo dạng</button><button class="chip" data-xtab="mock" aria-pressed="${exTab==="mock"}">Thi thử & kết quả</button></div>`;
    if(exTab==="mock"){
      const m=(exData().mocks||[]).slice().reverse();
      const nQ=Object.values<any>(EX_MOCK).reduce((a,b)=>a+b,0);
      body=head+`<section class="step"><h2><span class="k">試</span>Thi thử<span class="hint">~${nQ} câu · khoảng 35–45 phút</span></h2>
        <p class="tip">Đề rút ngẫu nhiên đủ 10 dạng như đề thật. Trong lúc thi không hiện đáp án, làm xong mới chấm. Phần nghe chỉ có chữ khi bạn bật “Hiện chữ”.</p>
        <button class="btn accent" data-xmode="mock">Bắt đầu thi thử</button></section>
        <section class="step"><h2><span class="k">績</span>Lịch sử</h2>${m.length?`<div class="tw"><table><tr><td>Ngày</td><td>Chữ·từ·NP·đọc</td><td>Nghe</td><td>Tổng</td><td></td></tr>${m.map(x=>`<tr><td>${esc(x.d)}</td><td>${+x.a||0}/120</td><td>${+x.b||0}/60</td><td><b>${+x.tot||0}</b>/180</td><td>${x.a>=38&&x.b>=19&&x.tot>=80?"✓ đậu":"✗"}</td></tr>`).join("")}</table></div>`:`<p class="tip">Chưa thi thử lần nào.</p>`}</section>`;
    } else {
      const weak=exPool().filter(q=>{const s=(exData().q||{})[q.id];return s&&s.w>0&&(s.next||"")<=dayStr();}).length;
      body=head+`<div class="row" style="margin-top:12px;flex-wrap:wrap;align-items:center"><button class="btn ghost" data-xmode="weak" ${weak?"":"disabled"}>Ôn ${weak} câu đã sai</button><span class="tip">Mỗi lượt 10 câu, làm xong thấy ngay đáp án và vì sao.</span></div>
      ${Object.entries<any>(EX_SEC).map(([sec,name])=>`<h3 class="nh">${esc(name)}</h3><div class="xgrid">${EX_KINDS.filter(k=>k.sec===sec).map(k=>{const n=exPool(k.k).length;return `<button class="xcard" data-xmode="kind:${k.k}" ${n?"":"disabled"}><span class="jp xjp">${esc(k.jp)}</span><b>${esc(k.t)}</b><span class="tip">${n} câu · ${ptBadge(st[k.k])}</span></button>`;}).join("")}</div>`).join("")}`;
    }
  }
  $("#main").innerHTML=body;
}
function exClick(t){
  if(t.dataset.xtab){exTab=t.dataset.xtab;if(exTab!=="run")XS=null;renderExam();return true;}
  if(t.dataset.xmode){exStart(t.dataset.xmode);return true;}
  if(t.dataset.xa!==undefined){exAnswer(+t.dataset.xa);return true;}
  if(t.dataset.xplay){exAudio(EXM.get(XS.ids[XS.pos]));return true;}
  if(t.dataset.xplayo!==undefined){exAudio(EXM.get(XS.ids[XS.pos]),+t.dataset.xplayo);return true;}
  if(t.id==="xNext"){exNext();return true;}
  if(t.id==="xQuit"){if(XS&&XS.mock&&!t.dataset.armed){t.dataset.armed="1";t.textContent="Bỏ bài thi?";setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent="Thoát";}},3000);return true;}
    XS=null;exTab="kind";if("speechSynthesis" in window)speechSynthesis.cancel();renderExam();return true;}
  return false;
}
function onChange(e){
  const el=e.target;
  if(el.id==="ptUpto2"){setSetting("exAll",el.value==="all");renderExam();}
  if(el.id==="xDate"){setSetting("examDate",el.value||null);renderExam();}
  if(el.id==="xShowText"){exShowText=el.checked;renderExam();}
}
function onKey(e){
  if(XS&&XS.pos<XS.ids.length&&e.target.tagName!=="INPUT"&&e.target.tagName!=="SELECT"){const q=EXM.get(XS.ids[XS.pos]);if(XS.ans[q.id]==null&&/^[1-4]$/.test(e.key)&&+e.key<=q.opts.length){exAnswer(+e.key-1);return true;} if(XS.ans[q.id]!=null&&e.key==="Enter"&&e.target.tagName!=="BUTTON"){e.preventDefault();exNext();return true;}}
  return false;
}

export { onChange, onKey, EX_KINDS, EX_SEC, EX_KIND, EX_MOCK, EXQ, EXM, exBuild, exTab, XS, exShowText, exData, exScopeAll, exPool, exKindStats, exRank, exPick, exStart, NUMV, exAudio, exAutoPlay, exAnswer, exNext, exScore, exFinishMock, exStem, exOptLabel, exQuestionHTML, exExplainHTML, renderExam, exClick };
