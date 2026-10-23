// Renders a real, searchable page for one good-value deal:
//   seayachts.net/deals/2014-hinckley-picnic-boat-37-mkiii-ab12cd
// The last 6 characters of the address identify the boat.
const SUPABASE_URL = "https://zpokavgizlkwukmonihj.supabase.co";
const SUPABASE_KEY = "sb_publishable_MLFS-SAOVwE5asfMxpBL1Q_Ub7g5ly7"; // public key: reads published deals only
const SITE = "https://seayachts.net";

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const title = (d) => [d.year, d.builder, d.model].filter(Boolean).join(" ");
const slug = (d) => {
  const w = title(d).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (w ? w + "-" : "") + String(d.id).slice(0, 6);
};
const money = (n) => "$" + Number(n).toLocaleString("en-US");
const day = (t) => new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/* Line drawings of each boat type, used when a deal has no photo of its own. */
function boatKind(d) {
  var s = ((d.builder || "") + " " + (d.model || "")).toLowerCase();
  if (/leopard|lagoon|aquila|fountaine|catamaran|powercat|\bcat\b/.test(s)) return "cat";
  if (/krogen|nordhavn|selene|grand banks|fleming|trawler|defever|mainship/.test(s)) return "trawler";
  if (/contender|regulator|yellowfin|seavee|sea vee|freeman|invincible|everglades|grady|whaler|center console|\bst\b|\bcc\b/.test(s)) return "console";
  if (/viking|bertram|hatteras.*(convertible|gt|\d+c\b)|cabo.*(flybridge|fb)|convertible|sport ?fish|jarrett|ocean yachts|spencer|merritt/.test(s)) return "sportfish";
  if (/sabre|back cove|hinckley|tiara|cabo|express|picnic|downeast|eastbay|pursuit|sundancer|coupe/.test(s)) return "express";
  return "motoryacht";
}
function boatArt(d) {
  var k = boatKind(d);
  var N = "#0E2235", T = "#8A4B2A", W = "#FFFFFF", G = "#C9D6D6";
  var st = 'fill="none" stroke="' + N + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  var hullFill = 'fill="' + W + '" stroke="' + N + '" stroke-width="2.4" stroke-linejoin="round"';
  var glass = 'fill="' + N + '" opacity="0.85"';
  var parts = {
    sportfish:
      '<path d="M178 96 L206 28 M292 96 L258 28 M196 28 H268" ' + st + '/>' +
      '<path d="M232 96 L110 24 M250 96 L370 24" fill="none" stroke="' + N + '" stroke-width="1.4"/>' +
      '<path d="M150 112 V98 H300 L314 112 Z" ' + hullFill + '/>' +
      '<path d="M110 136 V114 H318 Q350 118 372 132 Z" ' + hullFill + '/>' +
      '<path d="M130 124 H310 L318 130 H130 Z" ' + glass + '/>' +
      '<path d="M46 136 H372 Q420 130 456 118 Q446 160 410 184 H72 Q54 166 46 136 Z" ' + hullFill + '/>' +
      '<path d="M66 172 H418" stroke="' + T + '" stroke-width="5"/>',
    motoryacht:
      '<path d="M170 76 H300 L322 92 H160 Z" ' + hullFill + '/>' +
      '<path d="M130 112 V92 H330 Q356 98 372 112 Z" ' + hullFill + '/>' +
      '<path d="M150 100 H332 L346 106 H150 Z" ' + glass + '/>' +
      '<path d="M96 138 V112 H380 Q404 120 420 136 Z" ' + hullFill + '/>' +
      '<path d="M116 122 H382 L396 128 H116 Z" ' + glass + '/>' +
      '<path d="M40 138 H420 Q440 132 462 120 Q452 162 414 186 H66 Q48 168 40 138 Z" ' + hullFill + '/>' +
      '<path d="M120 154 h22 M160 154 h22 M200 154 h22" stroke="' + N + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M60 176 H422" stroke="' + T + '" stroke-width="5"/>' +
      '<path d="M240 76 V58 M232 62 H252" ' + st + '/>',
    trawler:
      '<path d="M238 92 V40 M238 52 L196 92 M238 52 L280 92" ' + st + '/>' +
      '<path d="M170 106 V92 H300 V106 Z" ' + hullFill + '/>' +
      '<path d="M120 132 V106 H330 L348 132 Z" ' + hullFill + '/>' +
      '<path d="M138 114 h30 v10 h-30 z M182 114 h30 v10 h-30 z M226 114 h30 v10 h-30 z M270 114 h40 l6 10 h-46 z" ' + glass + '/>' +
      '<path d="M56 134 H346 Q400 126 444 104 Q438 156 404 188 H84 Q62 170 56 134 Z" ' + hullFill + '/>' +
      '<path d="M76 176 H414" stroke="' + T + '" stroke-width="5"/>' +
      '<path d="M100 150 h300" stroke="' + N + '" stroke-width="1.4"/>',
    express:
      '<path d="M178 112 L196 84 H300 L318 96 Z" ' + hullFill + '/>' +
      '<path d="M196 88 H296 L306 96 H190 Z" ' + glass + '/>' +
      '<path d="M120 138 V112 H330 Q356 118 374 136 Z" ' + hullFill + '/>' +
      '<path d="M142 120 H322 L332 126 H142 Z" ' + glass + '/>' +
      '<path d="M50 138 H374 Q414 132 450 122 Q440 162 404 184 H74 Q56 166 50 138 Z" ' + hullFill + '/>' +
      '<path d="M70 172 H412" stroke="' + T + '" stroke-width="5"/>',
    console:
      '<path d="M176 84 H292 M196 84 L200 132 M276 84 L270 132" ' + st + '/>' +
      '<path d="M170 80 H298 L292 88 H176 Z" ' + hullFill + '/>' +
      '<path d="M206 132 V112 H262 L272 132 Z" ' + hullFill + '/>' +
      '<path d="M214 114 H258 L264 124 H214 Z" ' + glass + '/>' +
      '<path d="M84 140 H360 Q404 134 446 124 Q436 160 400 182 H100 Q88 166 84 140 Z" ' + hullFill + '/>' +
      '<path d="M54 120 h30 v52 h-18 l-12 -18 z M40 126 h30 v52 h-18 l-12 -18 z" ' + hullFill + '/>' +
      '<path d="M100 170 H410" stroke="' + T + '" stroke-width="5"/>',
    cat:
      '<path d="M150 96 H320 L334 106 H140 Z" ' + hullFill + '/>' +
      '<path d="M112 132 V106 H346 Q368 112 384 130 Z" ' + hullFill + '/>' +
      '<path d="M132 114 H340 L352 122 H132 Z" ' + glass + '/>' +
      '<path d="M60 132 H420 V148 H60 Z" ' + hullFill + '/>' +
      '<path d="M60 148 H440 Q436 168 418 182 H76 Q64 168 60 148 Z" ' + hullFill + '/>' +
      '<path d="M80 172 H420" stroke="' + T + '" stroke-width="5"/>'
  };
  return '<svg viewBox="0 0 480 270" role="img" aria-label="Drawing of a ' + ({ sportfish: "sportfish", motoryacht: "motor yacht", trawler: "trawler", express: "express cruiser", console: "center console", cat: "catamaran" })[k] + '" preserveAspectRatio="xMidYMid meet">' +
    '<rect width="480" height="270" fill="#E9EFEE"/>' +
    '<path d="M0 196 H480 V270 H0 Z" fill="' + G + '"/>' +
    '<path d="M0 196 H480" stroke="' + N + '" stroke-width="1.4"/>' +
    '<path d="M30 214 h60 M130 222 h80 M260 212 h70 M370 226 h70 M60 240 h50 M300 244 h60" stroke="' + N + '" stroke-width="1.2" opacity="0.35"/>' +
    '<g transform="translate(0 16)">' + parts[k] + '</g>' +
  '</svg>';
}

