(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 모바일 메뉴 */
  var burger = document.querySelector('.burger');
  var body = document.body;
  if (burger) {
    burger.addEventListener('click', function () {
      var open = body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });
    document.querySelectorAll('.mobile-nav a').forEach(function (a) {
      a.addEventListener('click', function () { body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* 히어로 썸네일 월: 트랙 복제로 무한 스크롤 */
  document.querySelectorAll('.wall-track').forEach(function (t) {
    var kids = Array.prototype.slice.call(t.children);
    kids.forEach(function (k) { t.appendChild(k.cloneNode(true)); });
  });

  /* 제목 단어 분리 (타이포그래피 리빌) */
  function splitWords(el) {
    var idx = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = p; wi.style.setProperty('--i', idx++);
            w.appendChild(wi); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    }
    walk(el);
    el.classList.add('split');
    el.classList.remove('reveal');
  }
  var heads = document.querySelectorAll('.hero h1, .h2, .case h3, .owner h3');
  if (!reduce) { heads.forEach(splitWords); }

  /* 히어로 등장 */
  var heroBits = document.querySelectorAll('.hero .reveal, .hero .split');
  window.setTimeout(function () { heroBits.forEach(function (el) { el.classList.add('in'); }); }, 80);

  /* 스크롤 리빌 */
  var reveals = document.querySelectorAll('.reveal:not(.hero *), .split:not(.hero *)');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* 숫자 카운트업 */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimal') || '0', 10);
    var comma = el.hasAttribute('data-comma');
    function fmt(v) { return comma ? Math.round(v).toLocaleString('ko-KR') : v.toFixed(dec); }
    if (reduce) { el.textContent = fmt(target); return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCount);
  }

  /* 포트폴리오 필터 */
  var tabs = document.querySelectorAll('.tabs button');
  var cards = document.querySelectorAll('#videoGrid .vcard');
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      var f = btn.getAttribute('data-filter');
      applyFilter(f);
    });
  });
  function applyFilter(f) {
    cards.forEach(function (c, i) {
      c.classList.toggle('hide', f !== 'all' && c.getAttribute('data-cat') !== f);
      c.classList.toggle('over', f === 'all' && i >= 12);
    });
  }
  applyFilter('all');

  /* 진행 과정 단계 탭 */
  var flowx = document.querySelector('.flowx');
  if (flowx) {
    var fxItems = flowx.querySelectorAll('.flowx-list li');
    var fxImgs = flowx.querySelectorAll('.flowx-media img');
    var fxCur = 0, fxTimer = null, FX_MS = 4500;
    var fxCapT = flowx.querySelector('.fc-t'), fxCapD = flowx.querySelector('.fc-d');
    function fxShow(i) {
      fxCur = i;
      fxItems.forEach(function (li, k) {
        li.classList.remove('on');
        if (k === i) { void li.offsetWidth; li.classList.add('on'); }
      });
      fxImgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      var li = fxItems[i];
      if (fxCapT) fxCapT.textContent = li.querySelector('.fx-n').textContent + ' · ' + li.querySelector('.fx-t').textContent;
      if (fxCapD) fxCapD.textContent = li.querySelector('.fx-d').textContent;
    }
    function fxStart() {
      if (reduce || fxTimer) return;
      fxShow(fxCur);
      fxTimer = window.setInterval(function () { fxShow((fxCur + 1) % fxItems.length); }, FX_MS);
    }
    function fxStop() { if (fxTimer) { window.clearInterval(fxTimer); fxTimer = null; } }
    flowx.style.setProperty('--fx-dur', FX_MS + 'ms');
    if (reduce) flowx.classList.add('paused');
    fxItems.forEach(function (li, k) {
      li.querySelector('button').addEventListener('click', function () {
        fxStop(); flowx.classList.add('paused'); fxShow(k);
      });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !flowx.classList.contains('paused')) fxStart(); else fxStop(); });
      }, { threshold: 0.4 }).observe(flowx);
    } else { fxStart(); }
  }

  /* 유튜브 지연 로딩 */
  document.querySelectorAll('.yt[data-id]').forEach(function (box) {
    function play() {
      if (box.querySelector('iframe')) return;
      var id = box.getAttribute('data-id');
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      f.title = box.getAttribute('aria-label') || 'YouTube video';
      box.appendChild(f);
    }
    box.addEventListener('click', play);
    box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
  });

  /* 숏폼 영상: 보일 때만 재생, 음소거 토글 */
  var phones = document.querySelectorAll('.phone');
  phones.forEach(function (ph) {
    var v = ph.querySelector('video');
    var btn = ph.querySelector('.mute');
    if (!v) return;
    if ('IntersectionObserver' in window && !reduce) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { v.play().catch(function () {}); } else { v.pause(); }
        });
      }, { threshold: 0.35 });
      vio.observe(ph);
    }
    if (btn) {
      btn.addEventListener('click', function () {
        v.muted = !v.muted;
        if (!v.muted) {
          phones.forEach(function (o) { var ov = o.querySelector('video'); if (ov && ov !== v) ov.muted = true; });
          v.play().catch(function () {});
        }
        btn.setAttribute('aria-label', v.muted ? '소리 켜기' : '소리 끄기');
        btn.innerHTML = v.muted
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></svg>';
      });
    }
  });

  /* 문의 폼 → 메일 작성창 */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var name = (d.get('name') || '').trim();
      var phone = (d.get('phone') || '').trim();
      var biz = d.get('biz') || '';
      var msg = (d.get('msg') || '').trim();
      var missing = [];
      if (!name) missing.push('성함');
      if (!phone) missing.push('연락처');
      if (!biz) missing.push('업종');
      if (missing.length) {
        var hint = form.querySelector('.hint');
        hint.textContent = missing.join(', ') + ' 항목을 입력해 주세요.';
        hint.style.color = '#abf783';
        form.querySelector('[name="' + (!name ? 'name' : !phone ? 'phone' : 'biz') + '"]').focus();
        return;
      }
      var subject = '[제작 문의] ' + name + ' / ' + biz;
      var bodyText = '성함/회사명: ' + name + '\n연락처: ' + phone + '\n업종: ' + biz + '\n\n' + msg;
      window.location.href = 'mailto:dream41591@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);
    });
  }
})();
