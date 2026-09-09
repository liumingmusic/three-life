/* ==========================================================
   app.js —— 界面渲染与交互（依赖 data.js / core.js）
   ========================================================== */

/* ---------- 通用片段 ---------- */

/* 卦象三爻图。size: 'lg' 大 · 'md' 中 · 'sm' 小
   数组按爻序自下而上（初爻→三爻），故容器用 column-reverse 使初爻落在最下方。
   阳爻为整划，阴爻为断开的两短划。中宫无卦时返回空。 */
function yaoHTML(g,size){
  const y=YAO[g];
  if(!y)return '';
  let s='<div class="yao'+(size?' yao-'+size:'')+'">';
  for(let k=0;k<3;k++){
    s+= y[k] ? '<i class="y1"></i>' : '<i class="y0"><b></b><b></b></i>';
  }
  return s+'</div>';
}

/* 单个爻线：阳爻整划，阴爻断为两截 */
function yaoBit(v){
  return v?'<i class="y1"></i>':'<i class="y0"><b></b><b></b></i>';
}

/* 爻变推演表：两卦三爻逐爻比对，标出变爻。
   自下而上为初、二、三爻，故自上而下排列三行，使初爻落在最下方。 */
function yaoCmp(a,b){
  const ya=YAO[a],yb=YAO[b],c=changedYao(a,b);
  let s='<div class="yao-cmp">'+
    '<div class="yc-h"><span>甲 · '+a+'卦</span><span>爻位</span>'+
    '<span>乙 · '+b+'卦</span><span>变化</span></div>';
  for(let k=2;k>=0;k--){
    const pos=k+1,ch=c.indexOf(String(pos))>=0;
    s+='<div class="yc-row'+(ch?' chg':'')+'">'+
       '<span class="yc-bit">'+yaoBit(ya[k])+'</span>'+
       '<span class="yc-pos">'+YAO_POS[pos]+'</span>'+
       '<span class="yc-bit">'+yaoBit(yb[k])+'</span>'+
       '<span class="yc-fl">'+(ch?'变':'同')+'</span></div>';
  }
  return s+'</div>';
}

/* 单个磁场的详解卡：性质 + 辩证 + 伴侣/亲人/同道 + 宜忌
   传入 fa/fb（自卦 / 至卦）时，补一行爻变之理 */
function relCard(rel,ctx,fa,fb){
  const i=INFO[rel];
  let h='<div class="rc"><div class="rc-h">'+
    '<span class="rc-n" style="color:'+i.c+'">'+rel+'</span>'+
    '<span class="rel-lv '+i.cls+'">'+i.lv+'</span>'+
    '<span class="rc-s">'+i.star+'</span>';
  if(ctx)h+='<span class="rc-ctx">'+ctx+'</span>';
  h+='</div>';
  if(fa&&fb){
    h+='<div class="rc-yao"><b>爻变</b>'+fa+' → '+fb+'，'+yaoDesc(fa,fb)+
       '<span class="ry-v">「'+YAO_VERSE[changedYao(fa,fb)]+'」</span></div>';
  }
  h+=  '<div class="rc-tx">'+i.tx+'</div>'+
    '<div class="rc-pos">'+i.pos+'</div>'+
    '<div class="rc-rel">'+
      '<span><b>伴侣</b>'+i.rel['伴侣']+'</span>'+
      '<span><b>亲人</b>'+i.rel['亲人']+'</span>'+
      '<span><b>同道</b>'+i.rel['同道']+'</span>'+
    '</div>'+
    '<div class="rc-use">'+i.use+'</div></div>';
  return h;
}

/* 顶部命卦主卡 */
function hero(y,sex,note){
  const n=calc(y,sex),g=GUA[n],isE=isEast(n),gi=GUA_INFO[g];
  return '<div class="card"><div class="gua-hero">'+
    '<div class="gua-badge">'+yaoHTML(g,'lg')+
    '<div class="gb-t"><div class="gn">'+g+'</div><div class="gd">'+n+' 宫</div></div></div>'+
    '<div class="gua-meta"><h2>'+y+' 年 · '+(sex==='male'?'男':'女')+'命 · '+g+'卦</h2>'+
    '<div style="font-size:13.5px;color:var(--ink2)">'+(note||'本命卦既定，八方吉凶随之而定')+'</div>'+
    '<div class="gua-x">'+g+'为'+gi.nat+'，'+gi.jue+'；'+gi.xiang+'</div>'+
    '<div class="tags"><span class="tag '+(isE?'east':'west')+'">'+(isE?'东四命':'西四命')+'</span>'+
    '<span class="tag si">'+g+'宫 · '+n+'</span>'+
    '<span class="tag east">'+gi.el+' · '+gi.dir+'</span>'+
    '<span class="tag east">'+gi.fam+'</span></div>'+
    '</div></div></div>';
}

