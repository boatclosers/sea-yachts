/* Click-to-reveal phone number.
   The number is never written into any page, so bots that scrape websites
   for phone numbers can't find it. It is only put together when a real
   person taps a "Show phone" or "Text" button.

   How to use on a page:
     <script src="/phone.js"></script>   (in the <head>)
     <a href="#" data-phone="call">Show phone</a>              tap 1 shows the number, tap 2 calls
     <a href="#" data-phone="call" data-prefix="Call ">Call Garry</a>
     <a href="#" data-phone="sms" data-body="Hi Garry">Text Garry</a>   opens texting right away

   To change the number, edit the three parts below (area code, first 3, last 4). */
(function () {
  var parts = ["786", "406", "9904"];
  var RAW = "+1" + parts.join("");
  var NICE = "(" + parts[0] + ") " + parts[1] + "-" + parts[2];
  window.SY_PHONE = { raw: RAW, nice: NICE };

  /* Capture phase, so this runs before any other click handlers on the page
     (for example the "Text Garry" helper popup on computers). */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("[data-phone]") : null;
    if (!a) return;
    var kind = a.getAttribute("data-phone");
    if (kind === "sms") {
      a.setAttribute("href", "sms:" + RAW + "?&body=" + encodeURIComponent(a.getAttribute("data-body") || ""));
      return; /* let the tap continue and open texting */
    }
    if (a.getAttribute("data-shown")) return; /* number already showing: tap calls it */
    e.preventDefault();
    a.setAttribute("href", "tel:" + RAW);
    a.textContent = (a.getAttribute("data-prefix") || "") + NICE;
    a.setAttribute("data-shown", "1");
  }, true);
})();
