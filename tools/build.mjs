// README.md -> jp-data-breach-2026.pdf、および images/*.png を書き出す
// usage: cd tools && npm install && npm run build   （Google Chrome が必要）
//        node build.mjs [repo-dir] [out-dir]          （既定はどちらもリポジトリ直下）
// 画像の数値・文言は下の causes / inds / origins と PERIOD を直接書き換える
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [repo = root, out = repo] = process.argv.slice(2);
fs.mkdirSync(path.join(out, "images"), { recursive: true });

const RED = "#c0392b", NAVY = "#2c3e50", GRAY = "#7f8c8d", BG = "#f6f5f2";
const FONT = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=block">`;
const PERIOD = "2026/1/1〜10/23 19時";
const FOOT = `出典：各社公式発表・専門メディアを突き合わせ（主要64事案、${PERIOD}）｜Synctank-jp｜github.com/Synctank-jp/jp-data-breach-2026`;

// ---------- PDF ----------
const md = fs.readFileSync(path.join(repo, "README.md"), "utf8");
const body = marked.parse(md, { gfm: true });
const pdfHtml = `<!doctype html><html lang="ja"><head><meta charset="utf-8">${FONT}<style>
body{font-family:"Noto Sans JP",sans-serif;font-size:10.5pt;line-height:1.75;color:#222;margin:0}
h1{font-size:21pt;line-height:1.35;margin:0 0 10pt;padding-bottom:6pt;border-bottom:3pt solid ${RED}}
h2{font-size:14pt;margin:20pt 0 8pt;padding-left:8pt;border-left:5pt solid ${RED};line-height:1.4;break-after:avoid}
h3{font-size:11.5pt;margin:14pt 0 6pt;break-after:avoid}
p{margin:6pt 0}
blockquote{margin:10pt 0;padding:8pt 12pt;background:#f2f1ee;border-left:3pt solid #999;color:#444}
blockquote p{margin:0}
hr{border:0;border-top:1px solid #ddd;margin:14pt 0}
ul,ol{padding-left:18pt;margin:6pt 0} li{margin:2pt 0}
table{border-collapse:collapse;width:100%;font-size:8pt;line-height:1.5;margin:8pt 0}
th,td{border:1px solid #ccc;padding:3pt 4pt;vertical-align:top;text-align:left}
th{background:#eceae6;font-weight:700} tr{break-inside:avoid}
td strong{color:${RED}}
a{color:#1f5fa8;text-decoration:none;word-break:break-all}
code{font-size:9pt;background:#f2f1ee;padding:0 2pt}
</style></head><body>${body}</body></html>`;

// ---------- 画像 01: 手口別 ----------
const causes = [
  ["① Webアプリ・APIの脆弱性/仕様・機能悪用", 18, 28, RED],
  ["⑦ 侵入経路未公表・調査中", 27, 42, GRAY],
  ["⑥ ランサムウェア", 7, 11, NAVY],
  ["③ 委託先・SaaS・基盤経由（手口不明）", 7, 11, NAVY],
  ["② 盗まれた・弱い認証情報", 4, 6, NAVY],
  ["⑤ VPN・リモートアクセス機器", 1, 2, NAVY],
  ["④ 設定・管理不備", 0, 0, NAVY],
];
const MAXC = 27;
const card = (n, t) => `<div class="card"><div class="big">${n}</div><div class="ct">${t}</div></div>`;
const img1 = `
<h1>2026年 国内の大規模情報漏えい、手口はなにか</h1>
<div class="sub">主要64事案の「主因」を型別に集計（2026年1月1日〜10月23日19時公表分）</div>
<div class="cards">${card("18件", "Webアプリ・APIの不備が最多。ランサムでもVPNでもない")}${card("23件", "「不正アクセス」「調査中」のみで経路が完全に未公表")}${card("69%", "手口が特定できない事案（部位のみ公表を含む）")}</div>
<div class="bars">${causes.map(([l, n, p, c]) => `<div class="row"><div class="lab">${l}</div><div class="track"><div class="bar" style="width:${Math.max(n / MAXC * 82, 0.6)}%;background:${c}"></div><div class="val"><b>${n}</b> <span>${p}%</span></div></div></div>`).join("")}</div>
<div class="note">①の代表例：ソースネクスト（会員情報取得APIの不正利用・2,252万件）、Gyazo（画像サーバーの脆弱性・2,362万件）、Eストアー（アプリ脆弱性・2,335万人）、KDDI（第三者製ソフトのゼロデイ・1,223万件）、skyticket（管理機能の不正操作・1,464万件）。⑦にはタイムズカー、焼肉きんぐ、バーガーキング、ブックオフ、カプコン、お名前.com、リクルート、ブラストメールなど大規模事案が多数含まれる。</div>`;

