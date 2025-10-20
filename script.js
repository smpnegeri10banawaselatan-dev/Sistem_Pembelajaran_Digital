// script.js - client-side helpers (demo)
// In Apps Script environment, use google.script.run for server calls.
// For standalone hosting this file is mostly UI helpers.

document.getElementById && (function(){
  const lf = document.getElementById('loginForm');
  if(lf) lf.addEventListener('submit', (e)=>{
    e.preventDefault();
    // Demo: redirect to dashboard
    window.location.href = 'dashboard.html';
  });

  const tanggapanForm = document.getElementById('tanggapanForm');
  if(tanggapanForm){
    let timer = 0, interval = null;
    const videoWrap = document.getElementById('videoWrap');
    // if a video element exists, start counting when play
    const maybeVideo = document.querySelector('#videoWrap video');
    if(maybeVideo){
      maybeVideo.addEventListener('play', ()=>{
        interval = setInterval(()=>{ timer++; document.getElementById('timerDisplay').innerText = 'Durasi ditonton: ' + toMMSS(timer); },1000);
      });
      maybeVideo.addEventListener('pause', ()=> clearInterval(interval));
      maybeVideo.addEventListener('ended', ()=> clearInterval(interval));
    }
    tanggapanForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const nama = document.getElementById('nama').value;
      const kelas = document.getElementById('kelas').value;
      const tanggapan = document.getElementById('tanggapan').value;
      const file = document.getElementById('fileInput') ? document.getElementById('fileInput').files[0] : null;
      const statusEl = document.getElementById('statusTanggapan') || document.getElementById('status');
      statusEl.innerText = 'Mengirim...';
      if(file){
        const fd = new FormData();
        fd.append('_fileName', file.name);
        fd.append('nama', nama);
        fd.append('kelas', kelas);
        fd.append('tanggapan', tanggapan);
        fd.append('durasi', toMMSS(timer));
        fd.append('tipe', 'upload_tanggapan');
        fd.append('file', file);
        // POST to same origin (when deployed as Apps Script, endpoint will accept multipart)
        const resp = await fetch(location.href, {method:'POST', body:fd});
        const j = await resp.json();
        if(j.status === 'success') statusEl.innerText = 'Tanggapan dan file tersimpan';
        else statusEl.innerText = 'Gagal upload';
      } else {
        // call server via google.script.run when in Apps Script environment
        if(window.google && google.script && google.script.run){
          google.script.run.withSuccessHandler(()=>{ statusEl.innerText='Tanggapan tersimpan'; }).saveTanggapan({nama, kelas, tanggapan, durasi: toMMSS(timer), fileUrl:''});
        } else {
          statusEl.innerText = 'Tanggapan disimpan (demo)';
        }
      }
    });
  }

  const abForm = document.getElementById('absenForm');
  if(abForm){
    abForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      if(window.google && google.script && google.script.run){
        const data = {type:'absensi_siswa', nisn:document.getElementById('nisn').value, nama:document.getElementById('nama').value, kelas:document.getElementById('kelas').value, keterangan:document.getElementById('ket').value, lokasi:''};
        google.script.run.withSuccessHandler(()=>{ document.getElementById('status').innerText='Absensi tersimpan'; }).saveAbsensiSiswa(data);
      } else {
        document.getElementById('status').innerText='Absensi (demo) tersimpan';
      }
    });
  }

  const abGuru = document.getElementById('absenGuru');
  if(abGuru){
    abGuru.addEventListener('submit', (e)=>{
      e.preventDefault();
      if(window.google && google.script && google.script.run){
        const data = {type:'absensi_guru', nip:document.getElementById('nip').value, nama:document.getElementById('nama').value, mapel:document.getElementById('mapel').value, materi:document.getElementById('materi').value};
        google.script.run.withSuccessHandler(()=>{ document.getElementById('status').innerText='Absensi guru tersimpan'; }).saveAbsensiGuru(data);
      } else {
        document.getElementById('status').innerText='Absensi guru (demo) tersimpan';
      }
    });
  }

})();

function toMMSS(s){
  const mm = Math.floor(s/60).toString().padStart(2,'0');
  const ss = (s%60).toString().padStart(2,'0');
  return mm + ':' + ss;
}
