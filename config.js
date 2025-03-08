const fs = require("fs");
global.d = new Date();
global.calender = d.toLocaleDateString("id");

global.namabot = "Nama Bot"; // Nama bot
global.namaowner = "Nama Owner"; // Nama owner
global.owner = ["6281339588759"]; // Nomor owner
global.invo = "LSD" + "-"; // LSD nya aja yang diganti (ini invoice)
global.pp_bot = 'https://media-hosting.imagekit.io//12d576c6e2c24097/20250307_172604.jpg?Expires=1835947590&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=1QZBlMadkE2mDyKKz3wWkpcEjfmtf4cEWmlhr7OZFoUHx73-mDVu6V2uRB6uzvyAjjxVipLfvVuY78IE~v~la2Y~NG7hJBStnySU5CN0D0z~qPthDq-vR52olxOuEn2EqKKF-iDmwyZaw1WuZ9g4rdy6L3A6ekFJ2ZNhVlw0OKYMUeqHR5mGr0BalfPINnBhRs7GI9-ICvh12fuA-q~USPX4N1ZcVMpyUULgmgaGu5vlfalW4Dxlk5eWVnG6-owyi2j4cVFDJVvsep53fZNWcmc7-1oPJ5bEXN7DVxJrhuzK6mfg2pJA7R6soi-nK-4sddMQppZgVKc-Nhgz8NYPFQ__' // upload di telegra.ph
global.web = "link web"; // Bebas mau link gc ataupun apa

// Digiflazz
const digiuser = "wasikeWjem9D"; // Username
const digiapi = "dc641c74-0bce-406e-beee-89d91080a2a2"; // Production key

const bronze = 1.000; // 1.5% (1.015 - 1 * 100 = 0.015 * 100 = 1.5%)
const silver = 1.00; // 1% (1.01 - 1 * 100 = 0.01 * 100 = 1%)
const gold = 1.000; // 0.5% (1.005 - 1 * 100 = 0.005 * 100 = 0.5%)

module.exports = {
  digiuser,
  digiapi,
  bronze,
  silver,
  gold,
};

let file = require.resolve(__filename);
const chalk = require("chalk");
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.greenBright(`Nova Bot Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