// ---------- 画像 02: 業種別 ----------
const inds = [
  ["IT・クラウド・SaaS・通信", 15, "KDDI、Eストアー、Gyazo、IDCF、Studio、ソースネクスト、お名前.com、ブラストメール…"],
  ["小売・EC", 14, "ムラウチ、ミスターマックス、ローソン、ブックオフ、H2O、ファンケル、イオン…"],
  ["メディア・出版・コンテンツ・ゲーム", 9, "日経、コミックシーモア、Renta!、NewsPicks、カプコン、新潟日報社、カーセンサー…"],
  ["運輸・物流・モビリティ", 6, "タイムズカー、京王、ヤマト、佐川、JR東日本、JR九州"],
  ["金融・証券・保険・決済", 4, "アフラック、第一生命、大和証券ほか（i-ask）、IDARE"],
  ["旅行・予約", 4, "skyticket、EPARK、ファインズ、手間いらず"],
  ["飲食", 4, "焼肉きんぐ、バーガーキング、銀のさら、第一興商"],
  ["人材・調査", 2, "ディップ、infoQ"],
  ["医療・製薬", 2, "メドレー@link（787医療機関）、旭化成"],
  ["不動産", 1, "穴吹ハウジング"],
  ["製造・食品", 1, "アサヒ"],
  ["官公庁", 1, "デジタル庁GSS"],
  ["教育", 1, "大阪公立大学"],
];
const img2 = `
<h1>どの業種が漏らしたか</h1>
<div class="sub">主要64事案の業種別分布（委託先・基盤が起点の事案は「IT・クラウド」に計上）</div>
<div class="bars ind">${inds.map(([l, n, d]) => `<div class="row"><div class="lab">${l}</div><div class="track"><div class="bar" style="width:${n / 15 * 46}%;background:${NAVY}"></div><div class="val"><b>${n}</b></div><div class="desc">${d}</div></div></div>`).join("")}</div>
<div class="note">大量漏えいは B2C（小売・飲食・運輸・コンテンツ）と、それを支えるIT基盤に偏る。一方、警察庁のランサムウェア統計（2026年上半期123件）では製造業37件が最多で中小企業が79件。「件数の大きな漏えい＝Web/API層」「業務停止＝VPN/RDP層」の二層構造になっている。</div>`;

// ---------- 画像 03: 波及構造 ----------
const origins = [
  ["IDCフロンティア「IDCFクラウド」", "ランサムウェア（経路未公表）", "495の企業・自治体が障害。JR東日本（206万→漏えいなし）、JR九州、イズミ40万、マウス42万"],
  ["Eストアー「ショップサーブ」", "アプリ脆弱性→不正プログラム", "7,858店・約2,335万6,000人（延べ885万件から最終報で拡大）"],
  ["KDDI ISP向けメール基盤", "第三者製ソフトのゼロデイ", "ISP6社、メール1,223万件・パスワード762万件"],
  ["スカラコミュニケーションズ「i-ask」", "管理サイト不正ログイン→不正プログラム", "大和証券・シチズン・損保ジャパン・オリックス生命、延べ71.3万件"],
  ["Studio（ノーコードWeb制作）", "一部機能の脆弱性", "全登録顧客。LUUP、ラクスル、埼玉県、京都市、デジタル庁（最大1.3万件）などのフォーム内容・APIキー"],
  ["コミューン「Commune」", "通信経路の不備で不正登録・閲覧", "約30.7万人。LINEヤフー DS.LAB、Sansan、パナソニック等"],
  ["ユミルリンク「Cuenote FC」", "脆弱性→認証情報の取得", "5システム、延べ約900万件の配信先。DNP「honto」など"],
  ["日本コロムビアG（第一興商の委託先）", "従業員PC1台のマルウェア感染", "第一興商（ビッグエコー等）約872万件"],
  ["NECの開発・保守委託先", "窃取された正規アカウント", "NEC顧客のサーバー暗号化、大阪大学など"],
  ["ライドオンの利用サーバー運営会社", "ランサムウェア", "銀のさら・釜寅等 最大約650万件"],
  ["ラクスライトクラウド「ブラストメール」", "API用サーバーへの侵入（経路調査中）", "全契約者の販売管理情報。新潟日報社 最大約25.3万人、JR四国 最大約3万件、横浜市など公表先76項目"],
  ["手間いらず「TEMAIRAZU」", "不正アクセス（経路未公表）", "宿泊施設の予約者 最大約445万人"],
];
const img3 = `
<h1>1か所の侵害が、何社に広がったか</h1>
<div class="sub">委託先・SaaS・クラウド基盤を起点とする「波及型」事案の構造</div>
<div class="grid">${origins.map(([t, m, r], i) => `<div class="oc"><div class="ot"><span class="tag">起点${i + 1}</span>${t}</div><div class="om">手口：${m}</div><div class="or">→ ${r}</div></div>`).join("")}</div>
<div class="note">波及型では、委託元が「可能性」ベースの最大値で初報を出し、後から大きく下方修正される（JR東日本・JR九州）一方、起点側の最終報で件数が膨らむこともある（Eストアー）。個人情報保護委員会の年次報告では、委託先からの漏えい2,248件のうち62.8%が不正アクセスで、本体の漏えい（83.5%がヒューマンエラー）と傾向が逆転している。</div>`;

