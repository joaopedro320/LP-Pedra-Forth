/* Pedra Forth | LP padrão QH4
   Menu, topo, entrada do hero, reveal, abas, galeria + lightbox, processo, vídeo, formulário -> WhatsApp */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduz) doc.classList.add("anim");
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Topo: borda ao rolar, some ao descer, progresso ---------- */
  var topo = $(".topo"), prog = $(".progresso"), waF = $(".wa-flutuante"), hero = $(".hero");
  var ultimoY = 0, tick = false, extras = [];
  function aoRolar() {
    var y = window.scrollY;
    topo.classList.toggle("is-rolado", y > 20);
    if (!doc.classList.contains("menu-aberto")) topo.classList.toggle("is-oculto", y > 400 && y > ultimoY);
    ultimoY = y;
    var h = document.body.scrollHeight - window.innerHeight;
    if (prog) prog.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    if (waF && hero) waF.classList.toggle("is-visivel", y > hero.offsetHeight * 0.6);
    linhaProcesso();
    for (var k = 0; k < extras.length; k++) extras[k]();
    tick = false;
  }
  window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(aoRolar); } }, { passive: true });

  /* ---------- Menu mobile ---------- */
  var mb = $(".menu-btn");
  if (mb) {
    mb.addEventListener("click", function () {
      var aberto = doc.classList.toggle("menu-aberto");
      mb.setAttribute("aria-expanded", aberto ? "true" : "false");
      mb.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });
    $$(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { doc.classList.remove("menu-aberto"); mb.setAttribute("aria-expanded", "false"); });
    });
  }

  /* ---------- Entrada do hero (único momento orquestrado) ---------- */
  if (hero && !reduz) {
    var h1 = $("h1", hero);
    var n = 0, frag = document.createDocumentFragment();
    function embrulha(texto, destino) {
      texto.split(/(\s+)/).forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { destino.appendChild(document.createTextNode(" ")); return; }
        var l = document.createElement("span"); l.className = "linha";
        var s = document.createElement("span"); s.style.setProperty("--d", (0.15 + n++ * 0.06).toFixed(2) + "s");
        s.textContent = p; l.appendChild(s); destino.appendChild(l);
      });
    }
    Array.prototype.slice.call(h1.childNodes).forEach(function (no) {
      if (no.nodeType === 3) embrulha(no.textContent, frag);
      else if (no.nodeType === 1) { var c = no.cloneNode(false); embrulha(no.textContent, c); frag.appendChild(c); }
    });
    h1.textContent = ""; h1.appendChild(frag);
  }
  requestAnimationFrame(function () { setTimeout(function () { hero && hero.classList.add("is-pronto"); }, 60); });

  /* ---------- Reveal ---------- */
  var alvos = $$(".reveal, .moldura");
  if ("IntersectionObserver" in window && !reduz) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    alvos.forEach(function (el) { io.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Abas acessíveis ---------- */
  $$("[data-abas]").forEach(function (grupo) {
    var abas = $$('[role="tab"]', grupo);
    function ativar(aba, foco) {
      abas.forEach(function (t) {
        var sel = t === aba;
        t.setAttribute("aria-selected", sel ? "true" : "false");
        t.tabIndex = sel ? 0 : -1;
        var p = document.getElementById(t.getAttribute("aria-controls"));
        if (p) {
          p.hidden = !sel;
          if (sel) { p.classList.remove("is-entrando"); void p.offsetWidth; p.classList.add("is-entrando"); }
        }
      });
      if (foco) aba.focus();
    }
    abas.forEach(function (t, i) {
      t.addEventListener("click", function () {
        ativar(t);
        if (window.innerWidth <= 900) {
          var p = document.getElementById(t.getAttribute("aria-controls"));
          if (p) p.scrollIntoView({ behavior: reduz ? "auto" : "smooth", block: "nearest" });
        }
      });
      if (window.matchMedia("(hover:hover)").matches) t.addEventListener("mouseenter", function () { ativar(t); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") n = abas[(i + 1) % abas.length];
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = abas[(i - 1 + abas.length) % abas.length];
        if (e.key === "Home") n = abas[0];
        if (e.key === "End") n = abas[abas.length - 1];
        if (n) { e.preventDefault(); ativar(n, true); }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = $(".lightbox");
  if (lb) {
    var lbImg = $("img", lb), lbLeg = $("figcaption", lb), lbCont = $(".lb-cont", lb);
    var lista = [], idx = 0, origem = null;
    function abrir(grupo, i, btn) {
      lista = $$('[data-lb="' + grupo + '"]');
      idx = i; origem = btn;
      mostrar();
      lb.classList.add("is-aberto");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      $(".lb-fechar", lb).focus();
    }
    function mostrar() {
      var b = lista[idx];
      lbImg.src = b.getAttribute("data-full");
      lbImg.alt = b.getAttribute("data-alt") || "";
      lbLeg.textContent = b.getAttribute("data-leg") || "";
      lbCont.textContent = (idx + 1) + " / " + lista.length;
    }
    function fechar() {
      lb.classList.remove("is-aberto");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (origem) origem.focus();
    }
    function passo(d) { idx = (idx + d + lista.length) % lista.length; mostrar(); }
    $$("[data-lb]").forEach(function (b) {
      b.addEventListener("click", function () {
        var g = b.getAttribute("data-lb");
        abrir(g, $$('[data-lb="' + g + '"]').indexOf(b), b);
      });
    });
    $(".lb-fechar", lb).addEventListener("click", fechar);
    $(".lb-ant", lb).addEventListener("click", function () { passo(-1); });
    $(".lb-prox", lb).addEventListener("click", function () { passo(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) fechar(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-aberto")) return;
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowRight") passo(1);
      if (e.key === "ArrowLeft") passo(-1);
      if (e.key === "Tab") {
        var f = $$("button", lb), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) passo(dx < 0 ? 1 : -1);
      x0 = null;
    });
  }

  /* ---------- Linha do processo preenchendo no scroll ---------- */
  var passos = $(".passos"), trilho = $(".passos .trilho"), itens = $$(".passo");
  function linhaProcesso() {
    if (!passos) return;
    var r = passos.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (vh * 0.6)));
    if (trilho) passos.style.setProperty("--p", p.toFixed(3));
    itens.forEach(function (it, i) { it.classList.toggle("is-ativo", p >= (i / itens.length) + 0.02); });
  }

  /* ---------- Vídeo do showroom: toca só quando visível ---------- */
  var vid = $(".show-video"), vbtn = $(".video-btn");
  if (vid) {
    var pausadoPeloUsuario = reduz;
    function iconeVideo() {
      if (!vbtn) return;
      var tocando = !vid.paused;
      vbtn.setAttribute("aria-label", tocando ? "Pausar vídeo" : "Tocar vídeo");
      vbtn.innerHTML = tocando
        ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>';
    }
    vid.addEventListener("play", iconeVideo);
    vid.addEventListener("pause", iconeVideo);
    if (vbtn) vbtn.addEventListener("click", function () {
      if (vid.paused) { pausadoPeloUsuario = false; vid.play(); } else { pausadoPeloUsuario = true; vid.pause(); }
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !pausadoPeloUsuario) { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {}); }
          else if (!e.isIntersecting) vid.pause();
        });
      }, { threshold: 0.35 }).observe(vid);
    }
    iconeVideo();
  }

  /* ---------- Formulário de orçamento -> WhatsApp ---------- */
  var form = $("#form-orcamento");
  if (form) {
    var C = window.QH4_CONFIG || {};
    var btn = $(".btn-enviar", form), aviso = $(".aviso", form), iniciou = false;
    var tel = $("#f-whats", form);

    tel.addEventListener("input", function () {
      var d = tel.value.replace(/\D/g, "").slice(0, 11), o = d;
      if (d.length > 2) o = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) o = "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
      tel.value = o;
    });

    function marcados(nome) { return $$('input[name="' + nome + '"]:checked', form).map(function (i) { return i.value; }); }
    function valido() {
      var nome = $("#f-nome", form).value.trim().length >= 2;
      var whats = tel.value.replace(/\D/g, "").length >= 10;
      var cidade = $("#f-cidade", form).value.trim().length >= 2;
      var oque = marcados("ambiente").length > 0;
      var mat = $("#f-material", form).value !== "";
      return nome && whats && cidade && oque && mat;
    }
    function atualizar() {
      var ok = valido();
      btn.disabled = !ok;
      aviso.textContent = ok ? "Tudo certo. A mensagem abre pronta no WhatsApp." : "Preencha os campos para liberar o envio.";
    }
    form.addEventListener("input", function () {
      if (!iniciou) { iniciou = true; window.QH4Track && window.QH4Track("form_start", { form: "orcamento" }); }
      atualizar();
    });
    form.addEventListener("change", atualizar);

    /* campos ocultos de origem */
    var u = window.QH4Utms ? window.QH4Utms() : {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach(function (k) {
      var i = form.querySelector('[name="' + k + '"]'); if (i && u[k]) i.value = u[k];
    });
    var pu = form.querySelector('[name="page_url"]'); if (pu) pu.value = location.href;
    var rf = form.querySelector('[name="referrer"]'); if (rf) rf.value = document.referrer || "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!valido()) { atualizar(); return; }
      if (form.querySelector('[name="empresa_site"]').value) return; /* honeypot */
      var d = {
        nome: $("#f-nome", form).value.trim(),
        whatsapp: tel.value.trim(),
        cidade: $("#f-cidade", form).value.trim(),
        perfil: marcados("perfil").join(", ") || "Não informado",
        ambiente: marcados("ambiente").join(", "),
        material: $("#f-material", form).value,
        fase: marcados("fase").join(", ") || "Não informado",
        detalhes: $("#f-detalhes", form).value.trim()
      };
      var msg = "Olá, Pedra Forth! Vim pelo site e quero um orçamento.\n\n" +
        "*Nome:* " + d.nome + "\n" +
        "*WhatsApp:* " + d.whatsapp + "\n" +
        "*Cidade da obra:* " + d.cidade + "\n" +
        "*Perfil:* " + d.perfil + "\n" +
        "*O que preciso:* " + d.ambiente + "\n" +
        "*Material:* " + d.material + "\n" +
        "*Fase da obra:* " + d.fase +
        (d.detalhes ? "\n*Detalhes:* " + d.detalhes : "");
      var url = "https://wa.me/" + (C.whatsapp || "5535999281011") + "?text=" + encodeURIComponent(msg);
      window.QH4Track && window.QH4Track("generate_lead", { form: "orcamento", ambiente: d.ambiente, material: d.material, perfil: d.perfil }, "Lead");
      window.QH4SendLead && window.QH4SendLead({ nome: d.nome, whatsapp: d.whatsapp, cidade: d.cidade, perfil: d.perfil, ambiente: d.ambiente, material: d.material, fase: d.fase, detalhes: d.detalhes });
      try { sessionStorage.setItem("pf_wa_url", url); sessionStorage.setItem("pf_nome", d.nome.split(" ")[0]); } catch (er) {}
      var janela = window.open(url, "_blank");
      if (janela) { try { janela.opener = null; } catch (er) {} }
      if (C.thankYouPage) {
        setTimeout(function () { window.location.href = C.thankYouPage + (janela ? "" : "?abrir=1"); }, janela ? 500 : 0);
      } else {
        form.classList.add("is-enviado");
        var ok = $(".form-ok a", form); if (ok) ok.href = url;
        if (!janela) window.location.href = url;
      }
    });
    atualizar();
  }

  /* =================== v2: mais movimento =================== */
  if (!reduz) {
    /* Títulos de seção palavra a palavra */
    $$("main h2").forEach(function (h) {
      if (h.closest(".hero")) return;
      var txt = h.textContent.trim().split(/\s+/);
      h.textContent = "";
      txt.forEach(function (w, i) {
        var o = document.createElement("span"); o.className = "w";
        var d = document.createElement("span"); d.textContent = w; d.style.setProperty("--d", (i * 0.045).toFixed(3) + "s");
        o.appendChild(d); h.appendChild(o); if (i < txt.length - 1) h.appendChild(document.createTextNode(" "));
      });
      h.classList.add("tit-anim");
    });
    /* Fotos abrindo em cortina */
    $$(".tecnica .img, .historia .retrato, .show-grid li, .parceiros figure").forEach(function (el, i) {
      el.classList.add("cortina");
    });
    $$(".show-grid li").forEach(function (el, i) { el.style.setProperty("--d", (i * 0.12) + "s"); });
    $$(".tecnica .img").forEach(function (el, i) { el.style.setProperty("--d", (i * 0.12) + "s"); });
    /* Galeria em cascata */
    $$(".galeria li").forEach(function (el, i) { el.style.setProperty("--d", ((i % 4) * 0.08) + "s"); });
    $$(".aval-card").forEach(function (el, i) { el.style.setProperty("--d", (Math.min(i, 4) * 0.1) + "s"); });

    /* clip-path zera a área visível para o IntersectionObserver: a cortina é observada pelo elemento pai */
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var alvo = e.target.__cortina || e.target;
        alvo.classList.add("is-in"); io2.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.12 });
    $$(".tit-anim, .galeria li, .aval, .kicker").forEach(function (el) { io2.observe(el); });
    $$(".cortina").forEach(function (el) {
      var sentinela = document.createElement("span");
      sentinela.setAttribute("aria-hidden", "true");
      sentinela.style.cssText = "position:absolute;inset:0;pointer-events:none;";
      if (getComputedStyle(el.parentElement).position === "static") el.parentElement.style.position = "relative";
      el.parentElement.appendChild(sentinela);
      sentinela.__cortina = el;
      io2.observe(sentinela);
    });

    /* Parallax leve nas fotos */
    var plx = $$("[data-parallax] img");
    plx.forEach(function (img) { img.style.scale = "1.12"; });
    var heroImg = $(".hero-foto .principal img");
    extras.push(function () {
      var vh = window.innerHeight;
      plx.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var c = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.translate = "0 " + (c * -38).toFixed(1) + "px";
      });
      if (heroImg && window.scrollY < vh * 1.2) heroImg.style.translate = "0 " + (window.scrollY * 0.09).toFixed(1) + "px";
    });

    /* Faixa cinética acompanha o scroll */
    var cin = $(".cinetica");
    if (cin) {
      var linhas = $$(".cinetica-linha", cin);
      extras.push(function () {
        var r = cin.getBoundingClientRect(), vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        var p = (vh - r.top) / (vh + r.height);
        linhas.forEach(function (l) {
          var v = parseFloat(l.getAttribute("data-vel")) || 1;
          l.style.setProperty("--x", (v * (p - 0.5) * 38).toFixed(2) + "vw");
        });
      });
    }

    /* Tilt 3D da foto do hero com o mouse */
    var hf = $(".hero-foto");
    if (hf && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      hero.addEventListener("mousemove", function (e) {
        var r = hf.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
        hf.style.transform = "perspective(1000px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 5).toFixed(2) + "deg)";
      });
      hero.addEventListener("mouseleave", function () { hf.style.transform = ""; });
    }
  }

  /* Contadores */
  var conts = $$("[data-count]");
  function contar(el) {
    var alvo = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var fmt = function (v) { return v.toFixed(dec).replace(".", ","); };
    if (reduz) { el.textContent = fmt(alvo); return; }
    var t0 = null, dur = 1500;
    function passo(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(alvo * e);
      if (k < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  if ("IntersectionObserver" in window) {
    var io3 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { contar(e.target); io3.unobserve(e.target); } });
    }, { threshold: 0.6 });
    conts.forEach(function (el) { io3.observe(el); });
  }

  /* Carrossel de avaliações */
  $$("[data-carrossel]").forEach(function (car) {
    var tr = $(".aval-trilho", car), barra = $(".aval-barra span", car), cards = $$(".aval-card", car);
    function passoW() { return cards[0] ? cards[0].getBoundingClientRect().width + 16 : tr.clientWidth; }
    function ir(dir) {
      var max = tr.scrollWidth - tr.clientWidth - 4;
      if (dir > 0 && tr.scrollLeft >= max) tr.scrollTo({ left: 0, behavior: reduz ? "auto" : "smooth" });
      else if (dir < 0 && tr.scrollLeft <= 4) tr.scrollTo({ left: tr.scrollWidth, behavior: reduz ? "auto" : "smooth" });
      else tr.scrollBy({ left: dir * passoW(), behavior: reduz ? "auto" : "smooth" });
    }
    $$(".aval-btn", car).forEach(function (b) { b.addEventListener("click", function () { ir(parseInt(b.getAttribute("data-dir"), 10)); reiniciar(); }); });
    tr.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); ir(1); reiniciar(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); ir(-1); reiniciar(); }
    });
    function barraUpd() {
      var vis = tr.clientWidth / tr.scrollWidth, pos = tr.scrollLeft / Math.max(1, tr.scrollWidth - tr.clientWidth);
      barra.style.width = (vis * 100).toFixed(2) + "%";
      barra.style.transform = "translateX(" + (pos * (1 / vis - 1) * 100).toFixed(2) + "%)";
    }
    tr.addEventListener("scroll", function () { requestAnimationFrame(barraUpd); }, { passive: true });
    window.addEventListener("resize", barraUpd);
    barraUpd();
    /* arrastar com o mouse */
    var arr = false, x0 = 0, s0 = 0, moveu = false;
    tr.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; arr = true; moveu = false; x0 = e.clientX; s0 = tr.scrollLeft; });
    window.addEventListener("pointermove", function (e) {
      if (!arr) return; var dx = e.clientX - x0;
      if (Math.abs(dx) > 4) { moveu = true; tr.classList.add("is-arrastando"); }
      tr.scrollLeft = s0 - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!arr) return; arr = false; tr.classList.remove("is-arrastando");
      if (moveu) { var w = passoW(); tr.scrollTo({ left: Math.round(tr.scrollLeft / w) * w, behavior: "smooth" }); reiniciar(); }
    });
    /* autoplay discreto */
    var timer = null, pausa = false, visivel = false;
    function reiniciar() { clearInterval(timer); if (reduz) return; timer = setInterval(function () { if (!pausa && visivel && !document.hidden) ir(1); }, 5500); }
    car.addEventListener("mouseenter", function () { pausa = true; });
    car.addEventListener("mouseleave", function () { pausa = false; });
    car.addEventListener("focusin", function () { pausa = true; });
    car.addEventListener("focusout", function () { pausa = false; });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; }, { threshold: 0.4 }).observe(car);
    reiniciar();
  });

  aoRolar();
})();
