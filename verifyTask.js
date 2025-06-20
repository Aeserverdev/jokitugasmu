import express from 'express';
import { Configuration, OpenAIApi } from "openai";

const app = express();
app.use(express.json());

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

app.post("/api/verify-task", async (req, res) => {
  const { deskripsi, jenis, dosen, matkul, deadline } = req.body;

  const prompts = [
    "Periksa apakah deskripsi terlalu pendek atau ambigu.",
    "Periksa kesesuaian deadline (harus lebih dari 24 jam).",
    "Periksa apakah nama dosen dan mata kuliah wajar dan lengkap.",
    `Periksa apakah jenis tugas (${jenis}) sesuai dengan isi deskripsi.`
  ].join("\n");

  try {
    const resp = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      max_tokens: 150,
      temperature: 0.5,
      prompt: `Anda adalah asisten yang memberi saran perbaikan.\n\nDeskripsi: ${deskripsi}\nJenis: ${jenis}\nDosen: ${dosen}\nMatkul: ${matkul}\nDeadline: ${deadline}\n\nInstruksi:\n${prompts}\n\nJika ada masalah, beri daftar poin. Jika baik, hanya tulis "OK".`
    });

    const analysis = resp.data.choices[0].text.trim();
    const isOk = analysis.toLowerCase() === "ok";
    res.json({ ok: isOk, analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, analysis: "Terjadi kesalahan server AI." });
  }
});

app.listen(3000, () => console.log("Verify API berjalan di port 3000"));