const CSS = `
:root{--navy:#0E2235;--paper:#FBFBF9;--white:#fff;--glass:#E9EFEE;--ink:#0E2235;--muted:#5C6A73;--rule:rgba(14,34,53,.16);--teak:#8A4B2A;
--serif:"Newsreader",Georgia,serif;--sans:"Albert Sans","Helvetica Neue",Arial,sans-serif;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
*,*::before,*::after{box-sizing:inherit}body{margin:0;background:var(--paper);color:var(--ink);font:400 1.0625rem/1.6 var(--sans)}
a{color:inherit;text-decoration:none}h1,h2,h3{font-family:var(--serif);font-weight:400;margin:0;letter-spacing:-.01em}
.wrap{max-width:1100px;margin:0 auto;padding:0 clamp(22px,4vw,48px)}
header{border-bottom:1px solid var(--rule)}header .wrap{display:flex;justify-content:space-between;align-items:center;height:80px;gap:16px}
.wordmark{font-family:var(--serif);font-size:1.5rem}.call{background:var(--navy);color:var(--paper);padding:10px 18px;font-size:.95rem}.call:hover{background:var(--teak)}
.crumb{padding:28px 0 0;font-size:.92rem;color:var(--muted)}.crumb a{border-bottom:1px solid var(--rule)}
main{padding:20px 0 90px}.grid{display:grid;grid-template-columns:6fr 5fr;gap:clamp(28px,5vw,72px);align-items:start;margin-top:22px}
.photo{margin:0 0 22px;aspect-ratio:4/3;overflow:hidden;border:1px solid var(--rule);background:var(--glass)}.photo img{width:100%;height:100%;object-fit:cover;display:block}
.tag{display:inline-block;font-size:.82rem;font-weight:600;color:var(--teak);margin-bottom:10px}
h1{font-size:clamp(2rem,4.4vw,3.2rem);line-height:1.08;margin-bottom:18px}
dl{display:grid;grid-template-columns:auto 1fr;gap:6px 20px;margin:0 0 22px}dt{color:var(--muted)}dd{margin:0}.ask{font-family:var(--serif);font-size:1.4rem}
.links{display:flex;flex-wrap:wrap;gap:12px 22px;align-items:center}
.btn{display:inline-block;background:var(--navy);color:var(--paper);padding:14px 24px;font-weight:500}.btn:hover{background:var(--teak)}
.textlink{border-bottom:1px solid var(--rule)}.textlink:hover{color:var(--teak);border-color:var(--teak)}
button.textlink{font:inherit;background:none;border:0;border-bottom:1px solid var(--rule);padding:0;cursor:pointer;color:var(--ink)}
.checked{font-size:.88rem;color:var(--muted);margin:16px 0 0}
.note{margin:16px 0 0;padding:12px 14px;background:var(--white);border-left:3px solid var(--teak);font-size:.94rem}.note a{font-weight:600;border-bottom:1px solid var(--teak)}
.take{background:var(--white);border-left:3px solid var(--teak);padding:28px 30px}.take small{display:block;color:var(--muted);font-size:.86rem;margin-bottom:8px}
.take h2{font-size:1.6rem;line-height:1.25;margin-bottom:16px}.take p{margin:0 0 .9em}
.sold{background:var(--navy);color:var(--paper);padding:18px 22px;margin:22px 0 0}.sold a{border-bottom:1px solid var(--paper);font-weight:600}
.disclaimer{margin-top:48px;border-left:3px solid var(--teak);background:rgba(255,255,255,.6);padding:16px 22px;max-width:860px}
.disclaimer p{margin:0 0 8px;font-size:.92rem;color:var(--muted)}.disclaimer p:last-child{margin:0;color:var(--ink)}
.rep{margin-top:22px;background:var(--navy);color:var(--paper);padding:22px 24px}.rep p{margin:0 0 14px}.rep b{display:block;font-family:var(--serif);font-weight:400;font-size:1.35rem;margin-bottom:4px}
.rep .acts{display:flex;flex-wrap:wrap;gap:10px}.rep .acts a{padding:12px 18px;font-weight:500;border:1px solid rgba(251,251,249,.5)}.rep .acts a.primary{background:var(--paper);color:var(--navy);border-color:var(--paper)}.rep .acts a:hover{background:var(--teak);color:var(--paper);border-color:var(--teak)}
  /* "See all photos": blue button, leaving-site notice and welcome-back bar */   .photos-btn { display: inline-flex; align-items: center; gap: 6px; background: #1F5FAD; color: #FFFFFF; border: 0; padding: 10px 16px; font-family: inherit; font-size: 0.95rem; font-weight: 500; cursor: pointer; text-decoration: none; }   .photos-btn:hover { background: #174A87; color: #FFFFFF; }   .deal-art { position: relative; margin: 0; aspect-ratio: 16 / 9; overflow: hidden; border: 1px solid rgba(14,34,53,0.16); background: #E9EFEE; }   .deal-art svg { width: 100%; height: 100%; display: block; }   .deal-art .art-note { position: absolute; left: 10px; bottom: 10px; font-size: 0.75rem; color: #0E2235; background: rgba(255,255,255,0.85); padding: 3px 8px; }   .deal-art .art-photos { position: absolute; right: 10px; bottom: 10px; padding: 7px 12px; font-size: 0.85rem; }   .deal-art .tag-over { position: absolute; top: 12px; left: 12px; background: #FFFFFF; color: #8A4B2A; font-size: 0.8rem; font-weight: 600; padding: 4px 10px; }   dialog.leave { border: 0; padding: 0; width: min(92vw, 520px); max-width: none; color: #0E2235; box-shadow: 0 20px 60px rgba(14,34,53,0.35); }   dialog.leave::backdrop { background: rgba(14,34,53,0.55); }   .leave-in { padding: 30px 30px 26px; }   .leave h3 { font-family: "Newsreader", Georgia, serif; font-weight: 400; font-size: 1.6rem; margin: 0 0 12px; }   .leave p { margin: 0 0 14px; line-height: 1.55; max-width: none; }   .leave .warn { border-left: 3px solid #8A4B2A; padding: 10px 14px; background: #F4F1EC; }   .leave .acts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }   .leave .stay { background: none; border: 1px solid #0E2235; padding: 10px 16px; font-family: inherit; font-size: 0.95rem; font-weight: 500; cursor: pointer; color: #0E2235; }   .back-bar { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 50; max-width: 760px; margin: 0 auto; background: #0E2235; color: #FBFBF9; padding: 14px 16px; display: flex; flex-wrap: wrap; gap: 10px 12px; align-items: center; box-shadow: 0 12px 40px rgba(14,34,53,0.35); }   .back-bar[hidden] { display: none; }   .back-bar p { margin: 0; flex: 1 1 240px; font-size: 0.95rem; max-width: none; }   .back-bar a { padding: 9px 14px; border: 1px solid rgba(251,251,249,0.5); font-weight: 500; font-size: 0.92rem; color: #FBFBF9; }   .back-bar a.primary { background: #FBFBF9; color: #0E2235; }   .back-bar button { background: none; border: 0; color: #FBFBF9; font-size: 1.5rem; line-height: 1; cursor: pointer; padding: 4px 6px; } 
.deal-art{margin:0 0 22px}
.about{margin-top:48px;display:flex;gap:18px;align-items:center;border-top:1px solid var(--rule);padding-top:28px}
.about img{width:72px;height:72px;object-fit:cover;border-radius:50%}.about p{margin:0;color:var(--muted);font-size:.96rem}.about b{color:var(--ink);font-weight:500}
footer{background:var(--navy);color:rgba(251,251,249,.72);font-size:.88rem;padding:30px 0}
@media(max-width:820px){.grid{grid-template-columns:1fr}.take{padding:22px}}`;

