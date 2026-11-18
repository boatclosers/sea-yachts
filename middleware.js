// Show the personal page when someone visits garrychupurdyjr.com.
// Everything on seayachts.net is unchanged.
export const config = { matcher: "/" };

export default function middleware(request) {
  const host = (request.headers.get("host") || "").replace(/^www\./, "");
  if (host === "garrychupurdyjr.com") {
    return new Response(null, {
      headers: { "x-middleware-rewrite": new URL("/personal/index.html", request.url).toString() },
    });
  }
}
