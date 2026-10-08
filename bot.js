// require("dotenv").config();

// const { Telegraf, Markup } = require("telegraf");
// const Database = require("better-sqlite3");
// const fs = require("fs");
// const path = require("path");

// const BOT_TOKEN = process.env.BOT_TOKEN;

// if (!BOT_TOKEN) {
//     console.error("❌ BOT_TOKEN topilmadi. .env faylini tekshiring.");
//     process.exit(1);
// }

// const bot = new Telegraf(BOT_TOKEN);

// // ===============================
// // DATABASE
// // ===============================

// const databaseFolder = path.join(__dirname, "database");

// if (!fs.existsSync(databaseFolder)) {
//     fs.mkdirSync(databaseFolder);
// }

// const db = new Database(
//     path.join(databaseFolder, "expenses.db")
// );

// db.pragma("journal_mode = WAL");

// db.exec(`
//     CREATE TABLE IF NOT EXISTS users (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         telegram_id INTEGER UNIQUE NOT NULL,
//         first_name TEXT,
//         username TEXT,
//         monthly_budget INTEGER DEFAULT 0,
//         created_at TEXT DEFAULT CURRENT_TIMESTAMP
//     );

//     CREATE TABLE IF NOT EXISTS expenses (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         telegram_id INTEGER NOT NULL,
//         category TEXT NOT NULL,
//         amount INTEGER NOT NULL,
//         description TEXT,
//         expense_date TEXT NOT NULL,
//         created_at TEXT DEFAULT CURRENT_TIMESTAMP
//     );
// `);

// // ===============================
// // CATEGORIES
// // ===============================

// const categories = [
//     ["🚕", "Yo‘l kira"],
//     ["🍔", "Ovqatlanish"],
//     ["📱", "Paynet / Aloqa"],
//     ["🛒", "Oziq-ovqat"],
//     ["🏠", "Uy-ro‘zg‘or"],
//     ["💊", "Dori-darmon"],
//     ["👕", "Kiyim-kechak"],
//     ["🎓", "Ta’lim"],
//     ["🎮", "Ko‘ngilochar"],
//     ["☕", "Kafe / Qahvaxona"],
//     ["💻", "Internet / Texnologiya"],
//     ["🏥", "Sog‘liq"],
//     ["🎁", "Sovg‘alar"],
//     ["💳", "Kredit / To‘lovlar"],
//     ["📦", "Boshqa"]
// ];

// // ===============================
// // USER STATE
// // ===============================

// const userStates = new Map();

// function setState(userId, state) {
//     userStates.set(userId, state);
// }

// function getState(userId) {
//     return userStates.get(userId);
// }

// function clearState(userId) {
//     userStates.delete(userId);
// }

// // ===============================
// // HELPERS
// // ===============================

// function formatMoney(amount) {
//     return new Intl.NumberFormat("uz-UZ").format(amount) + " so‘m";
// }

// function today() {
//     const date = new Date();

//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
// }

// function getUser(ctx) {
//     return db
//         .prepare(
//             "SELECT * FROM users WHERE telegram_id = ?"
//         )
//         .get(ctx.from.id);
// }

// function createUser(ctx) {
//     const existing = getUser(ctx);

//     if (existing) {
//         return existing;
//     }

//     db.prepare(`
//         INSERT INTO users (
//             telegram_id,
//             first_name,
//             username
//         )
//         VALUES (?, ?, ?)
//     `).run(
//         ctx.from.id,
//         ctx.from.first_name || "",
//         ctx.from.username || ""
//     );

//     return getUser(ctx);
// }

// function mainMenu() {
//     return Markup.keyboard([
//         ["➕ Xarajat qo‘shish", "📊 Bugungi xarajatlar"],
//         ["📅 Haftalik hisobot", "📆 Oylik hisobot"],
//         ["📈 Statistika", "💰 Budjet"],
//         ["🗂 Kategoriyalar", "⚙️ Sozlamalar"]
//     ]).resize();
// }

// function categoryKeyboard() {
//     const buttons = [];

//     for (let i = 0; i < categories.length; i += 2) {
//         const row = [];

//         const first = categories[i];

//         row.push(
//             Markup.button.callback(
//                 `${first[0]} ${first[1]}`,
//                 `category_${i}`
//             )
//         );

//         if (categories[i + 1]) {
//             const second = categories[i + 1];

//             row.push(
//                 Markup.button.callback(
//                     `${second[0]} ${second[1]}`,
//                     `category_${i + 1}`
//                 )
//             );
//         }

//         buttons.push(row);
//     }

//     buttons.push([
//         Markup.button.callback("❌ Bekor qilish", "cancel")
//     ]);

//     return Markup.inlineKeyboard(buttons);
// }

// // ===============================
// // START
// // ===============================