function page({ head, body, status }) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20width%3D%2240%22%20height%3D%2240%22%20rx%3D%226%22%20fill%3D%22%230E2235%22/%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%2215%22%20fill%3D%22none%22%20stroke%3D%22%23FBFBF9%22%20stroke-width%3D%221.4%22/%3E%3Cpath%20d%3D%22M20%204%20L23.5%2020%20L20%2036%20L16.5%2020%20Z%22%20fill%3D%22%23FBFBF9%22/%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%222.4%22%20fill%3D%22%23C98A5E%22/%3E%3C/svg%3E">
${head}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Albert+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<header><div class="wrap"><a class="wordmark" href="/" style="display:inline-flex;align-items:center;gap:10px"><svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true" style="flex:none"><circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" stroke-width=".8"/><path d="M20 3 L23 20 L20 37 L17 20 Z" fill="currentColor"/><path d="M3 20 L20 17.5 L37 20 L20 22.5 Z" fill="currentColor" opacity=".45"/><circle cx="20" cy="20" r="2" fill="#8A4B2A"/></svg>Sea Yachts</a><a class="call" href="tel:+17864069904">(786) 406-9904</a></div></header>
${body}
<footer><div class="wrap">&copy; ${new Date().getFullYear()} Sea Yachts LLC. Licensed and bonded Florida yacht brokerage. Garry Chupurdy Jr., Yacht Broker, License EBK 7119.</div></footer>
</body></html>`;
}

function notFound() {
  return page({
    head: `<title>Deal not found | Sea Yachts</title><meta name="robots" content="noindex">`,
    body: `<main class="wrap"><p class="crumb"><a href="/#deals">Good-value deals</a></p>
