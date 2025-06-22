document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return location.href = "login_daftar.html";

  document.getElementById("nama").textContent = user.nama;
  document.getElementById("npm").textContent = user.npm;
  document.getElementById("prodi").textContent = user.prodi;
  document.getElementById("nowa").textContent = user.nowa;

  const savedLang = localStorage.getItem("bahasa");
  if (savedLang) document.getElementById("pilihBahasa").value = savedLang;
  if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
});

// ================= Pengaturan =================
function simpanEditNama() {
  const namaBaru = document.getElementById("pengaturanNama").value.trim();
  if (!namaBaru) return showNotif("error", "Nama kosong", "Silakan masukkan nama baru.");

  const user = JSON.parse(localStorage.getItem("user"));
  user.nama = namaBaru;
  localStorage.setItem("user", JSON.stringify(user));

  document.getElementById("namaDisplay").textContent = namaBaru;
  document.getElementById("fotoProfil").src = `https://ui-avatars.com/api/?name=${encodeURIComponent(namaBaru)}&background=0D8ABC&color=fff&size=128&rounded=true`;
  showNotif("success", "Berhasil", "Nama berhasil diperbarui!");
}

function gantiPassword() {
  const lama = document.getElementById("passLama").value;
  const baru = document.getElementById("passBaru").value;
  const user = JSON.parse(localStorage.getItem("user"));

  if (!lama || !baru) return showNotif("error", "Lengkapi semua kolom");
  if (lama !== user.password) return showNotif("error", "Password lama salah!");

  user.password = baru;
  localStorage.setItem("user", JSON.stringify(user));
  showNotif("success", "Password diperbarui!");
  document.getElementById("passLama").value = "";
  document.getElementById("passBaru").value = "";
}

function ubahBahasa() {
  const lang = document.getElementById("pilihBahasa").value;
  localStorage.setItem("bahasa", lang);
  showNotif("success", "Bahasa disimpan", lang === "id" ? "Bahasa Indonesia" : "English");
}

// =============== Navigasi & Tema ===============
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".sidebar button").forEach(b => b.classList.remove("active"));
  document.querySelector(`.sidebar button[onclick*="${id}"]`).classList.add("active");
  if (id === "riwayat") loadRiwayat();
  if (id === "pembayaran") loadPembayaran();
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function logout() {
  localStorage.removeItem("user");
  Swal.fire({ icon: 'info', title: 'Logout berhasil', timer: 2000, showConfirmButton: false });
  setTimeout(() => location.href = "login_daftar.html", 1500);
}

// =============== Notifikasi & Harga ===============
function showNotif(icon, title, text = '') {
  Swal.fire({ icon, title, text, toast: true, position: 'top-end', timer: 4000, showConfirmButton: false });
}

const hargaMap = {
  "MAKALAH": 25000,
  "PPT": 25000,
  "PPT PREMIUM": 50000,
  "WEBSITE": 150000,
  "KODING": 750000,
  "ANIMACY": 50000,
  "BIKIN APLIKASI": 500000
};

function updateHarga() {
  const jenis = document.getElementById("jenis").value;
  const harga = hargaMap[jenis] || 0;
  document.getElementById("harga").value = harga ? `Rp ${harga.toLocaleString("id-ID")}` : '';
}

// =============== Pesanan & Telegram ===============
const nomorDanaMap = {
  "RENALDI": "081348722325",
  "AFRIZAL": "085182489261",
  "ABDUL HAKIM": "085764534425",
  "AIDIL ANWAR": "082279458613"
};

document.getElementById("adminJoki").addEventListener("change", function () {
  const admin = this.value;
  const metode = document.getElementById("metode");
  const nomor = nomorDanaMap[admin];
  const infoDana = document.getElementById("infoDana");

  if (admin === "RENALDI") {
    metode.innerHTML = `<option value="Dana">Dana</option><option value="QRIS">QRIS</option>`;
  } else {
    metode.innerHTML = `<option value="Dana">Dana</option>`;
  }

  if (nomor) {
    infoDana.style.display = "block";
    document.getElementById("nomorDana").textContent = nomor;
  } else {
    infoDana.style.display = "none";
    document.getElementById("nomorDana").textContent = "";
  }
});