// bot.start(async (ctx) => {

//     createUser(ctx);
//     clearState(ctx.from.id);

//     await ctx.reply(
//         `💰 Assalomu alaykum, ${ctx.from.first_name || "do‘st"}!

// Men sizning shaxsiy xarajatlar hisoblagichingizman.

// Har kuni qilgan xarajatlaringizni kiriting va pulingiz qayerga ketayotganini nazorat qiling.

// 📊 Kunlik
// 📅 Haftalik
// 📆 Oylik
// 📈 Statistikalar

// hammasini avtomatik hisoblab beraman.`,
//         mainMenu()
//     );
// });

// // ===============================
// // ADD EXPENSE
// // ===============================

// bot.hears("➕ Xarajat qo‘shish", async (ctx) => {

//     clearState(ctx.from.id);

//     await ctx.reply(
//         "🗂 Xarajat kategoriyasini tanlang:",
//         categoryKeyboard()
//     );
// });

// // ===============================
// // CATEGORY
// // ===============================

// bot.action(/^category_(\d+)$/, async (ctx) => {

//     const index = Number(ctx.match[1]);

//     const category = categories[index];

//     if (!category) {
//         return ctx.answerCbQuery("Kategoriya topilmadi");
//     }

//     setState(ctx.from.id, {
//         step: "amount",
//         category: category[1]
//     });

//     await ctx.answerCbQuery();

//     await ctx.editMessageText(
//         `🗂 Kategoriya: ${category[0]} ${category[1]}

// 💰 Qancha summa sarfladingiz?

// Masalan:
// 25000`
//     );
// });

// // ===============================
// // AMOUNT
// // ===============================

// bot.on("text", async (ctx) => {

//     const userId = ctx.from.id;
//     const state = getState(userId);

//     if (!state) {
//         return;
//     }

//     const text = ctx.message.text.trim();

//     if (state.step === "amount") {

//         const cleaned = text
//             .replace(/\s/g, "")
//             .replace(/,/g, "")
//             .replace(/\./g, "");

//         const amount = Number(cleaned);

//         if (!Number.isInteger(amount) || amount <= 0) {
//        await ctx.reply(
//         "❌ Summa noto‘g‘ri.\n\nMasalan:\n25000"
//     );
//         setState(userId, {
//             step: "description",
//             category: state.category,
//             amount
//         });

//         await ctx.reply(
//             `💰 Summa: ${formatMoney(amount)}

// 📝 Xarajat haqida qisqacha izoh yozing.

// Masalan:
// Lavash va cola

// Agar izoh kerak bo‘lmasa:
// “o‘tkazib yuborish” deb yozing.`
//         );

//         return;
//     }

//     if (state.step === "description") {

//         let description = text;

//         if (
//             text.toLowerCase() === "o‘tkazib yuborish" ||
//             text.toLowerCase() === "otkazib yuborish" ||
//             text.toLowerCase() === "skip"
//         ) {
//             description = "";
//         }

//         setState(userId, {
//             step: "confirm",
//             category: state.category,
//             amount: state.amount,
//             description
//         });

//         await ctx.reply(
//             `🧾 Xarajat ma’lumotlari:

// 🗂 Kategoriya:
// ${state.category}

// 💰 Summa:
// ${formatMoney(state.amount)}

// 📝 Izoh:
// ${description || "Izoh yo‘q"}

// 📅 Sana:
// ${today()}

// Xarajatni saqlaymizmi?`,
//             Markup.inlineKeyboard([
//                 [
//                     Markup.button.callback(
//                         "✅ Saqlash",
//                         "save_expense"
//                     ),
//                     Markup.button.callback(
//                         "❌ Bekor qilish",
//                         "cancel"
//                     )
//                 ]
//             ])
//         );

//         return;
//     }

//     if (state.step === "budget") {

//         const cleaned = text
//             .replace(/\s/g, "")
//             .replace(/,/g, "")
//             .replace(/\./g, "");

//         const amount = Number(cleaned);

//     if (!Number.isInteger(amount) || amount <= 0) {
//         await ctx.reply(
//             "❌ Budjet noto‘g‘ri.\n\nMasalan:\n5000000"
//         );

//         return;
//     }   

//             return;
//         }

//         db.prepare(`
//             UPDATE users
//             SET monthly_budget = ?
//             WHERE telegram_id = ?
//         `).run(amount, userId);

//         clearState(userId);

//         await ctx.reply(
//             `✅ Oylik budjet saqlandi!

// 💰 Budjet:
// ${formatMoney(amount)}`,
//             mainMenu()
//         );
//     }
// });

// // ===============================
// // SAVE EXPENSE
// // ===============================

// bot.action("save_expense", async (ctx) => {

//     const userId = ctx.from.id;
//     const state = getState(userId);

