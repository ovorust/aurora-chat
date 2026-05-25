/* knowledge-manager.js — Lógica do gerenciador de base de conhecimento */
(function () {
  'use strict';

  /* ── Estado global ── */
  var knowledgeData = null;
  var currentEditId = null;
  var currentEditType = null;
  var currentEditTab = null;

  /* ── Refs DOM ── */
  var overlay = document.getElementById('overlay');
  var modal = document.querySelector('.modal');
  var modalTitle = document.getElementById('modalTitle');
  var modalSub = document.getElementById('modalSub');
  var itemTitle = document.getElementById('itemTitle');
  var itemContent = document.getElementById('itemContent');
  var itemCategory = document.getElementById('itemCategory');
  var itemPriority = document.getElementById('itemPriority');
  var closeModalBtn = document.getElementById('closeModalBtn');
  var saveItemBtn = document.getElementById('saveItemBtn');
  var addItemBtn = document.getElementById('addItemBtn');
  var backBtn = document.getElementById('backBtn');
  var toast = document.getElementById('toast');

  /* ── Container lists ── */
  var instructionsList = document.getElementById('instructionsList');
  var preferencesList = document.getElementById('preferencesList');
  var profileList = document.getElementById('profileList');
  var knowledgeList = document.getElementById('knowledgeList');

  /* ═══════════════════════════════════
     INIT
  ═══════════════════════════════════ */
  function init() {
    loadKnowledgeData();
    setupEventListeners();
    renderAllLists();
  }

  /* ═══════════════════════════════════
     CARREGAR DADOS
  ═══════════════════════════════════ */
  function loadKnowledgeData() {
    var raw = localStorage.getItem('aurora_knowledge_base');
    if (raw) {
      try {
        knowledgeData = JSON.parse(raw);
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
        knowledgeData = getDefaultData();
        saveKnowledgeData();
      }
    } else {
      knowledgeData = getDefaultData();
      saveKnowledgeData();
    }
  }

  function saveKnowledgeData() {
    localStorage.setItem('aurora_knowledge_base', JSON.stringify(knowledgeData));
    showToast('Dados salvos com sucesso! ✓');
  }

  function getDefaultData() {
    return {
      version: '1.0',
      metadata: {
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        user: 'Aline'
      },
      instructions: [
        {
          id: 'inst-001',
          type: 'instruction',
          title: 'Especialidade Principal',
          content: 'Foco em Direito com expertise em todas as áreas (Civil, Penal, Trabalhista, Tributário, Administrativo, Processual, etc.)',
          category: 'expertise',
          priority: 'high',
          editable: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'inst-002',
          type: 'instruction',
          title: 'Formato de Respostas',
          content: 'Respostas claras, estruturadas e acessíveis. Use listas quando apropriado. Cite artigos de lei quando relevante.',
          category: 'format',
          priority: 'high',
          editable: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      preferences: [
        {
          id: 'pref-001',
          type: 'preference',
          title: 'Citações Legais',
          content: 'Sempre cite artigos do CPC/2015, CC, CP e Constituição Federal',
          category: 'citations',
          editable: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      student_profile: [
        {
          id: 'prof-001',
          type: 'profile',
          title: 'Situação Acadêmica',
          content: 'Aluna de Direito na Universidade',
          editable: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      knowledge_base: [
        {
          id: 'kb-001',
          type: 'knowledge',
          title: 'Áreas de Especialização',
          items: ['Direito Civil', 'Direito Penal', 'Direito Processual Civil', 'Direito Trabalhista'],
          editable: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  /* ═══════════════════════════════════
     EVENT LISTENERS
  ═══════════════════════════════════ */
  function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-pane').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        document.getElementById('tab-' + tab).classList.add('active');
      });
    });

    addItemBtn.addEventListener('click', openAddModal);
    backBtn.addEventListener('click', function () { window.history.back(); });
    closeModalBtn.addEventListener('click', closeModal);
    saveItemBtn.addEventListener('click', saveItem);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  }

  /* ═══════════════════════════════════
     RENDER LISTS
  ═══════════════════════════════════ */
  function renderAllLists() {
    instructionsList.innerHTML = '';
    preferencesList.innerHTML = '';
    profileList.innerHTML = '';
    knowledgeList.innerHTML = '';

    if (knowledgeData.instructions && knowledgeData.instructions.length > 0) {
      knowledgeData.instructions.forEach(function (item) { renderItem(item, instructionsList, 'instructions'); });
    } else {
      instructionsList.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">Nenhuma instrução adicionada</div><div class="empty-sub">Clique em + Adicionar Item para começar</div></div>';
    }

    if (knowledgeData.preferences && knowledgeData.preferences.length > 0) {
      knowledgeData.preferences.forEach(function (item) { renderItem(item, preferencesList, 'preferences'); });
    } else {
      preferencesList.innerHTML = '<div class="empty-state"><div class="empty-icon">⚙︎</div><div class="empty-text">Nenhuma preferência adicionada</div></div>';
    }

    if (knowledgeData.student_profile && knowledgeData.student_profile.length > 0) {
      knowledgeData.student_profile.forEach(function (item) { renderItem(item, profileList, 'student_profile'); });
    } else {
      profileList.innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><div class="empty-text">Nenhuma informação de perfil</div></div>';
    }

    if (knowledgeData.knowledge_base && knowledgeData.knowledge_base.length > 0) {
      knowledgeData.knowledge_base.forEach(function (item) { renderKnowledgeItem(item, knowledgeList); });
    } else {
      knowledgeList.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-text">Nenhuma base de conhecimento</div></div>';
    }
  }

  function renderItem(item, container, type) {
    var div = document.createElement('div');
    div.className = 'item' + (item.locked ? ' locked' : '');
    var catBadge = item.category ? '<span class="badge-cat">' + item.category + '</span>' : '';
    var lockBadge = item.locked ? '<span class="badge-lock">🔒 Bloqueado</span>' : '';
    
    div.innerHTML = '<div class="item-icon">📌</div>'
      + '<div class="item-content">'
      + '<div class="item-title">' + item.title + '</div>'
      + '<div class="item-desc">' + (item.content || item.items) + '</div>'
      + '<div class="item-meta">'
      + catBadge
      + lockBadge
      + (item.priority ? '<span class="item-meta-item">Prioridade: <strong>' + item.priority + '</strong></span>' : '')
      + '</div>'
      + '</div>'
      + '<div class="item-actions" id="actions-' + item.id + '"></div>';

    container.appendChild(div);
    renderActions(item, type, div.querySelector('.item-actions'));
  }

  function renderKnowledgeItem(item, container) {
    var div = document.createElement('div');
    div.className = 'item';
    var itemsStr = Array.isArray(item.items) ? item.items.join(', ') : String(item.items);
    
    div.innerHTML = '<div class="item-icon">📚</div>'
      + '<div class="item-content">'
      + '<div class="item-title">' + item.title + '</div>'
      + '<div class="item-desc">' + itemsStr + '</div>'
      + '<div class="item-meta"><span class="item-meta-item">Itens: <strong>' + (Array.isArray(item.items) ? item.items.length : 1) + '</strong></span></div>'
      + '</div>'
      + '<div class="item-actions" id="actions-' + item.id + '"></div>';

    container.appendChild(div);
    renderKnowledgeActions(item, div.querySelector('.item-actions'));
  }

  function renderActions(item, type, container) {
    container.innerHTML = '';
    
    if (!item.locked && item.editable !== false) {
      var editBtn = document.createElement('button');
      editBtn.className = 'btn btn-ghost btn-sm';
      editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', function () { openEditModal(item, type); });
      container.appendChild(editBtn);

      var delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger btn-sm';
      delBtn.textContent = 'Deletar';
      delBtn.addEventListener('click', function () { deleteItem(item.id, type); });
      container.appendChild(delBtn);
    } else {
      var viewBtn = document.createElement('button');
      viewBtn.className = 'btn btn-ghost btn-sm';
      viewBtn.textContent = 'Visualizar';
      viewBtn.disabled = true;
      container.appendChild(viewBtn);
    }
  }

  function renderKnowledgeActions(item, container) {
    container.innerHTML = '';
    
    var editBtn = document.createElement('button');
    editBtn.className = 'btn btn-ghost btn-sm';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', function () { openEditKnowledgeModal(item); });
    container.appendChild(editBtn);

    var delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger btn-sm';
    delBtn.textContent = 'Deletar';
    delBtn.addEventListener('click', function () { deleteItem(item.id, 'knowledge_base'); });
    container.appendChild(delBtn);
  }

  /* ═══════════════════════════════════
     MODAL
  ═══════════════════════════════════ */
  function openAddModal() {
    currentEditId = null;
    currentEditType = null;
    modalTitle.textContent = 'Adicionar novo item';
    modalSub.textContent = 'Preencha os campos abaixo';
    itemTitle.value = '';
    itemContent.value = '';
    itemCategory.value = '';
    itemPriority.value = 'medium';
    openModal();
  }

  function openEditModal(item, type) {
    currentEditId = item.id;
    currentEditType = type;
    currentEditTab = type;
    modalTitle.textContent = 'Editar: ' + item.title;
    modalSub.textContent = 'Atualize os campos abaixo';
    itemTitle.value = item.title || '';
    itemContent.value = item.content || '';
    itemCategory.value = item.category || '';
    itemPriority.value = item.priority || 'medium';
    openModal();
  }

  function openEditKnowledgeModal(item) {
    currentEditId = item.id;
    currentEditType = 'knowledge_base';
    currentEditTab = 'knowledge_base';
    modalTitle.textContent = 'Editar: ' + item.title;
    modalSub.textContent = 'Gerenciar itens desta base';
    itemTitle.value = item.title || '';
    itemContent.value = Array.isArray(item.items) ? item.items.join('\n') : item.items;
    itemCategory.value = '';
    itemPriority.value = 'medium';
    openModal();
  }

  function openModal() { overlay.classList.add('open'); }
  function closeModal() { overlay.classList.remove('open'); }

  /* ═══════════════════════════════════
     SAVE
  ═══════════════════════════════════ */
  function saveItem() {
    var title = itemTitle.value.trim();
    var content = itemContent.value.trim();
    var category = itemCategory.value || '';
    var priority = itemPriority.value || 'medium';

    if (!title) { showToast('Título é obrigatório!'); return; }
    if (!content) { showToast('Conteúdo é obrigatório!'); return; }

    if (currentEditId) {
      // Editar
      updateItem(currentEditId, currentEditType, title, content, category, priority);
    } else {
      // Criar novo
      addNewItem(title, content, category, priority);
    }

    closeModal();
    renderAllLists();
    saveKnowledgeData();
  }

  function addNewItem(title, content, category, priority) {
    var newId = 'item-' + Date.now();
    var activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    var type = activeTab;

    if (type === 'knowledge') type = 'knowledge_base';
    if (type === 'profile') type = 'student_profile';

    var newItem = {
      id: newId,
      type: type === 'knowledge_base' ? 'knowledge' : type.slice(0, -1),
      title: title,
      content: type === 'knowledge_base' ? undefined : content,
      items: type === 'knowledge_base' ? content.split('\n').filter(function (x) { return x.trim(); }) : undefined,
      category: category || undefined,
      priority: priority || undefined,
      editable: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!knowledgeData[type]) knowledgeData[type] = [];
    knowledgeData[type].push(newItem);
    showToast('Item adicionado com sucesso! ✓');
  }

  function updateItem(id, type, title, content, category, priority) {
    if (!knowledgeData[type]) return;

    var item = knowledgeData[type].find(function (x) { return x.id === id; });
    if (item) {
      item.title = title;
      if (type === 'knowledge_base') {
        item.items = content.split('\n').filter(function (x) { return x.trim(); });
      } else {
        item.content = content;
        if (category) item.category = category;
        if (priority) item.priority = priority;
      }
      item.updated_at = new Date().toISOString();
      showToast('Item atualizado com sucesso! ✓');
    }
  }

  /* ═══════════════════════════════════
     DELETE
  ═══════════════════════════════════ */
  function deleteItem(id, type) {
    if (!confirm('Tem certeza que deseja deletar este item?')) return;

    if (!knowledgeData[type]) return;

    var idx = knowledgeData[type].findIndex(function (x) { return x.id === id; });
    if (idx > -1) {
      knowledgeData[type].splice(idx, 1);
      renderAllLists();
      saveKnowledgeData();
      showToast('Item deletado com sucesso! ✓');
    }
  }

  /* ═══════════════════════════════════
     TOAST
  ═══════════════════════════════════ */
  var _toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }

  /* ── Start ── */
  init();
})();