async function kirimTelegramDenganGambar(data, file) {
  const TOKEN = "7686312873:AAFgoSgH-5A8RyB8tJRzjevPlXI0iQMi8uI";
  const GROUP = "-1002853719892";
  const ADMIN = "8087861371";

  const pesan = `
📥 *Pesanan Baru Masuk*
👤 Nama: *${data.nama}*
🎓 NPM: *${data.npm}*
📚 Prodi: *${data.prodi}*
📱 WhatsApp: *${data.nowa}*
📝 Jenis Tugas: *${data.jenis}*
📄 Deskripsi: *${data.deskripsi}*
👨‍🏫 Dosen: *${data.dosen}*
🏛 Fakultas: *${data.fakultas}*
📘 Matkul: *${data.matkul}*
🗓 Deadline: *${data.deadline}*
🧑‍💻 Admin: *${data.adminJoki}*
💳 Metode: *${data.metode}*
💰 Harga: *${data.harga}*
📱 Dana: *${data.dana}*
🆔 Tracking ID: *${data.trackingID}*
  `.trim();

  const formData = new FormData();
  formData.append("chat_id", GROUP);
  formData.append("caption", pesan);
  formData.append("photo", file);
  formData.append("parse_mode", "Markdown");

  const url = `https://api.telegram.org/bot${TOKEN}/sendPhoto`;
  const sendPhoto = await fetch(url, { method: "POST", body: formData });
  if (!sendPhoto.ok) throw new Error(await sendPhoto.text());

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: ADMIN, text: pesan, parse_mode: "Markdown" })
  });
}

