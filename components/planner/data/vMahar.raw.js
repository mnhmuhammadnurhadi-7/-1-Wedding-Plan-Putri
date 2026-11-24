function vMahar(){
  const c=calc(),f=UI.gf,all=c.gifts;
  const items=all.filter(g=>(f.kind==='Semua'||g.kind===f.kind)&&(f.st==='Semua'||g.status===f.st)&&hit(f.q,g.name,g.desc,g.group,g.note));
  const row=g=>{const a=c.gAct(g);return `<div class="row click ${g.status==='Sudah Dibeli'?'done':''}" data-act="editGift" data-id="${g.id}">${g.photo?`<img class="thumb" src="${esc(g.photo)}" alt="" loading="lazy" onerror="this.style.display='none'">`:''}<div class="main"><div class="t">${esc(g.name)}</div><div class="m">${stPill(g.status,'cycleGift',g.id)}${priPill(g.pri)}${f.view==='daftar'?`<span>${esc(g.group)}</span>`:''}${g.desc?`<span>${esc(g.desc)}</span>`:''}${c.linked(g)?'<span class="pill acc">Terhubung ke anggaran</span>':''}</div></div><div style="text-align:right"><div class="amt num">${a?fmt(a):'–'}</div><div class="note num">est. ${g.est?fmt(g.est):'–'}</div></div></div>`};
  let body;
  if(!items.length)body=emptyBox(all.length?'Tidak ada barang':'Belum ada barang','Tambahkan mahar atau seserahan pertama.',canWrite?`<br><button class="btn pri" data-act="addGift">Tambah barang</button>`:'');
  else if(f.view==='grup'){
    const keys=[...new Set(items.map(g=>g.kind+'|'+g.group))];
    body=keys.map(k=>{const [kind,grp]=k.split('|'),xs=items.filter(g=>g.kind===kind&&g.group===grp),all2=all.filter(g=>g.kind===kind&&g.group===grp),bt=all2.filter(g=>g.status==='Sudah Dibeli').length;
      return `<section class="card" style="margin-bottom:14px"><div class="grp" style="cursor:default"><div><div class="eyebrow">${esc(kind)}</div><h3>${esc(grp)}</h3></div><small class="num">${bt}/${all2.length} dibeli · ${fmt(sum(all2,c.gAct))} / ${fmt(sum(all2,g=>g.est))}</small></div><div class="bar thin" style="margin:0 4px 6px"><i style="width:${pct(bt,all2.length)}%"></i></div><div class="list">${xs.map(row).join('')}</div></section>`}).join('');
  }else{
    const po={Tinggi:0,Sedang:1,Rendah:2},so={'Belum Dibeli':0,'Dalam Proses':1,'Sudah Dibeli':2};
    body=`<section class="card"><div class="list">${[...items].sort((a,b)=>so[a.status]-so[b.status]||po[a.pri]-po[b.pri]).map(row).join('')}</div></section>`;
  }
  return head('Mahar & Seserahan','Daftar barang yang akan dibeli. Catatan terpisah dari Estimasi Pengeluaran',addBtn('addGift','Tambah mahar / seserahan'))+
  `<div class="grid g4" style="margin-bottom:16px">${tile('Total estimasi',rp(c.gEst),`${all.length} barang`)}${tile('Total aktual',rp(c.gActAll),c.gEst?`${pct(c.gActAll,c.gEst)}% dari estimasi`:'',pct(c.gActAll,c.gEst),c.gActAll>c.gEst?'bad':'')}${tile('Sudah dibeli',`${c.gBought} / ${all.length}`,`${all.filter(g=>g.status==='Dalam Proses').length} dalam proses`,pct(c.gBought,all.length),'ok')}${tile('Belum dibeli',all.filter(g=>g.status==='Belum Dibeli').length,`${all.filter(g=>g.status==='Belum Dibeli'&&g.pri==='Tinggi').length} prioritas tinggi`)}</div>
  <div class="tools"><div class="seg">${[['Semua','Semua'],['Mahar','Mahar'],['Seserahan','Seserahan']].map(([v,l])=>`<button aria-pressed="${f.kind===v}" data-act="gfKind" data-v="${v}">${l}</button>`).join('')}</div><div class="seg">${[['grup','Per Grup'],['daftar','Daftar']].map(([v,l])=>`<button aria-pressed="${f.view===v}" data-act="gfView" data-v="${v}">${l}</button>`).join('')}</div></div>
  <div class="tools">${searchBox('gf','Cari barang')}<select class="sel" id="gfst" data-chg="gfst" aria-label="Filter status">${['Semua',...GSTAT].map(v=>`<option ${f.st===v?'selected':''}>${v}</option>`).join('')}</select></div>
  ${body}<p class="note" style="margin-top:12px">Daftar ini hanya catatan barang dan tidak ikut dihitung di Estimasi Pengeluaran. Untuk menghitung biayanya, tambahkan item di Estimasi Pengeluaran lalu hubungkan di formulir barang.</p>`;
}

/* ---- acara & rundown ---- */
const RDTPL=[
['Akad Nikah','07:30','08:00','Persiapan lokasi dan pengecekan akhir','Bersama'],['Akad Nikah','08:00','08:30','Kedatangan keluarga, wali, dan saksi','Keluarga'],
['Akad Nikah','08:30','08:45','Pembukaan dan pembacaan ayat suci','MC'],['Akad Nikah','08:45','09:15','Khutbah nikah dan ijab kabul','Penghulu'],
['Akad Nikah','09:15','09:30','Penandatanganan buku nikah','Penghulu'],['Akad Nikah','09:30','10:00','Tukar cincin, sungkeman, dan doa','Bersama'],['Akad Nikah','10:00','10:30','Foto keluarga','Fotografer'],
['Resepsi','10:00','11:30','Rias dan busana pengantin','MUA'],['Resepsi','11:30','12:00','Cek sound dan gladi singkat','MC'],['Resepsi','12:00','12:15','Tamu mulai hadir','Penerima tamu'],
['Resepsi','12:15','12:30','Pembukaan oleh MC','MC'],['Resepsi','12:30','12:45','Prosesi masuk pengantin','Bersama'],['Resepsi','12:45','13:15','Sambutan keluarga dan doa','Keluarga'],
['Resepsi','13:15','14:30','Makan dan foto bersama tamu','Fotografer'],['Resepsi','14:30','15:00','Penutup','MC']];