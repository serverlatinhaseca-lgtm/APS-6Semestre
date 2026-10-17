# AGENTS.md — APS-6Semestre / VerdeID

- Projeto: VerdeID — landing pública + plataforma autenticada com conteúdo por nível de acesso. Idioma do conteúdo e commits: pt-BR.
- Stack: site estático sem build (HTML/CSS/JS em `index.html`, `assets/`). Rodar com `python3 -m http.server 8000` na raiz; não abrir via `file://` se testar login/filtros (usa `localStorage`/`sessionStorage`).
- Ordem de scripts (importa): `data.js` → `auth.js` → `app.js` (carregados no rodapé de `index.html`). `painel.html`, `login.html`, `cadastro.html`, `artigo.html` reutilizam esses mesmos scripts.
- Fonte da verdade: `assets/js/data.js` define `VERDEID_NIVEIS` (1 Cidadão, 2 Pesquisador, 3 Gestor), `VERDEID_ARTIGOS` (filtro por `artigo.nivel <= sessão.nivel`) e `VERDEID_USUARIOS_DEMO`. `assets/js/auth.js` expõe `Auth` (`entrar/cadastrar/sair`; sessão em `sessionStorage`, persistência opcional em `localStorage`). `assets/js/app.js` cuida da nav/reveal e da verificação facial simulada.
- Contas demo: `cidadao@verdeid.demo` / `pesquisador@verdeid.demo` / `gestor@verdeid.demo`, senha `demo123`. `cadastro.html` cria conta nível 1.
- Conteúdo acadêmico: lacunas da proposta usar marcador `[PROVISÓRIO]` ou `[DEMO]`. Não inventar dados nem alterar requisitos silenciosamente.
- Segurança/LGPD: reconhecimento facial é simulação didática (apenas visual no navegador). Não persistir biometria real, não commitar segredos ou `.env`.
- Fluxo de validação manual: `index.html` → `login.html` (conta demo) → `painel.html` (acervo filtrado por nível) → `artigo.html?id=...` (nega acesso se nível insuficiente).
- Workflow: mudanças pequenas e navegáveis; conferir `git status` + `git diff` antes de commit; sem push/PR sem pedido explícito.
