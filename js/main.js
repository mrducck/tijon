(function () {
  "use strict";
  var S = window.SITE || {};
  var $ = function (q, el) { return (el || document).querySelector(q); };
  var $$ = function (q, el) { return Array.prototype.slice.call((el || document).querySelectorAll(q)); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- name ---------- */
  var name = (S.name || "").trim();
  $$("[data-name]").forEach(function (n) {
    if (name) { n.textContent = name; return; }
    if (n.classList.contains("wordmark")) { n.textContent = "Name"; n.classList.add("empty"); }
  });
  var studio = (S.studio || "").trim();
  $$("[data-studio]").forEach(function (n) { n.textContent = studio; });
  if (name) document.title = name + (studio ? " / " + studio : "") + " — " + (S.tagline || []).join(" / ");
  var noAi = S.noAi || null;
  if (noAi) {
    $$("[data-noai]").forEach(function (n) { n.textContent = noAi.head; n.hidden = false; });
    $$("[data-noai-fine]").forEach(function (n) { n.textContent = noAi.head + " imagery. "; });
  }
  $("#yr").textContent = new Date().getFullYear();

  var tag = $("#heroTag");
  (studio ? [studio] : []).concat(S.tagline || []).forEach(function (t, i) {
    if (i) tag.appendChild(el("i", null, "†"));
    tag.appendChild(el("span", null, t));
  });

  /* ---------- tape ---------- */
  var tape = $("#tape");
  var words = (S.tagline || []).concat(noAi ? [noAi.head] : [], ["Direction", "Portraits", "Shot in camera"]);
  for (var r = 0; r < 4; r++) {
    words.forEach(function (w) { tape.appendChild(el("span", null, w)); tape.appendChild(el("span", null, "†")); });
  }
  var tapeX = 0, tapeV = 0.5, lastY = window.scrollY;
  function tapeTick() {
    var y = window.scrollY;
    tapeV += (0.5 + Math.min(Math.abs(y - lastY), 60) * 0.35 - tapeV) * 0.08;
    lastY = y;
    tapeX -= tapeV;
    var loop = tape.scrollWidth / 4;
    if (-tapeX >= loop) tapeX += loop;
    tape.style.transform = "translate3d(" + tapeX.toFixed(1) + "px,0,0)";
    requestAnimationFrame(tapeTick);
  }
  if (!calm) requestAnimationFrame(tapeTick);

  /* ---------- galleries ---------- */
  var groups = [];

  function tileFor(item, label, group, idx) {
    var isVideo = item.type === "video";
    var t = el(isVideo ? "button" : "a", "tile");
    t.style.setProperty("--ar", (item.w / item.h).toFixed(4));
    t.setAttribute("data-af", "");
    if (isVideo) {
      t.type = "button";
      t.setAttribute("aria-label", item.alt + " (play or pause)");
      var v = el("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none";
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      if (item.poster) v.poster = item.poster;
      v.src = item.src;
      t.appendChild(v);
      t.appendChild(el("span", "tile-play", "CLIP"));
      t.addEventListener("click", function () { if (v.paused) v.play(); else v.pause(); });
      if (!calm && "IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) v.play().catch(function () {}); else v.pause(); });
        }, { threshold: 0.5 }).observe(t);
      }
    } else {
      t.href = item.src;
      var img = el("img");
      img.alt = item.alt || "";
      img.loading = "lazy"; img.decoding = "async";
      img.width = item.w; img.height = item.h;
      img.addEventListener("load", function () {
        var c = avgColor(img);
        if (c) { item.glow = c; t.style.setProperty("--glow", c); }
      });
      img.src = item.src;
      t.appendChild(img);
      t.addEventListener("click", function (ev) { ev.preventDefault(); openLb(group, idx, t); });
    }
    t.appendChild(el("span", "tile-tag", label));
    return t;
  }

  function avgColor(img) {
    try {
      var c = document.createElement("canvas"); c.width = c.height = 12;
      var x = c.getContext("2d"); x.drawImage(img, 0, 0, 12, 12);
      var d = x.getImageData(0, 0, 12, 12).data, R = 0, G = 0, B = 0, W = 0;
      for (var i = 0; i < d.length; i += 4) {
        var mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
        var w = (mx - mn) + 8;                       // favour the saturated gel colour over the shadows
        R += d[i] * w; G += d[i + 1] * w; B += d[i + 2] * w; W += w;
      }
      return [R / W, G / W, B / W].map(Math.round).join(", ");
    } catch (e) { return null; }
  }

  var setsBody = $("#setsBody"), frameTotal = 0;
  (S.sets || []).forEach(function (set) {
    var wrap = el("article", "set rv");
    var head = el("div", "set-head");
    head.appendChild(el("b", null, "Set " + set.id));
    if (set.title) head.appendChild(el("span", null, set.title));
    head.appendChild(el("i"));
    head.appendChild(el("span", null, pad(set.frames.length) + " frames"));
    wrap.appendChild(head);
    var g = el("div", "jg");
    var group = set.frames;
    groups.push(group);
    set.frames.forEach(function (f, i) { g.appendChild(tileFor(f, set.id + "-" + pad(i + 1), group, i)); });
    wrap.appendChild(g);
    setsBody.appendChild(wrap);
    frameTotal += set.frames.length;
  });
  $("#setsMeta").textContent = pad((S.sets || []).length) + " set" + ((S.sets || []).length === 1 ? "" : "s") + " / " + pad(frameTotal) + " frames";

  var btsBody = $("#btsBody");
  var btsStills = (S.bts || []).filter(function (b) { return b.type !== "video"; });
  (S.bts || []).forEach(function (b, i) {
    btsBody.appendChild(tileFor(b, "BTS-" + pad(i + 1), btsStills, btsStills.indexOf(b)));
  });
  /* ---------- proof: No AI + BTS -> final swipe ---------- */
  var reveals = S.reveals || [];
  if (noAi || reveals.length) {
    $("#proof").hidden = false;
    if (noAi) { $("#noAiHead").textContent = noAi.head; $("#noAiBody").textContent = noAi.body; }
    if (!reveals.length) $("#proofHint").hidden = true;
  }
  reveals.forEach(function (r) {
    var w = el("div", "swipe");
    w.setAttribute("data-af", "");
    var after = el("img", "swipe-img"); after.src = r.after.src; after.alt = r.after.alt || ""; after.style.objectPosition = r.after.pos || "50% 50%";
    var top = el("div", "swipe-top");
    var before = el("img", "swipe-img"); before.src = r.before.src; before.alt = r.before.alt || ""; before.style.objectPosition = r.before.pos || "50% 50%";
    top.appendChild(before);
    var range = el("input");
    range.type = "range"; range.min = "0"; range.max = "100"; range.step = "0.1";
    range.setAttribute("aria-label", "Swipe between behind the scenes and the finished photo");
    var lA = el("span", "swipe-l", "BTS"), lB = el("span", "swipe-r", "Final");
    var touched = false;
    function set(v) {
      w.style.setProperty("--pos", v + "%");
      lA.style.opacity = v < 14 ? 0 : 1; lB.style.opacity = v > 86 ? 0 : 1;
    }
    range.addEventListener("input", function () { touched = true; set(+range.value); });
    [after, top, el("i", "swipe-line"), lA, lB, range].forEach(function (n) { w.appendChild(n); });
    $("#reveals").appendChild(w);
    if (calm || !("IntersectionObserver" in window)) { range.value = "50"; set(50); return; }
    range.value = "100"; set(100);
    var seen = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      seen.disconnect();
      var t0 = performance.now(), DUR = 1500;
      (function sweep(now) {
        if (touched) return;
        var k = Math.min(1, (now - t0) / DUR), e = 1 - Math.pow(1 - k, 3), v = 100 - 50 * e;
        range.value = String(v); set(v);
        if (k < 1) requestAnimationFrame(sweep);
      })(t0);
    }, { threshold: 0.55 });
    seen.observe(w);
  });

  if (!(S.bts || []).length && !noAi && !reveals.length) $("#bts").hidden = true;

  /* ---------- films (YouTube loads only on click) ---------- */
  var films = S.films || [];
  if (films.length) {
    $("#film").hidden = false;
    $("#btsNum").textContent = "03";
    $("#filmMeta").textContent = pad(films.length) + " film" + (films.length === 1 ? "" : "s");
    films.forEach(function (f) {
      var b = el("button", "film rv");
      b.type = "button";
      b.setAttribute("data-af", "");
      b.setAttribute("aria-label", "Play " + (f.title || "film"));
      b.style.backgroundImage = "url(https://i.ytimg.com/vi/" + f.id + "/maxresdefault.jpg), url(https://i.ytimg.com/vi/" + f.id + "/hqdefault.jpg)";
      var go = el("span", "film-go"); go.appendChild(el("b", null, "Play"));
      b.appendChild(go);
      if (f.title) b.appendChild(el("span", "film-title", f.title));
      b.addEventListener("click", function () {
        var fr = document.createElement("iframe");
        fr.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(f.id) + "?autoplay=1&rel=0&modestbranding=1";
        fr.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        fr.allowFullscreen = true;
        fr.title = f.title || "Film";
        b.textContent = ""; b.appendChild(fr); b.disabled = true;
      }, { once: true });
      $("#filmBody").appendChild(b);
    });
  } else {
    $$('[data-nav="film"]').forEach(function (a) { a.hidden = true; });
  }

  (S.links || []).forEach(function (l) {
    var a = el("a", null, l.label); a.href = l.href; a.rel = "noopener"; a.target = "_blank"; a.setAttribute("data-af", "");
    $("#footLinks").appendChild(a);
  });

  /* ---------- hero slideshow ---------- */
  var slidesEl = $("#heroSlides");
  var heroFrames = ((S.sets || [])[0] || { frames: [] }).frames;
  var tall = window.innerHeight > window.innerWidth;
  var ordered = heroFrames.slice().sort(function (a, b) {
    var pa = a.h > a.w, pb = b.h > b.w;
    return pa === pb ? 0 : (pa === tall ? -1 : 1);       // phones open on a portrait frame, desktops on a wide one
  });
  var slides = ordered.map(function (f) {
    var d = el("div"); d.style.backgroundImage = "url(" + f.src + ")"; slidesEl.appendChild(d); return d;
  });
  var cur = -1, HOLD = 5200, bar = $("#heroBar"), count = $("#heroCount");
  function show(i) {
    if (cur >= 0) slides[cur].classList.remove("on");
    cur = i % slides.length;
    slides[cur].classList.add("on");
    count.textContent = "FR " + pad(cur + 1) + "/" + pad(slides.length);
    bar.style.transition = "none"; bar.style.width = "0";
    void bar.offsetWidth;
    bar.style.transition = "width " + HOLD + "ms linear"; bar.style.width = "100%";
  }
  if (slides.length) {
    show(0);
    if (slides.length > 1 && !calm) setInterval(function () { if (!document.hidden) show(cur + 1); }, HOLD);
  }
  var hero = $(".hero");
  if (!calm) hero.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
    slidesEl.style.transform = "translate3d(" + (-x * 22).toFixed(1) + "px," + (-y * 16).toFixed(1) + "px,0)";
  });

  /* ---------- intro film ---------- */
  (function () {
    var cfg = S.intro, box = $("#intro"), vid = $("#introVid");
    if (!cfg || !cfg.film || calm) return;
    try { if (sessionStorage.getItem("introSeen")) return; } catch (e) {}
    var done = false, root = document.documentElement;
    function end() {
      if (done) return;
      done = true;
      try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
      box.classList.add("out");
      root.classList.remove("intro-on");
      setTimeout(function () { box.hidden = true; vid.pause(); vid.removeAttribute("src"); vid.load(); }, 950);
    }
    if (cfg.poster) vid.poster = cfg.poster;
    var tall = !!cfg.filmTall && window.innerHeight > window.innerWidth * 1.3;    // phones held upright get the vertical cut
    if (tall) box.classList.add("tall");
    vid.src = tall ? cfg.filmTall : cfg.film;
    box.hidden = false;
    root.classList.add("intro-on");
    vid.addEventListener("ended", end);
    vid.addEventListener("error", end);
    $("#introSkip").addEventListener("click", end);
    if (cfg.sound) {                                   // browsers only allow sound after a tap, so it is opt-in
      var snd = $("#introSound");
      snd.hidden = false;
      snd.addEventListener("click", function () {
        vid.muted = !vid.muted;
        snd.setAttribute("aria-pressed", String(!vid.muted));
        snd.textContent = vid.muted ? "Sound on" : "Sound off";
      });
    }
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") end(); });
    var p = vid.play();
    if (p && p.catch) p.catch(end);
    setTimeout(function () { if (vid.readyState < 2 || vid.paused) end(); }, 5000);   // never trap anyone behind a film that will not start
  })();

  /* ---------- chrome name: scrub the rendered frames ---------- */
  (function () {
    var cfg = S.hero3d, cv = $("#name3d");
    if (!cfg || !cfg.count) return;
    var n = cfg.count, mid = (n - 1) / 2, imgs = [], shown = -1, target = mid, pos = mid, steered = false;
    var cx = cv.getContext("2d");
    function draw(i) {
      var im = imgs[i];
      if (!im || !im.complete || !im.naturalWidth) return;
      if (cv.width !== im.naturalWidth) { cv.width = im.naturalWidth; cv.height = im.naturalHeight; }
      cx.clearRect(0, 0, cv.width, cv.height);
      cx.drawImage(im, 0, 0);
      shown = i;
    }
    for (var i = 0; i < n; i++) {
      imgs[i] = new Image();
      imgs[i].decoding = "async";
      if (i === Math.round(mid)) imgs[i].onload = function () {
        cv.hidden = false;
        $$(".wordmark").forEach(function (w) { w.classList.add("sr"); });
        draw(Math.round(mid));
      };
      imgs[i].src = cfg.frames.replace("%02d", pad(i));
    }
    if (calm) return;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      steered = true;
      target = Math.max(0, Math.min(1, e.clientX / window.innerWidth)) * (n - 1);
    }, { passive: true });
    window.addEventListener("deviceorientation", function (e) {
      if (e.gamma == null) return;
      steered = true;
      target = (Math.max(-28, Math.min(28, e.gamma)) / 56 + 0.5) * (n - 1);
    });
    (function tick(t) {
      if (!steered) target = mid + Math.sin(t / 2400) * mid * 0.8;     // nobody steering: slow sway
      pos += (target - pos) * 0.1;
      var f = Math.round(pos);
      if (f !== shown && window.scrollY < window.innerHeight) draw(f);
      requestAnimationFrame(tick);
    })(0);
  })();

  /* ---------- viewfinder readouts ---------- */
  var tc = $("#hudTc"), t0 = performance.now();
  setInterval(function () {
    var ms = performance.now() - t0, s = Math.floor(ms / 1000);
    tc.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60) + ":" + pad(Math.floor((ms % 1000) / 1000 * 24));
  }, 1000 / 12);

  var mark = $("#expoMark");
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    mark.style.left = (max > 0 ? Math.min(1, window.scrollY / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  var hudSec = $("#hudSec"), secs = $$("[data-sec]").filter(function (s) { return !s.hidden; });
  function onSection() {
    var mid = window.scrollY + window.innerHeight * 0.4, at = 0;
    secs.forEach(function (s, i) { if (s.offsetTop <= mid) at = i; });
    hudSec.textContent = "SEC " + pad(at) + " / " + secs[at].getAttribute("data-sec");
    $$(".nav a").forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + secs[at].id); });
  }
  window.addEventListener("scroll", onSection, { passive: true });
  onSection();

  /* ---------- reveal ---------- */
  if ("IntersectionObserver" in window && !calm) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(function (n) { io.observe(n); });
  } else {
    $$(".rv").forEach(function (n) { n.classList.add("in"); });
  }

  /* ---------- lightbox ---------- */
  var lb = $("#lb"), lbImg = $("#lbImg"), lbCount = $("#lbCount"), lbCap = $("#lbCap"), hist = $("#lbHist");
  var lbGroup = [], lbIdx = 0, lbFrom = null;

  function drawHist() {
    var x = hist.getContext("2d"), W = hist.width, H = hist.height;
    x.clearRect(0, 0, W, H);
    try {
      var c = document.createElement("canvas"), n = 160;
      c.width = n; c.height = Math.max(1, Math.round(n * lbImg.naturalHeight / lbImg.naturalWidth));
      var cx = c.getContext("2d"); cx.drawImage(lbImg, 0, 0, c.width, c.height);
      var d = cx.getImageData(0, 0, c.width, c.height).data;
      var bins = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)], i, k;
      for (i = 0; i < d.length; i += 4) { bins[0][d[i]]++; bins[1][d[i + 1]]++; bins[2][d[i + 2]]++; }
      var peak = 1;
      for (k = 0; k < 3; k++) for (i = 2; i < 254; i++) if (bins[k][i] > peak) peak = bins[k][i];
      x.globalCompositeOperation = "lighter";
      ["#e2182a", "#2fbf4a", "#3a6cff"].forEach(function (col, k) {
        x.fillStyle = col; x.beginPath(); x.moveTo(0, H);
        for (i = 0; i < 256; i++) x.lineTo(i / 255 * W, H - Math.min(1, bins[k][i] / peak) * (H - 3));
        x.lineTo(W, H); x.closePath(); x.fill();
      });
      x.globalCompositeOperation = "source-over";
    } catch (e) { /* cross-origin or decode failure: leave the box empty */ }
  }

  function lbShow(i) {
    lbIdx = (i + lbGroup.length) % lbGroup.length;
    var f = lbGroup[lbIdx];
    lbImg.classList.add("swap");
    var pre = new Image();
    pre.onload = function () {
      lbImg.src = f.src; lbImg.alt = f.alt || "";
      lb.style.setProperty("--glow", f.glow || "184, 15, 28");
      lbImg.classList.remove("swap");
      if (lbImg.complete) drawHist(); else lbImg.onload = drawHist;
    };
    pre.src = f.src;
    lbCount.textContent = pad(lbIdx + 1) + " / " + pad(lbGroup.length);
    lbCap.textContent = f.alt || "";
    var multi = lbGroup.length > 1;
    $("#lbPrev").hidden = $("#lbNext").hidden = !multi;
  }
  function openLb(group, idx, from) {
    lbGroup = group; lbFrom = from;
    lb.hidden = false; document.body.style.overflow = "hidden";
    lbShow(idx); $("#lbClose").focus();
  }
  function closeLb() {
    lb.hidden = true; document.body.style.overflow = "";
    if (lbFrom) lbFrom.focus();
  }
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", function () { lbShow(lbIdx - 1); });
  $("#lbNext").addEventListener("click", function () { lbShow(lbIdx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-fig")) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") lbShow(lbIdx - 1);
    else if (e.key === "ArrowRight") lbShow(lbIdx + 1);
    else if (e.key === "Tab") {
      var f = $$("button:not([hidden])", lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var sx = null;
  lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (sx == null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50 && lbGroup.length > 1) lbShow(lbIdx + (dx < 0 ? 1 : -1));
  });

  /* ---------- AF point cursor ---------- */
  var af = $("#af");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !calm) {
    var ax = 0, ay = 0, tx = 0, ty = 0, on = false;
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!on) { on = true; ax = tx; ay = ty; af.classList.add("live"); }
      af.classList.toggle("lock", !!(e.target.closest && e.target.closest("[data-af]")));
    }, { passive: true });
    document.addEventListener("pointerleave", function () { on = false; af.classList.remove("live"); });
    (function follow() {
      ax += (tx - ax) * 0.22; ay += (ty - ay) * 0.22;
      af.style.transform = "translate3d(" + ax.toFixed(1) + "px," + ay.toFixed(1) + "px,0)";
      requestAnimationFrame(follow);
    })();
  }
})();
