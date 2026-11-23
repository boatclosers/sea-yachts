// garrychupurdyjr.com is served from the /personal folder of this repo.
// The homepage, robots.txt, sitemap.xml and llms.txt on that domain all
// come from /personal so search engines and AI tools see Garry's own files,
// not the Sea Yachts ones. Everything on seayachts.net is unchanged.
export const config = { matcher: ["/", "/robots.txt", "/sitemap.xml", "/llms.txt", "/BingSiteAuth.xml"] };

const PERSONAL = {
  "/": "/personal",
  "/robots.txt": "/personal/robots.txt",
  "/sitemap.xml": "/personal/sitemap.xml",
  "/llms.txt": "/personal/llms.txt",
  "/BingSiteAuth.xml": "/personal/BingSiteAuth.xml", // Bing Webmaster Tools ownership check
};

export default function middleware(request) {
  const host = (request.headers.get("host") || "").replace(/^www\./, "");
  if (host !== "garrychupurdyjr.com") return;
  const target = PERSONAL[new URL(request.url).pathname];
  if (!target) return;
  return new Response(null, {
    headers: { "x-middleware-rewrite": new URL(target, request.url).toString() },
  });
}