/* ---------- ① 单人命卦 ---------- */
function renderSingle(){
  const y=parseInt(document.getElementById('s-year').value,10);
  const sex=document.getElementById('s-sex').value;
  if(!y||y<1900||y>2100){alert('请输入 1900–2100 之间的年份');return;}
  const me=GUA[calc(y,sex)];
  let h=hero(y,sex,'本命卦既定，八方吉凶随之而定');

  h+='<div class="card"><div class="sec-t">八方磁场（以命卦为中心，上南下北）</div><div class="grid9">';
  PALACE.forEach(p=>{
    if(p.g==='中'){
      h+='<div class="cell mid"><div class="cd">中宫</div><div class="cg">'+me+'</div>'+
         yaoHTML(me,'sm')+
         '<div class="cr" style="font-size:12px">我 · 伏位</div>'+
         '<div class="cl">本命</div></div>';
    }else{
      const r=relation(me,p.g),i=INFO[r];
      h+='<div class="cell"><div class="cd">'+p.d+'</div><div class="cg">'+p.g+'</div>'+
         yaoHTML(p.g,'sm')+
         '<div class="cr" style="color:'+i.c+'">'+r+'</div>'+
         '<div class="cl '+i.cls+'">'+i.lv+'</div></div>';
    }
  });
  h+='</div></div>';

  h+='<div class="card"><div class="sec-t">磁场详解 · 吉凶辨用</div>'+
     '<p class="chart-note" style="margin-top:-4px;margin-bottom:12px">'+
     '吉非全吉，凶非全凶：生气过旺则浮动，五鬼虽凶而利偏才。'+
     '同一磁场，施于伴侣、亲人、同道，其用各异，故分列三项以辨之。</p>';
  PALACE.forEach(p=>{
    if(p.g!=='中')h+=relCard(relation(me,p.g),p.d+' · '+p.g+'宫',me,p.g);
  });
  h+='</div>';

  document.getElementById('s-out').innerHTML=h;
}

/* ---------- ② 两人磁场 ---------- */
function renderPair(){
  const ay=parseInt(document.getElementById('a-year').value,10);
  const by=parseInt(document.getElementById('b-year').value,10);
  const as=document.getElementById('a-sex').value;
  const bs=document.getElementById('b-sex').value;
  if(!ay||!by||ay<1900||ay>2100||by<1900||by>2100){alert('请输入 1900–2100 之间的年份');return;}

  const an=calc(ay,as),bn=calc(by,bs);
  const ag=GUA[an],bg=GUA[bn];
  const r=relation(ag,bg),i=INFO[r];
  const aE=isEast(an),bE=isEast(bn);

  let h='<div class="card"><div class="pair-wrap">'+
    '<div class="pair-g"><div class="pg">'+ag+'</div>'+yaoHTML(ag,'md')+
    '<div class="pd">'+an+' 宫</div>'+
    '<div class="pp">'+ay+'年 '+(as==='male'?'男':'女')+' · '+(aE?'东四':'西四')+'</div></div>'+
    '<div class="pair-op">配</div>'+
    '<div class="pair-g"><div class="pg">'+bg+'</div>'+yaoHTML(bg,'md')+
    '<div class="pd">'+bn+' 宫</div>'+
    '<div class="pp">'+by+'年 '+(bs==='male'?'男':'女')+' · '+(bE?'东四':'西四')+'</div></div>'+
    '</div>';

  h+='<div class="pair-res"><div class="pr-r" style="color:'+i.c+'">'+r+'</div>'+
     '<div><span class="rel-lv '+i.cls+'">'+i.lv+' · '+i.star+'</span></div>'+
     '<div class="pr-d">'+i.tx+'</div>'+
     '<div class="pr-u">'+(r==='伏位'
        ? '二人同卦，五行比和，性情相近，相处平稳而少激荡。'
        : (aE===bE
            ? '二人同属'+(aE?'东四':'西四')+'命，气场相近，为本宫相配之基。'
            : '二人分属东西四命，气场相异，'+(i.good?'然得此星相照，可调而和之。':'又遇此星，宜以方位与距离调和。')))+'</div>'+
     '</div></div>';

  h+='<div class="card"><div class="sec-t">爻变推演 · 磁场之所由生</div>'+
     '<p class="chart-note" style="margin-top:-4px;margin-bottom:13px">'+
     '八宅磁场非凭空而定，乃由两卦爻变而生：'+
     '变初爻为祸害，变二爻为绝命，变三爻为生气；'+
     '初二同变为天医，上下同变为六煞，二三同变为五鬼，三爻全变为延年，全不变则为伏位。'+
     '歌诀「一祸二绝三生气，上下六煞初二医；二三爻变成五鬼，全变之后延年吉」即是此理。</p>'+
     yaoCmp(ag,bg)+
     '<div class="yao-conc">'+ag+' 与 '+bg+'相较，'+yaoDesc(ag,bg)+
     '；依歌诀「'+YAO_VERSE[changedYao(ag,bg)]+'」，是为<b>'+r+'</b>。</div></div>';

  h+='<div class="card"><div class="sec-t">磁场详解 · 吉凶辨用</div>'+relCard(r,'',ag,bg)+'</div>';
  document.getElementById('p-out').innerHTML=h;
}

