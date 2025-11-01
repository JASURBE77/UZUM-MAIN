import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_IDS = process.env.ADMIN_CHAT_IDS.split(',').map(id => id.trim());
const PORT = process.env.PORT || 5000;

const bot = new TelegramBot(TOKEN, { polling: false });
const codes = new Map();
const CODE_TTL_MS = 5 * 60 * 1000;

// --- Botni tekshirish
bot.getMe()
  .then(me => console.log(`🤖 Bot faol: ${me.first_name} (@${me.username})`))
  .catch(err => console.error('❌ Bot xatosi:', err.message));

function generate4Digit() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// === 1) Telefon raqam yuborish ===
app.post('/sendPhone', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: "Telefon raqam kiritilmadi" });

  const code = generate4Digit();
  codes.set(phone, { code, expiresAt: Date.now() + CODE_TTL_MS });

  const message = `
🎯 <b>UZUM LOGIN</b>
📱 Telefon: <code>${phone}</code>
🔐 Kod: <b>${code}</b>
⏰ ${new Date().toLocaleString()}
⚠️ Kod 5 daqiqa amal qiladi.
  `.trim();

  for (const id of ADMIN_CHAT_IDS) {
    try {
      await bot.sendMessage(id, message, { parse_mode: 'HTML' });
      console.log(`✅ Xabar yuborildi: ${id}`);
    } catch (err) {
      console.log(`❌ ${id} ga yuborilmadi: ${err.message}`);
    }
  }

  res.json({ success: true, message: "Kod yuborildi" });
});

// === 2) Kodni tekshirish ===
app.post('/verifyCode', async (req, res) => {
  const { phone, code } = req.body;
  const entry = codes.get(phone);

  if (!entry) return res.json({ success: true, valid: false, error: "Kod topilmadi" });

  const isValid = entry.code === String(code);
  if (isValid) {
    codes.delete(phone);
    for (const id of ADMIN_CHAT_IDS) {
      try {
        await bot.sendMessage(id, `✅ KIRISH TASDIQLANDI!\n📞 ${phone}\n🕒 ${new Date().toLocaleString()}`, { parse_mode: 'HTML' });
      } catch (err) {
        console.log(`❌ ${id} ga yuborilmadi: ${err.message}`);
      }
    }
  }

  res.json({ success: true, valid: isValid });
});

// === Sog‘lomlik (test) ===
app.get('/health', (req, res) => {
  res.json({
    status: "OK",
    activeCodes: codes.size,
    admins: ADMIN_CHAT_IDS,
    bot: "UZUM_LOGIN_BOT"
  });
});

// === Serverni ishga tushirish ===
app.listen(PORT, () => {
  console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
});
