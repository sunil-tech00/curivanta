/* Umami Cloud analytics (cookieless — no consent banner needed), shared by every page on
   curivanta.com. Does nothing until WEBSITE_ID is set. Pages log events with
   window.cvTrack("event_name", { optional: "data" }); calls before the tracker loads are queued.
   Visit any page with ?notrack to stop counting your own visits in this browser (?track undoes it). */
(function () {
  "use strict";
  var WEBSITE_ID = "2588718b-ee85-4be3-aaa6-aa687f22f567"; // Umami → Settings → Websites → Edit → Website ID
  var SRC = "https://cloud.umami.is/script.js";

  var queue = [];
  window.cvTrack = function (name, data) {
    try {
      if (window.umami && typeof window.umami.track === "function") window.umami.track(name, data);
      else if (queue.length < 50) queue.push([name, data]);
    } catch (e) {}
  };

  try {
    var params = new URLSearchParams(location.search);
    if (params.has("notrack") || params.has("bypass")) localStorage.setItem("umami.disabled", "1");
    if (params.has("track")) localStorage.removeItem("umami.disabled");
  } catch (e) {}

  // Keeps private values out of analytics: saved-report ids and Stripe session ids.
  var DROP = ["paid", "session", "id", "bypass", "notrack", "track"];
  function clean(u) {
    if (!u) return u;
    try {
      var abs = /^https?:/i.test(u);
      var url = new URL(u, location.origin);
      if (abs && url.host !== location.host) return u;
      url.pathname = url.pathname.replace(/^\/solar\/report\/[^/]+/, "/solar/report/:id");
      DROP.forEach(function (k) { url.searchParams.delete(k); });
      return abs ? url.href : url.pathname + url.search + url.hash;
    } catch (e) {
      return u;
    }
  }
  window.cvBeforeSend = function (type, payload) {
    if (payload) {
      if (payload.url) payload.url = clean(payload.url);
      if (payload.referrer) payload.referrer = clean(payload.referrer);
    }
    return payload;
  };

  if (!WEBSITE_ID) return;
  var s = document.createElement("script");
  s.src = SRC;
  s.defer = true;
  s.setAttribute("data-website-id", WEBSITE_ID);
  s.setAttribute("data-domains", "curivanta.com,www.curivanta.com");
  s.setAttribute("data-before-send", "cvBeforeSend");
  s.onload = function () {
    var q = queue.splice(0);
    q.forEach(function (e) { window.cvTrack(e[0], e[1]); });
  };
  document.head.appendChild(s);
})();