/* ---------- ③ 流年推演 ---------- */
let flowView='chart';

function buildChart(rows,mid){
  const W=680,H=312,L=58,R=662,T=26,B=H-46;
  const PW=R-L,PH=B-T;
  const yOf=v=>T+(3-v)/7*PH;
  const xOf=i=>L+i*PW/(rows.length-1);
  const midI=rows.findIndex(r=>r.yr===mid);

  let s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">';
  s+='<rect x="'+L+'" y="'+T+'" width="'+PW+'" height="'+(yOf(0)-T).toFixed(1)+'" fill="#fdf6f4"/>';
  s+='<rect x="'+L+'" y="'+yOf(0).toFixed(1)+'" width="'+PW+'" height="'+(B-yOf(0)).toFixed(1)+'" fill="#f2f5f4"/>';
  if(midI>=0){
    s+='<line x1="'+xOf(midI).toFixed(1)+'" y1="'+T+'" x2="'+xOf(midI).toFixed(1)+'" y2="'+B+
       '" stroke="#a0813c" stroke-width="1" stroke-dasharray="3 3" opacity=".55"/>';
  }
  for(let v=3;v>=-4;v--){
    const y=yOf(v).toFixed(1),z=(v===0);
    s+='<line x1="'+L+'" y1="'+y+'" x2="'+R+'" y2="'+y+'" stroke="'+(z?'#a5352b':'#e2dbc9')+
       '" stroke-width="'+(z?1.6:0.8)+'"'+(z?' stroke-dasharray="6 4"':'')+'/>';
    s+='<text x="'+(L-8)+'" y="'+y+'" text-anchor="end" dominant-baseline="central" font-size="11" fill="'+
       (z?'#a5352b':'#9a917f')+'"'+(z?' font-weight="600"':'')+'>'+YLBL[v]+'</text>';
  }
  const pts=rows.map((r,i)=>[xOf(i),yOf(SCORE[r.rel])]);
  s+='<polyline points="'+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+
     '" fill="none" stroke="#3d5c56" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>';
  rows.forEach((r,i)=>{
    const x=pts[i][0].toFixed(1),y=pts[i][1].toFixed(1),c=INFO[r.rel].c,m=(r.yr===mid);
    if(m)s+='<circle cx="'+x+'" cy="'+y+'" r="7.5" fill="'+c+'" stroke="#fff" stroke-width="2.5"/>';
    else s+='<circle cx="'+x+'" cy="'+y+'" r="3.6" fill="'+c+'"/>';
  });
  rows.forEach((r,i)=>{
    const m=(r.yr===mid);
    s+='<text x="'+pts[i][0].toFixed(1)+'" y="'+(B+17)+'" text-anchor="middle" font-size="11" fill="'+
       (m?'#a5352b':'#9a917f')+'"'+(m?' font-weight="600"':'')+'>'+String(r.yr).slice(2)+'</text>';
  });
  s+='</svg>';
  return s;
}

function buildTable(rows,mid){
  let s='<div class="tb-wrap"><table class="yr-tb">'+
    '<thead><tr><th>年份</th><th>年星</th><th>流年卦</th><th>磁场</th><th>吉凶</th></tr></thead><tbody>';
  rows.forEach(r=>{
    const i=INFO[r.rel];
    s+='<tr'+(r.yr===mid?' class="now"':'')+'><td class="y">'+r.yr+(r.yr===mid?' ●':'')+'</td>'+
       '<td class="lv">'+(r.star===5?'<b class="wh">五黄</b>':STAR_NAME[r.star])+'</td>'+
       '<td class="g">'+yaoHTML(r.gua,'sm')+'<span>'+r.gua+'</span></td>'+
       '<td>'+r.rel+'</td>'+
       '<td><span class="rv '+i.cls+'">'+i.lv+'</span></td></tr>';
  });
  return s+'</tbody></table></div>';
}

