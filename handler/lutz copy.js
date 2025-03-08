const {
  BufferJSON,
  WA_DEFAULT_EPHEMERAL,
  generateWAMessageFromContent,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  getContentType,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const axios = require("axios");
const moment = require("moment-timezone");
const ms = (toMs = require("ms"));
const FormData = require("form-data");
const { fromBuffer } = require("file-type");
const short = require("short-uuid");
const { DateTime } = require("luxon");
const crypto = require("crypto");
const path = require('path');
const fetch = require("node-fetch");
const xlsx = require('xlsx');

const { smsg, fetchJson, getBuffer } = require("../function/simple");
const {
  digiuser,
  digiapi,
  MerchantID,
  SecretKey,
  bronze,
  silver,
  gold,
} = require("../config");
const { sleep } = require("../function/sleep");
const { addUser, setRole, addSaldo, lessSaldo } = require("../function/user");
const cekProdukDigi = require("../function/cekproduk");
const { formatmoney } = require("./fmoney");
const formattedBalance = formatmoney;

async function getGroupAdmins(participants) {
  let admins = [];
  for (let i of participants) {
    i.admin === "superadmin"
      ? admins.push(i.id)
      : i.admin === "admin"
      ? admins.push(i.id)
      : "";
  }
  return admins || [];
}

function TelegraPh(Path) {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(Path)) return reject(new Error("File not Found"));
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(Path));
      const data = await axios({
        url: "https://telegra.ph/upload",
        method: "POST",
        headers: {
          ...form.getHeaders(),
        },
        data: form,
      });
      return resolve("https://telegra.ph" + data.data[0].src);
    } catch (err) {
      return reject(new Error(String(err)));
    }
  });
}

const {
  isSetDone,
  addSetDone,
  removeSetDone,
  changeSetDone,
  getTextSetDone,
  isSetProses,
  addSetProses,
  removeSetProses,
  changeSetProses,
  getTextSetProses,
} = require("../function/store");

const {
  updateResponList,
  delResponList,
  isAlreadyResponListGroup,
  sendResponList,
  isAlreadyResponList,
  getDataResponList,
  addResponList,
} = require("../function/list");