<h1 style="margin-top:22px">This boat is no longer posted.</h1>
<p style="color:var(--muted);max-width:60ch">It may have sold or been taken down. Tell me what you're looking for and I'll find one like her.</p>
<p><a class="btn" href="/?topic=buy#consult">Start a search</a></p></main>`,
  });
}

module.exports = async (req, res) => {
  const s = String((req.query && req.query.slug) || "").toLowerCase();
  const key = s.slice(-6);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (!/^[0-9a-f]{6}$/.test(key)) { res.statusCode = 404; return res.end(notFound()); }

  let deals = [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/deals?published=eq.true&select=*`, { headers: { apikey: SUPABASE_KEY } });
    deals = r.ok ? await r.json() : [];
  } catch (e) { deals = []; }
  const d = deals.find((x) => String(x.id).slice(0, 6) === key);
  if (!d) { res.statusCode = 404; return res.end(notFound()); }

  const t = title(d);
  const canonical = `${SITE}/deals/${slug(d)}`;
  if (s !== slug(d)) { res.statusCode = 301; res.setHeader("Location", canonical); return res.end(); }

  const sold = d.status === "sold";
  const tag = sold ? "Sold" : d.status === "under_contract" ? "Under contract" : d.tag || "";
  const facts = [d.length_ft ? Number(d.length_ft) + " ft" : "", d.location, d.price ? money(d.price) : ""].filter(Boolean).join(", ");
  const desc = `${d.verdict ? d.verdict + " " : ""}${t}${facts ? ", " + facts : ""}. A licensed captain and buyer's broker's take from Sea Yachts, Palm Beach.`.slice(0, 300);
  const image = d.photo_url || `${SITE}/images/inlet-chart.jpg`;
  const paras = String(d.take || "").split(/\n\s*\n/).filter((x) => x.trim()).map((x) => `<p>${esc(x)}</p>`).join("");
  const askHref = `/?topic=deal&deal=${encodeURIComponent(t)}#consult`;

  const mailHref = `mailto:Garry@SeaYachts.net?subject=${encodeURIComponent(`${t} - please represent me`)}&body=${encodeURIComponent(`Hi Garry,\n\nI'm interested in the ${t} on your site (${canonical}). Can you represent me?\n\n`)}`;
  const smsHref = `sms:+17864069904?&body=${encodeURIComponent(`Hi Garry, I'm interested in the ${t} on your site. Can you represent me?`)}`;

  const head = `<title>${esc(t)}${sold ? " (Sold)" : " for sale"} | Captain's take | Sea Yachts</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Sea Yachts">
<meta property="og:title" content="${esc(t)} | Captain's take from Sea Yachts"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">`;

  const body = `<main class="wrap">
<p class="crumb"><a href="/#deals">Good-value deals</a> / ${esc(t)}</p>
<div class="grid">
  <div>
    ${d.photo_url ? `<figure class="photo"><img src="${esc(d.photo_url)}" alt="${esc(t)}"></figure>` : `<figure class="deal-art">${boatArt(d)}<span class="art-note">Drawing</span>${d.link && !sold ? `<button type="button" class="photos-btn art-photos" data-photos="${esc(d.link)}" data-boat="${esc(t)}" data-page="${esc(canonical)}">See real photos</button>` : ""}</figure>`}
    ${tag ? `<span class="tag">${esc(tag)}</span>` : ""}
    <h1>${esc(t)}</h1>
    <dl>
      ${d.length_ft ? `<dt>Length</dt><dd>${esc(Number(d.length_ft))} ft</dd>` : ""}
      ${d.location ? `<dt>Location</dt><dd>${esc(d.location)}</dd>` : ""}
      ${d.engines ? `<dt>Engines</dt><dd>${esc(d.engines)}</dd>` : ""}
      ${d.price ? `<dt>Asking</dt><dd class="ask">${money(d.price)}</dd>` : ""}
    </dl>
    ${sold ? `<div class="sold">This boat has sold. Looking for one like her? <a href="/?topic=buy#consult">I'll find it</a>.</div>` : `
    <div class="links">
      <a class="btn" href="${esc(askHref)}">Ask me about this boat</a>
      ${d.link ? `<button type="button" class="photos-btn" data-photos="${esc(d.link)}" data-boat="${esc(t)}" data-page="${esc(canonical)}">See all photos &#8599;</button>` : ""}
      <button type="button" class="textlink" id="share">Share</button>
    </div>
    <div class="rep"><p><b>Want me on your side for this boat?</b>The listing broker works for the seller. I'll represent you as your buyer's broker, check her like a captain, run the survey and sea trial, and negotiate the price, usually at no cost to you.</p>
      <div class="acts"><a class="primary" href="${esc(mailHref)}">Email Garry</a><a href="${esc(smsHref)}">Text me</a></div></div>
