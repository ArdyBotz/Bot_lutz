// User
module.exports.helpMenu = (pushname, sender, saldo) => {
  return `
╭───═[ *INFORMASI* ]═───⋆
│╭───────────────···
││» 𝙽𝙰𝙼𝙰 : ${pushname}
││» 𝙽𝙾𝙼𝙾𝚁 : ${sender}
││» 𝚂𝙰𝙻𝙳𝙾 : ${saldo}
│╰───────────────···
├─═[ *STORE MENU* ]═───⋆
│╭───────────────···
││» .help (untuk bantuan)
││» .rekap (untuk melihat fee)
││» .excel (all fee dalam format excel)
││» .topco (untuk melihat peringkat bulanan)
│╰───────────────···
╰─────©NAMA TOKO─────⋆`;
};

// Owner
module.exports.helpOwner = (pushname, sender, saldo, role) => {
  return `
╭───═[ *INFORMASI* ]═───⋆
│╭───────────────···
││» 𝙽𝙰𝙼𝙰 : ${pushname}
││» 𝙽𝙾𝙼𝙾𝚁 : ${sender}
││» 𝚂𝙰𝙻𝙳𝙾 : ${saldo}
│╰───────────────···
├─═[ *OWNER MENU* ]═───⋆
│╭───────────────···
││» .addlist
││» .updatelist
││» .dellist
││» .proses
││» .done
││» .hidetag
││» .listuser
││» .cekdigi
││» .addsaldo
││» .cekip
│╰───────────────···
╰────©NAMA TOKO────⋆`;
};

// Profile
module.exports.profile = (pushname, sender, saldo, role) => {
  return `
╭───═[ *PROFILE* ]═─────⋆
│╭───────────────···
││» 𝙽𝙰𝙼𝙰 : ${pushname}
││» 𝙽𝙾𝙼𝙾𝚁 : ${sender}
││» 𝚂𝙰𝙻𝙳𝙾 : ${saldo}
││» 𝚁𝙾𝙻𝙴 : ${role}
│╰───────────────···
╰────©NAMA TOKO─────⋆`;
};

let file = require.resolve(__filename);
const chalk = require("chalk");
const fs = require("fs");
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.greenBright(`Update In ${__filename}`));
  delete require.cache[file];
  require(file);
});
