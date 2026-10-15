# AGENTS.md — APS-6Semestre / VerdeID

- Site estático sem build nem dependências: `index.html`, `cadastro.html`, `login.html`, `painel.html`, `artigo.html?id=...`, `privacidade.html` + `assets/css/style.css`, `assets/js/{data,auth,app}.js`.
- Rodar com `python3 -m http.server 8000` na raiz; não usar `file://` (quebra `localStorage`/`sessionStorage` e redireciona login/filtros).
- Scripts sempre nesta ordem: `data.js` → `auth.js` → `app.js` (inline de `painel.html`/`artigo.html` depende de `Auth` e `VERDEID_*`).
- Auth é só front: sessão em `verdeid.session.v1` (+ `-persist` se "lembrar"), contas extras em `verdeid.users.v1`; seed em `VERDEID_USUARIOS_DEMO` (`assets/js/data.js`). Demo: `cidadao@` / `pesquisador@` / `gestor@verdeid.demo`, senha `demo123`. `cadastro.html` cria sempre nível 1.
- Controle de acesso: `painel.html` lista `a.nivel <= s.nivel`; `artigo.html` nega se `a.nivel > s.nivel` (comportamento intencional, não bug). Níveis 1 Cidadão / 2 Pesquisador / 3 Gestor são `[PROVISÓRIO]`.
- Facial é simulação didática (`[data-face]` em `app.js`): nunca persistir/enviar imagem ou biometria; câmera via `getUserMedia` é opcional e descartada.
- Conteúdo e commits em pt-BR. Lacunas acadêmicas marcar `[PROVISÓRIO]` ou `[DEMO]`; não inventar dados nem mudar requisitos em silêncio. Não commitar segredos/`.env`.
- Workflow: mudanças pequenas; conferir `git status` + `git diff` antes de commit; sem push/PR sem pedido explícito.
