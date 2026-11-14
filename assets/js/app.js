// ===== 設定：お問い合わせ・募集の送り先メールアドレス（空ならコピー方式のみ） =====
var CONTACT_EMAIL = "1k0n2t7@gmail.com";

// ===== 開催日程の表示 =====
// 日程の元データ：①スプレッドシート（SCHEDULE_SHEET_URL を入れたとき）②schedule.js
var SCHEDULE_SHEET_URL = "";   // スプレッドシートの「CSV公開URL」をここに貼る（空なら schedule.js を使用）
(function(){
  var dEl=document.getElementById('sch-date'), tEl=document.getElementById('sch-time');
  var mRow=document.getElementById('sch-memo-row'), mEl=document.getElementById('sch-memo');
  if(!dEl)return;

  function parseDate(v){
    var n=String(v||'').match(/\d+/g); if(!n)return null;
    var y,m,d;
    if(+n[0]>=1000){y=+n[0];m=+n[1];d=+n[2];}                       // 2026-12-13 / 2026/12/13 / 2026年12月13日
    else if(n.length>=3&&+n[2]>=1000){m=+n[0];d=+n[1];y=+n[2];}     // 12/13/2026
    else if(+n[0]<=12&&+n[1]<=31){y=new Date().getFullYear();m=+n[0];d=+n[1];} // 12/13 / 12月13日
    else return null;
    var dt=new Date(y,m-1,d);
    return (dt.getMonth()===m-1&&dt.getDate()===d)?dt:null;
  }
  function parseTime(v){
    v=String(v||''); var m=v.match(/(\d{1,2}):(\d{2})/); if(!m)return '';
    var h=+m[1];
    if(/pm|午後/i.test(v)&&h<12)h+=12;
    if(/am|午前/i.test(v)&&h===12)h=0;
    return h+':'+m[2];
  }
  function render(s){
    dEl.textContent='日程は決まり次第お知らせします'; tEl.textContent='未定'; mRow.hidden=true;
    var d=parseDate(s.date), t=new Date(); t.setHours(0,0,0,0);
    if(!d||d<t)return;
    dEl.textContent=(d.getMonth()+1)+'月'+d.getDate()+'日（'+'日月火水木金土'.charAt(d.getDay())+'）';
    var st=parseTime(s.start), en=parseTime(s.end);
    if(st)tEl.textContent=st+' ～ '+en;
    var memo=String(s.memo||'').trim();
    if(memo){mEl.textContent=memo;mRow.hidden=false;}
  }
  function parseCSV(text){
    var rows=[],row=[],cell='',q=false,i,c;
    for(i=0;i<text.length;i++){
      c=text.charAt(i);
      if(q){ if(c==='"'){ if(text.charAt(i+1)==='"'){cell+='"';i++;} else q=false; } else cell+=c; }
      else if(c==='"')q=true;
      else if(c===','){row.push(cell);cell='';}
      else if(c==='\n'){row.push(cell);rows.push(row);row=[];cell='';}
      else if(c!=='\r')cell+=c;
    }
    if(cell!==''||row.length){row.push(cell);rows.push(row);}
    return rows;
  }

  render(typeof SCHEDULE!=='undefined'?SCHEDULE:{});
  if(SCHEDULE_SHEET_URL&&window.fetch){
    fetch(SCHEDULE_SHEET_URL).then(function(r){return r.text();}).then(function(t){
      var rows=parseCSV(t); if(rows.length<2)return;
      var r=rows[1]; render({date:r[0],start:r[1],end:r[2],memo:r[3]});
    }).catch(function(){});   // 失敗しても schedule.js の内容のまま表示
  }
})();

// ===== 写真スライダー =====
(function(){
  var s=document.querySelectorAll('.slider .slide'); if(s.length<2)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var c=0;
  setInterval(function(){
    var p=s[c]; c=(c+1)%s.length;
    p.classList.remove('active'); p.classList.add('prev');
    s[c].classList.remove('prev'); s[c].classList.add('active');
    setTimeout(function(){p.classList.remove('prev')},900);
  },4000);
})();

// ===== おにぎり：タップするとジャンプ =====
(function(){
  document.querySelectorAll('.chara').forEach(function(el){
    el.addEventListener('click',function(){
      el.classList.remove('jump'); void el.offsetWidth; el.classList.add('jump');
    });
    el.addEventListener('animationend',function(e){ if(e.animationName==='jump') el.classList.remove('jump'); });
  });
})();

// ===== やりたいこと募集フォーム =====
(function(){
  var form=document.getElementById('reqForm'); if(!form)return;
  var res=document.getElementById('reqResult'), txt=document.getElementById('r-text');
  var err=document.getElementById('f-err'), msg=document.getElementById('r-msg');
  var mail=document.getElementById('r-mail');
  function build(){
    var d=new FormData(form);
    var name=(d.get('name')||'').trim()||'（無記名）', room=(d.get('room')||'').trim();
    return '【'+d.get('kind')+'】\nお名前：'+name+(room?'\nお部屋：'+room:'')+'\n\n'+d.get('body').trim();
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!form.body.value.trim()){ err.hidden=false; form.body.focus(); return; }
    err.hidden=true; msg.hidden=true;
    var t=build(); txt.value=t;
    if(CONTACT_EMAIL){
      mail.href='mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent('おむすびころりん：'+form.kind.value)+'&body='+encodeURIComponent(t);
      mail.hidden=false;
    }
    form.hidden=true; res.hidden=false; res.scrollIntoView({behavior:'smooth',block:'center'});
  });
  document.getElementById('r-copy').addEventListener('click',function(){
    function ok(){ msg.textContent='コピーしました。LINEやメールに貼り付けて送ってください。'; msg.hidden=false; }
    function ng(){ txt.focus(); txt.select(); msg.textContent='自動コピーできませんでした。選択した文字をコピーしてください。'; msg.hidden=false; }
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt.value).then(ok,ng); } else { ng(); }
  });
  document.getElementById('r-back').addEventListener('click',function(){ res.hidden=true; form.hidden=false; form.body.focus(); });
})();
