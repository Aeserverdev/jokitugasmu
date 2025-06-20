import express from 'express';
import { Configuration, OpenAIApi } from "openai";

const app = express();
app.use(express.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: "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"
}));

app.post("/api/verify-task", async (req, res) => {
  const { deskripsi, jenis, dosen, matkul, deadline } = req.body;

  const instruksi = `
Periksa apakah deskripsi terlalu pendek atau ambigu.
Periksa kesesuaian deadline (harus lebih dari 24 jam dari sekarang).
Periksa apakah nama dosen dan mata kuliah wajar dan lengkap.
Periksa apakah jenis tugas (${jenis}) sesuai dengan isi deskripsi.

Jika ada masalah, beri daftar poin yang perlu diperbaiki.
Jika semua sudah baik, hanya tulis: OK
`;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      max_tokens: 300,
      messages: [
        { role: "system", content: "Anda adalah AI yang memverifikasi data pesanan mahasiswa." },
        {
          role: "user",
          content: `
Deskripsi: ${deskripsi}
Jenis: ${jenis}
Dosen: ${dosen}
Mata Kuliah: ${matkul}
Deadline: ${deadline}

${instruksi}
        `.trim()
        }
      ]
    });

    const analysis = response.data.choices[0].message.content.trim();
    const isOk = analysis.toLowerCase() === "ok";
    res.json({ ok: isOk, analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, analysis: "Terjadi kesalahan saat memproses permintaan AI." });
  }
});

app.listen(3000, () => console.log("✅ Verify API aktif di port 3000"));
