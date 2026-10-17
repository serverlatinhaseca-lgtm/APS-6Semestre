# VerdeID — APS 6º semestre

Plataforma demo: landing pública + área autenticada com acervo filtrado por nível de acesso.

## Rodar

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Fluxo demo

1. `index.html` → landing (problema, como funciona, níveis, privacidade).
2. `cadastro.html` → cria conta nível Cidadão (só no navegador).
3. `login.html` → ou use `cidadao@verdeid.demo` / `pesquisador@verdeid.demo` / `gestor@verdeid.demo`, senha `demo123`.
4. `painel.html` → busca + filtro + verificação facial **simulada**.
5. `artigo.html?id=...` → nega acesso acima do seu nível (de propósito).
6. `privacidade.html` → LGPD didática.

## Notas

- Níveis Cidadão (1) / Pesquisador (2) / Gestor (3) são **[PROVISÓRIO]**.
- Artigos e contas são **[DEMO]**; auth é `localStorage`/`sessionStorage`, sem backend.
- Facial é simulação: nada é gravado ou enviado.
