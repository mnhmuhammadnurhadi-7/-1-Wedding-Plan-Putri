function vChecklist(){
  const all=L('checklist'),f=UI.cl;
  const cats=[...new Set(all.map(x=>x.cat))];
  const pics=[['Semua','Semua PIC'],[nameB(),nameB()],[nameA(),nameA()],['Bersama','Bersama'],['-','Belum ditentukan']];
  const items=all.filter(x=>(f.ev==='Semua'||evOf(x)===f.ev)&&(f.cat==='Semua'||x.cat===f.cat)&&(f.st==='Semua'||(f.st==='Belum Selesai'?stOf(x)!=='Selesai':stOf(x)===f.st))&&(f.pic==='Semua'||(f.pic==='-'?!x.pic:x.pic===f.pic))&&hit(f.q,x.task,x.cat,x.pic,x.note));
  const groups=cats.map(cat=>[cat,items.filter(x=>x.cat===cat)]).filter(g=>g[1].length);
  const done=all.filter(x=>stOf(x)==='Selesai').length,proc=all.filter(x=>stOf(x)==='Dalam Proses').length;
  return head('Checklist',`${done} dari ${all.length} tugas selesai`,`<button class="btn" data-act="tpl">${ic('list')} Template</button>`+addBtn('addTask','Tambah tugas'))+
  `<div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b class="num">${pct(done,all.length)}% selesai</b><span class="note">${done} selesai · ${proc} dalam proses · ${all.length-done-proc} belum dimulai</span></div><div class="bar" style="margin-top:10px"><i style="width:${pct(done,all.length)}%"></i></div></div>
  <div class="seg" style="margin-bottom:14px">${[['Semua','Semua Tugas'],['Akad','Akad Nikah'],['Resepsi','Resepsi'],['Umum','Umum']].map(([v,l])=>`<button aria-pressed="${f.ev===v}" data-act="clEv" data-v="${v}">${l}</button>`).join('')}</div>
  <div class="chips cl-grid">${['Semua',...cats].map(c=>`<button class="chip" aria-pressed="${f.cat===c}" data-act="clCat" data-v="${esc(c)}">${esc(c)}${c!=='Semua'?`<em>${all.filter(x=>x.cat===c&&stOf(x)!=='Selesai').length}</em>`:''}</button>`).join('')}</div>
  <div class="tools">${searchBox('cl','Cari tugas')}
   <select class="sel" id="clpic" data-chg="clpic" aria-label="Filter penanggung jawab">${pics.map(([v,l])=>`<option value="${esc(v)}" ${f.pic===v?'selected':''}>${esc(l)}</option>`).join('')}</select>
   <select class="sel" id="clst" data-chg="clst" aria-label="Filter status">${['Semua','Belum Selesai',...TSTAT].map(v=>`<option ${f.st===v?'selected':''}>${v}</option>`).join('')}</select></div>
  ${groups.length?groups.map(([cat,xs])=>{const open=!f.collapsed[cat]||f.q;const dn=all.filter(x=>x.cat===cat&&stOf(x)==='Selesai').length,tot=all.filter(x=>x.cat===cat).length;
    return `<section class="card" style="margin-bottom:14px"><button class="grp" data-act="clTog" data-v="${esc(cat)}" aria-expanded="${!!open}"><h3>${esc(cat)}</h3><small class="num">${dn}/${tot}</small></button><div class="bar thin" style="margin:0 4px 6px"><i style="width:${pct(dn,tot)}%"></i></div>
    ${open?`<div class="list">${xs.sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')||(a.o||0)-(b.o||0)).map(t=>{const s=stOf(t);return `<div class="row click ${s==='Selesai'?'done':''}" data-act="editTask" data-id="${t.id}"><button class="cb" role="checkbox" aria-checked="${s==='Selesai'}" aria-label="Tandai selesai" data-act="toggleTask" data-id="${t.id}">${ic('tick',2.4)}</button><div class="main"><div class="t">${esc(t.task)}</div><div class="m">${stPill(s,'cycleTask',t.id)}${t.pri&&t.pri!=='Sedang'?priPill(t.pri):''}${t.pic?`<span>${esc(t.pic)}</span>`:''}${t.due?(s==='Selesai'?`<span>${dFmt(t.due)}</span>`:dueTag(t.due)):''}${t.note?`<span>${esc(t.note)}</span>`:''}</div></div></div>`}).join('')}</div>`:''}</section>`}).join(''):emptyBox('Tidak ada tugas','Ubah filter, tambahkan tugas baru, atau pakai template.',canWrite?`<br><button class="btn" data-act="tpl">Lihat template</button>`:'')}`;
}

/* ---- estimasi pengeluaran ---- */