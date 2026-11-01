import { KANJI, VOCAB } from "../content/data";
import { S, saveProgress } from "./store";
import { $, dayStr } from "./util";

const DAILY_NEW=14, DAILY_KANJI=3, REVIEW_CAP=40, IV=[0,1,3,7,14,30];
// ---- lô từ vựng: theo nhóm chủ đề của file, ~7 từ / lô
const cleanT=t=>t.replace(/\s*\((?!\d+\/\d+\))[^)]*\)/g,"").trim();
const LOTS=VOCAB.map(L=>{
  const out=[];let idx=0;
  for(const g of L.groups){const n=g.w.length, parts=Math.ceil(n/7), size=Math.ceil(n/parts);
    for(let p=0;p<parts;p++){const ids=[];for(let k=p*size;k<Math.min(n,(p+1)*size);k++)ids.push(idx+k);
      out.push({t:cleanT(g.t)+(parts>1?` (${p+1}/${parts})`:""),ids});}
    idx+=n;}
  const m=[];for(const c of out){const last=m[m.length-1];
    if(last&&(c.ids.length<4||last.ids.length<4)&&last.ids.length+c.ids.length<=8){last.t+=" · "+c.t;last.ids.push(...c.ids);}else m.push({t:c.t,ids:[...c.ids]});}
  return m;
});
const VFLAT=VOCAB.map(L=>L.groups.flatMap(g=>g.w));
const vid=(li,i)=>"v"+VOCAB[li].n+"-"+i;
const KLIST=KANJI.flatMap((c,ci)=>c.groups.flatMap((g,gi)=>g.kanji.map(k=>({k,ci,gi}))));
const kid=ch=>"k"+ch;
// ---- trạng thái mỗi từ / chữ: lv 0..3 (3 = thuộc), box, next, wr (số lần sai), first (ngày gặp đầu)
const srsAll=()=>S.progress.srs||(S.progress.srs={});
const srs=id=>srsAll()[id];
function setSrs(id,o){const cur=srs(id)||{lv:0,box:0,next:dayStr(),wr:0,first:dayStr()};srsAll()[id]=Object.assign({},cur,o,{t:Date.now()});saveProgress();}
const isDue=st=>st&&(st.next||"")<=dayStr();
function lotsUnseen(li){return LOTS[li].map(l=>({...l,ids:l.ids.filter(i=>!srs(vid(li,i)))})).filter(l=>l.ids.length);}
function introducedToday(prefix){const t=dayStr();return Object.entries<any>(srsAll()).filter(([k,v])=>k.startsWith(prefix)&&v.first===t).length;}
function planNewLots(){
  let need=DAILY_NEW-introducedToday("v"); const res=[];
  for(let li=0;li<VOCAB.length&&need>0;li++){for(const l of lotsUnseen(li)){if(need<=0)break;res.push({li,t:l.t,ids:l.ids});need-=l.ids.length;}}
  return res;
}
function kanjiUnlocked(x){
  // mở khi đã nhớ lại được (bậc ≥2) ít nhất 1 từ vựng có chữ này
  for(let li=0;li<VOCAB.length;li++)for(let i=0;i<VFLAT[li].length;i++){const w=VFLAT[li][i];if(w[1]&&w[1].includes(x.k.k)&&(srs(vid(li,i))?.lv||0)>=2)return true;}
  // chữ không có trong từ vựng: mở khi các chữ khác cùng nhóm đã mở
  const inVocab=VFLAT.some(ws=>ws.some(w=>w[1]&&w[1].includes(x.k.k)));
  if(!inVocab){const mates=KLIST.filter(y=>y.ci===x.ci&&y.gi===x.gi&&y!==x);return mates.length>0&&mates.every(y=>srs(kid(y.k.k)));}
  return false;
}
function planNewKanji(){const need=DAILY_KANJI-introducedToday("k");if(need<=0)return [];return KLIST.filter(x=>!srs(kid(x.k.k))&&kanjiUnlocked(x)).slice(0,need);}
function dueItems(){
  const out=[];
  for(const [id,st] of Object.entries<any>(srsAll())){if(!isDue(st)||!itemOf(id))continue;out.push({id,st});}
  out.sort((a,b)=>(a.st.lv-b.st.lv)||((b.st.wr||0)-(a.st.wr||0)));
  return out.slice(0,REVIEW_CAP);
}
// ---- tra cứu item
function itemOf(id){
  // id của từ đã bị bỏ / dời khỏi file từ vựng (nội dung đổi) → null, tránh vỡ buổi học và bảng "Từ hay quên"
  if(id[0]==="v"){const [n,i]=id.slice(1).split("-").map(Number);const li=VOCAB.findIndex(L=>L.n===n);const w=li>=0?VFLAT[li][i]:null;return w?{kind:"v",id,li,i,w}:null;}
  const ch=id.slice(1);const x=KLIST.find(y=>y.k.k===ch);return x?{kind:"k",id,...x}:null;
}

export { DAILY_NEW, DAILY_KANJI, REVIEW_CAP, IV, cleanT, LOTS, VFLAT, vid, KLIST, kid, srsAll, srs, setSrs, isDue, lotsUnseen, introducedToday, planNewLots, kanjiUnlocked, planNewKanji, dueItems, itemOf };
