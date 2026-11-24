/* =====================================================================
   [QH4 SLOT 8] CONFIGURAÇÃO DE CONVERSÃO | Pedra Forth Marmoraria
   Tudo que a QH4 precisa preencher antes de publicar fica aqui.
   ===================================================================== */
window.QH4_CONFIG = window.QH4_CONFIG || {
  /* WhatsApp que recebe os leads da LP (DDI + DDD + número, só dígitos).
     Veio do briefing: "número para onde os clientes dos anúncios devem ir". */
  whatsapp: "5535999281011",

  /* Webhook de entrada do CRM (GHL via n8n). Deixe vazio enquanto o CRM não estiver ativo.
     O formulário envia POST JSON no mesmo contrato das LPs QH4 (event_id, utm, lp, lead...).
     Para usar o inbound padrão QH4: "https://webhook.qh4.com.br/webhook/7aad43c8-e41f-437a-81d0-3f7f43e1940a"
     e filtrar no n8n por lp.variant == "lp-pedra-forth". */
  webhook: "",

  /* ID do Meta Pixel do cliente. Preenchendo aqui, o pixel carrega sozinho.
     Se o pixel vier pelo GTM ou pelo [QH4 SLOT 3], deixe vazio para não duplicar o PageView. */
  metaPixelId: "",

  /* Página de obrigado (dispara generate_lead / Lead). Vazio = mostra a confirmação na própria página. */
  thankYouPage: "obrigado.html",

  /* Identificador da LP nos eventos e no payload do CRM */
  lpSlug: "lp-pedra-forth",
  vertical: "marmoraria"
};

/* =====================================================================
   Rastreamento: dataLayer (GTM) + Meta Pixel + gtag, se existirem.
   Eventos:
     whatsapp_click   clique em qualquer link wa.me (wa_local = data-wa do link)
     form_start       primeiro campo do formulário tocado
     generate_lead    envio do formulário (Meta: Lead padrão)
   Não precisa mexer daqui pra baixo.
   ===================================================================== */
(function () {
  "use strict";
  var C = window.QH4_CONFIG;
  window.dataLayer = window.dataLayer || [];

  if (C.metaPixelId && !window.fbq) {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", C.metaPixelId);
    window.fbq("track", "PageView");
  }

  window.QH4Track = function (name, params, metaStandard) {
    params = params || {};
    var dl = { event: name, lp: C.lpSlug };
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) dl[k] = params[k];
    try { window.dataLayer.push(dl); } catch (e) {}
    try {
      if (window.fbq) {
        if (metaStandard) window.fbq("track", metaStandard, params);
        else window.fbq("trackCustom", name, params);
      }
    } catch (e) {}
    try { if (window.gtag) window.gtag("event", name, params); } catch (e) {}
  };

  /* UTMs e click ids guardados na sessão para ir junto com o lead */
  window.QH4Utms = function () {
    var out = {}, keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
    try {
      var q = new URLSearchParams(window.location.search);
      keys.forEach(function (k) {
        var v = q.get(k);
        if (v) sessionStorage.setItem("qh4_" + k, v);
        var saved = sessionStorage.getItem("qh4_" + k);
        if (saved) out[k] = saved;
      });
    } catch (e) {}
    return out;
  };
  window.QH4Utms();

  function cookie(n) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + n + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  /* Envio do lead ao CRM (não bloqueia o WhatsApp) */
  window.QH4SendLead = function (lead) {
    if (!C.webhook) return;
    var u = window.QH4Utms();
    var id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    var body = {
      event_id: id,
      timestamp: new Date().toISOString(),
      source_url: location.href,
      referrer: document.referrer || "",
      fbp: cookie("_fbp"), fbc: cookie("_fbc"), gclid: u.gclid || "",
      user_agent: navigator.userAgent,
      utm: { source: u.utm_source || "", medium: u.utm_medium || "", campaign: u.utm_campaign || "", term: u.utm_term || "", content: u.utm_content || "" },
      lp: { vertical: C.vertical, variant: C.lpSlug },
      lead: lead
    };
    try {
      fetch(C.webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true }).catch(function () {});
    } catch (e) {}
  };

  /* Clique em qualquer link de WhatsApp */
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href*="wa.me"]');
    if (!a) return;
    window.QH4Track("whatsapp_click", { wa_local: a.getAttribute("data-wa") || "sem-origem" });
  }, true);
})();
