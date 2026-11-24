function vBeranda(){
  const c=calc(),s=S(),target=+s.target||0,fd=fund(),rows=allocRows(c),today=todayISO();
  /* Savings: sumber sama dengan halaman Savings (fund) */
  /* lima kategori tetap. Imbal hasil = imbal hasil yang belum dicairkan (yang sudah dicairkan sudah masuk Tabungan), jadi total = Total Nilai Dana di Savings tanpa hitung ganda. Saham/ETF dan Lainnya hanya muncul jika ada isinya agar total tetap cocok. */
  const alloc=[['Tabungan',INSTR_COL['Tabungan'],fd.byKind['Tabungan']],['Deposito',INSTR_COL['Deposito'],fd.byKind['Deposito']],['Obligasi / SBN',INSTR_COL['Obligasi / SBN'],fd.byKind['Obligasi / SBN']],['Reksa Dana',INSTR_COL['Reksa Dana'],fd.byKind['Reksa Dana']],['Imbal Hasil','var(--c2)',fd.unreal]];
  ['Saham / ETF','Lainnya'].forEach(k=>{if(fd.byKind[k]>0)alloc.push([k,INSTR_COL[k],fd.byKind[k]])});
  const aShow=alloc.map(a=>({k:a[0],col:a[1],v:Math.max(0,a[2]||0)})),aTot=sum(aShow,a=>a.v);
  const svPct=target>0?Math.round(fd.net/target*100):0;
  /* Estimasi */
  const realPct=c.plan>0?Math.round(c.actual/c.plan*100):0;
  /* Checklist */
  const cl=L('checklist'),open=cl.filter(x=>stOf(x)!=='Selesai'),clPct=pct(c.clDone,c.clAll);
  const uIc='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>',qIc='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/></svg>';
  const picKey=t=>t.pic===nameB()?0:t.pic===nameA()?1:t.pic==='Bersama'?2:3;
  const picT=[[nameB(),nameB(),'rose',uIc],[nameA(),nameA(),'sage',uIc],['Bersama','Bersama','butter',ic('users')],['-','Belum ditentukan','lav',qIc]].map((p,k)=>{const xs=cl.filter(t=>picKey(t)===k);return {v:p[0],name:p[1],cls:p[2],ico:p[3],tot:xs.length,done:xs.filter(t=>stOf(t)==='Selesai').length}});
  const rank=t=>[t.due&&t.due<today?0:1,t.pri==='Tinggi'?0:1,t.due||'9999-99-99',t.o||0];
  const tasks=open.slice().sort((a,b)=>{const x=rank(a),y=rank(b);for(let i=0;i<3;i++){if(x[i]<y[i])return -1;if(x[i]>y[i])return 1}return x[3]-y[3]}).slice(0,5);
  const rem=L('notes').filter(n=>n.status!=='Selesai').sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')||(a.dueTime||'').localeCompare(b.dueTime||'')||(a.o||0)-(b.o||0)).slice(0,5);
  /* Dokumen */
  const docs=L('docs'),ada=docs.filter(x=>x.have).length,wajib=docs.filter(x=>!x.have&&x.req==='Ya').length;
  /* kategori */
  const catRows=rows.filter(r=>r.est>0||r.act>0);
  const catSeg=catRows.map((r,i)=>({v:r.act,col:BN_CLR[i%8],name:r.cat}));
  const updTxt=lastUp?lastUp.toLocaleString('id-ID',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}):'';
  const FLI=(k,cls)=>`<img class="bn-fl ${cls}" src="${BNFL[k]}" alt="" aria-hidden="true">`;
  const quick=canWrite?`<section class="bn-quick" aria-label="Akses cepat"><div class="bn-qt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg><h2>Akses Cepat</h2></div>
    <div class="bn-qg"><button class="bn-qb" data-act="addTask">${ic('plus')}<span>Tambah Tugas</span></button><button class="bn-qb" data-act="addSaving">${ic('wallet')}<span>Catat Setoran</span></button><button class="bn-qb" data-act="addExpense">${ic('note')}<span>Catat Pembayaran</span></button><button class="bn-qb" data-act="addGuest">${ic('users')}<span>Tambah Tamu</span></button></div></section>`:'';
  const row=(lead,act,id,title,meta,flag,right,editable)=>`<div class="bn-row" ${editable?'':`data-act="${act}" data-id="${id}" role="button" tabindex="0"`}><span class="bn-lead" aria-hidden="true">${lead}</span><div class="bn-rm" ${editable?`data-act="${act}" data-id="${id}" role="button" tabindex="0"`:''}><div class="bn-rt">${esc(title)}</div><div class="bn-rs"><span>${meta}</span>${flag}</div></div><div class="bn-rr">${right}</div></div>`;
  const taskRow=t=>{const late=t.due&&t.due<today;
    return row('<i class="bn-ck"></i>','editTask',t.id,t.task,[t.cat,t.pic].filter(Boolean).map(esc).join(' · ')||'&nbsp;',late?'<span class="pill bad">Terlambat</span>':t.pri==='Tinggi'?'<span class="pill warn">Prioritas</span>':'',
      `<span class="pill ${late?'bad':''}">${t.due?dFmt(t.due,{day:'2-digit',month:'2-digit',year:'numeric'}):'Tanpa tenggat'}</span><span class="pill ${stOf(t)==='Dalam Proses'?'warn':''}">${esc(stOf(t))}</span>`)};
  const noteRow=n=>{const late=n.due&&n.due<today;
    return row(ic('calendar'),'editNote',n.id,n.note,[n.topic,n.pic].filter(Boolean).map(esc).join(' · ')||'&nbsp;',late?'<span class="pill bad">Terlambat</span>':'',
      canWrite?`<div class="when bn-when"><input type="date" value="${esc(n.due||'')}" data-chg="noteDue" data-id="${n.id}" aria-label="Tanggal tindak lanjut"><input type="time" value="${esc(n.dueTime||'')}" data-chg="noteTime" data-id="${n.id}" aria-label="Jam tindak lanjut"></div>`:(n.due?`<span class="pill ${late?'bad':''}">${dFmt(n.due,{day:'2-digit',month:'2-digit',year:'numeric'})}${n.dueTime?' · '+esc(n.dueTime):''}</span>`:'<span class="pill">Tanpa tanggal</span>'),true)};
  return `<div class="bn">
  <header class="bn-mh"><button class="bn-hb" data-act="more" aria-label="Buka menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button><div class="bn-logo"><b>${esc(nameA())} &amp; ${esc(nameB())}</b><span>Wedding planner</span></div><span class="bn-hs"></span></header>
  <section class="bn-top" aria-label="Sapaan dan hitung mundur">
    <div class="bn-hi"><h1>Halo,<br class="bn-br"> ${esc(nameA())} &amp; ${esc(nameB())} <span class="bn-hrt">♡</span></h1><p>Ini ringkasan persiapan pernikahan kalian hari ini.</p>${updTxt?`<div class="bn-upd">${ic('calendar')}<span>Terakhir diperbarui: ${nm(esc(updTxt))}</span></div>`:''}</div>
    <div class="bn-cd"><div class="bn-cdl">${ic('calendar')}<h2>Menuju Hari Bahagia</h2></div><div class="bn-cdg"><div><b id="cd-d">–</b><span>Hari</span></div><div><b id="cd-h">–</b><span>Jam</span></div><div><b id="cd-m">–</b><span>Menit</span></div><div><b id="cd-s">–</b><span>Detik</span></div></div>
      <div class="bn-cdd">${s.weddingDate?nm(dFmt(s.weddingDate,{weekday:'long',day:'numeric',month:'long',year:'numeric'})):'Atur tanggal pernikahan di Pengaturan'}</div>
      <img class="bn-couple" src="${BN_COUPLE}" alt="${esc(nameA())} dan ${esc(nameB())}"></div>
  </section>
  ${quick}
  <section class="bn-main">
    <section class="bn-card bn-sv"><div class="bn-in">${FLI('blossom','bn-f-bl')}
      <div class="bn-ch">${ic('coins')}<h2>${go('Savings Dana Nikah','tabungan','tb.tab=invest')}</h2><span class="pill acc">${svPct}%</span></div>
      <div class="bn-big">${go(fmt(fd.net),'tabungan','tb.tab=riwayat')}</div>
      <div class="bn-sub">${target?`Target: ${nm(fmt(target))}`:'Target dana nikah belum diatur'}${canWrite?` · <button class="lk bn-lkb" data-act="editTarget">${target?'Ubah':'Atur'}</button>`:''}</div>
      <div class="bar bn-bar"><i style="width:${pct(fd.net,target)}%"></i></div>
      <h3 class="bn-h3">Alokasi Dana Saat Ini</h3>
      <div class="bn-alloc">${bnDonut(aShow.map(a=>({v:a.v,col:a.col})),aTot,aTot>=1e8?'Rp'+short(aTot):fmt(aTot),'Total Dana','Alokasi dana saat ini')}
        <div class="bn-leg">${aShow.map(a=>`<a class="bn-li" href="#tabungan" data-act="go" data-set="tb.tab=invest"><span class="bn-dot" style="background:${a.col}"></span><span class="bn-ln">${esc(a.k)}</span><span class="bn-lp">${pct(a.v,aTot)}%</span><span class="bn-la">${fmt(a.v)}</span></a>`).join('')}</div></div>
      <div class="bn-tot">${ic('layers')}<span>Total Alokasi Dana</span><b>${fmt(aTot)}</b></div>
    </div></section>
    <section class="bn-card bn-es"><div class="bn-in">
      <div class="bn-ch">${ic('wallet')}<h2>${go('Estimasi Pengeluaran','anggaran','ag.tab=banding;ag.q=')}</h2><span class="pill warn">${realPct}%</span></div>
      <div class="bn-big">${go(fmt(c.plan),'anggaran','ag.tab=banding;ag.q=')}</div><div class="bn-sub">Total estimasi anggaran</div>
      <div class="bn-two"><div class="bn-mini"><span>${ic('coins')}Realisasi</span><b>${go(fmt(c.actual),'anggaran','ag.tab=riwayat;ag.st=Semua;ag.q=')}</b></div><div class="bn-mini"><span>${ic('wallet')}${c.sisa<0?'Melebihi':'Sisa anggaran'}</span><b style="${c.sisa<0?'color:var(--bad)':''}">${go(fmt(Math.abs(c.sisa)),'anggaran','ag.tab=banding;ag.q=')}</b></div></div>
      <div class="bar bn-bar ${c.actual>c.plan?'bad':'warn'}"><i style="width:${pct(c.actual,c.plan)}%"></i></div>
      <div class="bn-note">${c.plan>0?`${nm(realPct+'%')} anggaran sudah terealisasi`:'Belum ada estimasi pengeluaran'}</div>
    </div></section>
    <section class="bn-card bn-pr"><div class="bn-in">${FLI('lav','bn-f-lav')}
      <div class="bn-ch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg><h2>${go('Progress Persiapan','checklist','cl.st=Semua;cl.ev=Semua;cl.cat=Semua;cl.pic=Semua;cl.q=')}</h2></div>
      <div class="bn-big">${clPct}%</div><div class="bn-sub">${nm(c.clDone)} dari ${nm(c.clAll)} tugas selesai</div>
      <div class="bar bn-bar ok"><i style="width:${clPct}%"></i></div>
      <div class="bn-st3">${picT.map(p=>`<a class="bn-s3 ${p.cls}" href="#checklist" data-act="go" data-set="cl.pic=${esc(p.v)};cl.st=Semua;cl.ev=Semua;cl.cat=Semua;cl.q="><span class="bn-s3h">${p.ico}<em>${esc(p.name)}</em></span><b>${p.done} / ${p.tot}</b><span class="bn-s3l">Tugas selesai</span></a>`).join('')}</div>
      <a class="bn-lnk" href="#checklist" data-act="go" data-set="cl.st=Semua;cl.ev=Semua;cl.cat=Semua;cl.pic=Semua;cl.q=">Lihat Checklist ${bnArrow}</a>
      <svg class="bn-clip" viewBox="0 0 64 80" aria-hidden="true"><rect x="8" y="10" width="48" height="66" rx="7" fill="#fff" stroke="#C9D3B3" stroke-width="2"/><rect x="22" y="4" width="20" height="12" rx="4" fill="#E7EBD9" stroke="#8EA573" stroke-width="2"/><g fill="none" stroke="#8EA573" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m16 30 4 4 7-8M16 46l4 4 7-8M16 62l4 4 7-8"/></g><g stroke="#D9E0C6" stroke-width="3" stroke-linecap="round"><path d="M33 30h16M33 46h16M33 62h16"/></g></svg>
    </div></section>
    <section class="bn-card bn-mh2"><div class="bn-in">${FLI('cluster','bn-f-cl')}
      <div class="bn-ch">${ic('gift')}<h2>Mahar &amp; Seserahan</h2><a class="bn-go" href="#mahar" data-act="go" data-set="gf.kind=Semua;gf.st=Semua;gf.q=" aria-label="Buka Mahar dan Seserahan">${bnArrow}</a></div>
      <div class="bn-big">${c.gBought} / ${c.gifts.length}</div>
    </div></section>
    <section class="bn-card bn-dk"><div class="bn-in">
      <div class="bn-ch">${ic('file')}<h2>Dokumen</h2><a class="bn-go" href="#dokumen" data-act="go" data-set="dk.stage=Semua;dk.who=Semua;dk.q=" aria-label="Buka Dokumen">${bnArrow}</a></div>
      <div class="bn-big">${ada} / ${docs.length}</div>
    </div></section>
  </section>
  <section class="bn-card bn-cat"><div class="bn-in">
    <div class="bn-ch">${ic('chartPie')}<h2>Estimasi vs Realisasi per Kategori</h2><a class="btn sm bn-detail" href="#anggaran" data-act="go" data-set="ag.tab=banding;ag.q=">Lihat detail ${bnArrow}</a></div>
    ${catRows.length?`<div class="bn-cg"><div class="bn-cl">${bnDonut(catSeg.map(a=>({v:a.v,col:a.col})),sum(catSeg,x=>x.v),realPct+'%','Terealisasi','Total realisasi per kategori')}
      <div class="bn-leg">${catSeg.map(a=>`<div class="bn-li"><span class="bn-dot" style="background:${a.col}"></span><span class="bn-ln">${esc(a.name)}</span><span class="bn-lp">${pct(a.v,sum(catSeg,x=>x.v))}%</span></div>`).join('')}</div></div>
      <div class="bn-cb">${catRows.map((x,i)=>{const over=x.act>x.est;return `<div class="bn-cr"><div class="bn-crh"><span class="bn-crn"><i style="background:${BN_CLR[i%8]}"></i>${esc(x.cat)}</span><span class="bn-cra">${fmt(x.act)} / ${fmt(x.est)}${over?' <b>OVER</b>':''}</span></div><div class="bar thin ${over?'bad':''}"><i style="width:${pct(x.act,x.est)}%;${over?'':'background:'+BN_CLR[i%8]}"></i></div></div>`}).join('')}</div></div>`:`<div class="empty">Belum ada pos estimasi atau realisasi.<br>${go('Buka Estimasi Pengeluaran','anggaran','ag.tab=banding;ag.q=')}</div>`}
  </div></section>
  <div class="bn-two2">
    <section class="bn-card bn-tk"><div class="bn-in"><div class="bn-ch">${ic('list')}<h2>${go('Tugas Prioritas','checklist','cl.st=Belum Selesai;cl.ev=Semua;cl.cat=Semua;cl.pic=Semua;cl.q=')}</h2><span class="pill">${tasks.length} tugas</span></div>
      <div class="bn-rows">${tasks.length?tasks.map(taskRow).join(''):`<div class="empty">Belum ada tugas yang menunggu.<br>${go('Buka Checklist','checklist')}</div>`}</div></div></section>
    <section class="bn-card bn-fu"><div class="bn-in"><div class="bn-ch">${ic('calendar')}<h2>${go('Tindak Lanjut Terdekat','catatan')}</h2><span class="pill">${rem.length} aktivitas</span></div>
      <div class="bn-rows">${rem.length?rem.map(noteRow).join(''):`<div class="empty">Tidak ada tindak lanjut yang terbuka.</div>`}</div></div></section>
  </div>
  <section class="bn-bk"><div><b>Cadangan data</b><span>Unduh seluruh data dalam satu file JSON.</span></div><button class="btn sm" data-act="exportAll">${ic('download')} Export Data</button></section>
  <img class="bn-fl-bot" src="${BNFL.border}" alt="" aria-hidden="true">
  </div>`;
}

