# 📚 Gerenciador de Base de Conhecimento - AURORA

Um gerenciador completo de base de conhecimento para personalizar instruções, preferências e contexto da assistente de IA AURORA.

## 🚀 Como Usar

### Acesso
Abra o arquivo `knowledge-manager.html` no seu navegador:
```
file:///caminho/para/knowledge-manager.html
```

Ou sirva via servidor local:
```bash
# VS Code Live Server, ou:
npx http-server
```

### Funcionalidades

#### 📌 Instruções
Defina as diretrizes principais da AURORA:
- **Especialidade Principal**: Áreas de expertise
- **Formato de Respostas**: Como estruturar respostas
- **Capacidades**: Tipos de trabalhos que pode fazer
- **Tone**: Personalidade da assistente

#### ⚙️ Preferências
Configure comportamentos específicos:
- **Citações Legais**: Quais documentos citar
- **Linguagem**: Tom e nível técnico
- **Formato Acadêmico**: Estrutura de textos

#### 👤 Perfil
Informações sobre o usuário (Aline):
- Situação acadêmica
- Atuação profissional
- Contexto pessoal

#### 📚 Base de Conhecimento
Áreas de especialização e tipos de trabalhos aceitos:
- Adicione/edite/remova categorias
- Organize itens por categoria
- Priorize tópicos

---

## 🎯 Operações

### ✅ Adicionar Item
1. Clique em **+ Adicionar Item**
2. Preencha título e conteúdo
3. Selecione categoria (opcional)
4. Define prioridade
5. Clique em **Salvar**

### ✏️ Editar Item
1. Clique em **Editar** no item
2. Modifique os campos
3. Clique em **Salvar**

### 🗑️ Deletar Item
1. Clique em **Deletar** no item
2. Confirme a ação

---

## 💾 Armazenamento

Todos os dados são salvos em **localStorage** do navegador:
```javascript
localStorage.getItem('aurora_knowledge_base')
```

### Exportar Dados
Para fazer backup, abra o console e execute:
```javascript
var data = localStorage.getItem('aurora_knowledge_base');
console.log(JSON.parse(data));
// Copie o output e salve em um arquivo JSON
```

### Importar Dados
Para restaurar de um backup:
```javascript
var backup = { /* seu JSON aqui */ };
localStorage.setItem('aurora_knowledge_base', JSON.stringify(backup));
location.reload();
```

---

## 🔒 Itens Bloqueados

Alguns itens vêm bloqueados por padrão (não podem ser editados):
- ✅ **System Prompt** - Mantém integridade da AURORA
- ✅ **Personal Context** - Contexto confidencial

Apenas itens **editáveis** podem ser modificados ou removidos.

---

## 📝 Estrutura do JSON

```json
{
  "version": "1.0",
  "metadata": { ... },
  "instructions": [
    {
      "id": "inst-001",
      "type": "instruction",
      "title": "Exemplo",
      "content": "Conteúdo",
      "category": "expertise",
      "priority": "high",
      "editable": true,
      "created_at": "ISO-8601",
      "updated_at": "ISO-8601"
    }
  ],
  "preferences": [ ... ],
  "student_profile": [ ... ],
  "knowledge_base": [ ... ]
}
```

---

## 🔄 Integração com AURORA

O arquivo `aurora.js` deve ser atualizado para ler essas instruções:

```javascript
// No aurora.js, ao construir o prompt:
var knowledgeDb = JSON.parse(localStorage.getItem('aurora_knowledge_base'));
var instructions = knowledgeDb.instructions.map(i => i.content).join('\n\n');

var sysContent = SYSTEM + '\n\n--- INSTRUÇÕES ADICIONAIS ---\n' + instructions;
```

---

## 📖 Categorias Disponíveis

- **expertise** - Áreas de especialização
- **format** - Formato e estrutura
- **capabilities** - Capacidades e habilidades
- **personality** - Tone e personalidade
- **citations** - Citações e referências
- **language** - Linguagem e clareza
- **academic_format** - Formato acadêmico
- **other** - Outros

---

## 🎨 Interface

- **Responsiva**: Funciona em desktop e mobile
- **Dark Mode**: Tema escuro profissional
- **Modal Intuitivo**: Edição em pop-up
- **Toast Feedback**: Notificações de ação
- **Abas Organizadas**: Separação por tipo

---

## 🐛 Troubleshooting

### Dados não aparecem
- Verifique se o localStorage está habilitado
- Limpe cache do navegador
- Tente recarregar a página

### Não consigo deletar
- Verificar se o item está bloqueado (🔒)
- Apenas itens editáveis podem ser deletados

### Mudanças não salvam
- Verifique permissões de localStorage
- Modo privado do navegador não persiste dados

---

## 📞 Próximas Melhorias

- [ ] Sincronização com servidor
- [ ] Exportar/importar JSON
- [ ] Busca e filtro
- [ ] Versionamento de mudanças
- [ ] Integração direta com aurora.js

---

**Desenvolvido para AURORA** © 2026