//     if (!state || state.step !== "confirm") {
//         return ctx.answerCbQuery("Ma’lumot topilmadi");
//     }

//     db.prepare(`
//         INSERT INTO expenses (
//             telegram_id,
//             category,
//             amount,
//             description,
//             expense_date
//         )
//         VALUES (?, ?, ?, ?, ?)
//     `).run(
//         userId,
//         state.category,
//         state.amount,
//         state.description,
//         today()
//     );

//     clearState(userId);

//     const result = db.prepare(`
//         SELECT COALESCE(SUM(amount), 0) AS total
//         FROM expenses
//         WHERE telegram_id = ?
//         AND expense_date = ?
//     `).get(userId, today());

//     await ctx.answerCbQuery("Xarajat saqlandi!");

//     await ctx.editMessageText(
//         `✅ Xarajat saqlandi!

// ${state.category}
// 💰 ${formatMoney(state.amount)}

// ━━━━━━━━━━━━
// 💸 Bugungi jami:
// ${formatMoney(result.total)}`
//     );

//     await ctx.reply(
//         "Boshqa amalni tanlang:",
//         mainMenu()
//     );
// });

// // ===============================
// // CANCEL
// // ===============================

// bot.action("cancel", async (ctx) => {

//     clearState(ctx.from.id);

//     await ctx.answerCbQuery("Bekor qilindi");

//     try {
//         await ctx.editMessageText(
//             "❌ Amal bekor qilindi."
//         );
//     } catch {
//         await ctx.reply(
//             "❌ Amal bekor qilindi.",
//             mainMenu()
//         );
//     }
// });

// // ===============================
// // TODAY
// // ===============================

// bot.hears("📊 Bugungi xarajatlar", async (ctx) => {

//     const userId = ctx.from.id;

//     const expenses = db.prepare(`
//         SELECT *
//         FROM expenses
//         WHERE telegram_id = ?
//         AND expense_date = ?
//         ORDER BY id DESC
//     `).all(userId, today());

//     if (expenses.length === 0) {

//         await ctx.reply(
//             `📊 Bugungi xarajatlar

// Hozircha xarajat kiritilmagan.

// ➕ “Xarajat qo‘shish” tugmasini bosing.`,
//             mainMenu()
//         );

//         return;
//     }

//     let message = "📊 BUGUNGI XARAJATLAR\n\n";

//     let total = 0;

//     expenses.forEach((expense, index) => {

//         total += expense.amount;

//         message += `${index + 1}. ${expense.category}\n`;
//         message += `💰 ${formatMoney(expense.amount)}\n`;

//         if (expense.description) {
//             message += `📝 ${expense.description}\n`;
//         }

//         message += "\n";
//     });

//     message += "━━━━━━━━━━━━\n";
//     message += `💰 JAMI: ${formatMoney(total)}`;

//     await ctx.reply(
//         message,
//         mainMenu()
//     );
// });

// // ===============================
// // WEEKLY
// // ===============================

// bot.hears("📅 Haftalik hisobot", async (ctx) => {

//     const userId = ctx.from.id;

//     const result = db.prepare(`
//         SELECT
//             category,
//             SUM(amount) AS total
//         FROM expenses
//         WHERE telegram_id = ?
//         AND expense_date >= date('now', '-6 days', 'localtime')
//         GROUP BY category
//         ORDER BY total DESC
//     `).all(userId);

//     if (result.length === 0) {

//         await ctx.reply(
//             "📅 Haftalik hisobot\n\nHozircha ma’lumot yo‘q.",
//             mainMenu()
//         );

//         return;
//     }

//     let message = "📅 HAFTALIK HISOBOT\n\n";

//     let total = 0;

//     result.forEach(item => {

//         total += item.total;

//         message += `${item.category}\n`;
//         message += `💰 ${formatMoney(item.total)}\n\n`;
//     });

//     const average = Math.round(total / 7);

//     message += "━━━━━━━━━━━━\n";
//     message += `💰 Jami: ${formatMoney(total)}\n`;
//     message += `📊 Kunlik o‘rtacha: ${formatMoney(average)}\n\n`;

//     message += `🔥 Eng katta xarajat:\n`;
//     message += `${result[0].category} — ${formatMoney(result[0].total)}`;

//     await ctx.reply(
//         message,
//         mainMenu()
//     );
// });

// // ===============================
// // MONTHLY
// // ===============================

// bot.hears("📆 Oylik hisobot", async (ctx) => {

//     const userId = ctx.from.id;

//     const result = db.prepare(`
//         SELECT
//             category,
//             SUM(amount) AS total
//         FROM expenses
//         WHERE telegram_id = ?
//         AND strftime('%Y-%m', expense_date)
//             = strftime('%Y-%m', 'now', 'localtime')
//         GROUP BY category
//         ORDER BY total DESC
//     `).all(userId);

