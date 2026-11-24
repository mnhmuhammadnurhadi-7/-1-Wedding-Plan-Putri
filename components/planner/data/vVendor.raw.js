function vVendor(){
  const c=calc(),tot=sum(c.ven,v=>v.price),paid=sum(c.ven,v=>c.paidV[v.id]||0);
  const items=c.ven.filter(v=>hit(UI.vd.q,v.name,v.cat,v.pic,v.pkg,v.note));
  return head('Vendor','Penawaran, kesepakatan, dan pembayaran',addBtn('addVendor','Tambah vendor'))+
  `<div class="grid g4" style="margin-bottom:16px">${tile('Vendor',c.ven.length,`${c.ven.filter(v=>vStatus(v,c.paidV[v.id]||0)==='Booked').length} booked · ${c.ven.filter(v=>vStatus(v,c.paidV[v.id]||0)==='Lunas').length} lunas`)}${tile('Total kesepakatan',rp(tot))}${tile('Sudah dibayar',rp(paid),'',pct(paid,tot))}${tile('Sisa pembayaran',rp(Math.max(0,tot-paid)))}</div>
  <div class="tools">${searchBox('vd','Cari vendor atau kategori')}</div>
  ${items.length?`<div class="grid g2">${items.map(v=>{const p=c.paidV[v.id]||0,dp=vDp(v),vs=vStatus(v,p);
    return `<article class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div style="min-width:0"><div class="eyebrow">${esc(v.cat)}</div><h3 style="font-size:25px;margin-top:2px">${esc(v.name)}</h3></div><span class="pill ${vs==='Lunas'?'ok':vs==='Booked'?'acc':vs==='Negosiasi'?'warn':vs==='Batal'?'bad':''}">${vs}</span></div>
    <div class="sub">${esc(v.pkg)}</div>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">
      ${v.quote?`<div class="stat"><small>Harga penawaran</small><b>${fmt(v.quote)}</b></div>`:''}<div class="stat"><small>Harga kesepakatan</small><b>${fmt(v.price)}</b></div>
      <div class="stat"><small>DP disepakati</small><b>${dp?fmt(dp):'–'}</b></div><div class="stat"><small>Sudah dibayar</small><b>${fmt(p)}</b></div>
      <div class="stat"><small>Sisa pembayaran</small><b>${fmt(Math.max(0,v.price-p))}</b></div></div>
    <div class="bar ${p>v.price?'bad':p>=v.price&&v.price>0?'ok':''}"><i style="width:${pct(p,v.price)}%"></i></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;align-items:center">${dp>p?`<span class="pill warn">DP kurang ${fmt(dp-p)}</span>`:''}${v.payDue?`<span class="note">Pelunasan</span>${dueTag(v.payDue)}`:''}</div>
    <div class="note" style="display:flex;gap:4px 14px;flex-wrap:wrap;margin-top:12px"><span>${esc(v.pic)}</span><span class="num">${esc(v.phone)}</span>${v.due?`<span>Acara ${dFmt(v.due)}</span>`:''}<span>Kontrak: ${esc(v.contract||'Belum')}</span></div>
    ${v.note?`<div class="note" style="margin-top:6px">${esc(v.note)}</div>`:''}
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;align-items:center">${v.phone?`<button class="btn sm" data-act="copy" data-v="${esc(v.phone)}">${ic('copy')} Salin nomor</button>`:''}${v.phone?`<a class="btn sm" href="${waLink(v.phone)}" target="_blank" rel="noopener">WhatsApp</a>`:''}${canWrite?`<button class="btn sm" data-act="editVendor" data-id="${v.id}">Ubah</button>`:''}${fileLink(v.refUrl,'Referensi')}${fileLink(v.contractUrl,'Kontrak')}</div></article>`}).join('')}</div>`:emptyBox(c.ven.length?'Tidak ada vendor':'Belum ada vendor','Tambahkan vendor pertama.',canWrite?`<br><button class="btn pri" data-act="addVendor">Tambah vendor</button>`:'')}`;
}

/* ---- tamu ---- */