function renderFlow(){
  const y=parseInt(document.getElementById('f-year').value,10);
  const mid=parseInt(document.getElementById('f-mid').value,10);
  const sex=document.getElementById('f-sex').value;
  if(!y||!mid||y<1900||y>2100||mid<1900||mid>2100){alert('请输入 1900–2100 之间的年份');return;}

  const me=GUA[calc(y,sex)];
  const rows=[];
  for(let yr=mid-10;yr<=mid+10;yr++){
    rows.push({yr:yr,star:yearStar(yr),gua:guaOf(yr,sex),rel:relation(me,guaOf(yr,sex))});
  }
  let good=0;
  rows.forEach(r=>{if(INFO[r.rel].good)good++;});

  let h=hero(y,sex,'本命 '+me+'卦，逐年起卦相参，观流年磁场消长');
  h+='<div class="card"><div class="sec-t">'+(mid-10)+' – '+(mid+10)+' 流年推演'+
     '<span style="margin-left:auto"><span class="seg">'+
     '<button class="seg-b'+(flowView==='chart'?' on':'')+'" data-v="chart">折线图</button>'+
     '<button class="seg-b'+(flowView==='list'?' on':'')+'" data-v="list">列表</button>'+
     '</span></span></div>';

  if(flowView==='chart'){
    h+='<div class="chart-wrap">'+buildChart(rows,mid)+'</div>'+
       '<p class="chart-note">横轴为年份（后两位），纵轴为吉凶八阶。'+
       '朱砂横线以上为吉，分大吉、中吉、小吉；以下为凶，分小凶、次凶、大凶、至凶。'+
       '中心年以大点标出，并引金色竖线贯穿。'+
       '流年卦依本人性别推演：男命 11 − 年份数字根，女命 4 + 年份数字根；遇 5 男寄坤、女寄艮。</p>'+
       '<p class="scroll-tip">← 左右滑动可查看全部年份 →</p>';
  }else{
    h+=buildTable(rows,mid);
  }

  const wh=rows.filter(r=>r.star===5).map(r=>r.yr);
  if(wh.length){
    h+='<p class="chart-note" style="margin-top:10px"><b class="wh">五黄</b>入中之年（'+
       wh.join('、')+'）：中宫无卦，已按男寄坤、女寄艮并入流年卦；'+
       '传统上此年忌动土、搬迁、开业、远行，宜静守祈福。</p>';
  }

  h+='<div class="stat"><span>吉年 <b>'+good+'</b> 载</span><span>凶年 <b>'+(rows.length-good)+
     '</b> 载</span><span>共 <b>'+rows.length+'</b> 载</span>'+
     '<span style="color:var(--ink3)">● 为中心年</span></div></div>';

  document.getElementById('f-out').innerHTML=h;
}

/* ---------- 事件绑定 ---------- */
function bindUI(){
  /* 标签页 */
  document.querySelectorAll('.tab').forEach(t=>{
    t.addEventListener('click',()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
      document.querySelectorAll('.panel').forEach(x=>x.classList.remove('on'));
      t.classList.add('on');
      document.getElementById('p-'+t.dataset.p).classList.add('on');
    });
  });

  document.getElementById('s-go').addEventListener('click',renderSingle);
  document.getElementById('p-go').addEventListener('click',renderPair);
  document.getElementById('f-go').addEventListener('click',renderFlow);

  /* 折线图 / 列表 切换（事件委托，容器不重建） */
  document.getElementById('f-out').addEventListener('click',e=>{
    const b=e.target.closest('.seg-b');
    if(!b)return;
    flowView=b.dataset.v;
    renderFlow();
  });

  /* 回车即算 */
  ['s-year','s-sex'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')renderSingle();}));
  ['a-year','a-sex','b-year','b-sex'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')renderPair();}));
  ['f-year','f-sex','f-mid'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')renderFlow();}));

  /* 免责声明折叠（记住用户选择） */
  const disc=document.getElementById('disc');
  if(disc){
    const KEY='tl-disc-open';
    try{if(localStorage.getItem(KEY)==='0')disc.classList.remove('open');}catch(e){}
    disc.querySelector('.disc-h').addEventListener('click',()=>{
      disc.classList.toggle('open');
      try{localStorage.setItem(KEY,disc.classList.contains('open')?'1':'0');}catch(e){}
    });
  }
}

/* ---------- 初始化 ---------- */
(function init(){
  /* 中心年份默认取今年 */
  const midEl=document.getElementById('f-mid');
  if(midEl)midEl.value=new Date().getFullYear();
  bindUI();
  renderSingle();
})();