//     if (result.length === 0) {

//         await ctx.reply(
//             "📆 Oylik hisobot\n\nHozircha ma’lumot yo‘q.",
//             mainMenu()
//         );

//         return;
//     }

//     let message = "📆 OYLIK HISOBOT\n\n";

//     let total = 0;

//     result.forEach(item => {

//         total += item.total;

//         message += `${item.category}\n`;
//         message += `💰 ${formatMoney(item.total)}\n\n`;
//     });

//     const days = new Date().getDate();

//     const average = Math.round(total / days);

//     message += "━━━━━━━━━━━━\n";
//     message += `💰 Jami: ${formatMoney(total)}\n`;
//     message += `📊 Kunlik o‘rtacha: ${formatMoney(average)}\n\n`;

//     message += `🔥 Eng ko‘p xarajat:\n`;
//     message += `${result[0].category} — ${formatMoney(result[0].total)}`;

//     await ctx.reply(
//         message,
//         mainMenu()
//     );
// });

// // ===============================
// // STATISTICS
// // ===============================

// bot.hears("📈 Statistika", async (ctx) => {

//     const userId = ctx.from.id;

//     const month = db.prepare(`
//         SELECT COALESCE(SUM(amount), 0) AS total
//         FROM expenses
//         WHERE telegram_id = ?
//         AND strftime('%Y-%m', expense_date)
//             = strftime('%Y-%m', 'now', 'localtime')
//     `).get(userId);

//     const all = db.prepare(`
//         SELECT COALESCE(SUM(amount), 0) AS total
//         FROM expenses
//         WHERE telegram_id = ?
//     `).get(userId);

//     const top = db.prepare(`
//         SELECT
//             category,
//             SUM(amount) AS total
//         FROM expenses
//         WHERE telegram_id = ?
//         GROUP BY category
//         ORDER BY total DESC
//         LIMIT 1
//     `).get(userId);

//     let message = `📈 SIZNING STATISTIKANGIZ

// 💰 Bu oy:
// ${formatMoney(month.total)}

// 💵 Barcha vaqt:
// ${formatMoney(all.total)}

// `;

//     if (top) {
//         message += `🔥 Eng ko‘p xarajat:
// ${top.category}
// ${formatMoney(top.total)}
// `;
//     } else {
//         message += "Hozircha statistika mavjud emas.";
//     }

//     await ctx.reply(
//         message,
//         mainMenu()
//     );
// });

// // ===============================
// // BUDGET
// // ===============================

// bot.hears("💰 Budjet", async (ctx) => {

//     const user = getUser(ctx);

//     const currentMonth = db.prepare(`
//         SELECT COALESCE(SUM(amount), 0) AS total
//         FROM expenses
//         WHERE telegram_id = ?
//         AND strftime('%Y-%m', expense_date)
//             = strftime('%Y-%m', 'now', 'localtime')
//     `).get(ctx.from.id);

//     let message = `💰 BUDJET

// Oylik budjet:
// ${formatMoney(user.monthly_budget)}

// Bu oy sarflandi:
// ${formatMoney(currentMonth.total)}
// `;

//     if (user.monthly_budget > 0) {

//         const remaining =
//             user.monthly_budget - currentMonth.total;

//         message += "\n";

//         if (remaining >= 0) {
//             message += `Qolgan:
// ${formatMoney(remaining)}`;
//         } else {
//             message += `🚨 Budjetdan oshib ketdingiz!
// ${formatMoney(Math.abs(remaining))} ortiqcha sarflandi.`;
//         }
//     }

//     await ctx.reply(
//         message,
//         Markup.inlineKeyboard([
//             [
//                 Markup.button.callback(
//                     "✏️ Budjet belgilash",
//                     "set_budget"
//                 )
//             ]
//         ])
//     );
// });

// bot.action("set_budget", async (ctx) => {

//     setState(ctx.from.id, {
//         step: "budget"
//     });

//     await ctx.answerCbQuery();

//     await ctx.reply(
//         `💰 Oylik budjetingizni kiriting.

// Masalan:
// 5000000`
//     );
// });

// // ===============================
// // CATEGORIES
// // ===============================

// bot.hears("🗂 Kategoriyalar", async (ctx) => {

//     let message = "🗂 XARAJAT KATEGORIYALARI\n\n";

//     categories.forEach(category => {
//         message += `${category[0]} ${category[1]}\n`;
//     });

//     await ctx.reply(
//         message,
//         mainMenu()
//     );
// });

// // ===============================
// // SETTINGS
// // ===============================

// bot.hears("⚙️ Sozlamalar", async (ctx) => {

//     const user = getUser(ctx);

//     await ctx.reply(
//         `⚙️ SOZLAMALAR

