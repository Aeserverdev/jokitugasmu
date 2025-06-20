
    const form = document.getElementById("form");
    const loader = document.getElementById("loader");
    const errorMsg = document.getElementById("errorMsg");
    const submitBtn = document.getElementById("submitBtn");
    const captcha = document.getElementById("captcha");
    let isLogin = true;

    function toggleForm() {
      isLogin = !isLogin;
      document.getElementById("formTitle").innerText = isLogin ? "Login Mahasiswa" : "Daftar Mahasiswa";
      submitBtn.innerText = isLogin ? "Login" : "Daftar";
      document.querySelector(".switch").innerText = isLogin ? "Belum punya akun? Daftar" : "Sudah punya akun? Login";
      document.getElementById("nama").style.display = isLogin ? "none" : "block";
      document.getElementById("prodi").style.display = isLogin ? "none" : "block";
      document.getElementById("nowa").style.display = isLogin ? "none" : "block";
      captcha.style.display = isLogin ? "none" : "block";
    }

    toggleForm(); // Panggil pertama kali

    form.addEventListener("submit", function(e) {
      e.preventDefault();
      loader.style.display = "block";
      errorMsg.style.display = "none";
      submitBtn.disabled = true;

      const npm = document.getElementById("npm").value.trim();
      const pw = document.getElementById("password").value.trim();
      const nama = document.getElementById("nama").value.trim();
      const prodi = document.getElementById("prodi").value.trim();
      const nowa = document.getElementById("nowa").value.trim();

      if (isNaN(npm) || (!isLogin && isNaN(nowa))) {
        showError("NPM dan No WhatsApp harus berupa angka.");
        return;
      }

      if (!isLogin) {
        if (!nama || !prodi || !nowa) {
          showError("Semua data harus diisi untuk mendaftar.");
          return;
        }
        if (npm.length < 8 || nowa.length < 10 || nowa.length > 12) {
          showError("NPM minimal 8 digit. No WA 10-12 digit.");
          return;
        }
        if (captcha.value !== "3874") {
          showError("CAPTCHA salah.");
          return;
        }

        // Kirim data ke Telegram
        const msg = `📝 Pendaftaran Baru\n\n👤 Nama: ${nama}\n🆔 NPM: ${npm}\n📚 Prodi: ${prodi}\n📱 WA: ${nowa}`;
        fetch(`https://api.telegram.org/bot7686312873:AAFgoSgH-5A8RyB8tJRzjevPlXI0iQMi8uI/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "-1002853719892",
            text: msg
          })
        });
      }

      const url = "https://script.google.com/macros/s/AKfycbxONOr_f5emqFnV-QF-D2u6Gjr_ysuBDJjxD7_7kD01W-AOznBsv-d1lr46oBVxVN8/exec";
      const action = isLogin ? "login" : "register";

      fetch(url, {
        method: "POST",
        body: new URLSearchParams({ action, npm, pw, nama, prodi, nowa })
      })
      .then(res => res.json())
      .then(data => {
        loader.style.display = "none";
        submitBtn.disabled = false;
        if (data.success) {
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.href = "fjoki.html";
        } else {
          showError(data.message);
        }
      })
      .catch(() => {
        loader.style.display = "none";
        submitBtn.disabled = false;
        showError("Terjadi kesalahan koneksi.");
      });
    });

    function showError(msg) {
      loader.style.display = "none";
      submitBtn.disabled = false;
      errorMsg.innerText = msg;
      errorMsg.style.display = "block";
    }

    // Isi otomatis jika sebelumnya pernah login
    const saved = JSON.parse(localStorage.getItem("user"));
    if (saved) {
      document.getElementById("npm").value = saved.npm || "";
      document.getElementById("password").value = saved.pw || "";
    }
