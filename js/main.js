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

  /* 스크롤 리빌 */
  var reveals = document.querySelectorAll('.reveal');
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
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec);
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
      cards.forEach(function (c) {
        c.classList.toggle('hide', f !== 'all' && c.getAttribute('data-cat') !== f);
      });
    });
  });

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