document.getElementById("formPesanan").addEventListener("submit", async e => {
  e.preventDefault();

  const jenis = document.getElementById("jenis").value.trim();
  const adminJoki = document.getElementById("adminJoki").value.trim();
  const deskripsi = document.getElementById("deskripsi").value.trim();
  const dosen = document.getElementById("dosen").value.trim();
  const fakultas = document.getElementById("fakultas").value.trim();
  const matkul = document.getElementById("matkul").value.trim();
  const deadline = document.getElementById("deadline").value;
  const metode = document.getElementById("metode").value;
  const harga = document.getElementById("harga").value;
  const file = document.getElementById("bukti").files[0];
  const trackingID = "TRK" + Date.now();

  if (!jenis || !adminJoki || !deskripsi || !dosen || !fakultas || !matkul || !deadline || !metode || !harga)
    return showNotif("error", "Form belum lengkap", "Isi semua kolom.");

  if (!file) return showNotif("error", "Gagal", "Upload bukti pembayaran.");
  if (!file.type.startsWith("image/")) return showNotif("error", "File harus gambar.");
  if (file.size > 5 * 1024 * 1024) return showNotif("error", "Ukuran maksimal 5MB.");

  const user = JSON.parse(localStorage.getItem("user"));
  const data = { trackingID, nama: user.nama, npm: user.npm, prodi: user.prodi, nowa: user.nowa, jenis, deskripsi, dosen, fakultas, matkul, deadline, metode, harga, adminJoki, dana: nomorDanaMap[adminJoki] || "-" };

  const statusPesanan = document.getElementById("statusPesanan");
  statusPesanan.style.display = "block";
  statusPesanan.innerText = "📡 Mengirim ke Telegram...";
  const submitBtn = document.querySelector('#formPesanan button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Mengirim...";

  try {
    await kirimTelegramDenganGambar(data, file);
    document.getElementById("formPesanan").reset();
    statusPesanan.innerHTML = `✅ Berhasil dikirim!<br><strong>ID:</strong> ${trackingID}`;
    navigator.clipboard.writeText(trackingID);
    showNotif("success", "Terkirim!", `Tracking ID: ${trackingID}`);
  } catch (err) {
    statusPesanan.innerHTML = "❌ Gagal mengirim ke Telegram.";
    showNotif("error", "Gagal", err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Kirim";
  }
});

// =============== Riwayat & Pembayaran ===============
let semuaRiwayat = [], semuaPembayaran = [];

async function loadRiwayat() {
  const box = document.getElementById("tabelRiwayat");
  box.textContent = "Memuat data...";
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?.npm) return box.innerHTML = "<i>Data pengguna tidak lengkap.</i>";

  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbzvm0RO0IdDk9dgowz7d56ZjOQUejBxjkiUzyOBaRAq5bbmQuLKoGa55sx_DCVW-ghd/exec?action=getRiwayat&npm=${user.npm}`);
    const data = await res.json();
    semuaRiwayat = Array.isArray(data) ? data : [];
    tampilkanRiwayat(semuaRiwayat);
  } catch {
    box.innerHTML = "<i>Gagal memuat data.</i>";
    showNotif("error", "Riwayat gagal dimuat");
  }
}

function tampilkanRiwayat(data) {
  let html = "<table><tr><th>ID</th><th>Jenis</th><th>Deadline</th><th>Status</th></tr>";
  data.forEach(r => {
    const s = (r.status || "Menunggu").toLowerCase();
    const cls = s.includes("proses") ? "status-proses" : s.includes("selesai") ? "status-selesai" : s.includes("batal") ? "status-batal" : "status-menunggu";
    html += `<tr><td>${r.trackingID || "-"}</td><td>${r.jenis || "-"}</td><td>${r.deadline || "-"}</td><td><span class="status-badge ${cls}">${r.status || "Menunggu"}</span></td></tr>`;
  });
  html += "</table>";
  document.getElementById("tabelRiwayat").innerHTML = html;
}

function filterRiwayat() {
  const q = document.getElementById("searchRiwayat").value.toLowerCase();
  const hasil = semuaRiwayat.filter(r =>
    (r.trackingID || "").toLowerCase().includes(q) ||
    (r.jenis || "").toLowerCase().includes(q) ||
    (r.deadline || "").toLowerCase().includes(q) ||
    (r.status || "").toLowerCase().includes(q)
  );
  tampilkanRiwayat(hasil);
}

async function loadPembayaran() {
  const box = document.getElementById("tabelPembayaran");
  box.textContent = "Memuat data...";
  const user = JSON.parse(localStorage.getItem("user"));

  try {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbzvm0RO0IdDk9dgowz7d56ZjOQUejBxjkiUzyOBaRAq5bbmQuLKoGa55sx_DCVW-ghd/exec?action=getPembayaran&npm=${user.npm}`);
    const data = await res.json();
    semuaPembayaran = Array.isArray(data) ? data : [];
    tampilkanPembayaran(semuaPembayaran);
  } catch {
    box.innerHTML = "<i>Gagal memuat data pembayaran.</i>";
    showNotif("error", "Gagal memuat pembayaran");
  }
}

function tampilkanPembayaran(data) {
  let html = "<table><tr><th>ID</th><th>Tanggal</th><th>Metode</th><th>Jumlah</th><th>Status</th></tr>";
  data.forEach(p => {
    const s = (p.status || "Pending").toLowerCase();
    const cls = s.includes("terverifikasi") ? "status-selesai" : s.includes("gagal") ? "status-batal" : "status-menunggu";
    html += `<tr><td>${p.id || '-'}</td><td>${p.tanggal || '-'}</td><td>${p.metode || '-'}</td><td>Rp ${parseInt(p.jumlah || 0).toLocaleString("id-ID")}</td><td><span class="status-badge ${cls}">${p.status || 'Pending'}</span></td></tr>`;
  });
  html += "</table>";
  document.getElementById("tabelPembayaran").innerHTML = html;
}

function filterPembayaran() {
  const q = document.getElementById("searchPembayaran").value.toLowerCase();
  const hasil = semuaPembayaran.filter(p =>
    (p.id || "").toLowerCase().includes(q) ||
    (p.tanggal || "").toLowerCase().includes(q) ||
    (p.metode || "").toLowerCase().includes(q) ||
    (p.status || "").toLowerCase().includes(q)
  );
  tampilkanPembayaran(hasil);
}
