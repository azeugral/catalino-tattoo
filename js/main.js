(function () {
  var IG = 'catalinotattoo';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* nav */
  var nav = $('#nav');
  function navSolida() { nav.classList.toggle('solida', scrollY > 40 || !$('#menu').hidden); }
  addEventListener('scroll', navSolida, { passive: true }); navSolida();
  var menuBt = $('#menuBt'), menu = $('#menu');
  menuBt.addEventListener('click', function () {
    var abre = menu.hidden; menu.hidden = !abre; menuBt.setAttribute('aria-expanded', abre); menuBt.textContent = abre ? 'Fechar' : 'Menu'; navSolida();
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu.hidden = true; menuBt.textContent = 'Menu'; menuBt.setAttribute('aria-expanded', false); navSolida(); }); });

  /* hero: cada peça entra em passadas de sombreado dentro da cantaria */
  var pecas = $$('#pecas img'), atual = 0;
  var calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function entra(i) {
    var el = pecas[i];
    el.classList.remove('ja'); void el.offsetWidth; el.classList.add('entra');
    setTimeout(function () {
      pecas.forEach(function (p, k) { if (k !== i) p.classList.remove('ja'); });
      el.classList.remove('entra'); el.classList.add('ja');
    }, calmo ? 20 : 1850);
  }
  entra(0);
  if (!calmo) {
    setInterval(function () {
      atual = (atual + 1) % pecas.length;
      entra(atual);
    }, 5000);
  }

  /* trabalhos */
  var grade = $('#grade'), verMais = $('#verMais');
  var obras = window.OBRAS || [];
  var PASSO = innerWidth < 640 ? 12 : 24;
  var filtro = 'todos', limite = PASSO, lista = [];
  function render() {
    lista = obras.filter(function (o) { return filtro === 'todos' || o.tema === filtro; });
    grade.innerHTML = lista.slice(0, limite).map(function (o, i) {
      return '<button class="item rev" data-i="' + i + '" aria-label="' + o.titulo + '"><img src="img/t/' + o.n + '.webp" alt="' + o.titulo + '" width="720" height="900" draggable="false"></button>';
    }).join('');
    verMais.parentNode.hidden = lista.length <= limite;
    observa($$('.item', grade));
  }
  $$('#filtros button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#filtros button').forEach(function (x) { x.classList.toggle('on', x === b); });
      filtro = b.dataset.f; limite = PASSO; render();
    });
  });
  verMais.addEventListener('click', function () { limite += PASSO; render(); });
  grade.addEventListener('click', function (e) { var b = e.target.closest('.item'); if (b) abreLb(+b.dataset.i); });

  /* lightbox */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbI = 0;
  function mostra(i) {
    lbI = (i + lista.length) % lista.length; var o = lista[lbI];
    lbImg.src = 'img/g/' + o.n + '.webp'; lbImg.alt = o.titulo; lbCap.textContent = o.titulo + ' · ' + o.estilo;
  }
  function abreLb(i) { mostra(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbX').focus(); }
  function fechaLb() { lb.hidden = true; document.body.style.overflow = ''; }
  $('#lbX').addEventListener('click', fechaLb);
  $('#lbP').addEventListener('click', function () { mostra(lbI - 1); });
  $('#lbS').addEventListener('click', function () { mostra(lbI + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) fechaLb(); });
  addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fechaLb(); else if (e.key === 'ArrowLeft') mostra(lbI - 1); else if (e.key === 'ArrowRight') mostra(lbI + 1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) mostra(lbI + (d < 0 ? 1 : -1)); tx = null; });
  var ESTILO = { real: 'Realismo preto e cinza', anime: 'Anime', geek: 'Cinema e geek', retrato: 'Retrato', animal: 'Animais' };
  $('#lbQuero').addEventListener('click', function () {
    var o = lista[lbI]; fechaLb();
    form.ideia.value = 'Quero algo no estilo do trabalho "' + o.titulo + '" que vi no site.';
    marca('estilo', ESTILO[o.tema]);
    form.scrollIntoView({ behavior: 'smooth' });
  });

  /* formulário: copia a mensagem e abre o Direct */
  var form = $('#form');
  function marca(nome, valor) { $$('input[name="' + nome + '"]', form).forEach(function (r) { r.checked = r.value === valor; }); }
  function copia(txt) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt).catch(function () { velho(txt); });
    velho(txt); return Promise.resolve();
  }
  function velho(txt) {
    var t = document.createElement('textarea'); t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(t);
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim(), erro = $('.erro', form);
    if (!nome) { erro.hidden = false; form.nome.focus(); return; }
    erro.hidden = true;
    var est = $('input[name="estilo"]:checked', form);
    var L = ['Olá, Catalino! Sou ' + nome + ' e quero um orçamento.', ''];
    var add = function (k, x) { if (x) L.push(k + ': ' + x); };
    add('Estilo', est ? est.value : ''); add('Local', form.local.value.trim());
    add('Tamanho', form.tamanho.value); add('Disponibilidade', form.disp.value);
    var ideia = form.ideia.value.trim(); if (ideia) { L.push(''); L.push('Ideia: ' + ideia); }
    L.push(''); L.push('(pedido enviado pelo site)');
    var msg = L.join('\n');
    var janela = window.open('https://ig.me/m/' + IG, '_blank');
    copia(msg);
    var av = $('#aviso'); av.textContent = 'Mensagem copiada. No Direct, é só colar e enviar, com as imagens de referência e a foto do local.'; av.hidden = false;
    window.__ultimaMensagem = msg;
  });

  /* entrada ao rolar */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('vis'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function observa(els) { els.forEach(function (el) { if (io) io.observe(el); else el.classList.add('vis'); }); }
  render();
  observa($$('.rev').filter(function (el) { return !el.classList.contains('item'); }));
})();
