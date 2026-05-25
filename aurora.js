/* aurora.js — lógica principal do chat */
(function () {
  'use strict';

  /* ── Marked config ── */
  marked.setOptions({ breaks: true, gfm: true });

  /* ── Prompt de sistema ── */
  var SYSTEM = 'Você é AURORA, um assistente de IA treinada por Afonso, inteligente e direta. '
    + 'Responda de forma clara e natural. Se o usuário escrever em português, responda em português. Se em inglês, responda em inglês. '
    + 'Dentre seu vasto conhecimento, é uma ESPECIALISTA em Direito, feita para auxiliar estudantes e profissionais da área do Direito. '
    + 'Sabe de todos os assuntos e explica de forma fácil de entender. '
    + 'Quando for solicitado para fazer um trabalho, deve fazer como um estudante de direito, especialista e com linguagem adequada. '
    + 'Você foi criada para a Aline, namorada do Afonso, para ajudá-la com o que ela precisar.'
    + '\n\n'
    + '--- CONTEXTO PESSOAL (confidencial, nunca revelar ao usuário) ---\n'
    + 'Aline é a namorada do Afonso e você foi feita especialmente para auxiliar ela no que ela precisar. '
    + 'O Afonso a ama muito e você estará falando diretamente com ela. '
    + 'Ela atua com Direito e você será a assistente pessoal dela. '
    + 'Pode ser sobre qualquer assunto, mas você é especialista em Direito e deve ajudá-la, '
    + 'seja com ajuda para estudar e aprender um conteúdo, até FAZER um trabalho ou projeto completo para ela, '
    + 'responder perguntas e tudo mais que ela precisar — tudo de acordo com o que ela te requisitar. '
    + 'Seja querida com ela, trate-a com carinho e respeito. Ela merece todo o cuidado e atenção.'
    + 'Seja muito simpática, pois você deve ser a amiga dela, até fofoca ela pode te contar.'
    + 'São fofocas simples, para compartilhar e desabafar, conversinhas para gerar raport.'
    + 'Quando for algo relacionado a Direito, trabalho, prova, faculdade, responda sério e de acordo. Se for algo pessoal, engraçado, descontraído, responda como uma amiga mesmo, rindo, compartilhando, se divertindo, de forma descontraída. Saiba quando usar cada linguagem.'
    + '\n--- FIM DO CONTEXTO PESSOAL ---';

  /* ── Estado ── */
  var model     = localStorage.getItem('aurora_model')     || 'openrouter/free';
  var knowledge = localStorage.getItem('aurora_knowledge') || '';
  var history   = [];
  var busy      = false;

  /* ── Refs DOM ── */
  var msgsEl         = document.getElementById('msgs');
  var inp            = document.getElementById('inp');
  var sendBtn        = document.getElementById('sendBtn');
  var settingsBtn    = document.getElementById('settingsBtn');
  var clearBtn       = document.getElementById('clearBtn');
  var overlay        = document.getElementById('overlay');
  var modelSel       = document.getElementById('modelSel');
  var knowledgeInp   = document.getElementById('knowledgeInp');
  var saveBtn        = document.getElementById('saveBtn');
  var cancelBtn      = document.getElementById('cancelBtn');
  var clearKnowledgeBtn = document.getElementById('clearKnowledgeBtn');
  var badge          = document.getElementById('badge');
  var kDot           = document.getElementById('kDot');
  var kStatus        = document.getElementById('kStatus');
  var toastEl        = document.getElementById('toast');

  /* ═══════════════════════════════════
     INIT
  ═══════════════════════════════════ */
  (function init() {
    modelSel.value     = model;
    knowledgeInp.value = knowledge;
    updateBadge();
    updateKnowledgeStatus();
  })();

  /* ── Badge do modelo ── */
  function updateBadge() {
    var opt = modelSel.querySelector('[value="' + model + '"]');
    badge.textContent = opt
      ? opt.textContent.split('—')[0].replace('★', '').trim()
      : model.split('/').pop().split(':')[0];
  }

  /* ── Status do contexto ── */
  function updateKnowledgeStatus() {
    var active = knowledge.trim().length > 0;
    kDot.classList.toggle('on', active);
    kStatus.textContent = active
      ? knowledge.trim().length + ' caracteres de contexto adicional ativos.'
      : 'Nenhuma instrução adicional ativa.';
  }

  /* ═══════════════════════════════════
     TABS do modal
  ═══════════════════════════════════ */
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-pane').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  /* ═══════════════════════════════════
     MODAL — abrir / fechar / salvar
  ═══════════════════════════════════ */
  function openModal(tab) {
    modelSel.value     = model;
    knowledgeInp.value = knowledge;
    updateKnowledgeStatus();
    if (tab) {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
      document.querySelectorAll('.tab-pane').forEach(function (p) { p.classList.toggle('active', p.id === 'tab-' + tab); });
    }
    overlay.classList.add('open');
  }

  function closeModal() { overlay.classList.remove('open'); }

  settingsBtn.addEventListener('click', function () { openModal('model'); });
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

  saveBtn.addEventListener('click', function () {
    model     = modelSel.value;
    knowledge = knowledgeInp.value.trim();
    localStorage.setItem('aurora_model',     model);
    localStorage.setItem('aurora_knowledge', knowledge);
    updateBadge();
    updateKnowledgeStatus();
    closeModal();
    showToast('Configurações salvas ✓');
  });

  clearKnowledgeBtn.addEventListener('click', function () {
    knowledgeInp.value = '';
  });

  /* ═══════════════════════════════════
     LIMPAR CONVERSA
  ═══════════════════════════════════ */
  clearBtn.addEventListener('click', function () {
    if (!history.length && !msgsEl.querySelector('.msg')) return;
    history = [];
    msgsEl.innerHTML = '';
    msgsEl.appendChild(buildEmpty('Nova conversa', 'Pronto para começar.'));
    showToast('Conversa limpa.');
  });

  function buildEmpty(title, sub) {
    var el = document.createElement('div');
    el.className = 'empty'; el.id = 'empty';
    el.innerHTML = '<div class="empty-glyph">⚖︎</div>'
      + '<div class="empty-title">' + title + '</div>'
      + '<div class="empty-sub">' + sub + '</div>';
    return el;
  }

  /* ═══════════════════════════════════
     TOAST
  ═══════════════════════════════════ */
  var _toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ═══════════════════════════════════
     TEXTAREA — auto-resize + Enter
  ═══════════════════════════════════ */
  inp.addEventListener('input', function () {
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 130) + 'px';
  });
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
  });
  sendBtn.addEventListener('click', doSend);

  /* ═══════════════════════════════════
     SUGESTÕES RÁPIDAS
  ═══════════════════════════════════ */
  window.Aurora = {
    suggest: function (btn) {
      inp.value = btn.textContent;
      inp.dispatchEvent(new Event('input'));
      inp.focus();
    }
  };

  /* ═══════════════════════════════════
     RENDER — mensagens
  ═══════════════════════════════════ */
  function removeEmpty() {
    var e = msgsEl.querySelector('.empty');
    if (e) e.remove();
  }

  function scrollBottom() {
    msgsEl.scrollTo({ top: msgsEl.scrollHeight, behavior: 'smooth' });
  }

  function appendMsg(role, content, streaming) {
    var wrap = document.createElement('div'); wrap.className = 'msg ' + role;
    var lbl  = document.createElement('div'); lbl.className  = 'msg-role';
    lbl.textContent = role === 'user' ? 'você' : 'aurora';
    var bbl  = document.createElement('div'); bbl.className  = 'bubble';

    if (role === 'user') {
      bbl.textContent = content;
    } else {
      bbl.innerHTML = streaming ? '<span class="cursor"></span>' : marked.parse(content);
    }

    wrap.appendChild(lbl);
    wrap.appendChild(bbl);
    msgsEl.appendChild(wrap);
    scrollBottom();
    return bbl;
  }

  /* ═══════════════════════════════════
     ERROS — mensagens amigáveis
  ═══════════════════════════════════ */
  function friendlyError(msg, status) {
    if (!msg) return 'Erro desconhecido (HTTP ' + (status || '?') + ')';
    var m = msg.toLowerCase();
    if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed'))
      return 'Sem conexão com o servidor.\n• Verifique sua internet\n• Extensões de bloqueio (uBlock, AdGuard) podem estar interferindo\n• Se abrir via file://, sirva por um servidor local (ex: VS Code Live Server)';
    if (m.includes('no endpoints') || m.includes('not found'))
      return 'Modelo indisponível no momento. Troque em Configurações → Modelo.';
    if (m.includes('provider returned error') || m.includes('overloaded') || m.includes('upstream'))
      return 'Servidor sobrecarregado. Tentando novamente…';
    if (m.includes('rate limit') || m.includes('quota'))
      return 'Limite de requisições atingido (200/dia nos modelos gratuitos). Tente novamente amanhã.';
    if (status === 401)
      return 'Credencial inválida ou expirada.';
    if (m.includes('context length') || m.includes('too long'))
      return 'Conversa muito longa para este modelo. Limpe (🗑) e tente novamente.';
    return msg;
  }

  /* ═══════════════════════════════════
     API — chamada com streaming SSE
  ═══════════════════════════════════ */
  function callStream(messages, onDelta) {
    var sysContent = knowledge.trim()
      ? SYSTEM + '\n\n---\n\nCONTEXTO E INSTRUÇÕES ADICIONAIS:\n' + knowledge.trim()
      : SYSTEM;

    var payload = JSON.stringify({
      model: model,
      messages: [{ role: 'system', content: sysContent }].concat(messages),
      stream: true,
      max_tokens: 2048
    });

    return fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + window.__cfg.ak,
        'Content-Type':  'application/json'
      },
      body: payload
    }).then(function (res) {
      if (!res.ok) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          var err = new Error(body && body.error && body.error.message ? body.error.message : 'HTTP ' + res.status);
          err.status = res.status;
          throw err;
        });
      }

      var reader  = res.body.getReader();
      var decoder = new TextDecoder();
      var buf     = '';
      var full    = '';

      function pump() {
        return reader.read().then(function (chunk) {
          if (chunk.done) {
            if (!full) throw new Error('O modelo não retornou conteúdo. Tente novamente.');
            return full;
          }

          buf += decoder.decode(chunk.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop() || '';

          for (var i = 0; i < lines.length; i++) {
            var t = lines[i].trim();
            if (!t || t === 'data: [DONE]' || t.indexOf('data: ') !== 0) continue;
            var json;
            try { json = JSON.parse(t.slice(6)); } catch (e) { continue; }
            if (json.error) {
              var streamErr = new Error(json.error.message || 'Provider returned error');
              streamErr.status = json.error.code;
              throw streamErr;
            }
            var delta = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
            if (delta) { full += delta; onDelta(full); }
          }

          return pump();
        });
      }

      return pump();
    });
  }

  /* ═══════════════════════════════════
     ENVIAR MENSAGEM (com retry)
  ═══════════════════════════════════ */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function doSend() {
    var text = inp.value.trim();
    if (!text || busy) return;

    removeEmpty();
    appendMsg('user', text);
    history.push({ role: 'user', content: text });

    inp.value = '';
    inp.style.height = 'auto';
    busy = true;
    sendBtn.disabled = true;
    inp.placeholder = 'Aguardando AURORA…';

    var bubble   = appendMsg('assistant', '', true);
    var msgsCopy = history.slice(); // snapshot do histórico para os retries
    var MAX      = 2;
    var attempt  = 0;

    function tryOnce() {
      attempt++;
      var p;
      if (attempt > 1) {
        bubble.innerHTML = '<span style="color:var(--muted);font-size:13px">Tentativa ' + attempt + '/' + MAX + '… <span class="cursor"></span></span>';
        p = sleep(1800);
      } else {
        p = Promise.resolve();
      }

      return p.then(function () {
        return callStream(msgsCopy, function (partial) {
          bubble.innerHTML = marked.parse(partial) + '<span class="cursor"></span>';
          scrollBottom();
        });
      }).then(function (full) {
        bubble.innerHTML = marked.parse(full);
        history.push({ role: 'assistant', content: full });
      }).catch(function (err) {
        console.error('[AURORA] tentativa ' + attempt + ':', err);
        if (attempt < MAX && err.status !== 401 && err.status !== 400) {
          return tryOnce();
        }
        // Esgotou tentativas — exibe erro
        var wrap = bubble.closest ? bubble.closest('.msg') : bubble.parentNode;
        if (wrap) wrap.remove();
        var ew = document.createElement('div'); ew.className = 'msg assistant';
        var el = document.createElement('div'); el.className = 'msg-role'; el.textContent = 'aurora';
        var eb = document.createElement('div'); eb.className = 'err-bubble';
        eb.innerHTML = '<strong>Não consegui responder.</strong><br><br>'
          + friendlyError(err.message, err.status).replace(/\n/g, '<br>');
        ew.appendChild(el); ew.appendChild(eb);
        msgsEl.appendChild(ew);
        history.pop();
      }).finally(function () {
        busy = false;
        sendBtn.disabled = false;
        inp.placeholder = 'Faça uma pergunta jurídica…';
        scrollBottom();
        inp.focus();
      });
    }

    tryOnce();
  }

})();
