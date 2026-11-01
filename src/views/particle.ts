// Tab Trợ từ: tổng hợp, khung động từ, luyện điền, điểm yếu
import { PT_DRILLS } from "../content/drills";
import { PT_FRAMES, PT_SETS, PT_USES } from "../content/particles";
import { PG_CORE, PG_LOOKUP, PG_MASTERS, PG_PAIRS } from "../content/particle_guide";
import { LS_KEY, S, bump, dailyInc, saveProgress, setSetting } from "../core/store";
import { say } from "../core/tts";
import { $, addDays, dayStr, esc, pick, toast } from "../core/util";

const PT_ORDER=["は","が","を","に","へ","で","と","から","まで","までに","より","も","の","や","だけ","×"];
const PT_U=new Map<any,any>(PT_USES.map(u=>[u.u,u]));
const PT_D=new Map<any,any>(PT_DRILLS.map(d=>[d.id,d]));
const PT_IV=[0,1,3,7,14,30], PT_N=10;
// bài sớm nhất mỗi nút trợ từ xuất hiện → ẩn nút của bài chưa học
const PT_BTN_L={}; PT_USES.forEach(u=>u.p.split("／").forEach(p=>{PT_BTN_L[p]=Math.min(PT_BTN_L[p]??99,u.l);}));
let ptTab="map", PQ=null;
try{const o=JSON.parse(localStorage.getItem(LS_KEY+"_pt")||"null");if(o&&["map","frame","drill","weak"].includes(o.tab))ptTab=o.tab;}catch(e){}
const ptUpto=()=>S.progress.upto||13;
const ptAll=()=>S.progress.pt||(S.progress.pt={});
function ptUseStats(){
  const r={}; for(const [id,v] of Object.entries<any>(ptAll())){const d=PT_D.get(id);if(!d)continue;const x=r[d.u]||(r[d.u]={c:0,w:0});x.c+=v.c||0;x.w+=v.w||0;}
  return r;
}
const pct=x=>x&&(x.c+x.w)?Math.round(100*x.c/(x.c+x.w)):null;
function ptBadge(x){const p=pct(x);if(p===null)return `<span class="ptb">chưa luyện</span>`;return `<span class="ptb ${p>=80?"g":p>=60?"m":"b"}">${p}% · ${x.c+x.w} câu</span>`;}
const ptFill=(s,a,cls)=>esc(s).replace("（　）",`<span class="blank ${cls||""}">${a==null?"&nbsp;?&nbsp;":a==="×"?"∅":esc(a)}</span>`);
const ptPlain=(s,a)=>s.replace("（　）",a==="×"?"":a);

function ptPool(mode){
  const L=ptUpto(), T=dayStr(), all=PT_DRILLS.filter(d=>d.l<=L);
  if(mode==="lesson") return all.filter(d=>d.l===L);
  if(mode==="weak") return all.filter(d=>{const s=ptAll()[d.id];return s&&s.w>0&&(s.next||"")<=T;});
  if(mode.startsWith("set:")){const st=PT_SETS.find(s=>s.id===mode.slice(4));return all.filter(d=>st&&st.uses.includes(d.u));}
  if(mode.startsWith("u:")) return all.filter(d=>d.u===mode.slice(2));
  return all;
}
function ptStart(mode){
  const T=dayStr(), pool=ptPool(mode);
  if(!pool.length){toast(mode==="weak"?"Không còn câu sai nào cần ôn hôm nay 👍":"Chưa có câu nào cho mục này ở mức bài bạn chọn.");return;}
  const st=d=>ptAll()[d.id], rnd=()=>Math.random();
  // ưu tiên: câu sai đến hạn → câu chưa làm → câu đến hạn → còn lại
  const rank=d=>{const s=st(d);if(s&&s.w>0&&(s.next||"")<=T)return 0;if(!s)return 1;if((s.next||"")<=T)return 2;return 3;};
  const pick=pool.map(d=>[d,rank(d),rnd()]).sort((a,b)=>a[1]-b[1]||a[2]-b[2]).slice(0,PT_N).map(x=>x[0]);
  PQ={mode,ids:pick.map(d=>d.id).sort(()=>rnd()-.5),pos:0,ans:null,ok:0,wrong:[]};
  ptTab="drill"; renderParticles(); window.scrollTo({top:0});
}
function ptAnswer(v){
  if(!PQ||PQ.ans!==null) return;
  const d=PT_D.get(PQ.ids[PQ.pos]), ok=d.a.includes(v), T=dayStr();
  PQ.ans=v;
  const s=Object.assign({c:0,w:0,box:0},ptAll()[d.id]||{});
  if(ok){s.c++;s.box=Math.min(s.box+1,5);s.next=addDays(T,PT_IV[s.box]);PQ.ok++;bump(1);}
  else{s.w++;s.box=1;s.next=T;PQ.wrong.push(d.id);}
  s.t=Date.now(); ptAll()[d.id]=s; dailyInc("pt"); saveProgress();
  renderParticles();
  const fb=$("#ptFb"); if(fb) fb.scrollIntoView({block:"nearest",behavior:"smooth"});
}
function ptNext(){ if(!PQ||PQ.ans===null) return; PQ.pos++; PQ.ans=null; renderParticles(); window.scrollTo({top:0}); }
function ptModeName(m){
  if(m==="mix") return "Trộn đến Bài "+ptUpto(); if(m==="lesson") return "Chỉ Bài "+ptUpto(); if(m==="weak") return "Câu hay sai";
  if(m.startsWith("set:")) return (PT_SETS.find(s=>s.id===m.slice(4))||{}).t||m;
  if(m.startsWith("u:")){const u=PT_U.get(m.slice(2));return u?u.p+" · "+u.q:m;} return m;
}
function ptUseRow(u,st,dim){
  return `<div class="ptu${dim?" dim":""}" id="ptu-${u.u}">
    <div class="ptq"><b>${esc(u.q)}</b> <span class="ptl">Bài ${u.l}</span> ${dim?"":ptBadge(st[u.u])}</div>
    <div class="tip">${esc(u.rule)}</div>
    <div class="ptex"><button class="say" data-say="${esc(u.ex[0])}" aria-label="Nghe">🔊</button><span class="jp">${esc(u.ex[0])}</span><span class="tip">${esc(u.ex[1])}</span>
    ${dim?"":`<button class="lnk" data-ptmode="u:${u.u}">Luyện →</button>`}</div></div>`;
}

