# AGENTS.md — VerdeID (APS 6º semestre)

- Stack: site estático de arquivo único — tudo em `index.html` (~90 KB, CSS + 2 `<script>` inline). Sem build, sem dependências, sem backend, sem `assets/`. Externos: Google Fonts + imagens/vídeos hotlinked (pexels/unsplash/wikimedia) — precisa de internet.
- Rodar: `python3 -m http.server 8000` na raiz → `http://localhost:8000`.
- Fonte da verdade: `const levels = {'1','2','3'}` no primeiro `<script>` — rótulos, intros, vídeos e `articles[]` por nível (`{category, nivel, img, id, fact, title, summary, detail}`). O segundo `<script>` é só reveal-on-scroll (`watch`); não colocar lógica de negócio nele.
- Login é fake: `simulateLogin()` lê `#demoName` + `#demoLevel` + checkbox `#privacy`, guarda em `currentName/currentLevel` (default `'2'`) só em memória — sem senha, sem storage, recarregar perde a sessão. `logout()` volta para a landing.
- Acesso cumulativo em `showPortal()`: nível 1 vê L1; nível 2 vê L1+L2; nível 3 vê tudo + banner estratégico. Busca `#busca` → `filtrarBiblio()` casa contra `data-t`; `toggleArticle` expande inline; `openArticle(id)` abre overlay. Cada artigo tem `video` próprio (testar HTTP 200 ao trocar o `src`).
- Mapa (só L3) em `initMapa()`: base satélite Esri World Imagery + labels (sem chave) e `PTS` hardcoded `{la,lo,t,d,k,s,r,img}`; L1/L2 veem cartão bloqueado via `mapaSecao()`.
- Facial/biometria é decorativa (SVG/CSS + texto) — sem `getUserMedia`, nada é capturado/enviado: não persistir biometria nem adicionar reconhecimento real.
- Slot facial (módulo externo feito à parte): `window.FaceSlot` detecta `window.VerdeIDFace.verificar()` → `Promise<{ok:true,nome,nivel:'1'|'2'|'3'}|{ok:false,motivo?}>`; o módulo monta a câmera em `#faceMount` (`#facePlaceholder` some). Sem o módulo, `simulateLogin()` segue o fluxo demo. Não mudar esse contrato sem avisar a equipe.
- Edição: linhas muito longas — navegar por âncoras (`id:'...'`, nomes de função) e conferir com grep. Manter arquivo único; não recriar `assets/` nem multipágina sem pedido.
- Conteúdo e commits em pt-BR. Dados ilustrativos marcados `[SIMULAÇÃO]` — não apresentar como reais nem remover a marca silenciosamente.
- Sem testes/lint. Validar manualmente: landing → login (nome + nível) → portal (lista cumulativa, busca, vídeo, mapa) → artigo overlay.
- Workflow: mudanças pequenas; `git status` + `git diff` antes de commit; sem push/PR e sem commitar segredos/`.env`.
