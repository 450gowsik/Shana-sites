const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const file = path.join(__dirname, 'messages.json');
  let arr = [];
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf8') || '[]';
      arr = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading messages.json', err);
    arr = [];
  }

  const entry = { name, email, subject, message, receivedAt: new Date().toISOString() };
  arr.push(entry);

  try {
    fs.writeFileSync(file, JSON.stringify(arr, null, 2));
  } catch (err) {
    console.error('Failed writing messages.json', err);
    return res.status(500).json({ error: 'Could not save message' });
  }

  return res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