// 👤 Ism:
// ${user.first_name || "Noma’lum"}

// 💰 Oylik budjet:
// ${formatMoney(user.monthly_budget)}

// 💵 Valyuta:
// UZS — so‘m`,
//         mainMenu()
//     );
// });

// // ===============================
// // UNKNOWN TEXT
// // ===============================

// bot.on("text", async (ctx) => {

//     const state = getState(ctx.from.id);

//     if (state) {
//         return;
//     }

//     await ctx.reply(
//         "👇 Menyudan kerakli amalni tanlang.",
//         mainMenu()
//     );
// });

// // ===============================
// // ERROR
// // ===============================

// bot.catch((error, ctx) => {

//     console.error("BOT ERROR:", error);

//     ctx.reply(
//         "❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring."
//     ).catch(() => {});
// });

// // ===============================
// // START BOT
// // ===============================

// bot.launch();

// console.log("=================================");
// console.log("💰 Kunlik Xarajatlar Bot");
// console.log("🤖 Bot ishga tushdi!");
// console.log("=================================");

// // Graceful shutdown

// process.once("SIGINT", () => {
//     bot.stop("SIGINT");
// });

// process.once("SIGTERM", () => {
//     bot.stop("SIGTERM");
// });



require("dotenv").config();

const { Telegraf, Markup } = require("telegraf");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// ========================================
// BOT TOKEN
// ========================================

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error("❌ BOT_TOKEN topilmadi.");
    console.error("❗ .env faylini tekshiring.");
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// ========================================
// DATABASE
// ========================================

const databaseFolder = path.join(__dirname, "database");

if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder, { recursive: true });
}

const db = new Database(
    path.join(databaseFolder, "expenses.db")
);

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER UNIQUE NOT NULL,
        first_name TEXT DEFAULT '',
        username TEXT DEFAULT '',
        monthly_budget INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        amount INTEGER NOT NULL,
        description TEXT DEFAULT '',
        expense_date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);

// ========================================
// CATEGORIES
// ========================================

const categories = [
    ["🚕", "Yo‘l kira"],
    ["🍔", "Ovqatlanish"],
    ["📱", "Paynet / Aloqa"],
    ["🛒", "Oziq-ovqat"],
    ["🏠", "Uy-ro‘zg‘or"],
    ["💊", "Dori-darmon"],
    ["👕", "Kiyim-kechak"],
    ["🎓", "Ta’lim"],
    ["🎮", "Ko‘ngilochar"],
    ["☕", "Kafe / Qahvaxona"],
    ["💻", "Internet / Texnologiya"],
    ["🏥", "Sog‘liq"],
    ["🎁", "Sovg‘alar"],
    ["💳", "Kredit / To‘lovlar"],
    ["📦", "Boshqa"]
];

// ========================================
// USER STATES
// ========================================

const userStates = new Map();

function setState(userId, state) {
    userStates.set(userId, state);
}

function getState(userId) {
    return userStates.get(userId);
}

function clearState(userId) {
    userStates.delete(userId);
}

// ========================================
// HELPERS
// ========================================

function formatMoney(amount) {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so‘m";
}

function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getUser(userId) {
    return db
        .prepare(
            "SELECT * FROM users WHERE telegram_id = ?"
        )
        .get(userId);
}

function createUser(ctx) {
    let user = getUser(ctx.from.id);

    if (user) {
        return user;
    }

    db.prepare(`
        INSERT INTO users (
            telegram_id,
            first_name,
            username
        )
        VALUES (?, ?, ?)
    `).run(
        ctx.from.id,
        ctx.from.first_name || "",
        ctx.from.username || ""
    );

    return getUser(ctx.from.id);
}

function mainMenu() {
    return Markup.keyboard([
        ["➕ Xarajat qo‘shish", "📊 Bugungi xarajatlar"],
        ["📅 Haftalik hisobot", "📆 Oylik hisobot"],
        ["📈 Statistika", "💰 Budjet"],
        ["🗂 Kategoriyalar", "⚙️ Sozlamalar"]
    ]).resize();
}

function categoryKeyboard() {
    const rows = [];

    for (let i = 0; i < categories.length; i += 2) {
        const row = [];

        row.push(
            Markup.button.callback(
                `${categories[i][0]} ${categories[i][1]}`,
                `category_${i}`
            )
        );

        if (categories[i + 1]) {
            row.push(
                Markup.button.callback(
                    `${categories[i + 1][0]} ${categories[i + 1][1]}`,
                    `category_${i + 1}`
                )
            );
        }

        rows.push(row);
    }

    rows.push([
        Markup.button.callback(
            "❌ Bekor qilish",
            "cancel"
        )
    ]);

    return Markup.inlineKeyboard(rows);
}