// ---- Tổng hợp: 1 câu chứa hết · mỗi trợ từ 1 hình · cặp hay nhầm · tra nhanh ----
let pgM=0, pgSel="";
const lbl=(l,L)=>l>L?` <span class="ptl">Bài ${l}</span>`:"";
const pgSay=jp=>`<button class="say" data-say="${esc(jp)}" aria-label="Nghe">🔊</button>`;
function pgInfo(){
  const M=PG_MASTERS[pgM]; if(!pgSel) return `<span class="tip">👆 Chạm vào từng cụm có màu để xem nó trả lời câu hỏi gì.</span>`;
  const [li,ci]=pgSel.split(":").map(Number), c=(M.lines[li]||[])[ci]; if(!c) return "";
  return c[1]===""?`<b class="jp">${esc(c[0])}</b> — ${esc(c[2])}. Đọc câu từ đây ngược lên: động từ quyết định các trợ từ phía trước.`
    :`<span class="jp pgbig pc-${c[3]}">${esc(c[1]==="×"?"∅":c[1])}</span> <b>${esc(c[2]||(c[1]==="×"?"Không cần trợ từ":""))}</b> → <span class="jp">${esc(c[0])}${c[1]==="×"?"":`<b>${esc(c[1])}</b>`}</span>`;
}
function renderGuide(L,st){
  const M=PG_MASTERS[pgM];
  const sent=M.lines.map(line=>line.map(c=>c[0]+(c[1]&&c[1]!=="×"?c[1]:"")).join(" ")).join(" ");
  const masters=`<section class="step"><h2><span class="k">一</span>Một câu chứa hết<span class="hint">mỗi màu là một câu hỏi</span></h2>
    <div class="chips" style="margin-top:0">${PG_MASTERS.map((m,i)=>`<button class="chip" data-pgm="${i}" aria-pressed="${i===pgM}">${esc(m.t)}${lbl(m.l,L)}</button>`).join("")}</div>
    <div class="pgsent">${M.lines.map((line,li)=>`<div class="pgline">${line.map((c,ci)=>`<button class="pgc pc-${c[3]}${pgSel===li+":"+ci?" sel":""}" data-pgc="${li}:${ci}"><span class="jp">${esc(c[0])}</span>${c[1]&&c[1]!=="×"?`<b class="jp">${esc(c[1])}</b>`:c[1]==="×"?`<b class="pgx">∅</b>`:""}</button>`).join("")}</div>`).join("")}</div>
    <div class="row" style="align-items:center">${pgSay(sent)}<span class="tip">${esc(M.vi)}</span></div>
    <div class="pginfo" id="pgInfo">${pgInfo()}</div>
  </section>`;
  const core=`<section class="step"><h2><span class="k">二</span>Mỗi trợ từ = 1 hình<span class="hint">nhớ hình trước, nghĩa phụ sau</span></h2>
    <div class="pgcore">${PG_CORE.map(c=>{const us=PT_USES.filter(u=>c.ps.includes(u.p)), now=us.filter(u=>u.l<=L), later=us.length-now.length;
      return `<div class="pgcard"><div class="pghead"><span class="pgico" aria-hidden="true">${c.ico}</span><span class="jp pgbig pc-${c.c}">${esc(c.p)}</span><b>${esc(c.key)}</b></div>
        <div>${esc(c.one)}</div>
        <div class="ptex">${pgSay(c.ex[0])}<span class="jp">${esc(c.ex[0])}</span><span class="tip">${esc(c.ex[1])}</span></div>
        ${now.length?`<details class="pgmore"><summary>${now.length} cách dùng tới Bài ${L}${later?` <span class="tip">(+${later} ở bài sau)</span>`:""}</summary>${now.map(u=>ptUseRow(u,st,false)).join("")}</details>`:""}
      </div>`;}).join("")}</div>
  </section>`;
  const pairs=`<section class="step"><h2><span class="k">三</span>Cặp hay nhầm<span class="hint">hai câu chỉ khác đúng một trợ từ</span></h2>
    ${PG_PAIRS.map(x=>{const dim=x.l>L;const side=(y)=>`<div class="pgside"><div class="row" style="align-items:center">${pgSay(y[0])}<span class="jp pgjp">${hlP(y[0],y[1])}</span></div><div class="tip">${esc(y[2])}</div></div>`;
      return `<div class="pgpair${dim?" dim":""}"><div class="pgpt"><b>${esc(x.t)}</b>${lbl(x.l,L)}</div><div class="pgab">${side(x.a)}${side(x.b)}</div>
        <div class="pgrule">${esc(x.rule)}</div>${dim?"":`<button class="btn ghost" data-ptmode="${esc(x.mode)}">Luyện cặp này →</button>`}</div>`;}).join("")}
  </section>`;
  const look=`<section class="step"><h2><span class="k">四</span>Tra nhanh: tôi muốn nói…<span class="hint">mờ = bài sau</span></h2>
    <div class="pglook">${PG_LOOKUP.map(r=>`<div class="pgl${r[4]>L?" dim":""}"><div>${esc(r[0])}</div><span class="jp pgbig pc-${r[3]}">${esc(r[1])}</span><div class="ptex">${pgSay(r[2])}<span class="jp">${esc(r[2])}</span></div></div>`).join("")}</div>
  </section>`;
  const how=`<details class="more" style="margin-top:20px"><summary><b>Gặp câu lạ thì làm sao? (3 bước)</b></summary><ol class="pt3" style="margin-top:8px">
      <li><b>Nhìn ĐỘNG TỪ cuối câu trước.</b> Động từ quyết định trợ từ.</li>
      <li><b>Động từ có khung riêng không?</b> Tra <button class="lnk" data-pttab="frame">Khung động từ</button> (のります → に, おります → を).</li>
      <li><b>Không có thì hỏi danh từ trả lời câu hỏi gì</b> — dùng bảng Tra nhanh ở trên.</li></ol></details>`;
  return masters+core+pairs+look+how;
}
// tô màu đúng trợ từ khác nhau trong câu cặp: tìm cụm trước trợ từ đầu tiên khớp mã màu
const PG_CH={wa:"は",ga:"が",wo:"を",ni:"に",de:"で",e:"へ",to:"と",kara:"まで",x:""};
function hlP(jp,c){
  const ch=PG_CH[c]; const t=esc(jp);
  if(c==="x") return t;
  const re=c==="kara"?/(までに|まで|から)/:new RegExp("("+ch+")(?= )");
  return t.replace(re,`<b class="pc-${c} pghl">$1</b>`);
}
function renderParticles(){
  const L=ptUpto(), st=ptUseStats();
  const tabs={map:"Tổng hợp",frame:"Khung động từ",drill:"Luyện điền",weak:"Điểm yếu"};
  const head=`<div class="ptbar"><label class="tip" for="ptUpto">Tôi đang học đến</label>
    <select id="ptUpto">${Array.from({length:25},(_,i)=>`<option value="${i+1}" ${i+1===L?"selected":""}>Bài ${i+1}</option>`).join("")}</select>
    <span class="tip">→ chỉ hiện cách dùng và câu luyện tới bài này.</span></div>
    <div class="chips">${Object.entries<any>(tabs).map(([k,v])=>`<button class="chip" data-pttab="${k}" aria-pressed="${k===ptTab}">${v}</button>`).join("")}</div>`;
  let body="";
  if(ptTab==="map") body=renderGuide(L,st);
  if(ptTab==="frame"){
    body=`<p class="tip" style="margin-top:12px">Khung của động từ thắng mọi quy tắc chung. Học động từ thì học cả khung: thay vì nhớ <span class="jp">のります</span>, hãy nhớ <span class="jp">でんしゃに のります</span>. Dòng mờ là bài sau.</p>
    ${PT_FRAMES.map(g=>`<h3 class="nh">${esc(g.g)}</h3><div class="tw"><table>${g.rows.map(r=>`<tr class="${r[2]>L?"dim":""}"><td class="jp c0">${esc(r[0])}</td><td class="jp">${esc(r[1])}</td><td class="c2">Bài ${r[2]}</td></tr>`).join("")}</table></div>`).join("")}`;
  }
  if(ptTab==="weak"){
    const rows=PT_USES.filter(u=>u.l<=L).map(u=>({u,x:st[u.u],p:pct(st[u.u])})).sort((a,b)=>(a.p??101)-(b.p??101));
    const due=ptPool("weak").length;
    body=`<div class="row" style="margin-top:12px;align-items:center;flex-wrap:wrap"><button class="btn accent" data-ptmode="weak" ${due?"":"disabled"}>Ôn ${due} câu hay sai</button><span class="tip">Câu sai sẽ hỏi lại cho tới khi đúng, rồi giãn dần 1 → 3 → 7 → 14 → 30 ngày.</span></div>
    <div class="tw" style="margin-top:12px"><table>${rows.map(r=>`<tr><td class="jp c0">${esc(r.u.p)}</td><td>${esc(r.u.q)} <span class="ptl">Bài ${r.u.l}</span></td><td>${ptBadge(r.x)}</td><td><button class="lnk" data-ptmode="u:${r.u.u}">Luyện</button></td></tr>`).join("")}</table></div>`;
  }
  if(ptTab==="drill"){
    if(!PQ){
      const sets=PT_SETS.map(s=>({s,n:ptPool("set:"+s.id).length})).filter(x=>x.n);
      body=`<section class="step"><h2><span class="k">練</span>Chọn kiểu luyện<span class="hint">mỗi lượt ${PT_N} câu</span></h2>
        <div class="row" style="flex-wrap:wrap"><button class="btn accent" data-ptmode="mix">Trộn Bài 1–${L} (${ptPool("mix").length} câu)</button><button class="btn ghost" data-ptmode="lesson">Chỉ Bài ${L} (${ptPool("lesson").length})</button><button class="btn ghost" data-ptmode="weak">Câu hay sai (${ptPool("weak").length})</button></div>
        <p class="tip" style="margin-top:14px">Hoặc luyện riêng từng cụm dễ nhầm. Loạn chỗ nào thì luyện chỗ đó:</p>
        ${sets.map(x=>`<div class="ptset"><button class="btn ghost" data-ptmode="set:${x.s.id}">${esc(x.s.t)} <span class="tip">(${x.n})</span></button><div class="tip">${esc(x.s.tip)}</div></div>`).join("")}
      </section>`;
    } else if(PQ.pos>=PQ.ids.length){
      const wr=[...new Set<any>(PQ.wrong)].map(id=>PT_D.get(id));
      body=`<section class="step"><h2><span class="k">終</span>Xong lượt: ${PQ.ok}/${PQ.ids.length} câu đúng</h2>
        ${wr.length?`<p class="tip">Những câu sai, đọc lại phần “vì sao” một lần nữa:</p>${wr.map(d=>`<div class="ptrev"><div class="jp">${ptFill(d.s,d.a[0],"ok")}</div><div class="tip">${esc(d.why)}</div></div>`).join("")}`:`<p>Không sai câu nào. Giỏi lắm! 🎉</p>`}
        <div class="row" style="flex-wrap:wrap;margin-top:12px"><button class="btn accent" data-ptmode="${esc(PQ.mode)}">Làm thêm ${PT_N} câu</button><button class="btn ghost" id="ptMenu">Chọn kiểu khác</button></div>
      </section>`;
    } else {
      const d=PT_D.get(PQ.ids[PQ.pos]), u=PT_U.get(d.u), a=PQ.ans, ok=a!==null&&d.a.includes(a);
      const set=PQ.mode.startsWith("set:")?PT_SETS.find(s=>s.id===PQ.mode.slice(4)):null;
      const btns=PT_ORDER.filter(p=>(PT_BTN_L[p]??1)<=L||d.a.includes(p));
      body=`<div class="ptprog"><span class="tip">${esc(ptModeName(PQ.mode))}</span><span class="tip">Câu ${PQ.pos+1}/${PQ.ids.length} · đúng ${PQ.ok}</span><button class="lnk" id="ptMenu">Thoát</button></div>
      <span class="bar wide"><i style="width:${100*PQ.pos/PQ.ids.length}%"></i></span>
      ${set?`<p class="tip">${esc(set.tip)}</p>`:""}
      <section class="step ptcard">
        <div class="ptsent jp">${ptFill(d.s,a===null?null:(ok?a:d.a[0]),a===null?"":ok?"ok":"bad")}</div>
        <div class="tip">${esc(d.vi)}</div>
        <div class="opts ptopts">${btns.map(p=>`<button class="opt${a!==null&&d.a.includes(p)?" right":""}${a===p&&!ok?" wrong":""}" data-pta="${esc(p)}" ${a!==null?"disabled":""}>${esc(p)}</button>`).join("")}</div>
        ${a===null?`<p class="tip">Nhìn động từ cuối câu trước, rồi hỏi: chỗ trống trả lời câu hỏi gì? <span class="jp">×</span> = không cần trợ từ.</p>`:`
        <div id="ptFb" class="res ${ok?"ok":"bad"}">${ok?"✓ Đúng!":"✗ Chưa đúng. Đáp án: <b class=\"jp\">"+d.a.map(esc).join(" / ")+"</b>"}${ok&&d.a.length>1?` <span class="tip">(${d.a.map(esc).join(" / ")} đều được)</span>`:""}</div>
        <div class="ptwhy"><div><b>Vì sao:</b> ${esc(d.why)}</div>
          <div class="tip">Câu tự hỏi: <b>${esc(u.q)}</b> → <span class="jp">${esc(u.p)}</span> · <button class="lnk" data-ptsee="${u.u}">xem cách dùng này</button></div>
          <div class="row" style="align-items:center"><button class="say" data-say="${esc(ptPlain(d.s,d.a[0]))}" aria-label="Nghe">🔊</button><span class="tip">Nghe rồi đọc to cả câu một lần.</span></div></div>
        <div class="row"><button class="btn" id="ptNext">${PQ.pos+1<PQ.ids.length?"Câu tiếp →":"Xem kết quả"}</button><span class="tip kbdhint">(Enter)</span></div>`}
      </section>`;
    }
  }
  $("#main").innerHTML=head+body;
}
function ptClick(t){
  if(t.dataset.pgm!==undefined){pgM=+t.dataset.pgm;pgSel="";renderParticles();return true;}
  if(t.dataset.pgc){pgSel=t.dataset.pgc;document.querySelectorAll(".pgc.sel").forEach((b:any)=>b.classList.remove("sel"));t.classList.add("sel");const i=$("#pgInfo");if(i)i.innerHTML=pgInfo();return true;}
  if(t.dataset.pttab){ptTab=t.dataset.pttab;if(ptTab!=="drill")PQ=PQ&&PQ.pos<PQ.ids.length?PQ:null;try{localStorage.setItem(LS_KEY+"_pt",JSON.stringify({tab:ptTab}));}catch(e){}renderParticles();return true;}
  if(t.dataset.ptmode){ptStart(t.dataset.ptmode);return true;}
  if(t.dataset.pta!==undefined){ptAnswer(t.dataset.pta);return true;}
  if(t.id==="ptNext"){ptNext();return true;}
  if(t.id==="ptMenu"){PQ=null;renderParticles();return true;}
  if(t.dataset.ptjump){const el=document.getElementById("ptp-"+t.dataset.ptjump);if(el)el.scrollIntoView({behavior:"smooth"});return true;}
  if(t.dataset.ptsee){ptTab="map";renderParticles();const el=document.getElementById("ptu-"+t.dataset.ptsee);if(el){const dt=el.closest("details");if(dt)(dt as any).open=true;el.scrollIntoView({block:"center"});el.classList.add("flash");}return true;}
  return false;
}
function onChange(e){
  if(e.target.id==="ptUpto"){setSetting("upto",+e.target.value);PQ=null;renderParticles();}
}
function onKey(e){
  if(PQ&&PQ.ans!==null&&e.key==="Enter"&&e.target.tagName!=="BUTTON"&&e.target.tagName!=="SELECT"){e.preventDefault();ptNext();return true;}
  return false;
}

export { onChange, onKey, PT_ORDER, PT_U, PT_D, PT_IV, PT_N, PT_BTN_L, ptTab, PQ, ptUpto, ptAll, ptUseStats, pct, ptBadge, ptFill, ptPlain, ptPool, ptStart, ptAnswer, ptNext, ptModeName, ptUseRow, renderParticles, ptClick };
