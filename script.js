let semuaRiwayat = [], semuaPembayaran = [];

// Format tanggal aman
function formatTanggal(str) {
  if (!str) return "-";
  const date = new Date(str);
  return isNaN(date.getTime()) ? str : date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

// Tampilkan Riwayat
function tampilkanRiwayat(data) {
  let html = "<table><tr><th>ID</th><th>Jenis</th><th>Deadline</th><th>Status</th></tr>";

  data.forEach(r => {
    const status = (r.status || "Menunggu").toLowerCase();
    let cls = "status-menunggu";
    if (status.includes("proses")) cls = "status-proses";
    else if (status.includes("selesai")) cls = "status-selesai";
    else if (status.includes("batal")) cls = "status-batal";

    html += `<tr>
      <td>${r.trackingID || '-'}</td>
      <td>${r.jenis || '-'}</td>
      <td>${formatTanggal(r.deadline)}</td>
      <td><span class="status-badge ${cls}">${r.status || 'Menunggu'}</span></td>
    </tr>`;
  });

  html += "</table>";
  document.getElementById("tabelRiwayat").innerHTML = html;
}

// Load Riwayat dari GAS
async function loadRiwayat() {
  const box = document.getElementById("tabelRiwayat");
  box.textContent = "Memuat data...";
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.npm) {
    box.innerHTML = "<i>Data pengguna tidak ditemukan.</i>";
    return showNotif("error", "Gagal Memuat", "Data pengguna tidak lengkap.");
  }

  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbzvm0RO0IdDk9dgowz7d56ZjOQUejBxjkiUzyOBaRAq5bbmQuLKoGa55sx_DCVW-ghd/exec?action=getRiwayat&npm=${user.npm}`);
    const data = await res.json();
    semuaRiwayat = Array.isArray(data) ? data : [];
    if (semuaRiwayat.length === 0) {
      box.innerHTML = "<i>Belum ada data.</i>";
      return;
    }
    tampilkanRiwayat(semuaRiwayat);
  } catch (e) {
    console.error("loadRiwayat error:", e);
    box.innerHTML = "<i>Gagal memuat data.</i>";
    showNotif("error", "Gagal Memuat Riwayat", "Terjadi kesalahan saat mengambil data.");
  }
}

// Filter Riwayat
function filterRiwayat() {
  const q = document.getElementById("searchRiwayat").value.toLowerCase();
  const hasil = semuaRiwayat.filter(r => {
    const id = (r.trackingID || "").toLowerCase();
    const jenis = (r.jenis || "").toLowerCase();
    const deadline = (r.deadline || "").toLowerCase();
    const status = (r.status || "").toLowerCase();
    return id.includes(q) || jenis.includes(q) || deadline.includes(q) || status.includes(q);
  });
  tampilkanRiwayat(hasil);
}

// Tampilkan Pembayaran
function tampilkanPembayaran(data) {
  let html = "<table><tr><th>ID</th><th>Tanggal</th><th>Metode</th><th>Jumlah</th><th>Status</th></tr>";
  data.forEach(p => {
    const s = (p.status || "Pending").toLowerCase();
    let cls = "status-menunggu";
    if (s.includes("terverifikasi")) cls = "status-selesai";
    else if (s.includes("gagal")) cls = "status-batal";
    html += `<tr>
      <td>${p.id || '-'}</td>
      <td>${formatTanggal(p.tanggal)}</td>
      <td>${p.metode || '-'}</td>
      <td>Rp ${parseInt(p.jumlah || 0).toLocaleString("id-ID")}</td>
      <td><span class="status-badge ${cls}">${p.status || 'Pending'}</span></td>
    </tr>`;
  });
  html += "</table>";
  document.getElementById("tabelPembayaran").innerHTML = html;
}

// Load Pembayaran
async function loadPembayaran() {
  const box = document.getElementById("tabelPembayaran");
  box.textContent = "Memuat data...";
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.npm) {
    box.innerHTML = "<i>Data pengguna tidak ditemukan.</i>";
    return showNotif("error", "Gagal Memuat", "Data pengguna tidak lengkap.");
  }

  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbzvm0RO0IdDk9dgowz7d56ZjOQUejBxjkiUzyOBaRAq5bbmQuLKoGa55sx_DCVW-ghd/exec?action=getPembayaran&npm=${user.npm}`);
    const data = await res.json();
    semuaPembayaran = Array.isArray(data) ? data : [];
    if (semuaPembayaran.length === 0) {
      box.innerHTML = "<i>Belum ada data pembayaran.</i>";
      return;
    }
    tampilkanPembayaran(semuaPembayaran);
  } catch (e) {
    console.error("loadPembayaran error:", e);
    box.innerHTML = "<i>Gagal memuat data pembayaran.</i>";
    showNotif("error", "Gagal Memuat Pembayaran");
  }
}

// Filter Pembayaran
function filterPembayaran() {
  const q = document.getElementById("searchPembayaran").value.toLowerCase();
  const f = semuaPembayaran.filter(p =>
    (p.id || "").toLowerCase().includes(q) ||
    (p.tanggal || "").toLowerCase().includes(q) ||
    (p.metode || "").toLowerCase().includes(q) ||
    (p.status || "").toLowerCase().includes(q)
  );
  tampilkanPembayaran(f);
}
