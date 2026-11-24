function vCatatan(){
  const all=L('notes'),f=UI.ct,open=all.filter(n=>n.status!=='Selesai'),late=open.filter(n=>n.due&&n.due<todayISO());
  const pics=[...new Set(all.map(n=>n.pic))];
  const items=all.filter(n=>(f.st==='Semua'||(f.st==='Open')===(n.status!=='Selesai'))&&(f.pic==='Semua'||n.pic===f.pic)&&(f.type==='Semua'||noteType(n)===f.type)&&hit(f.q,n.topic,n.note,n.follow)).sort((a,b)=>(a.status==='Selesai')-(b.status==='Selesai')||(a.due||'9').localeCompare(b.due||'9'));
  return head('Catatan','Ide, hasil diskusi, keputusan keluarga, dan yang perlu dibahas',addBtn('addNote','Tambah catatan'))+
  `<div class="grid g4" style="margin-bottom:16px">${tile('Total',all.length)}${tile('Terbuka',open.length)}${tile('Selesai',all.length-open.length,'',pct(all.length-open.length,all.length),'ok')}${tile('Punya tenggat',open.filter(n=>n.due).length)}</div>
  <div class="chips">${['Semua',...NTYPES].map(t=>`<button class="chip" aria-pressed="${f.type===t}" data-act="ctType" data-v="${esc(t)}">${t}${t!=='Semua'?`<em>${all.filter(n=>noteType(n)===t).length}</em>`:''}</button>`).join('')}</div>
  <div class="tools">${searchBox('ct','Cari catatan')}<div class="seg">${[['Open','Terbuka'],['Selesai','Selesai'],['Semua','Semua']].map(([v,l])=>`<button aria-pressed="${f.st===v}" data-act="ctSt" data-v="${v}">${l}</button>`).join('')}</div>
  <div class="seg">${['Semua',...pics].map(p=>`<button aria-pressed="${f.pic===p}" data-act="ctPic" data-v="${esc(p)}">${esc(p)}</button>`).join('')}</div></div>
  <div class="grid g2 top">${items.map(n=>`<article class="card ${n.status==='Selesai'?'done':''}"><div style="display:flex;gap:12px;align-items:flex-start"><button class="cb" role="checkbox" aria-checked="${n.status==='Selesai'}" aria-label="Tandai selesai" data-act="toggleNote" data-id="${n.id}" style="margin-top:2px">${ic('tick',2.4)}</button><div class="main click" data-act="editNote" data-id="${n.id}" style="flex:1;min-width:0;cursor:pointer"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="eyebrow">${esc(n.topic)}</span><span class="pill acc">${esc(noteType(n))}</span></div><div class="t" style="font-weight:500;margin-top:4px">${esc(n.note)}</div>${n.follow?`<div class="note" style="margin-top:4px">Tindak lanjut: ${esc(n.follow)}</div>`:''}<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;align-items:center"><span class="note">${esc(n.pic)}</span>${priPill(n.pri)}${n.status!=='Selesai'?dueTag(n.due):''}</div></div></div></article>`).join('')}</div>${items.length?'':emptyBox(all.length?'Tidak ada catatan':'Belum ada catatan','Tulis ide, hasil diskusi, atau keputusan keluarga di sini.',canWrite?`<br><button class="btn pri" data-act="addNote">Tambah catatan</button>`:'')}`;
}

/* ================= forms ================= */
const PEOPLE=()=>[nameA(),nameB(),'Bersama'];
const budgetOpts=()=>[['','— Tanpa item —'],...L('budget').map(b=>[b.id,b.cat+' · '+b.name])];
const vendorOpts=()=>[['','— Tanpa vendor —'],...L('vendors').map(v=>[v.id,v.name])];
async function compress(file){
  if(!file.type.startsWith('image/'))return file;
  try{const bmp=await createImageBitmap(file),s=Math.min(1,1400/Math.max(bmp.width,bmp.height)),cv=document.createElement('canvas');cv.width=Math.round(bmp.width*s);cv.height=Math.round(bmp.height*s);cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);return await new Promise(r=>cv.toBlob(b=>r(b||file),'image/jpeg',.82))}catch(_){return file}
}