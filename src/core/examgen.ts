// Luyện thi: sinh đề tự động — đọc/viết kanji từ VOCAB, xếp câu ★ từ câu ví dụ ngữ pháp
import { VOCAB } from "../content/data";
import { LESSONS } from "../content/lessons";
import { $, hashStr, seeded, shuffleWith } from "./util";

const N5_KANJI="一二三四五六七八九十百千万円日月火水木金土曜年時分半午前後上下左右中外東西南北山川天気雨花空人男女子父母友名先生学校大小高安新古長多少白何今毎週休見聞読書話言行来出入食飲買会立電車駅道店国語本目耳手足口";
// chữ trông giống nhau → làm lựa chọn nhiễu cho dạng viết kanji
const KJ_LOOK=["右左石","入人八","大太犬天","木本休体林","日目白百田","午牛","千干","土士","万方","金全","間聞門","話語読","見貝","小少","東車","気汽","雨両","北比","毎母海","行何","書事","長張","上下","前後","外夕","名多","山出","来米","食飲","学字","男田","会今","西四","高古","店広","安字","電雷","半羊","花化","空究","語話","国困","駅馬","道首","買貝","校交","週周"];
const KJ_SIM={}; KJ_LOOK.forEach(g=>[...g].forEach(c=>{KJ_SIM[c]=(KJ_SIM[c]||"")+g.replace(c,"");}));
const DAK={"か":"が","き":"ぎ","く":"ぐ","け":"げ","こ":"ご","さ":"ざ","し":"じ","す":"ず","せ":"ぜ","そ":"ぞ","た":"だ","ち":"ぢ","て":"で","と":"ど","は":"ば","ひ":"び","ふ":"ぶ","へ":"べ","ほ":"ぼ"};
const UNDAK={}; Object.entries<any>(DAK).forEach(([a,b])=>UNDAK[b]=a);
const SMALL={"ゃ":"や","ゅ":"ゆ","ょ":"よ"};
// biến đổi cách đọc theo kiểu bẫy của đề thật: trường âm, âm đục, âm ngắt, âm ghép
function kjWrongReads(r){
  const out=new Set<any>(), add=s=>{if(s&&s!==r)out.add(s);};
  const ch=[...r];
  ch.forEach((c,i)=>{
    const sw=DAK[c]||UNDAK[c]; if(sw) add(ch.slice(0,i).join("")+sw+ch.slice(i+1).join(""));
    if(SMALL[c]) add(ch.slice(0,i).join("")+SMALL[c]+ch.slice(i+1).join(""));
    if(c==="っ") add(ch.slice(0,i).join("")+ch.slice(i+1).join(""));
    if(i>0&&"かきくけこさしすせそたちつてとぱぴぷぺぽ".includes(c)&&ch[i-1]!=="っ"&&ch[i-1]!=="ん") add(ch.slice(0,i).join("")+"っ"+ch.slice(i).join(""));
    const nx=ch[i+1];
    if(nx==="う"&&"おこそとのほもよろごぞどぼぽょゅうくすつぬふむゆるぐずぶぷ".includes(c)) add(ch.slice(0,i+1).join("")+ch.slice(i+2).join(""));
    if(nx==="い"&&"えけせてねへめれげぜでべぺ".includes(c)) add(ch.slice(0,i+1).join("")+ch.slice(i+2).join(""));
    if(nx==="ー") add(ch.slice(0,i+1).join("")+ch.slice(i+2).join(""));
    if("おこそとのほもろごぞどぼょ".includes(c)&&nx!=="う"&&nx!=="お") add(ch.slice(0,i+1).join("")+"う"+ch.slice(i+1).join(""));
  });
  return [...out];
}
const kjClean=s=>String(s||"").replace(/[［\[][^］\]]*[］\]]/g,"").replace(/[～〜（）()…、。\s]/g,"");
const isKan=c=>/[一-鿿]/.test(c);
function kjWords(){
  const seen=new Set<any>(), out=[];
  VOCAB.forEach(L=>L.groups.forEach(g=>g.w.forEach(w=>{
    const kj=kjClean(w[1]), rd=kjClean(w[0]);
    if(!kj||kj===rd||!/[一-鿿]/.test(kj)||/[^぀-ヿ一-鿿ー]/.test(kj+rd)) return;
    if(![...kj].filter(isKan).every(c=>N5_KANJI.includes(c))) return;
    if(seen.has(kj)) return; seen.add(kj);
    out.push({kj,rd,vi:w[3],l:L.n});
  })));
  return out;
}
function genKanji(){
  const W=kjWords(), Q=[];
  W.forEach((w,i)=>{
    const rnd=seeded(hashStr(w.kj));
    // chỉ bẫy ở phần đọc của kanji, giữ nguyên phần kana đi kèm (あの人 → chỉ đổi ひと)
    let p=0; while(p<w.kj.length&&w.kj[p]===w.rd[p]) p++;
    let e=0; while(e<w.kj.length-p&&w.kj[w.kj.length-1-e]===w.rd[w.rd.length-1-e]) e++;
    const core=w.rd.slice(p,w.rd.length-e), pre=w.rd.slice(0,p), suf=w.rd.slice(w.rd.length-e);
    const wr=shuffleWith(kjWrongReads(core).map(x=>pre+x+suf),rnd).slice(0,3);
    if(wr.length===3){const opts=shuffleWith([w.rd,...wr],rnd);Q.push({id:"ky_"+w.kj,k:"kj_yomi",l:w.l,q:"【"+w.kj+"】",opts,a:opts.indexOf(w.rd),vi:w.vi,why:w.kj+" đọc là "+w.rd+". Để ý trường âm, âm đục (゛) và âm ngắt (っ): đề hay bẫy đúng mấy chỗ đó."});}
    const kans=[...w.kj].map((c,j)=>[c,j]).filter(([c])=>isKan(c)&&KJ_SIM[c]);
    const wrongs=new Set<any>();
    kans.forEach(([c,j])=>[...KJ_SIM[c]].forEach(s=>{const t=[...w.kj];t[j]=s;wrongs.add(t.join(""));}));
    if(kans.length>=2){const t=[...w.kj];kans.forEach(([c,j])=>{t[j]=KJ_SIM[c][0];});wrongs.add(t.join(""));}
    const dbl=x=>[...x].some((c,j)=>j>0&&isKan(c)&&c===x[j-1]&&w.kj[j]!==w.kj[j-1]);
    const wl=shuffleWith([...wrongs].filter(x=>x!==w.kj&&!dbl(x)),rnd).slice(0,3);
    if(wl.length===3){const opts=shuffleWith([w.kj,...wl],rnd);Q.push({id:"kh_"+w.kj,k:"kj_hyoki",l:w.l,q:"【"+w.rd+"】",opts,a:opts.indexOf(w.kj),vi:w.vi,why:w.rd+" viết là "+w.kj+". Các lựa chọn kia là chữ trông na ná."});}
  });
  return Q;
}
// xếp câu ★: lấy câu ví dụ có ≥5 cụm, giấu 4 cụm liền nhau trước cụm cuối; ★ ở ô thứ 3
function genNarabe(){
  const Q=[], seen=new Set<any>();
  LESSONS.forEach(L=>L.patterns.forEach(P=>(P.ex||[]).forEach(([jp,vi])=>{
    if(seen.has(jp)||/[「」]/.test(jp)) return; seen.add(jp);
    const t=jp.replace(/。$/,"").split(/[ 　]+/).filter(Boolean);
    if(t.length<5||new Set<any>(t).size!==t.length) return;
    const end=t.length-1, st=Math.max(0,end-4), mid=t.slice(st,end);
    if(mid.length<4) return;
    const rnd=seeded(hashStr(jp)), opts=shuffleWith(mid,rnd), star=mid[2];
    Q.push({id:"nb_"+hashStr(jp).toString(36),k:"narabe",l:L.n,head:t.slice(0,st).join(" "),tail:t[end]+"。",opts,a:opts.indexOf(star),full:jp,vi,why:"Câu đúng: "+jp});
  })));
  return Q;
}

export { N5_KANJI, KJ_LOOK, KJ_SIM, DAK, UNDAK, SMALL, kjWrongReads, kjClean, isKan, kjWords, genKanji, genNarabe };