`}
    ${d.checked_at ? `<p class="checked">Price and availability checked ${day(d.checked_at)}.</p>` : ""}
  </div>
  <div class="take"><small>Captain's take</small><h2>${esc(d.verdict || "")}</h2>${paras}</div>
</div>
<div class="disclaimer">
  <p>This yacht is listed by another brokerage. I'm sharing it because I believe it may represent interesting value based on the information publicly available at the time of posting.</p>
  <p>Sea Yachts is not the listing broker for this yacht. Listing details, pricing, availability and condition may change and should be independently verified with the listing broker.</p>
  <p>If you're interested in this boat, I can represent you as the buyer's broker and work with the listing broker on your behalf.</p>
</div>
<div class="about"><img src="/images/garry.jpg" alt="Garry Chupurdy Jr."><p><b>Garry Chupurdy Jr.</b> Licensed captain since 1998 and yacht broker since 2008. <a class="textlink" href="/#qualifications">More about me</a> &middot; <a class="textlink" href="/#deals">More good-value deals</a></p></div>
</main>
<dialog class="leave" id="leave" aria-labelledby="leave-h"><div class="leave-in">
  <h3 id="leave-h">You&rsquo;re leaving Sea Yachts</h3>
  <p>The photos of the <b id="leave-boat"></b> are on the listing broker&rsquo;s website. It opens in a new tab, and Sea Yachts stays open in this one, so you can come straight back.</p>
  <p class="warn">Remember, the listing broker works for the seller. Before you contact them, let me represent you, usually at no cost to you.</p>
  <div class="acts"><a class="photos-btn" id="leave-go" href="#" target="_blank" rel="noopener">Continue to photos &#8599;</a><button type="button" class="stay" id="leave-stay">Stay on Sea Yachts</button></div>
</div></dialog>
<div class="back-bar" id="back-bar" role="status" hidden><p>Welcome back. Want me on your side for the <b id="back-boat"></b>?</p><a class="primary" id="back-email" href="#">Email Garry</a><a id="back-text" href="#">Text me</a><button type="button" id="back-close" aria-label="Close">&times;</button></div>
<script>
/* "See all photos": warn before leaving for the listing broker's site, then welcome them back */
(function () {
  var dlg = document.getElementById("leave"), go = document.getElementById("leave-go"), bar = document.getElementById("back-bar");
  var away = false, boat = "", page = "";
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-photos]") : null;
    if (!b) return;
    e.preventDefault();
    boat = b.getAttribute("data-boat") || "this boat";
    page = b.getAttribute("data-page") || location.href;
    document.getElementById("leave-boat").textContent = boat;
    go.href = b.getAttribute("data-photos");
    if (dlg.showModal) dlg.showModal(); else { away = true; window.open(go.href, "_blank", "noopener"); }
  });
  go.addEventListener("click", function () { away = true; dlg.close(); });
  document.getElementById("leave-stay").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  function welcomeBack() {
    if (!away) return;
    away = false;
    document.getElementById("back-boat").textContent = boat;
    document.getElementById("back-email").href = "mailto:Garry@SeaYachts.net?subject=" + encodeURIComponent(boat + " - please represent me") +
      "&body=" + encodeURIComponent("Hi Garry,\\n\\nI'm interested in the " + boat + " (" + page + "). Can you represent me?\\n\\n");
    document.getElementById("back-text").href = "sms:+17864069904?&body=" + encodeURIComponent("Hi Garry, I'm interested in the " + boat + " on your site. Can you represent me?");
    bar.hidden = false;
  }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") welcomeBack(); });
  window.addEventListener("focus", welcomeBack);
  document.getElementById("back-close").addEventListener("click", function () { bar.hidden = true; });
})();

(function(){
  var b=document.getElementById("share"); if(!b) return;
  var url=${JSON.stringify(canonical)}, title=${JSON.stringify(t)};
  b.addEventListener("click",function(){
    if(navigator.share){navigator.share({title:title,text:title+" \\u2014 Captain\\u2019s take from Sea Yachts",url:url}).catch(function(){});return;}
    (navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject()).then(function(){b.textContent="Link copied";}).catch(function(){window.prompt("Copy this link:",url);});
  });
})();
</script>`;

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  res.statusCode = 200;
  res.end(page({ head, body }));
};