const tanggal = (numer) => {
  myMonths = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  myDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum’at", "Sabtu"];
  var tgl = new Date(numer);
  var day = tgl.getDate();
  bulan = tgl.getMonth();
  var thisDay = tgl.getDay(),
    thisDay = myDays[thisDay];
  var yy = tgl.getYear();
  var year = yy < 1000 ? yy + 1900 : yy;
  const time = moment.tz("Asia/Jakarta").format("DD/MM HH:mm:ss");
  let d = new Date();
  let locale = "id";
  let gmt = new Date(0).getTime() - new Date("1 January 1970").getTime();
  let weton = ["Pahing", "Pon", "Wage", "Kliwon", "Legi"][
    Math.floor((d * 1 + gmt) / 84600000) % 5
  ];

  return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`;
};

module.exports = lutz = async (
  lutz,
  m,
  chatUpdate,
  store,
  db_respon_list,
  set_done,
  set_proses
) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype == "videoMessage"
        ? m.message.videoMessage.caption
        : m.mtype == "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype == "buttonsResponseMessage"
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.mtype == "listResponseMessage"
        ? m.message.listResponseMessage.singleSelectReply.selectedRowId
        : m.mtype == "templateButtonReplyMessage"
        ? m.message.templateButtonReplyMessage.selectedId
        : m.mtype === "messageContextInfo"
        ? m.message.buttonsResponseMessage?.selectedButtonId ||
          m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
          m.text
        : "";
    var budy = typeof m.text == "string" ? m.text : "";
    const args = body.trim().split(/ +/).slice(1);
    const text = (q = args.join(" "));
    const pushname = m.pushName || "Fulan";
    const botNumber = await lutz.decodeJid(lutz.user.id);
    const isCreator = [botNumber, ...global.owner]
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(m.sender);
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const isMedia = /image|video|sticker|audio/.test(mime);
    const groupMetadata = m.isGroup
      ? await lutz.groupMetadata(m.chat).catch((e) => {})
      : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const participants = m.isGroup ? await groupMetadata.participants : "";
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : "";
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;

    const mentionByTag =
      m.mtype == "extendedTextMessage" &&
      m.message.extendedTextMessage.contextInfo != null
        ? m.message.extendedTextMessage.contextInfo.mentionedJid
        : [];
    const mentionByReply =
      m.mtype == "extendedTextMessage" &&
      m.message.extendedTextMessage.contextInfo != null
        ? m.message.extendedTextMessage.contextInfo.participant || ""
        : "";
    const mention =
      typeof mentionByTag == "string" ? [mentionByTag] : mentionByTag;
    mention != undefined ? mention.push(mentionByReply) : [];
    const mentionUser = mention != undefined ? mention.filter((n) => n) : [];
    const numberQuery =
      text.replace(new RegExp("[()+-/ +/]", "gi"), "") + "@s.whatsapp.net";
    const Input = Array.isArray(mentionByTag) && mentionByTag[0]
      ? mentionByTag[0]
      : mentionByReply
      ? mentionByReply
      : text
      ? numberQuery
      : false;

const reply = (text) => {
  m.reply(text);
};


    async function getGcName(groupID) {
      try {
        let data_name = await lutz.groupMetadata(groupID);
        return data_name.subject;
      } catch (err) {
        return "-";
      }
    }

    // Lutz Send Message
    const lutzMes = async (m, txt1) => {
      const mopsi = {
        text: txt1,
        contextInfo: {
          externalAdReply: {
            renderLargerThumbnail: true,
            mediaUrl: `${web}`,
            mediaType: 1,
            title: `${namabot}`,
            body: `Follow Me`,
            thumbnail: await getBuffer(pp_bot),
            sourceUrl: `${web}`,
            showAdAttribution: false,
          },
        },
      };

      lutz.sendMessage(m.chat, mopsi, { quoted: m });
    };

    if (m.message) {
      lutz.readMessages([m.key]);
      console.log();
      console.log(
        `${
          m.isGroup ? "\x1b[0;32mGC\x1b[1;32m" : "\x1b[1;32mPC"
        } \x1b[0m[ \x1b[1;37m${body} \x1b[0m] time \x1b[0;32m${calender}\x1b[0m\n› ${
          m.chat
        }\n› From : \x1b[0;37m${m.sender.split("@")[0]}\x1b[0m${
          m.pushName ? ", " + m.pushName : ""
        }\n› In : \x1b[0;32m${m.isGroup ? groupName : "Personal Chat"}\x1b[0m`
      );

      addUser(m.sender.split("@")[0], pushname);
    }

    // Show List Menu
    if (
      isAlreadyResponList(
        m.isGroup ? m.chat : botNumber,
        body.toLowerCase(),
        db_respon_list
      )
    ) {
      var get_data_respon = getDataResponList(
        m.isGroup ? m.chat : botNumber,
        body.toLowerCase(),
        db_respon_list
      );
      if (get_data_respon.isImage === false) {
        lutz.sendMessage(
          m.chat,
          {
            text: sendResponList(
              m.isGroup ? m.chat : botNumber,
              body.toLowerCase(),
              db_respon_list
            ),
          },
          {
            quoted: m,
          }
        );
      } else {
        lutz.sendMessage(
          m.chat,
          {
            image: await getBuffer(get_data_respon.image_url),
            caption: get_data_respon.response,
          },
          {
            quoted: m,
          }
        );
      }
    }

    // Start Bot Message
    // Menu User
    if (body === ".menu") {
      const sender = m.sender.split("@")[0];
      const usersData = JSON.parse(fs.readFileSync("./libs/users.json"));
      const userData = usersData.find((user) => user.nomor === sender);

      if (userData) {
        const { nama, nomor, saldo, role } = userData;
        const saldoFormatted = formattedBalance(saldo || 0);

        const txt1 = require("./menu").helpMenu(
          nama,
          nomor,
          saldoFormatted,
          role
        );
        lutzMes(m, txt1);
      } else {
        m.reply("Data pengguna tidak ditemukan.");
      }
      return;
    }

    // Menu Owner
    if (body === ".help") {
      if (!isCreator) return;
      const sender = m.sender.split("@")[0];

      const usersData = JSON.parse(fs.readFileSync("./libs/users.json"));
      const userData = usersData.find((user) => user.nomor === sender);

      if (userData) {
        const { nama, nomor, saldo, role } = userData;
        const saldoFormatted = formattedBalance(saldo || 0);

        const txt1 = require("./menu").helpOwner(
          nama,
          nomor,
          saldoFormatted,
          role
        );
        lutzMes(m, txt1);
      } else {
        m.reply("Data pengguna tidak ditemukan.");
      }
      return;
    }

    // Owner
    if (body === ".owner") {
      lutz.sendContact(m.chat, global.owner, m);
      return;
    }

    /* OWNER HANDLER */
    // Add List
    if (body.indexOf(".addlist") === 0) {
      if (!m.isGroup) return m.reply("Fitur Khusus Group!");
      if (!(m.isGroup ? isAdmins : isCreator))
        return m.reply("Fitur Khusus admin & owner!");
      var args1 = q.split("@")[0].toLowerCase();
      var args2 = q.split("@")[1];
      if (!q.includes("@"))
        return m.reply(`Gunakan dengan cara .addlist *key@response*`);
      if (
        isAlreadyResponList(
          m.isGroup ? m.chat : botNumber,
          args1.toLowerCase(),
          db_respon_list
        )
      )
        return m.reply(
          `List respon dengan key : *${args1}* sudah ada di chat ini.`
        );
      if (m.isGroup) {
        if (/image/.test(mime)) {
          let media = await lutz.downloadAndSaveMediaMessage(quoted);
          let mem = await TelegraPh(media);
          addResponList(m.chat, args1, args2, true, mem, db_respon_list);
          m.reply(`${args1} Telah berhasil ditambahkan`);
          if (fs.existsSync(media)) fs.unlinkSync(media);
        } else {
          addResponList(m.chat, args1, args2, false, "-", db_respon_list);
          m.reply(`${args1} Telah berhasil ditambahkan`);
        }
      } else {
        if (/image/.test(mime)) {
          let media = await lutz.downloadAndSaveMediaMessage(quoted);
          let mem = await TelegraPh(media);
          addResponList(
            botNumber,
            args1.toLowerCase(),
            args2,
            true,
            mem,
            db_respon_list
          );
          m.reply(`${args1} Telah berhasil ditambahkan`);
          if (fs.existsSync(media)) fs.unlinkSync(media);
        } else {
          addResponList(
            botNumber,
            args1.toLowerCase(),
            args2,
            false,
            "-",
            db_respon_list
          );
          m.reply(`${args1} Telah berhasil ditambahkan`);
        }
      }
      return;
    }

    // Update List
    if (body.indexOf(".updatelist") === 0) {
      if (!m.isGroup) return m.reply("Fitur Khusus Group!");
      if (!(m.isGroup ? isAdmins : isCreator))
        return m.reply("Fitur Khusus admin & owner!");
      var args1 = q.split("@")[0].toLowerCase();
      var args2 = q.split("@")[1];
      if (!q.includes("@"))
        return m.reply(`Gunakan dengan cara .updatelist *key@response*`);
      if (
        !isAlreadyResponList(
          m.isGroup ? m.chat : botNumber,
          args1.toLowerCase(),
          db_respon_list
        )
      )
        return m.reply(
          `Maaf, untuk key *${args1}* belum terdaftar di chat ini`
        );
      if (/image/.test(mime)) {
        let media = await lutz.downloadAndSaveMediaMessage(quoted);
        let mem = await TelegraPh(media);
        updateResponList(
          m.isGroup ? m.chat : botNumber,
          args1.toLowerCase(),
          args2,
          true,
          mem,
          db_respon_list
        );
        m.reply(`${args1} Telah berhasil diupdate`);
        if (fs.existsSync(media)) fs.unlinkSync(media);
      } else {
        updateResponList(
          m.isGroup ? m.chat : botNumber,
          args1.toLowerCase(),
          args2,
          false,
          "-",
          db_respon_list
        );
        m.reply(`${args1} Telah berhasil diupdate`);
      }
      return;
    }

    // Delete List
    if (body.indexOf(".dellist") === 0) {
      if (!m.isGroup) return m.reply("Fitur Khusus Group!");
      if (!(m.isGroup ? isAdmins : isCreator))
        return m.reply("Fitur Khusus admin & owner!");
      if (db_respon_list.length === 0)
        return m.reply(`Belum ada list message di database`);
      if (!text) return m.reply(`Gunakan dengan cara .dellist *key*`);
      if (
        !isAlreadyResponList(
          m.isGroup ? m.chat : botNumber,
          q.toLowerCase(),
          db_respon_list
        )
      )
        return m.reply(`List respon dengan key *${q}* tidak ada di database!`);
      delResponList(
        m.isGroup ? m.chat : botNumber,
        q.toLowerCase(),
        db_respon_list
      );
      m.reply(`${q} Telah berhasil dihapus`);
      return;
    }

    // Set Proses
    if (body.indexOf(".setproses") === 0) {
      if (!(m.isGroup ? isAdmins : isCreator))
        return m.reply("Fitur Khusus admin!");
      if (!text)
        return m.reply(
          `Gunakan dengan cara .setproses *teks*\n\n_Contoh_\n\n.setproses Pesanan sedang di proses ya @user\n\n- @user (tag org yg pesan)\n- @pesanan (pesanan)\n- @jam (waktu pemesanan)\n- @tanggal (tanggal pemesanan) `
        );
      if (isSetProses(m.isGroup ? m.chat : botNumber, set_proses))
        return m.reply(`Set proses already active`);
      addSetProses(text, m.isGroup ? m.chat : botNumber, set_proses);
      reply(`✅ Done set proses!`);
    }

    // Change Proses
    if (body.indexOf(".changeproses") === 0) {
      if (!(m.isGroup ? isAdmins : isCreator))
        return m.reply("Fitur Khusus admin!");
      if (!text)
        return m.reply(
          `Gunakan dengan cara .changeproses *teks*\n\n_Contoh_\n\n.changeproses Pesanan sedang di proses ya @user\n\n- @user (tag org yg pesan)\n- @pesanan (pesanan)\n- @jam (waktu pemesanan)\n- @tanggal (tanggal pemesanan) `
        );
      if (isSetProses(m.isGroup ? m.chat : botNumber, set_proses)) {
        changeSetProses(text, m.isGroup ? m.chat : botNumber, set_proses);
        m.reply(`Sukses ubah set proses!`);
      } else {
        addSetProses(text, m.isGroup ? m.chat : botNumber, set_proses);
        m.reply(`Sukses ubah set proses!`);
      }
    }

    // Delete proses
    if (body.indexOf(".delsetproses") === 0) {
      if (!(m.isGroup ? isAdmins : isCreator))
        return m.reply("Fitur Khusus admin!");
      if (!isSetProses(m.isGroup ? m.chat : botNumber, set_proses))
        return m.reply(`Belum ada set proses di gc ini`);
      removeSetProses(m.isGroup ? m.chat : botNumber, set_proses);
      reply(`Sukses delete set proses`);
    }

    // Set done
    if (body.indexOf(".setdone") === 0) {
      if (!(m.isGroup ? isAdmins : isCreator))
        return m.reply("Fitur Khusus admin!");
      if (!text)
        return m.reply(
          `Gunakan dengan cara .setdone *teks*\n\n_Contoh_\n\n.setdone Done @user\n\n- @user (tag org yg pesan)\n- @pesanan (pesanan)\n- @jam (waktu pemesanan)\n- @tanggal (tanggal pemesanan) `
        );
      if (isSetDone(m.isGroup ? m.chat : botNumber, set_done))
        return m.reply(`Udh set done sebelumnya`);
      addSetDone(text, m.isGroup ? m.chat : botNumber, set_done);
      reply(`Sukses set done!`);
    }

    // Change done
    if (body.indexOf(".changedone") === 0) {
      if (!(m.isGroup ? isAdmins : isCreator))
        return m.reply("Fitur Khusus admin!");
      if (!text)
        return m.reply(
          `Gunakan dengan cara .changedone *teks*\n\n_Contoh_\n\n.changedone Done @user\n\n- @user (tag org yg pesan)\n- @pesanan (pesanan)\n- @jam (waktu pemesanan)\n- @tanggal (tanggal pemesanan) `
        );
      if (isSetDone(m.isGroup ? m.chat : botNumber, set_done)) {
        changeSetDone(text, m.isGroup ? m.chat : botNumber, set_done);
        m.reply(`Sukses ubah set done!`);
      } else {
        addSetDone(text, m.isGroup ? m.chat : botNumber, set_done);
        m.reply(`Sukses ubah set done!`);
      }
    }

    // Delete done
    if (body.indexOf(".delsetdone") === 0) {
      if (!(m.isGroup ? isAdmins : isCreator))
        return m.reply("Fitur Khusus admin!");
      if (!isSetDone(m.isGroup ? m.chat : botNumber, set_done))
        return m.reply(`Belum ada set done di gc ini`);
      removeSetDone(m.isGroup ? m.chat : botNumber, set_done);
      m.reply(`Sukses delete set done`);
    }

    // Proses Pesanan
    if (body.indexOf(".proses") === 0) {
      if (!(m.isGroup ? isAdmins : isCreator))
        return m.reply("Fitur Khusus admin!");
      if (!m.quoted) return m.reply("Reply pesanan yang akan proses");
      let tek = m.quoted ? quoted.text : quoted.text.split(args[0])[1];
      const time = moment(Date.now())
        .tz("Asia/Jakarta")
        .locale("id")
        .format("HH:mm:ss z");
      let proses = `「 *TRANSAKSI PENDING* 」\n\n\`\`\`📆 TANGGAL : @tanggal\n⌚ JAM     : @jam\n✨ STATUS  : Pending\`\`\`\n\n📝 Catatan :\n@pesanan\n\nPesanan @user sedang di proses!`;
      const getTextP = getTextSetProses(
        m.isGroup ? m.chat : botNumber,
        set_proses
      );
      if (getTextP !== undefined) {
        var anunya = getTextP
          .replace("@pesanan", tek ? tek : "-")
          .replace("@user", "@" + m.quoted.sender.split("@")[0])
          .replace("@jam", time)
          .replace("@tanggal", tanggal(new Date()))
          .replace("@user", "@" + m.quoted.sender.split("@")[0]);
        lutz.sendTextWithMentions(m.chat, anunya, m);
      } else {
        lutz.sendTextWithMentions(
          m.chat,
          proses
            .replace("@pesanan", tek ? tek : "-")
            .replace("@user", "@" + m.quoted.sender.split("@")[0])
            .replace("@jam", time)
            .replace("@tanggal", tanggal(new Date()))
            .replace("@user", "@" + m.quoted.sender.split("@")[0]),
          m
        );
      }
    }
    
     //daftar
     if (body.indexOf(".daftar") === 0) {
    const userDbPath = "./database/UserDaftar.json";
    const saldoDbPath = "./libs/users.json";
    const sender = m.sender.split("@")[0]; // Nomor pengirim
    const pushname = m.pushName || "User"; // Nama pengguna dari WA

    // Cek apakah file database pendaftaran ada
    if (!fs.existsSync(userDbPath)) {
        fs.writeFileSync(userDbPath, JSON.stringify({ users: {} }, null, 2));
    }

    let userDB;
    
    try {
        userDB = JSON.parse(fs.readFileSync(userDbPath, "utf8"));
    } catch (e) {
        console.log("Format JSON rusak, membuat ulang...");
        userDB = { users: {} };
        fs.writeFileSync(userDbPath, JSON.stringify(userDB, null, 2));
    }

    // Cek apakah user sudah terdaftar
    if (userDB.users[sender]) {
        return m.reply("✅ *Kamu sudah terdaftar!*");
    }

    // Cek saldo dari database saldo
    let saldo = 0; // Default saldo
    if (fs.existsSync(saldoDbPath)) {
        try {
            const saldoDB = JSON.parse(fs.readFileSync(saldoDbPath, "utf8"));
            let userSaldo = saldoDB.find((user) => user.nomor === sender);
            if (userSaldo && userSaldo.saldo !== undefined) {
                saldo = userSaldo.saldo;
            }
        } catch (e) {
            console.log("Error membaca saldo:", e);
        }
    }

    // Ambil nama dari input jika ada, jika tidak gunakan pushname dari WA
    let name = body.split(".daftar ")[1] || pushname;

    // Simpan data user ke database pendaftaran
    userDB.users[sender] = { 
        nama: name, 
        wa: sender,
        saldo: saldo
    };

    // Simpan ke file
    fs.writeFileSync(userDbPath, JSON.stringify(userDB, null, 2));

    // Format respons pendaftaran
    let response = `🔹──【 *Pendaftaran Berhasil* 】──🔹\n\n`;
    response += `🎭 *Informasi Pengguna:*  \n`;
    response += `   🏷️ *Nama:* ${name}\n`;
    response += `   📲 *Nomor:* ${sender}\n`;
    response += `   💳 *Saldo Tersedia:* Rp ${saldo.toLocaleString("id-ID")}\n\n`;
    response += `Terima kasih telah menggunakan layanan kami!`;

    m.reply(response);
}


    //excell
    if (body.indexOf(".excel") === 0) {
    const userNumber = m.sender.split("@")[0]; 
    const dbPath = "./database/orders.json";
    const excelFolderPath = path.join(__dirname, 'database/excel');

    if (!fs.existsSync(excelFolderPath)) {
        fs.mkdirSync(excelFolderPath, { recursive: true });
    }

    fs.chmodSync(excelFolderPath, 0o777);

    if (!fs.existsSync(dbPath)) return m.reply("⚠️ *Database pesanan tidak ditemukan atau kosong.*");

    let ordersDB;
    try {
        ordersDB = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    } catch (e) {
        ordersDB = { users: {} };
    }

    const dataForExcel = [];
    const formatHarga = (harga) => `Rp${Number(harga).toLocaleString('id-ID')}`;

    if (isCreator) {
        for (const userKey in ordersDB.users) {
            const userOrders = ordersDB.users[userKey];
            userOrders.forEach(order => {
                dataForExcel.push([
                    order.penerima,
                    order.produk,
                    String(order.qty),  // Tambahkan petik satu agar dianggap teks
                    formatHarga(order.harga),
                    order.noPesanan,
                    order.noResi,
                    order.tanggal,
                    order.wa,
                    '?'
                ]);
            });
        }
    } else {
        const userOrders = ordersDB.users[userNumber] || [];
        userOrders.forEach(order => {
            dataForExcel.push([
                order.penerima,
                order.produk,
                String(order.qty),
                formatHarga(order.harga),
                order.noPesanan,
                order.noResi,
                order.tanggal,
                order.wa,
                '?'
            ]);
        });
    }

    if (dataForExcel.length === 0) {
        return m.reply("⚠️ *Tidak ada data pesanan untuk diekspor.*");
    }

    const wb = xlsx.utils.book_new();
    const header = [
        "NAMA PENERIMA", "PRODUK", "JUMLAH BARANG", "HARGA", "NO PESANAN",
        "NO RESI", "TANGGAL CHECKOUT", "NO WA", "FEE"
    ];
    const ws = xlsx.utils.aoa_to_sheet([header, ...dataForExcel]);

    const columnWidths = [];
    const range = xlsx.utils.decode_range(ws['!ref']);

    const getMaxColumnWidth = (colIdx) => {
        let maxLength = header[colIdx].length;
        for (let rowIdx = 1; rowIdx <= range.e.r; rowIdx++) {
            const cell = ws[xlsx.utils.encode_cell({ r: rowIdx, c: colIdx })];
            if (cell && cell.v) {
                maxLength = Math.max(maxLength, cell.v.toString().length);
            }
        }
        return maxLength;
    };

    for (let colIdx = 0; colIdx <= range.e.c; colIdx++) {
        columnWidths.push({ wch: getMaxColumnWidth(colIdx) + 2 });
    }

    ws["!cols"] = columnWidths;

    // Menentukan indeks kolom "JUMLAH BARANG" (index ke-2)
    const jumlahBarangColIdx = 2;

    // Menerapkan alignment ke tengah + ubah format ke teks
    for (let rowIdx = 1; rowIdx <= range.e.r; rowIdx++) {
        const cellRef = xlsx.utils.encode_cell({ r: rowIdx, c: jumlahBarangColIdx });
        if (!ws[cellRef]) continue;

        // Ubah alignment + format teks
        ws[cellRef].s = {
            alignment: { horizontal: 'center' }, 
            font: { bold: false, name: 'Arial', sz: 12 }
        };
        ws[cellRef].z = "@";  // Ubah format sel menjadi teks
    }

    xlsx.utils.book_append_sheet(wb, ws, "Pesanan");

    const userIdDigits = userNumber.replace(/\D/g, '').slice(-7);
    const randomDigits = Math.floor(Math.random() * 1000);
    const uniqueCode = `${userIdDigits}${randomDigits.toString().padStart(3, '0')}`;
    const excelPath = path.join(excelFolderPath, `${uniqueCode}.xlsx`);

    xlsx.writeFile(wb, excelPath);

    try {
        if (lutz.sendMessage) {
            await lutz.sendMessage(m.chat, {
                caption: "📊 *Data pesanan telah diekspor ke Excel!*",
                document: fs.readFileSync(excelPath),
                fileName: `${uniqueCode}.xlsx`,
                mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
        } else {
            console.error("Method sendMessage not found on lutz object.");
        }
    } catch (error) {
        console.error("Error while sending message:", error);
    }
}



      // mengubah status
    if (body.indexOf(".setstatus") === 0) {
    if (!isCreator) return m.reply("❌ *Kamu tidak memiliki izin untuk menggunakan perintah ini!*");

    const dbPath = "./database/orders.json";

    if (!fs.existsSync(dbPath)) return m.reply("⚠️ *Database masih kosong, belum ada pesanan yang dimasukkan.*");

    let args = body.split(" ");
    if (args.length < 3) {
        return m.reply("⚠️ *Format salah! Gunakan:* `.setstatus <NoResi> <Status>`\n\n📌 *Contoh:* `.setstatus 474637264 Selesai`");
    }

    let noResiInput = args[1];
    let statusBaru = args.slice(2).join(" ").toLowerCase(); // Konversi ke huruf kecil

    // Daftar status yang valid
    const statusValid = {
        "selesai": "Selesai",
        "pending": "Pending",
        "gagal": "Gagal"
    };

    if (!statusValid[statusBaru]) {
        return m.reply(
            `⚠️ *Status tidak valid! Pilih salah satu dari:*\n✅ *Selesai*\n⏳ *Pending*\n❌ *Gagal*\n\n📌 *Contoh:* \`.setstatus 474637264 Selesai\``
        );
    }

    let ordersDB = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    let orderDitemukan = false;
    let statusFormatted = statusValid[statusBaru]; // Format status ke bentuk yang benar

    // Looping ke semua pengguna untuk mencari NoResi
    for (let user in ordersDB.users) {
        let userOrders = ordersDB.users[user];

        let orderIndex = userOrders.findIndex(order => order.noResi === noResiInput);
        if (orderIndex !== -1) {
            if (userOrders[orderIndex].status === statusFormatted) {
                return m.reply(`⚠️ *Pesanan dengan NoResi ${noResiInput} sudah berstatus* _${statusFormatted}_.`);
            }

            // Update status
            ordersDB.users[user][orderIndex].status = statusFormatted;
            orderDitemukan = true;

            // Format ulang pesan untuk ditampilkan
            let pesan = `✅ *Status pesanan diperbarui!*\n\n`;
            pesan += `📦 *Produk*: ${userOrders[orderIndex].produk}\n`;
            pesan += `👤 *Penerima*: ${userOrders[orderIndex].penerima}\n`;
            pesan += `📄 *NoPesanan*: ${userOrders[orderIndex].noPesanan}\n`;
            pesan += `📦 *NoResi*: ${userOrders[orderIndex].noResi}\n`;
            pesan += `🔢 *Qty*: ${userOrders[orderIndex].qty}\n`;
            pesan += `💰 *Total Harga*: Rp${userOrders[orderIndex].harga.toLocaleString("id-ID")}\n`;
            pesan += `📅 *Tanggal CheckOut*: ${userOrders[orderIndex].tanggal}\n`;
            pesan += `📞 *WA*: ${userOrders[orderIndex].wa}\n`;
            pesan += `📌 *Status Baru*: ${userOrders[orderIndex].status}`;

            fs.writeFileSync(dbPath, JSON.stringify(ordersDB, null, 2));
            return m.reply(pesan);
        }
    }

    if (!orderDitemukan) {
        return m.reply(`⚠️ *NoResi ${noResiInput} tidak ditemukan dalam database!*`);
    }
}


    //topco
    if (body.indexOf(".topco") === 0) {
    const dbPath = "./database/orders.json";
    const userDbPath = "./database/UserDaftar.json"; // Ambil data user

    if (!fs.existsSync(dbPath) || !fs.existsSync(userDbPath)) {
        return m.reply("⚠️ *Database masih kosong, belum ada data transaksi.*");
    }

    let ordersDB = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    let userDB = JSON.parse(fs.readFileSync(userDbPath, "utf8"));
    let currentMonth = new Date().getMonth() + 1;
    let currentYear = new Date().getFullYear();

    let transaksiUser = {};

    for (let user in ordersDB.users) {
        let transaksiBerhasil = ordersDB.users[user].filter(order => {
            if (order.status !== "Selesai") return false;

            let stats = fs.statSync(dbPath);
            let modifiedDate = new Date(stats.mtime);
            let orderMonth = modifiedDate.getMonth() + 1;
            let orderYear = modifiedDate.getFullYear();

            return orderMonth === currentMonth && orderYear === currentYear;
        });

        if (transaksiBerhasil.length > 0) {
            let totalQty = transaksiBerhasil.reduce((sum, order) => sum + order.qty, 0);
            let totalBelanja = transaksiBerhasil.reduce((sum, order) => sum + (order.qty * order.harga), 0);
            transaksiUser[user] = { totalQty, totalBelanja };
        }
    }

    if (Object.keys(transaksiUser).length === 0) {
        return m.reply("⚠️ *Belum ada transaksi berhasil di bulan ini.*");
    }

    let sortedUsers = Object.entries(transaksiUser).sort((a, b) => b[1].totalBelanja - a[1].totalBelanja);
    
    let response = "🏆 *TOP CO BULAN INI* 🏆\n\n";
    let topUsers = sortedUsers.slice(0, 3);

    topUsers.forEach(([user, data], index) => {
        let nama = userDB.users[user]?.nama || `User ${index + 1}`; // Mengambil nama dengan benar
        response += `*${index + 1}.* ${nama}\n`;
        response += `   🛍️ *Total Qty:* ${data.totalQty}\n`;
        response += `   💰 *Total Belanja:* Rp${data.totalBelanja.toLocaleString("id-ID")}\n\n`;
    });

    response += "✨ Terima kasih sudah berbelanja!";
    m.reply(response);
}

    
    //input data
    if (body.indexOf(".input") === 0) {
    const ordersPath = "./database/orders.json";
    const usersPath = "./database/UserDaftar.json";
    const userNumber = m.sender.split("@")[0]; // Ambil nomor pengguna

    // Cek apakah user terdaftar di UserDaftar.json
    if (!fs.existsSync(usersPath)) {
        fs.writeFileSync(usersPath, JSON.stringify({ users: {} }, null, 2));
    }
    
    // Jika user hanya mengetik ".input" tanpa data, berikan panduan
    if (body.trim() === ".input") {
        return m.reply(
            `📌 *Cara Menginput Pesanan:*\n\n` +
            `Ketik perintah berikut dengan format:\n` +
            `\`\`\`\n.input\n` +
            `*Produk*: Nama Produk\n` +
            `*Penerima*: Nama Penerima\n` +
            `*NoPesanan*: Nomor Pesanan\n` +
            `*NoResi*: Nomor Resi\n` +
            `*Qty*: Jumlah Barang\n` +
            `*Harga*: Harga Produk\n` +
            `*Tanggal CheckOut*: YYYY-MM-DD\n` +
            `*WA*: Nomor WhatsApp\n\`\`\`\n\n` +
            `Contoh:\n\`\`\`\n.input\n` +
            `*Produk*: Baju Polos\n` +
            `*Penerima*: Budi Santoso\n` +
            `*NoPesanan*: 12345678\n` +
            `*NoResi*: AB1234567890\n` +
            `*Qty*: 2\n` +
            `*Harga*: 150000\n` +
            `*Tanggal CheckOut*: 2025-03-06\n` +
            `*WA*: 081234567890\n\`\`\``
        );
    }
    
    let userDB;
    try {
        userDB = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    } catch (e) {
        console.log("Format JSON UserDaftar.json rusak, membuat ulang...");
        userDB = { users: {} };
        fs.writeFileSync(usersPath, JSON.stringify(userDB, null, 2));
    }

    // Jika user belum terdaftar, tolak input
    if (!userDB.users[userNumber]) {
        return m.reply("⚠️ *Kamu belum terdaftar! Silakan daftar dengan perintah .daftar NamaKamu*");
    }

    // Cek apakah file database pesanan ada dan valid
    if (!fs.existsSync(ordersPath)) {
        fs.writeFileSync(ordersPath, JSON.stringify({ users: {} }, null, 2));
    }

    let ordersDB;
    try {
        ordersDB = JSON.parse(fs.readFileSync(ordersPath, "utf8"));
    } catch (e) {
        console.log("Format JSON orders.json rusak, membuat ulang...");
        ordersDB = { users: {} };
        fs.writeFileSync(ordersPath, JSON.stringify(ordersDB, null, 2));
    }

    // Pastikan ada struktur data untuk pengguna ini
    if (!ordersDB.users[userNumber]) {
        ordersDB.users[userNumber] = [];
    }

    // Mengambil seluruh nomor yang sudah ada di semua pengguna
    let existingNos = [];
    for (let user in ordersDB.users) {
        ordersDB.users[user].forEach(order => {
            existingNos.push(parseInt(order.no));
        });
    }

    // Mendapatkan nomor urut 4 digit yang unik
    let newNo = 1;
    while (existingNos.includes(newNo)) {
        newNo++;
    }
    newNo = String(newNo).padStart(4, "0");

    // Mengambil data dari pesan
    let data = {
        no: newNo,
        produk: (body.match(/\*Produk\*:\s*(.+)/i) || [])[1] || "-",
        penerima: (body.match(/\*Penerima\*:\s*(.+)/i) || [])[1] || "-",
        noPesanan: (body.match(/\*NoPesanan\*:\s*(.+)/i) || [])[1] || "-",
        noResi: (body.match(/\*NoResi\*:\s*(.+)/i) || [])[1] || "-",
        qty: parseInt((body.match(/\*Qty\*:\s*(.+)/i) || [])[1]) || 0,
        harga: parseInt((body.match(/\*Harga\*:\s*(.+)/i) || [])[1].replace(/\./g, "")) || 0,
        tanggal: (body.match(/\*Tanggal CheckOut\*:\s*(.+)/i) || [])[1] || "-",
        wa: (body.match(/\*WA\*:\s*(.+)/i) || [])[1] || "-",
        status: "Pending"
    };

    // Pastikan penerima tidak kosong
    if (data.penerima === "-") return m.reply("⚠️ *Nama Penerima wajib diisi!*");

    // Simpan ke database
    ordersDB.users[userNumber].push(data);

    // Simpan kembali ke database JSON
    try {
        fs.writeFileSync(ordersPath, JSON.stringify(ordersDB, null, 2));
    } catch (e) {
        console.error("Error saat menulis ke file database:", e);
        return m.reply("⚠️ *Terjadi kesalahan saat menyimpan data pesanan!*");
    }

    // Format harga ke rupiah
    let formatRupiah = (angka) => `Rp${angka.toLocaleString("id-ID")}`;

    // Menyusun respons yang akan dikirimkan
    let response = `✅ *Pesanan berhasil ditambahkan!*\n\n`;
    response += `🔢 *No*: ${data.no}\n`;
    response += `📦 *Produk*: ${data.produk}\n`;
    response += `👤 *Penerima*: ${data.penerima}\n`;
    response += `📄 *NoPesanan*: ${data.noPesanan}\n`;
    response += `📦 *NoResi*: ${data.noResi}\n`;
    response += `🔢 *Qty*: ${data.qty}\n`;
    response += `💰 *Harga*: ${formatRupiah(data.harga)}\n`;
    response += `📅 *Tanggal CheckOut*: ${data.tanggal}\n`;
    response += `📞 *WA*: ${data.wa}\n`;
    response += `📌 *Status*: ${data.status}`;

    // Kirim respons ke pengguna
    m.reply(response);
}

    //fitur rekap
    if (body.indexOf(".rekap") === 0) {
    const userNumber = m.sender.split("@")[0]; // Ambil nomor pengguna
    const dbPath = "./database/orders.json";

    // Cek apakah file database ada
    if (!fs.existsSync(dbPath)) return m.reply("📌 *Belum ada data pesanan yang kamu input.*");

    // Membaca database utama
    let ordersDB;
    try {
        // Coba untuk membaca dan mengurai file JSON
        ordersDB = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    } catch (e) {
        // Jika terjadi error saat parsing (misal file rusak), buat file baru
        ordersDB = { users: {} };
    }

    // Pastikan data user ada
    if (!ordersDB.users[userNumber] || ordersDB.users[userNumber].length === 0) {
        return m.reply("📌 *Belum ada data pesanan yang kamu input.*");
    }

    let formatRupiah = (angka) => `Rp${angka.toLocaleString("id-ID")}`;
    let response = `📜 *Rekap Pesanan Anda:*\n\n`;

    // Loop untuk menampilkan data pesanan berdasarkan urutan nomor yang benar
    ordersDB.users[userNumber].forEach((order) => {
        response += `🔢 *No*: ${order.no}\n`;
        response += `📦 *Produk*: ${order.produk}\n`;
        response += `👤 *Penerima*: ${order.penerima}\n`;
        response += `📄 *NoPesanan*: ${order.noPesanan}\n`;
        response += `📦 *NoResi*: ${order.noResi}\n`;
        response += `🔢 *Qty*: ${order.qty}\n`;
        response += `💰 *Harga*: ${formatRupiah(order.harga)}\n`;
        response += `📅 *Tanggal CheckOut*: ${order.tanggal}\n`;
        response += `📞 *WA*: ${order.wa}\n`;
        response += `📌 *Status*: ${order.status}\n`;
        response += `---------------------------\n`;
    });

    m.reply(response.trim());
}

    //resetdb
    if (body.indexOf(".resetdb") === 0) {
    if (!isCreator) return m.reply("❌ *Kamu tidak memiliki izin untuk menggunakan perintah ini!*");

    const ordersPath = "./database/orders.json";
    const usersPath = "./database/UserDaftar.json";

    // Struktur awal orders.json
    const initialOrders = { users: {} };

    // Struktur awal UserDaftar.json
    const initialUsers = { users: {} };

    try {
        // Reset database orders.json
        fs.writeFileSync(ordersPath, JSON.stringify(initialOrders, null, 2));

        // Reset database UserDaftar.json
        fs.writeFileSync(usersPath, JSON.stringify(initialUsers, null, 2));

        m.reply("✅ *Database berhasil direset! Semua data pesanan dan pendaftaran telah dihapus.*");
    } catch (e) {
        console.error("Error saat mereset database:", e);
        m.reply("⚠️ *Terjadi kesalahan saat mereset database!*");
    }
}
     

    // Proses Selesai
    if (body.indexOf(".done") === 0) {
      if (!(m.isGroup ? isAdmins : isCreator))
        return m.reply("Fitur Khusus admin!");
      if (!m.quoted) return m.reply("Reply pesanan yang telah di proses");
      let tek = m.quoted ? quoted.text : quoted.text.split(args[0])[1];
      const time = moment(Date.now())
        .tz("Asia/Jakarta")
        .locale("id")
        .format("HH:mm:ss z");
      let sukses = `「 *TRANSAKSI BERHASIL* 」\n\n\`\`\`📆 TANGGAL : @tanggal\n⌚ JAM     : @jam\n✨ STATUS  : Berhasil\`\`\`\n\nTerimakasih @user Next Order ya🙏`;
      const getTextD = getTextSetDone(m.isGroup ? m.chat : botNumber, set_done);
      if (getTextD !== undefined) {
        var anunya = getTextD
          .replace("@pesanan", tek ? tek : "-")
          .replace("@user", "@" + m.quoted.sender.split("@")[0])
          .replace("@jam", time)
          .replace("@tanggal", tanggal(new Date()))
          .replace("@user", "@" + m.quoted.sender.split("@")[0]);
        lutz.sendTextWithMentions(m.chat, anunya, m);
      } else {
        lutz.sendTextWithMentions(
          m.chat,
          sukses
            .replace("@pesanan", tek ? tek : "-")
            .replace("@user", "@" + m.quoted.sender.split("@")[0])
            .replace("@jam", time)
            .replace("@tanggal", tanggal(new Date()))
            .replace("@user", "@" + m.quoted.sender.split("@")[0]),
          m
        );
      }
    }

    // Hidetag
    if (body.indexOf(".hidetag") === 0 || body.indexOf(".h") === 0) {
      if (!m.isGroup) return reply("Khusus grup");
      if (!(isAdmins || isCreator)) return reply("Fitur khusus admin");
      let tek = m.quoted ? quoted.text : text ? text : "";
      if (!tek) return m.reply("Teksnya mana?");
      lutz.sendMessage(
        m.chat,
        {
          text: tek,
          mentions: participants.map((a) => a.id),
        },
        {}
      );
      return;
    }

    // List user
    if (body === ".listuser") {
      if (!isCreator) return;
      const userData = JSON.parse(fs.readFileSync("./libs/users.json"));
      let userList = "───〔 *LIST USER* 〕───\n\n";
      userData.forEach((user) => {
        userList += `*› Nama :* ${user.nama}\n*› Nomor :* ${
          user.nomor
        }\n*› Saldo :* ${formattedBalance(user.saldo)}\n*› Role :* ${
          user.role
        }\n\n`;
      });

      lutzMes(m, userList);
    }

    // Cek akun tokopay
    if (body === ".cektpay") {
      if (!isCreator) return reply("Fitur khusus owner!");
      let hash = crypto
        .createHash("md5")
        .update(`${MerchantID}:${SecretKey}`)
        .digest("hex");

      const data = await fetchJson(
        `https://api.tokopay.id/v1/merchant/balance?merchant=${MerchantID}&signature=${hash}`
      );

      const capt = `*「 AKUN TOKOPAY 」*\n\n*» STATUS AKUN :* *TERHUBUNG*\n*» NAMA TOKO :* *${
        data.data.nama_toko
      }*\n*» SALDO TERSEDIA :* *${formattedBalance(
        data.data.saldo_tersedia
      )}*\n*» SALDO TERTAHAN :* *${formattedBalance(
        data.data.saldo_tertahan
      )}*\n`;
      lutzMes(m, capt);
    }

    // Cek saldo digi
    if (body === ".cekdigi") {
      if (m.isGroup) return m.reply("Fitur khusus private chat!!!");
      if (!isCreator) return m.reply("Fitur khusus owner!!!");
      const crypto = require("crypto");
      const axios = require("axios");
      let cmd = "depo";
      let sign = crypto
        .createHash("md5")
        .update(digiuser + digiapi + cmd)
        .digest("hex");

      var config = {
        method: "POST",
        url: "https://api.digiflazz.com/v1/cek-saldo",
        data: {
          cmd: "deposit",
          username: digiuser,
          sign: sign,
        },
      };

      axios(config).then(function (response) {
        if (response.data.data) {
          const txt = `*「 AKUN DIGIFLAZZ 」*\n\n*» STATUS AKUN :* *TERHUBUNG*\n*» SALDO SERVER :* *${formatmoney(
            response.data.data.deposit
          )}*\n`;
          lutzMes(m, `${txt}`);
        } else {
          const cpt = `*「 AKUN DIGIFLAZZ 」*\n\n*Server Terputus Mohon Untuk Mengecek Providernya Kembali*.\n`;
          lutzMes(m, `${cpt}`);
        }
      });
      return;
    }

    // Set Role
    if (body.indexOf(".setrole") === 0) {
      if (!isCreator) return;
      const targetNumber = Input.split("@")[0];
      if (!Input) return m.reply("Reply aja orangnya");
      const newRole = text.split(",")[1];
      if (!newRole) return m.reply(".setrole ,ROLE");

      if (!["BRONZE", "SILVER", "GOLD"].includes(newRole)) {
        return m.reply("Hanya bisa BRONZE, SILVER, dan GOLD!");
      }

      lutzMes(m, `${setRole(targetNumber, newRole)}`);
    }

    // AddSaldo
    if (body.startsWith(".addsaldo")) {
    if (!isCreator) return m.reply("Kamu tidak memiliki izin untuk menambahkan saldo.");

    const args = body.split(" ");
    if (args.length < 3) return m.reply("⚠️ *Format salah!*\nGunakan: `.addsaldo <nomor> <jumlah>`\nContoh: `.addsaldo 082196900766 10000`");

    let targetNumber = args[1].replace(/[^0-9]/g, ""); // Ambil hanya angka
    let saldo = parseInt(args[2]);

    if (!saldo || saldo <= 0) return m.reply("⚠️ Nominal saldo harus angka dan lebih dari 0.");
    
    // Ubah ke format WhatsApp internasional
    if (targetNumber.startsWith("0")) targetNumber = "62" + targetNumber.slice(1);
    let targetJid = targetNumber + "@s.whatsapp.net";

    // Tambahkan saldo ke database
    let totalSaldo = addSaldo(targetNumber, saldo); 

    // Format respons untuk pengirim perintah
    let responseMessage = `✅ *Saldo berhasil ditambahkan!*\n\n*» Nomor* : ${targetNumber}\n*» Jumlah* : Rp ${saldo.toLocaleString()}\n*» Total Saldo* : Rp ${totalSaldo.toLocaleString()}`;
    
    m.reply(responseMessage);

    // Kirim notifikasi ke target setelah 2 detik untuk menghindari timeout
    setTimeout(async () => {
        try {
            await lutz.sendMessage(targetJid, { 
                text: `📢 *Notifikasi Saldo*\n\nAdmin telah menambahkan saldo ke akun Anda!\n\n💰 *Jumlah:* Rp ${saldo.toLocaleString()}\n📌 *Total Saldo Saat Ini:* Rp ${totalSaldo.toLocaleString()}\n\nTerima kasih telah menggunakan layanan kami!`
            });
        } catch (err) {
            console.error(`Gagal mengirim pesan ke ${targetNumber}: ${err.message}`);
        }
    }, 2000);
}

   // Cek Ip Address
    if (body === ".cekip") {
      if (m.isGroup) return m.reply("Fitur Khusus Private Chat");
      if (!isCreator) return m.reply("Fitur khusus owner!");
      const link = {
        method: "GET",
        url: "https://find-any-ip-address-or-domain-location-world-wide.p.rapidapi.com/iplocation",
        qs: { apikey: "873dbe322aea47f89dcf729dcc8f60e8" },
        headers: {
          "X-RapidAPI-Key":
            "837661b454msh274b6753ca80823p11c653jsn973bb2a55a34",
          "X-RapidAPI-Host":
            "find-any-ip-address-or-domain-location-world-wide.p.rapidapi.com",
          useQueryString: true,
        },
      };
      let re = require("request");
      re(link, function (error, response, body) {
        if (error) throw new Error(error);
        reply(body);
      });
      return;
    }

    /* USER HANDLER */
    // Cek transaksi
    if (body.indexOf(".cektrx") === 0) {
      const query = body.split(" ")[1];

      if (!query) {
        m.reply(`.cektrx invoice/nomor`);
        return;
      }

      let transactions = [];
      if (fs.existsSync("./libs/trx.json")) {
        const rawData = fs.readFileSync("./libs/trx.json", "utf8");
        transactions = JSON.parse(rawData);
      }

      const results = transactions.filter((trx) => {
        return (
          trx.invoice.includes(query) ||
          trx.nomor.includes(query.replace("08", "628"))
        );
      });

      if (results.length === 0) {
        m.reply(`Transaksi dengan invoice/nomor *${query}* tidak ditemukan.`);
        return;
      }

      let capt = `─────〔 *HISTORY* 〕─────\n\n`;
      results.forEach((result) => {
        capt += `*» Invoice :* ${result.invoice}\n`;
        capt += `*» Status :* ${result.status}\n`;
        capt += `*» Item :* ${result.item}\n`;
        capt += `*» Tujuan :* ${result.tujuan}\n`;
        capt += `*» Harga :* ${formattedBalance(result.harga)}\n`;
        capt += `*» Waktu :* ${result.waktu}\n\n`;
      });
      lutzMes(m, capt);
    }

    // Topup
    if (body.indexOf(".topup") === 0) {
      if (fs.existsSync(`./handler/session/${m.sender.split("@")[0]}.json`)) {
        m.reply(
          `Masih ada topup yang belum terselesaikan!!!\n\n_ketik *Y* untuk melanjutkan, *N* untuk membatalkan_`
        );
        return;
      }

      const kodeproduk = body.split(" ")[1];
      const id = body.split(" ")[2];
      const server = body.split(" ")[3];
      const nomor = m.sender.split("@")[0];

      if (!kodeproduk || !id) {
        return m.reply(`Contoh : .topup ML5 370876948 9702`);
      }

      try {
        const result = await cekProdukDigi(digiuser, digiapi, kodeproduk);
        const productData = result.data;

        if (productData && productData.length > 0) {
          const product = productData[0];

          const userData = JSON.parse(fs.readFileSync("./libs/users.json"));
          let userRole = userData.find((role) => role.nomor === nomor);
          let userSaldo = userData.find((saldo) => saldo.nomor === nomor);

          let hargaWithPercentage = product.price;
          if (userRole && userRole.role) {
            if (userRole.role === "GOLD") {
              hargaWithPercentage *= gold;
            } else if (userRole.role === "SILVER") {
              hargaWithPercentage *= silver;
            } else if (userRole.role === "BRONZE") {
              hargaWithPercentage *= bronze;
            }
          }

          const harga = formattedBalance(hargaWithPercentage);
          const invoice = invo + short.generate();

          const topData = [
            {
              no: nomor,
              id: id,
              server: server ? server : "",
              kode: kodeproduk,
              invoice: invoice,
              brand: product.brand,
              item: product.product_name,
              saldo: formattedBalance(
                userSaldo && userSaldo.saldo ? userSaldo.saldo : "0"
              ),
              harga: harga,
            },
          ];
          fs.writeFileSync(
            `./handler/session/${nomor}.json`,
            JSON.stringify(topData, null, 2)
          );

          let zoneId = server ? `(${server})` : "";
          let capt = `───〔 CONFIRMATION 〕───\n\n*» Kode Layanan :* ${kodeproduk}\n*» Item :* ${product.product_name}\n*» Harga :* ${harga}\n*» ID Tujuan :* ${id} ${zoneId}\n\nApakah data diatas sudah benar? akan gagal apabila terdapat kesalahan input.\n\nketik Y untuk melanjutkan, N untuk membatalkan`;
          lutzMes(m, capt);
        } else {
          return m.reply(
            `Layanan ${dm} tidak tersedia\nSilahkan pilih layanan yang lain`
          );
        }
      } catch (error) {
        return m.reply(`${error}`);
      }
    }

    // Proses topup
    if (budy.toLowerCase() === "y") {
      const { sender } = m;
      const nomor = sender.split("@")[0];

      if (!fs.existsSync(`./handler/session/${nomor}.json`)) {
        return;
      }
      const moment = require("moment-timezone");
      moment.tz.setDefault("Asia/Jakarta");
      const waktuSekarang = moment();
      const Jam = waktuSekarang.format("HH:mm:ss");
      const Tanggal = waktuSekarang.format("MM-DD-YYYY");

      const userData = JSON.parse(fs.readFileSync("./libs/users.json"));
      let userSaldo = userData.find((saldo) => saldo.nomor === nomor);
      const userRole = userData.find((role) => role.nomor === nomor);

      if (
        !userSaldo ||
        userSaldo.saldo === null ||
        userSaldo.saldo === undefined
      ) {
        m.reply(`Kamu tidak memiliki saldo, silahkan deposit`);
        fs.unlinkSync(`./handler/session/${nomor}.json`);
        return;
      }

      const dataId = JSON.parse(
        fs.readFileSync(`./handler/session/${nomor}.json`)
      );
      const userTopup = dataId.find((kode) => kode.no === nomor);
      let server = userTopup.server ? userTopup.server : "";
      let zone = userTopup.server ? `(${userTopup.server})` : "";

      try {
        const result = await cekProdukDigi(digiuser, digiapi, userTopup.kode);
        const productData = result.data;

        if (productData && productData.length > 0) {
          const product = productData[0];

          let hargaWithPercentage = product.price;
          if (userRole) {
            if (userRole.role === "GOLD") {
              hargaWithPercentage *= gold;
            } else if (userRole.role === "SILVER") {
              hargaWithPercentage *= silver;
            } else if (userRole.role === "BRONZE") {
              hargaWithPercentage *= bronze;
            }
          }

          if (userSaldo.saldo < hargaWithPercentage) {
            m.reply(`Saldo kamu tidak cukup untuk melakukan transaksi`);
            fs.unlinkSync(`./handler/session/${nomor}.json`);
            return;
          }

          const isian = `${userTopup.id}${server}`;
          const referdf = userTopup.invoice;
          const signature = crypto
            .createHash("md5")
            .update(digiuser + digiapi + referdf)
            .digest("hex");
          const config = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: digiuser,
              buyer_sku_code: userTopup.kode,
              customer_no: isian,
              ref_id: referdf,
              sign: signature,
            }),
          };

          fetch("https://api.digiflazz.com/v1/transaction", config)
            .then(async (response) => {
              const data = await response.json();
              m.reply(`_*Silahkan tunggu, pesanan kamu sedang diproses ⏳*_`);
              let dataStatus = data.data.status;

              while (dataStatus !== "Sukses") {
                await sleep(1000);
                const MemecLutz = await fetch(
                  "https://api.digiflazz.com/v1/transaction",
                  config
                );
                const memecData = await MemecLutz.json();
                dataStatus = memecData.data.status;
                console.log(dataStatus);

                if (dataStatus === "Gagal") {
                  const capt = `─────〔 GAGAL 〕─────\n\n*» Status :* ${memecData.data.status}\n*» Invoice :* ${memecData.data.ref_id}\n*» Tujuan :* ${userTopup.id} ${zone}\n*» Message :* ${memecData.data.message}\n*» Waktu :* ${Jam} | ${Tanggal}`;
                  lutzMes(m, capt);
                  // Add transaction
                  let transactions = [];
                  if (fs.existsSync("./libs/trx.json")) {
                    const rawData = fs.readFileSync("./libs/trx.json", "utf8");
                    transactions = JSON.parse(rawData);
                  }
                  const newTransaction = {
                    nomor: userTopup.no,
                    status: memecData.data.status,
                    invoice: memecData.data.ref_id,
                    item: userTopup.item,
                    rc: memecData.data.rc,
                    tujuan: `${userTopup.id} ${zone}`,
                    harga: hargaWithPercentage,
                    waktu: `${Jam} | ${Tanggal}`,
                  };
                  transactions.push(newTransaction);
                  fs.writeFileSync(
                    "./libs/trx.json",
                    JSON.stringify(transactions, null, 2)
                  );
                  fs.unlinkSync(`./handler/session/${nomor}.json`);
                  break;
                } else if (dataStatus === "Sukses") {
                  const capt = `─────〔 *SUKSES* 〕─────\n\n*» Status :* ${memecData.data.status}\n*» Invoice :* ${memecData.data.ref_id}\n*» Item :* ${userTopup.item}\n*» Tujuan :* ${userTopup.id} ${zone}\n*» Waktu :* ${Jam} | ${Tanggal}\n\n─────〔 *SN* 〕─────\n${memecData.data.sn}`;
                  lutzMes(m, capt);
                  // Update saldo pengguna
                  userSaldo.saldo -= hargaWithPercentage;
                  fs.writeFileSync(
                    "./libs/users.json",
                    JSON.stringify(userData, null, 2)
                  );
                  // Add transaction
                  let transactions = [];
                  if (fs.existsSync("./libs/trx.json")) {
                    const rawData = fs.readFileSync("./libs/trx.json", "utf8");
                    transactions = JSON.parse(rawData);
                  }
                  const newTransaction = {
                    nomor: userTopup.no,
                    status: memecData.data.status,
                    invoice: memecData.data.ref_id,
                    item: userTopup.item,
                    rc: memecData.data.rc,
                    tujuan: `${userTopup.id} ${zone}`,
                    harga: hargaWithPercentage,
                    waktu: `${Jam} | ${Tanggal}`,
                  };
                  transactions.push(newTransaction);
                  fs.writeFileSync(
                    "./libs/trx.json",
                    JSON.stringify(transactions, null, 2)
                  );
                  fs.unlinkSync(`./handler/session/${nomor}.json`);
                  break;
                }
              }
            })
            .catch((error) => {
              m.reply(error);
              fs.unlinkSync(`./handler/session/${nomor}.json`);
              console.log(error);
              return;
            });
        } else {
          return m.reply("Terjadi kesalahan, Silahkan coba lagi :)");
        }
      } catch (error) {
        return m.reply(`${error}`);
      }
    }

    // Batalkan pesanan / topup
    if (budy.toLowerCase() === "n") {
      const { sender } = m;
      if (fs.existsSync(`./handler/session/${sender.split("@")[0]}.json`)) {
        m.reply("Orderan kamu telah dibatalkan");
        return fs.unlinkSync(`./handler/session/${sender.split("@")[0]}.json`);
      }
      if (!fs.existsSync(`./handler/session/${sender.split("@")[0]}.json`))
        return;
    }

    // Cek Produk
    if (body.indexOf(".code") === 0) {
      const keyword = body.split(" ")[1];
      if (!keyword) return m.reply("Ex: .code ML5");

      try {
        const result = await cekProdukDigi(digiuser, digiapi, keyword);
        const productData = result.data;

        if (productData && productData.length > 0) {
          const product = productData[0];

          const userData = JSON.parse(fs.readFileSync("./libs/users.json"));
          let userRole = userData.find(
            (role) => role.nomor === m.sender.split("@")[0]
          );

          let hargaWithPercentage = product.price;
          if (userRole.role === "GOLD") {
            hargaWithPercentage *= gold;
          } else if (userRole.role === "SILVER") {
            hargaWithPercentage *= silver;
          } else if (userRole.role === "BRONZE") {
            hargaWithPercentage *= bronze;
          }

          const hargaRoleBronze = product.price * bronze;
          const hargaRoleSilver = product.price * silver;
          const hargaRoleGold = product.price * gold;

          const hargaNow = formattedBalance(hargaWithPercentage);
          let seller = "";
          let buyer = "";

          if (product.seller_product_status == true) {
            seller = "Tersedia";
          } else {
            seller = "Tidak Tersedia";
          }

          if (product.buyer_product_status == true) {
            buyer = "Tersedia";
          } else {
            buyer = "Tidak Tersedia";
          }

          const capt = `──〔 DETAIL PRODUCT 〕──\n\n*» Item :* ${
            product.product_name
          }\n*» Code :* ${
            product.buyer_sku_code
          }\n*» Price:* ${hargaNow}\n*» Brand :* ${
            product.brand
          }\n*» Category :* ${
            product.category
          }\n*» Status Seller :* ${seller}\n*» Status Buyer :* ${buyer}\n\n──〔 HARGA ROLE 〕──\n\n*» Price Bronze :* ${formattedBalance(
            hargaRoleBronze
          )}\n*» Price Silver :* ${formattedBalance(
            hargaRoleSilver
          )}\n*» Price Gold :* ${formattedBalance(
            hargaRoleGold
          )}\n\nRole kamu *${
            userRole.role
          }*, Upgrade role kamu dan nikmati harga yang murah :)`;
          lutzMes(m, capt);
          return;
        } else {
          return m.reply(
            `Layanan ${keyword} tidak tersedia\nSilahkan pilih layanan yang lain`
          );
        }
      } catch (error) {
        return m.reply(`${error}`);
      }
    }

    // List
    if (body === ".list") {
      if (db_respon_list.length === 0)
        return m.reply(`Belum ada list message di database`);
      if (
        !isAlreadyResponListGroup(
          m.isGroup ? m.chat : botNumber,
          db_respon_list
        )
      )
        return m.reply(`Belum ada list message yang terdaftar di group ini`);
      if (m.isGroup) {
        const time = moment(Date.now())
          .tz("Asia/Jakarta")
          .locale("id")
          .format("HH:mm:ss z");
        const date = moment(Date.now())
          .tz("Asia/Jakarta")
          .locale("id")
          .format("dddd, DD MMM YYYY");
        let teks = `*Hello kak* @${
          m.sender.split("@")[0]
        }, Selamat datang di *${groupName}*\n\nDate : ${date}\nTime : ${time}\n\n*Silahkan pilih daftar menu*\n\n`;
        for (let i of db_respon_list) {
          if (i.id === (m.isGroup ? m.chat : botNumber)) {
            teks += `» ${i.key.toUpperCase().replace("#", "")}\n`;
          }
        }
        teks += `\n© ${namabot}`;
        lutz.sendMessage(
          m.chat,
          { text: teks, mentions: [m.sender] },
          { quoted: m }
        );
      }
    }

    // Me / Profile
    if (body === ".me") {
      const sender = m.sender.split("@")[0];
      const usersData = JSON.parse(fs.readFileSync("./libs/users.json"));
      const userData = usersData.find((user) => user.nomor === sender);
      const { nama, nomor, saldo, role } = userData;
      const saldoFormatted = formattedBalance(saldo || 0);

      const txt1 = require("./menu").profile(nama, nomor, saldoFormatted, role);
      lutzMes(m, txt1);
    }

    // Kick user
    if (body.indexOf(".kick") === 0) {
      if (!isAdmins) return;
      if (!isCreator) return;
      if (!isBotAdmins) return;
      let users = m.mentionedJid.filter(
        (u) => !areJidsSameUser(u, lutz.user.id)
      );
      let kickedUser = [];
      for (let user of users)
        if (
          user.endsWith("@s.whatsapp.net") &&
          !(
            participants.find((v) => areJidsSameUser(v.id, user)) || {
              admin: true,
            }
          ).admin
        ) {
          const res = await lutz.groupParticipantsUpdate(
            m.chat,
            [user],
            "remove"
          );
          kickedUser.concat(res);
          await sleep(1 * 1000);
        }
    }

    /* End Bot Message */
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.greenBright(`Update In ${__filename}`));
  delete require.cache[file];
  require(file);
});
