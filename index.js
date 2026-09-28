const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>24-MD Pair</title>
<style>
body{background:#0a0a0a;color:#fff;font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}
.card{background:#1a1a1a;padding:30px;border-radius:20px;width:90%;max-width:350px;text-align:center;box-shadow:0 0 20px #ff0040}
input{width:90%;padding:12px;border-radius:10px;border:none;margin:15px 0;font-size:18px;text-align:center}
button{background:#ff0040;color:#fff;border:none;padding:12px 25px;border-radius:10px;font-size:18px;width:100%;cursor:pointer}
h2{color:#ff0040}
#code{font-size:30px;margin:20px 0;letter-spacing:5px;color:#00ff88;font-weight:bold}
</style>
</head>
<body>
<div class="card">
<h2>24-MD PAIR 🔥</h2>
<p>Weka number bila +</p>
<input id="num" placeholder="254110752459">
<button onclick="getCode()">GET PAIR CODE</button>
<div id="code"></div>
<p id="msg" style="font-size:13px"></p>
</div>
<script>
async function getCode(){
 let n=document.getElementById('num').value;
 if(!n) return alert('Weka number');
 document.getElementById('msg').innerText='Natafuta code... subiri 5 sec';
 document.getElementById('code').innerText='';
 let res=await fetch('/pair?number='+n);
 let data=await res.text();
 document.getElementById('code').innerHTML=data;
 document.getElementById('msg').innerText='Weka WhatsApp > Linked Devices > Link with phone number';
}
</script>
</body>
</html>
  `);
});

app.get('/pair', async (req, res) => {
  let num = req.query.number.replace(/[^0-9]/g, '');
  if (!num) return res.send('Weka number sahihi');
  
  const dir = './session-'+num;
  if(fs.existsSync(dir)) fs.rmSync(dir, {recursive:true, force:true});
  
  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: ['24-MD', 'Chrome', '1.0']
  });
  sock.ev.on('creds.update', saveCreds);
  await delay(2000);
  try {
    const code = await sock.requestPairingCode(num);
    res.send(code);
  } catch (e) {
    res.send('ERROR: ' + e.message);
  }
});

app.listen(process.env.PORT || 3000, () => console.log('24-MD PAIR LIVE'));
