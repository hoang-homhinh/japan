// Tab Sổ ngữ pháp: cấu trúc theo bài, trường hợp đặc biệt, cặp dễ nhầm
import { gotoPattern } from "./learn";
import { setView } from "../app/shell";
import { LESSONS } from "../content/lessons";
import { PAIRS, SPECIAL } from "../content/notes";
import { SPECIAL_EXTRA } from "../content/lessons";
import { $, esc, tbl } from "../core/util";

let notesTab="sum";
function renderNotes(){
  const sec={sum:"Cấu trúc theo bài",sp:"Trường hợp đặc biệt",pair:"Cặp dễ nhầm"};
  let body="";
  if(notesTab==="sum") body=LESSONS.map((l,li)=>`<h3 class="nh">Bài ${l.n} · ${esc(l.title)}</h3><div class="tw"><table>${l.patterns.map((p,pi)=>`<tr><td class="jp c0"><button class="lnk" data-goto="${li}:${pi}">${esc(p.form)}</button></td><td>${esc(p.mean)}</td><td class="jp c2">${esc(p.ex[0][0])}</td></tr>`).join("")}</table></div>`).join("");
  if(notesTab==="sp") body=[...SPECIAL,...SPECIAL_EXTRA].map(s=>`<h3 class="nh">${esc(s.t)}</h3>${tbl(s.rows)}`).join("");
  if(notesTab==="pair") body=PAIRS.map(s=>`<h3 class="nh">${esc(s.t)}</h3>${tbl(s.rows)}`).join("");
  $("#main").innerHTML=`<div class="chips">${Object.entries<any>(sec).map(([k,v])=>`<button class="chip" data-ntab="${k}" aria-pressed="${k===notesTab}">${v}</button>`).join("")}</div>
  <p class="tip" style="margin-top:12px">${notesTab==="sum"?"Bấm vào một cấu trúc để mở bài luyện của mẫu đó.":notesTab==="sp"?"Những chỗ phải học thuộc vì không theo quy luật chung.":"Đặt cạnh nhau để thấy khác nhau ở đâu."}</p>${body}`;
}

function onClick(t){
  if(t.dataset.ntab){notesTab=t.dataset.ntab;renderNotes();return true;}
  if(t.dataset.goto){const [l,p]=t.dataset.goto.split(":").map(Number);gotoPattern(l,p);setView("learn");return true;}
  return false;
}

export { onClick, renderNotes };