/* ---- checklist ---- */
const TPL=[
['Akad','Dokumen KUA','Daftar nikah di KUA / SIMKAH',-90],['Akad','Dokumen KUA','Ikut kursus pra-nikah (bimbingan perkawinan)',-90],['Akad','Dokumen KUA','Konfirmasi penghulu dan jadwal akad',-60],['Akad','Dokumen KUA','Tentukan wali dan dua saksi',-60],['Akad','Dokumen KUA','Siapkan map berkas dan buku nikah',-14],
['Akad','Mahar','Tentukan bentuk dan nominal mahar',-120],['Akad','Mahar','Siapkan mahar dan wadahnya',-30],['Akad','Mahar','Latihan ijab kabul',-14],
['Akad','Seserahan','Finalisasi daftar seserahan',-90],['Akad','Seserahan','Pesan box atau hampers seserahan',-45],['Akad','Seserahan','Tulis kartu ucapan seserahan',-30],['Akad','Seserahan','Packing seserahan',-7],
['Akad','Busana & MUA','Pilih busana akad',-90],['Akad','Busana & MUA','Makeup trial dan hairdo',-60],['Akad','Busana & MUA','Siapkan cincin kawin',-30],['Akad','Busana & MUA','Fitting terakhir',-14],
['Akad','Acara / Hari-H','Susun rundown akad nikah',-30],['Akad','Acara / Hari-H','Brief keluarga inti untuk akad',-7],
['Resepsi','Venue & Dekorasi','Survey dan booking venue',-365],['Resepsi','Venue & Dekorasi','Finalisasi layout dan dekorasi',-45],['Resepsi','Venue & Dekorasi','Technical meeting dengan vendor',-14],
['Resepsi','Catering','Food tasting',-120],['Resepsi','Catering','Finalisasi menu dan jumlah pax',-30],
['Resepsi','Undangan','Finalisasi daftar tamu',-90],['Resepsi','Undangan','Desain dan cetak undangan',-75],['Resepsi','Undangan','Sebar undangan',-45],['Resepsi','Undangan','Follow-up RSVP',-21],
['Resepsi','Foto & Video','Booking fotografer dan videografer',-300],['Resepsi','Foto & Video','Buat shot list keluarga',-30],
['Resepsi','Souvenir','Pesan souvenir',-60],['Resepsi','Transportasi','Konfirmasi mobil pengantin dan keluarga',-14],
['Resepsi','Acara / Hari-H','Susun rundown resepsi',-30],['Resepsi','Acara / Hari-H','Siapkan emergency kit',-7],['Resepsi','Acara / Hari-H','Brief penerima tamu',-7],['Resepsi','Acara / Hari-H','Gladi bersih',-3],['Resepsi','Acara / Hari-H','Konfirmasi final seluruh vendor',-3],
['Umum','Honeymoon','Booking tiket dan hotel honeymoon',-60],['Umum','Persiapan Setelah Menikah','Siapkan hunian dan perlengkapan rumah',-30],['Umum','Persiapan Setelah Menikah','Urus perubahan KK dan dokumen setelah menikah',14]];

