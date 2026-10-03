// Sitemap for search engines: the homepage plus every published deal page.
// Updates itself whenever deals are published, hidden or deleted.
const SUPABASE_URL = "https://zpokavgizlkwukmonihj.supabase.co";
const SUPABASE_KEY = "sb_publishable_MLFS-SAOVwE5asfMxpBL1Q_Ub7g5ly7";
const SITE = "https://seayachts.net";
const title = (d) => [d.year, d.builder, d.model].filter(Boolean).join(" ");
const slug = (d) => {
  const w = title(d).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (w ? w + "-" : "") + String(d.id).slice(0, 6);
};

module.exports = async (req, res) => {
  let deals = [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/deals?published=eq.true&select=id,year,builder,model,updated_at`, { headers: { apikey: SUPABASE_KEY } });
    deals = r.ok ? await r.json() : [];
  } catch (e) { deals = []; }
  const pages = ["/", "/buyer-representation", "/selling", "/exports"];
  const urls = pages.map((p) => `<url><loc>${SITE}${p}</loc></url>`).concat(
    deals.map((d) => `<url><loc>${SITE}/deals/${slug(d)}</loc><lastmod>${new Date(d.updated_at).toISOString().slice(0, 10)}</lastmod></url>`)
  );
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
};