function cleanAmount(text) {
    const cleaned = text
        .replace(/\s/g, "")
        .replace(/,/g, "")
        .replace(/\./g, "");

    return Number(cleaned);
}

// ========================================
// START
// ========================================

bot.start(async (ctx) => {
    createUser(ctx);
    clearState(ctx.from.id);

    await ctx.reply(
        `💰 Assalomu alaykum, ${ctx.from.first_name || "do‘st"}!

Men sizning shaxsiy xarajatlar hisoblagichingizman.

Har kuni qilgan xarajatlaringizni kiriting va pulingiz qayerga ketayotganini nazorat qiling.

📊 Kunlik
📅 Haftalik
📆 Oylik
📈 Statistikalar

hammasini avtomatik hisoblab beraman.`,
        mainMenu()
    );
});

// ========================================
// ADD EXPENSE
// ========================================

bot.hears("➕ Xarajat qo‘shish", async (ctx) => {
    clearState(ctx.from.id);

    await ctx.reply(
        "🗂 Xarajat kategoriyasini tanlang:",
        categoryKeyboard()
    );
});

// ========================================
// CATEGORY
// ========================================

bot.action(/^category_(\d+)$/, async (ctx) => {
    const index = Number(ctx.match[1]);
    const category = categories[index];

    if (!category) {
        await ctx.answerCbQuery("Kategoriya topilmadi");
        return;
    }

    setState(ctx.from.id, {
        step: "expense_amount",
        category: category[1]
    });

    await ctx.answerCbQuery();

    await ctx.editMessageText(
        `🗂 Kategoriya: ${category[0]} ${category[1]}

💰 Qancha summa sarfladingiz?

Masalan:
25000`
    );
});

// ========================================
// SAVE EXPENSE
// ========================================

