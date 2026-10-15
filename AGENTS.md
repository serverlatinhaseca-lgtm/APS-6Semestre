# AGENTS.md — APS-6Semestre / VerdeID

- Projeto: VerdeID — landing pública + plataforma autenticada com conteúdo por nível de acesso. Idioma do conteúdo e commits: pt-BR.
- Stack: site estático sem build (HTML/CSS/JS em `index.html`, `assets/`). Rodar com `python3 -m http.server 8000` na raiz; não abrir via `file://` se testar login/filtros.
- Conteúdo acadêmico: lacunas da proposta usar marcador `[PROVISÓRIO]` ou `[DEMO]`. Não inventar dados nem alterar requisitos silenciosamente.
- Segurança/LGPD: reconhecimento facial é simulação didática. Não persistir biometria real, não commitar segredos ou `.env`.
- Workflow: mudanças pequenas e navegáveis; conferir `git status` + `git diff` antes de commit; sem push/PR sem pedido explícito.