const chartCss = `<style>
body{margin:0;background:${BG};font-family:"Noto Sans JP",sans-serif;color:#1d1d1d}
.wrap{width:1080px;padding:60px}
h1{font-size:36px;margin:0 0 12px;letter-spacing:.01em}
.sub{font-size:16.5px;color:#555;margin-bottom:30px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:30px}
.card{background:#fff;border:1px solid #ddd;border-radius:6px;padding:16px 18px}
.big{font-size:34px;font-weight:700;color:${RED};line-height:1.1}
.ct{font-size:14px;color:#444;margin-top:6px;line-height:1.6}
.row{display:flex;align-items:center;margin:9px 0;min-height:30px}
.lab{width:310px;font-size:17px;line-height:1.35;padding-right:10px}
.ind .lab{width:290px}
.track{flex:1;display:flex;align-items:center}
.bar{height:30px;border-radius:3px;flex:none}
.val{margin-left:12px;font-size:15px;color:#555;white-space:nowrap}
.val b{font-size:20px;color:#1d1d1d}
.desc{margin-left:14px;font-size:13px;color:#555;line-height:1.5}
.note{background:#fff;border-left:4px solid ${RED};padding:16px 18px;font-size:14px;line-height:1.75;color:#333;margin-top:26px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 20px}
.oc{background:#fff;border:1px solid #ddd;border-radius:6px;padding:14px 16px}
.ot{font-size:17px;font-weight:700;margin-bottom:6px}
.tag{background:${RED};color:#fff;font-size:12px;padding:2px 6px;border-radius:3px;margin-right:8px;vertical-align:2px}
.om{font-size:13px;color:#666;margin-bottom:6px}
.or{font-size:14.5px;line-height:1.6}
.foot{border-top:1px solid #ddd;margin-top:30px;padding-top:14px;font-size:12px;color:#777}
</style>`;
const chart = (inner) => `<!doctype html><html lang="ja"><head><meta charset="utf-8">${FONT}${chartCss}</head><body><div class="wrap">${inner}<div class="foot">${FOOT}</div></div></body></html>`;

const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 1200, height: 800 } });
const page = await ctx.newPage();
for (const [name, inner] of [["01_cause-types", img1], ["02_industries", img2], ["03_supply-chain", img3]]) {
  await page.setContent(chart(inner), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".wrap").screenshot({ path: path.join(out, "images", `${name}.png`) });
}
await page.setContent(pdfHtml, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: path.join(out, "jp-data-breach-2026.pdf"), format: "A4", printBackground: true,
  margin: { top: "20mm", bottom: "18mm", left: "17mm", right: "17mm" },
  displayHeaderFooter: true,
  headerTemplate: `<div style="font-size:7.5pt;color:#555;width:100%;padding:0 14mm;font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN',sans-serif">2026年 日本の情報漏えい・不正アクセス・ランサムウェア事案 原因別精査レポート（${PERIOD}）</div>`,
  footerTemplate: `<div style="font-size:7.5pt;color:#555;width:100%;padding:0 14mm;text-align:right;font-family:'Hiragino Sans','Hiragino Kaku Gothic ProN',sans-serif">Synctank-jp ／ <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
});
await browser.close();
console.log("done");