bot.action("save_expense", async (ctx) => {
    const userId = ctx.from.id;
    const state = getState(userId);

    if (!state || state.step !== "expense_confirm") {
        await ctx.answerCbQuery("Ma’lumot topilmadi");
        return;
    }

    db.prepare(`
        INSERT INTO expenses (
            telegram_id,
            category,
            amount,
            description,
            expense_date
        )
        VALUES (?, ?, ?, ?, ?)
    `).run(
        userId,
        state.category,
        state.amount,
        state.description,
        getToday()
    );

    clearState(userId);

    const result = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE telegram_id = ?
        AND expense_date = ?
    `).get(userId, getToday());

    await ctx.answerCbQuery("Saqlandi!");

    await ctx.editMessageText(
        `✅ Xarajat saqlandi!

🗂 ${state.category}
💰 ${formatMoney(state.amount)}

━━━━━━━━━━━━
💸 Bugungi jami:
${formatMoney(result.total)}`
    );

    await ctx.reply(
        "👇 Kerakli amalni tanlang:",
        mainMenu()
    );
});

// ========================================
// CANCEL
// ========================================

bot.action("cancel", async (ctx) => {
    clearState(ctx.from.id);

    await ctx.answerCbQuery("Bekor qilindi");

    try {
        await ctx.editMessageText(
            "❌ Amal bekor qilindi."
        );
    } catch {
        await ctx.reply(
            "❌ Amal bekor qilindi.",
            mainMenu()
        );
    }
});

// ========================================
// TODAY EXPENSES
// ========================================

bot.hears("📊 Bugungi xarajatlar", async (ctx) => {
    const userId = ctx.from.id;

    const expenses = db.prepare(`
        SELECT *
        FROM expenses
        WHERE telegram_id = ?
        AND expense_date = ?
        ORDER BY id DESC
    `).all(
        userId,
        getToday()
    );

    if (expenses.length === 0) {
        await ctx.reply(
            `📊 BUGUNGI XARAJATLAR

Hozircha xarajat kiritilmagan.

➕ “Xarajat qo‘shish” tugmasini bosing.`,
            mainMenu()
        );

        return;
    }

    let message = "📊 BUGUNGI XARAJATLAR\n\n";
    let total = 0;

    expenses.forEach((expense, index) => {
        total += expense.amount;

        message += `${index + 1}. ${expense.category}\n`;
        message += `💰 ${formatMoney(expense.amount)}\n`;

        if (expense.description) {
            message += `📝 ${expense.description}\n`;
        }

        message += "\n";
    });

    message += "━━━━━━━━━━━━\n";
    message += `💰 JAMI: ${formatMoney(total)}`;

    await ctx.reply(
        message,
        mainMenu()
    );
});

// ========================================
// WEEKLY REPORT
// ========================================

bot.hears("📅 Haftalik hisobot", async (ctx) => {
    const userId = ctx.from.id;

    const result = db.prepare(`
        SELECT
            category,
            SUM(amount) AS total
        FROM expenses
        WHERE telegram_id = ?
        AND expense_date >= date('now', '-6 days', 'localtime')
        AND expense_date <= date('now', 'localtime')
        GROUP BY category
        ORDER BY total DESC
    `).all(userId);

    if (result.length === 0) {
        await ctx.reply(
            `📅 HAFTALIK HISOBOT

Oxirgi 7 kun ichida xarajat kiritilmagan.`,
            mainMenu()
        );

        return;
    }

    let message = "📅 HAFTALIK HISOBOT\n\n";
    let total = 0;

    result.forEach((item) => {
        total += item.total;

        message += `${item.category}\n`;
        message += `💰 ${formatMoney(item.total)}\n\n`;
    });

    const average = Math.round(total / 7);

    message += "━━━━━━━━━━━━\n";
    message += `💰 Jami: ${formatMoney(total)}\n`;
    message += `📊 Kunlik o‘rtacha: ${formatMoney(average)}\n\n`;
    message += "🔥 Eng ko‘p xarajat:\n";
    message += `${result[0].category} — ${formatMoney(result[0].total)}`;

    await ctx.reply(
        message,
        mainMenu()
    );
});

// ========================================
// MONTHLY REPORT
// ========================================

bot.hears("📆 Oylik hisobot", async (ctx) => {
    const userId = ctx.from.id;

    const result = db.prepare(`
        SELECT
            category,
            SUM(amount) AS total
        FROM expenses
        WHERE telegram_id = ?
        AND strftime('%Y-%m', expense_date)
            = strftime('%Y-%m', 'now', 'localtime')
        GROUP BY category
        ORDER BY total DESC
    `).all(userId);

    if (result.length === 0) {
        await ctx.reply(
            `📆 OYLIK HISOBOT

Bu oyda xarajat kiritilmagan.`,
            mainMenu()
        );

        return;
    }

    let message = "📆 OYLIK HISOBOT\n\n";
    let total = 0;

    result.forEach((item) => {
        total += item.total;

        message += `${item.category}\n`;
        message += `💰 ${formatMoney(item.total)}\n\n`;
    });

    const days = new Date().getDate();
    const average = Math.round(total / days);

    message += "━━━━━━━━━━━━\n";
    message += `💰 Jami: ${formatMoney(total)}\n`;
    message += `📊 Kunlik o‘rtacha: ${formatMoney(average)}\n\n`;
    message += "🔥 Eng ko‘p xarajat:\n";
    message += `${result[0].category} — ${formatMoney(result[0].total)}`;

    await ctx.reply(
        message,
        mainMenu()
    );
});

// ========================================
// STATISTICS
// ========================================

bot.hears("📈 Statistika", async (ctx) => {
    const userId = ctx.from.id;

    const month = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE telegram_id = ?
        AND strftime('%Y-%m', expense_date)
            = strftime('%Y-%m', 'now', 'localtime')
    `).get(userId);

    const all = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE telegram_id = ?
    `).get(userId);

    const top = db.prepare(`
        SELECT
            category,
            SUM(amount) AS total
        FROM expenses
        WHERE telegram_id = ?
        GROUP BY category
        ORDER BY total DESC
        LIMIT 1
    `).get(userId);

    let message = `📈 SIZNING STATISTIKANGIZ

💰 Bu oy:
${formatMoney(month.total)}

💵 Barcha vaqt:
${formatMoney(all.total)}

`;

    if (top) {
        message += `🔥 Eng ko‘p xarajat:
${top.category}
${formatMoney(top.total)}`;
    } else {
        message += "📭 Hozircha statistika mavjud emas.";
    }

    await ctx.reply(
        message,
        mainMenu()
    );
});

// ========================================
// BUDGET
// ========================================

bot.hears("💰 Budjet", async (ctx) => {
    const userId = ctx.from.id;
    const user = getUser(userId);

    const currentMonth = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE telegram_id = ?
        AND strftime('%Y-%m', expense_date)
            = strftime('%Y-%m', 'now', 'localtime')
    `).get(userId);

    let message = `💰 BUDJET

💵 Oylik budjet:
${formatMoney(user.monthly_budget)}

📊 Bu oy sarflandi:
${formatMoney(currentMonth.total)}
`;

    if (user.monthly_budget > 0) {
        const remaining =
            user.monthly_budget - currentMonth.total;

        message += "\n";

        if (remaining >= 0) {
            message += `✅ Qolgan:
${formatMoney(remaining)}`;
        } else {
            message += `🚨 Budjetdan oshib ketdingiz!

Ortiqcha:
${formatMoney(Math.abs(remaining))}`;
        }
    } else {
        message += "\n⚠️ Hali oylik budjet belgilanmagan.";
    }

    await ctx.reply(
        message,
        Markup.inlineKeyboard([
            [
                Markup.button.callback(
                    "✏️ Budjet belgilash",
                    "set_budget"
                )
            ]
        ])
    );
});

