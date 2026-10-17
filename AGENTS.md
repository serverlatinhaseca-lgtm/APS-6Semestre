# AGENTS.md — APS-6Semestre / VerdeID + Reconhecimento Facial

- Projeto: VerdeID (landing pública + plataforma autenticada por nível de acesso) + backend de reconhecimento facial (FastAPI/PostgreSQL). Idioma do conteúdo e commits: pt-BR.
- Stack: frontend estático sem build (`index.html`, `assets/`, HTMLs em raiz) + backend Python em `src/` (`main.py`, `api.py`, `reconhecimento.py`, `usuarios.py`, `sessoes.py`, `servicos.py`, `banco_dados.py`, `cadastro.py`, `estado.py`, `camera_compartilhada.py`, `fotos_temporarias.py`). Banco: PostgreSQL via `compose.yaml`; schema em `sql/inicializacao.sql`.
- Rodar frontend: `python3 -m http.server 8000` na raiz → `http://localhost:8000` (não usar `file://`; usa `localStorage`/`sessionStorage`).
- Rodar backend: `docker compose up` (PostgreSQL na porta 5432) + `pip install -r requirements.txt` e `uvicorn src.api:app` (ou `python src/main.py`). Arquivo `.env` não commitar — criar localmente.
- Ordem de scripts frontend (importa): `data.js` → `auth.js` → `app.js` (carregados no rodapé de `index.html`; HTMLs da raiz reutilizam os mesmos).
- Fonte da verdade frontend: `assets/js/data.js` (`VERDEID_NIVEIS`, `VERDEID_ARTIGOS`, `VERDEID_USUARIOS_DEMO`); `assets/js/auth.js` expõe `Auth`. Contas demo: `cidadao@verdeid.demo`, `pesquisador@verdeid.demo`, `gestor@verdeid.demo`, senha `demo123`.
- Reconhecimento facial: simulação didática no frontend; backend real em `src/reconhecimento.py` (DeepFace). Não persistir biometria real, não commitar segredos/`.env`.
- Conteúdo acadêmico: lacunas da proposta usar `[PROVISÓRIO]` ou `[DEMO]`. Não inventar dados nem alterar requisitos silenciosamente.
- Testes: `tests/` (pytest). Validar manualmente: frontend `index → login → painel → artigo`; backend `docker compose up → uvicorn → testes`.
- Workflow: mudanças pequenas e navegáveis; `git status` + `git diff` antes de commit; sem push/PR sem pedido explícito.