// ========================================
// SET BUDGET
// ========================================

bot.action("set_budget", async (ctx) => {
    setState(ctx.from.id, {
        step: "budget"
    });

    await ctx.answerCbQuery();

    await ctx.reply(
        `💰 Oylik budjetingizni kiriting.

Masalan:
5000000`
    );
});

// ========================================
// CATEGORIES
// ========================================

bot.hears("🗂 Kategoriyalar", async (ctx) => {
    let message = "🗂 XARAJAT KATEGORIYALARI\n\n";

    categories.forEach((category) => {
        message += `${category[0]} ${category[1]}\n`;
    });

    await ctx.reply(
        message,
        mainMenu()
    );
});

// ========================================
// SETTINGS
// ========================================

bot.hears("⚙️ Sozlamalar", async (ctx) => {
    const user = getUser(ctx.from.id);

    await ctx.reply(
        `⚙️ SOZLAMALAR

👤 Ism:
${user.first_name || "Noma’lum"}

💰 Oylik budjet:
${formatMoney(user.monthly_budget)}

💵 Valyuta:
UZS — so‘m`,
        mainMenu()
    );
});

// ========================================
// TEXT INPUT
// ========================================

bot.on("text", async (ctx) => {
    const userId = ctx.from.id;
    const state = getState(userId);

    if (!state) {
        await ctx.reply(
            "👇 Menyudan kerakli amalni tanlang.",
            mainMenu()
        );

        return;
    }

    const text = ctx.message.text.trim();

    // ====================================
    // EXPENSE AMOUNT
    // ====================================

    if (state.step === "expense_amount") {
        const amount = cleanAmount(text);

        if (!Number.isInteger(amount) || amount <= 0) {
            await ctx.reply(
                "❌ Summa noto‘g‘ri.\n\nMasalan:\n25000"
            );

            return;
        }

        setState(userId, {
            step: "expense_description",
            category: state.category,
            amount: amount
        });

        await ctx.reply(
            `💰 Summa:
${formatMoney(amount)}

📝 Xarajat haqida izoh yozing.

Masalan:
Lavash va cola

Agar izoh kerak bo‘lmasa:
o‘tkazib yuborish`
        );

        return;
    }

    // ====================================
    // EXPENSE DESCRIPTION
    // ====================================

    if (state.step === "expense_description") {
        let description = text;

        const skipWords = [
            "o‘tkazib yuborish",
            "otkazib yuborish",
            "o'tkazib yuborish",
            "skip",
            "yo‘q",
            "yo'q"
        ];

        if (skipWords.includes(text.toLowerCase())) {
            description = "";
        }

        setState(userId, {
            step: "expense_confirm",
            category: state.category,
            amount: state.amount,
            description: description
        });

        await ctx.reply(
            `🧾 XARAJAT

🗂 Kategoriya:
${state.category}

💰 Summa:
${formatMoney(state.amount)}

📝 Izoh:
${description || "Izoh yo‘q"}

📅 Sana:
${getToday()}

Xarajatni saqlaymizmi?`,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        "✅ Saqlash",
                        "save_expense"
                    ),
                    Markup.button.callback(
                        "❌ Bekor qilish",
                        "cancel"
                    )
                ]
            ])
        );

        return;
    }

    // ====================================
    // BUDGET
    // ====================================

    if (state.step === "budget") {
        const amount = cleanAmount(text);

        if (!Number.isInteger(amount) || amount <= 0) {
            await ctx.reply(
                "❌ Budjet noto‘g‘ri.\n\nMasalan:\n5000000"
            );

            return;
        }

        db.prepare(`
            UPDATE users
            SET monthly_budget = ?
            WHERE telegram_id = ?
        `).run(
            amount,
            userId
        );

        clearState(userId);

        await ctx.reply(
            `✅ Oylik budjet saqlandi!

💰 Budjet:
${formatMoney(amount)}`,
            mainMenu()
        );

        return;
    }
});

// ========================================
// ERROR HANDLER
// ========================================

bot.catch(async (error, ctx) => {
    console.error("❌ BOT ERROR:", error);

    try {
        await ctx.reply(
            "❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring."
        );
    } catch {
        // Telegram javob bera olmasa hech narsa qilmaymiz
    }
});

// ========================================
// START BOT
// ========================================

bot.launch()
    .then(() => {
        console.log("=================================");
        console.log("💰 Kunlik Xarajatlar Bot");
        console.log("🤖 Bot ishga tushdi!");
        console.log("=================================");
    })
    .catch((error) => {
        console.error("❌ Bot ishga tushmadi:");
        console.error(error);
    });

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.once("SIGINT", () => {
    bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
});