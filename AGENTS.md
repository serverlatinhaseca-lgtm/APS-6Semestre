# AGENTS.md — APS-6Semestre / VerdeID + Reconhecimento Facial

> Projeto acadêmico (APS 6º semestre). Conteúdo e commits em **pt-BR**.
> Protótipo navegável de identificação biométrica com controle de acesso por nível a informações ambientais.

---

## 1. Visão geral do repositório

O VerdeID tem **duas partes com regras diferentes**:

| Parte | Pode alterar? | O que é |
|---|---|---|
| **Site (frontend)** — HTML, CSS, JS em raiz e `assets/` | ✅ **SIM** | Landing, login, cadastro, painel, artigos, portal com mapa/vídeos/gráficos. Pode editar, integrar e consertar livremente. |
| **Reconhecimento facial (backend `src/`)** | ❌ **NÃO** | Foi feito por outra parte do time. **Não alterar.** Apenas integrar com o site para funcionar. |

---

## 2. Stack

| Camada | Tecnologia | Detalhes |
|---|---|---|
| Frontend | HTML/CSS/JS estático | Sem build. HTMLs na raiz + `assets/css/style.css` + `assets/js/`. Usa `localStorage`/`sessionStorage` → **não abrir via `file://`**. |
| Servidor frontend | `python3 -m http.server 8000` | Executar **na raiz** do repositório → `http://localhost:8000` |
| Backend API | FastAPI + uvicorn | `src/api.py`, porta 8000 |
| Banco | PostgreSQL 17 | Via `compose.yaml`, porta 5432, db `aps_reconhecimento_facial`, user `aps_user` |
| Reconhecimento facial | DeepFace (outro time) | `src/reconhecimento.py` — `detector_backend="opencv"`, limite 0.55. Não alterar. |
| Dependências Python | `requirements.txt` | `deepface`, `opencv-contrib-python`, `psycopg[binary]`, `fastapi`, `uvicorn`, `httpx2` |

---

## 3. Comandos exatos (ordem importa)

### 3.1 Frontend (site)
```bash
# Executar NA RAIZ do repositório
python3 -m http.server 8000
```
Abrir `http://localhost:8000/index.html`.

Fluxo de validação manual do site: `index → login → painel → artigo`.

### 3.2 Backend (API + reconhecimento facial)

**Arquivos de suporte:**
- `.env.example` — modelo do arquivo de variáveis de ambiente. Copie para `.env` e preencha `POSTGRES_PASSWORD`.
- `setup_backend.sh` — script automatizado que sobe o PostgreSQL, instala dependências e instrui como iniciar a API.

```bash
# 1) Copie o modelo de ambiente e edite a senha
cp .env.example .env
# edite o .env com sua POSTGRES_PASSWORD

# 2) Sobe PostgreSQL na porta 5432
docker compose up

# 3) Instala dependências Python
pip install -r requirements.txt

# 4) Inicia a API
uvicorn src.api:app
# ou: python src/main.py   (sobe API + loop da câmera OpenCV)
```
Ou use o script automatizado:
```bash
chmod +x setup_backend.sh
./setup_backend.sh
```

**Ordem obrigatória:** banco primeiro → dependências depois → uvicorn por último.
`src/banco_dados.py` carrega `.env` na raiz (`load_dotenv`) e exige `POSTGRES_PASSWORD`.

### 3.3 Testes
```bash
pytest tests/              # todos os testes
pytest tests/test_api.py   # um arquivo específico
```
Os testes exigem o PostgreSQL rodando (`docker compose up`) antes de executar.

### 3.4 Porta 8000 (conflito)
Usada tanto pelo `http.server` (frontend) quanto pelo uvicorn (backend). **Não rodar ambos na mesma porta simultaneamente** sem ajustar uma das portas.

---

## 4. Estrutura do repositório

### Raiz — site (pode alterar)
| Arquivo | Função |
|---|---|
| `index.html` | Landing completa com mapa, vídeos, gráficos, fotos, artigos por nível, simulação de login facial, portal pós-login |
| `login.html` | Login com contas demo |
| `cadastro.html` | Cadastro com **escolha de nível de acesso** (1, 2 ou 3) |
| `painel.html` | Acervo filtrado por nível de acesso |
| `artigo.html` | Artigo com controle de acesso (nega se nível insuficiente) |
| `privacidade.html` | Política LGPD / didático |
| `compose.yaml` | Sobe PostgreSQL (`aps-postgres`, porta 5432) |
| `requirements.txt` | Dependências Python do backend |
| `sql/inicializacao.sql` | Cria tabelas `usuarios` e `dados_ambientais` com dados iniciais por nível (1,2,3) |
| `.env` | **Não commitar.** Contém `POSTGRES_PASSWORD`. Criar localmente. |

### `assets/js/` — ordem de carregamento (importa)
`data.js` → `auth.js` → `app.js` (carregados no rodapé dos HTMLs da raiz).

| Arquivo | Função | Pode alterar? |
|---|---|---|
| `data.js` | Fonte da verdade frontend: `VERDEID_NIVEIS`, `VERDEID_ARTIGOS`, `VERDEID_USUARIOS_DEMO` | ✅ Sim |
| `auth.js` | Expõe `Auth` (entrar/cadastrar/sair/exigir/marcarRosto/nomeNivel/pode). Sessão em `sessionStorage` + `localStorage` (persistente se "lembrar"). | ✅ Sim |
| `app.js` | Nav, reveal, simulação facial (câmera opcional via `getUserMedia`, nunca grava/envia). | ✅ Sim |

### `assets/css/style.css`
Estilização única compartilhada por todos os HTMLs da raiz. ✅ Pode alterar.

### `src/` — backend (parte do reconhecimento facial — do outro time)
| Arquivo | Função | Pode alterar? |
|---|---|---|
| `api.py` | Endpoints FastAPI (`/usuarios`, `/cadastro/foto`, `/reconhecimento`, `/status`, `/sessao`, `/dados/{nivel}`) | ✅ Sim |
| `main.py` | Entry point: sobe API em thread daemon + loop da câmera OpenCV (`cv2.VideoCapture(0)`, reconhecimento a cada 15 frames) | ✅ Sim |
| `reconhecimento.py` | **DeepFace.find** (`detector_backend="opencv"`, limite 0.55), compara frame com imagens cadastradas | ❌ **NÃO** |
| `camera_compartilhada.py` | Frame compartilhado entre câmera e API | ❌ **NÃO** |
| `estado.py` | Estado do reconhecimento em memória (válido 3s) | ❌ **NÃO** |
| `fotos_temporarias.py` | Fotos temporárias do cadastro/reconhecimento | ❌ **NÃO** |
| `banco_dados.py` | `conectar()` ao PostgreSQL `127.0.0.1:5432`, db `aps_reconhecimento_facial`, user `aps_user` | ✅ Sim |
| `usuarios.py` | CRUD de usuários (CPF 11 dígitos, nível 1-3, imagem BYTEA) | ✅ Sim |
| `sessoes.py` | Sessões em memória (token, expiração 15min inatividade / 8h total) | ✅ Sim |
| `servicos.py` | Consulta `dados_ambientais` por nível (`nivel_usuario >= nivel_recurso`) | ✅ Sim |
| `cadastro.py` | Captura de imagem por webcam para cadastro local | ✅ Sim |

**Regra de ouro:** `src/reconhecimento.py`, `src/camera_compartilhada.py`, `src/estado.py` e `src/fotos_temporarias.py` são do outro time. **Não alterar.** Se precisar expor dados para o site, faça via `src/api.py` ou `src/servicos.py`, consumindo o que esses módulos já oferecem.

---

## 5. Funcionalidades do site (frontend)

### 5.1 Landing (`index.html`)
- Hero com varredura de biométria simulada (animação visual, não grava nada)
- 3 seções: Como funciona, Por que é importante, Caso monitorado (agrotóxicos proibidos)
- 3 níveis de acesso explicados com imagens
- Seção de segurança/privacidade (LGPD)
- Equipe (com placeholders para nomes)
- Botão "Acessar plataforma" abre modal de login simulado

### 5.2 Login simulado (`loginOverlay` em `index.html`)
- Modal com área de câmera simulada (SVG, não captura nada)
- Seleção de perfil de teste: Nível 1 (Público), Nível 2 (Diretor), Nível 3 (Ministro)
- Botão "Simular reconhecimento facial →" (apenas visual)
- Após simulação: tela de boas-vindas → portal personalizado

### 5.3 Portal (`#portal` em `index.html`)
- Dashboard com raio-x geral (gráfico de composição do acervo)
- Artigos filtrados por nível do usuário logado
- Vídeos por nível (Vídeo do Nível 1, 2, 3 conforme liberação)
- Gráficos SVG por nível (prevenção/denúncia/emergência, ocorrências, alertas estratégicos)
- Mapa de ocorrências (Leaflet, pontos simulados por nível)
- Linha de apuração em 4 etapas
- Soluções práticas por nível
- Glossário de termos ambientais
- Documentos oficiais (links para leis)
- Conteúdo bloqueado para níveis superiores

### 5.4 Cadastro com nível de acesso (`cadastro.html`)
- Formulário com: Nome, E-mail, Senha (mín. 6), **Nível de acesso (select 1/2/3)**
- Botão "Criar conta e entrar" funciona
- `Auth.cadastrar(nome, email, senha, nivel)` valida que o nível seja 1, 2 ou 3
- Nova conta começa no nível escolhido

### 5.5 Contas demo (senha `demo123`)
| E-mail | Nível | Perfil |
|---|---|---|
| `cidadao@verdeid.demo` | 1 | Cidadão / Público |
| `pesquisador@verdeid.demo` | 2 | Pesquisador / Diretor de divisão |
| `gestor@verdeid.demo` | 3 | Gestor / Ministro |

---

## 6. Endpoints da API (FastAPI, porta 8000)

| Método | Caminho | Autenticação | Descrição |
|---|---|---|---|
| POST | `/usuarios` | Não | Cadastra usuário (CPF, nome, nível 1-3, imagem JPEG/PNG ≤5MB) |
| POST | `/cadastro/foto` | Não | Captura frame da webcam e salva foto temporária |
| POST | `/reconhecimento` | Não | Reconhece facial no frame da webcam (usa DeepFace) |
| GET | `/status` | Bearer token | Dados do usuário da sessão válida + foto base64 |
| POST | `/sessao` | Não | Cria sessão apenas se houver reconhecimento recente (estado válido ≤3s) |
| DELETE | `/sessao` | Bearer token | Encerra sessão |
| GET | `/dados/{nivel_recurso}` | Bearer token | Dados ambientais se `nivel_usuario >= nivel_recurso` |

---

## 7. Controle de acesso por nível

- Nível 1 = Cidadão, Nível 2 = Pesquisador, Nível 3 = Gestor
- Usuário acessa recurso se `nivel_usuario >= nivel_recurso`
- Painel mostra apenas artigos com `nivel ≤ nível do usuário`
- Artigo com nível superior exibe "Acesso negado"

---

## 8. ANÁLISE DE SEGURANÇA E VAZAMENTOS (leitura obrigatória antes de alterar anything)

**Nenhum arquivo de reconhecimento facial foi modificado.**

### 8.1 Dados biométricos (imagens faciais) — PONTOS DE ATENÇÃO

| Onde | O que acontece | Risco |
|---|---|---|
| `sql/inicializacao.sql` | Tabela `usuarios` tem coluna `imagem` (BYTEA) que armazena a foto facial | Armazena dado biométrico no banco |
| `src/usuarios.py` (`cadastrar_usuario`) | Recebe `imagem` em bytes e insere na tabela | Persiste biometria no banco |
| `src/api.py` (`/status`) | Retorna a imagem do usuário em **Base64** no campo `foto` | **Expõe a imagem biométrica via API** — qualquer um com o token baixa a foto do rosto |
| `src/api.py` (`/usuarios`) | Aceita upload de imagem via formulário e salva no banco | Entrada de biometria no sistema |
| `src/reconhecimento.py` | (outro time — não modificar) Grava imagens em `tempfile.TemporaryDirectory()` para DeepFace | Arquivos temporários removidos ao sair do contexto `with` |
| `src/fotos_temporarias.py` | Salva fotos em pasta temporária removida via `atexit` | Removida ao encerrar o processo |

**Ação recomendada (somente no site/frontend, sem tocar no reconhecimento):** não exibir a imagem facial retornada por `/status` na interface do site, a menos que seja estritamente necessário.

### 8.2 CPF (dado pessoal sensível — LGPD)

| Onde | O que acontece | Risco |
|---|---|---|
| `sql/inicializacao.sql` | `cpf CHAR(11) PRIMARY KEY` na tabela `usuarios` | CPF é chave primária — dado sensível exposto no schema |
| `src/api.py` (`/usuarios`) | Retorna `cpf` na resposta do cadastro (status 201) | CPF exposto na resposta da API |
| `src/api.py` (`/status`) | Retorna `cpf` no campo `cpf` da resposta | CPF exposto via API autenticada |

### 8.3 Senhas — VAZAMENTO CONFIRMADO (frontend, pode ser corrigido)

| Onde | O que acontece | Risco |
|---|---|---|
| `assets/js/auth.js` | `Auth.cadastrar` armazena `senha` em **plain text** no `localStorage` (chave `verdeid.users.v1`) | **Senhas em texto claro no navegador.** Qualquer script/extensão com acesso ao `localStorage` pode ler as senhas. |
| `assets/js/auth.js` | `VERDEID_USUARIOS_DEMO` contém senhas hardcoded `demo123` | Senhas demo expostas no código fonte |

**Ação recomendada (frontend, pode ser alterado):** não armazenar senhas em plain text no `localStorage`. Para a versão demo, considerar armazenar apenas um hash ou não persistir usuários cadastrados entre sessões.

### 8.4 Token de sessão e expiração

| Onde | O que acontece | Risco |
|---|---|---|
| `src/sessoes.py` | Tokens gerados com `token_urlsafe(32)`, armazenados em memória | Seguro para demo local. Expiram por inatividade (15 min) ou duração máxima (8 h). |
| `src/estado.py` | Estado de reconhecimento válido por apenas **3 segundos** | `/sessao` falha se o reconhecimento estiver expirado. É por design. |
| `assets/js/auth.js` | Sessão em `sessionStorage` (temporária) + `localStorage` (persistente se "lembrar") | `localStorage` persiste após fechar o navegador |

### 8.5 Variáveis de ambiente e segredos

| Onde | O que acontece | Risco |
|---|---|---|
| `.gitignore` | Ignora `.env`, `.venv`, `database/*`, `database/*.pkl` | ✅ Segredos e cache do DeepFace não são commitados |
| `src/banco_dados.py` | `load_dotenv(BASE_DIR / ".env")` e lê `os.environ["POSTGRES_PASSWORD"]` | Exige `.env` local com `POSTGRES_PASSWORD`. Sem ele, a conexão falha. |
| `compose.yaml` | `env_file: - .env`, expõe porta `127.0.0.1:5432:5432` | Banco acessível apenas no localhost |

### 8.6 Controle de acesso (autorização)

| Onde | O que acontece | Status |
|---|---|---|
| `src/servicos.py` (`pode_acessar`) | `nivel_usuario >= nivel_recurso` | ✅ Correto |
| `src/api.py` (`/dados/{nivel}`) | Verifica sessão e chama `consultar_dados`. Retorna 403 se acesso negado | ✅ Correto |
| `assets/js/painel.html` | Filtra artigos: `a.nivel <= s.nivel` | ✅ Correto no frontend |
| `assets/js/artigo.html` | Bloqueia leitura se `a.nivel > s.nivel` | ✅ Correto no frontend |

### 8.7 Webcam / câmera

| Onde | O que acontece | Risco |
|---|---|---|
| `src/main.py` | `cv2.VideoCapture(0)`. Sem câmera → `SystemExit(1)` | Requer câmera física para `python src/main.py` |
| `assets/js/app.js` / `index.html` | `getUserMedia` apenas para simulação visual. Nunca grava/envia | ✅ Sem vazamento de vídeo no frontend |
| `src/api.py` (`/cadastro/foto`, `/reconhecimento`) | Lê frame da `camera_compartilhada` (memória) e codifica em JPEG | Frame fica em memória, não salvo em disco (exceto fotos temporárias via `fotos_temporarias.py`) |

---

## 9. Regras e gotchas (o que um agente provavelmente esqueceria)

1. **Site não abre via `file://`** — sempre subir `python3 -m http.server 8000` na raiz. Senão `localStorage`/`sessionStorage` e scripts não funcionam corretamente.
2. **Ordem dos scripts JS importa:** `data.js` → `auth.js` → `app.js`. Inverter quebra o site.
3. **Reconhecimento facial é intocável:** não editar `src/reconhecimento.py` nem os módulos de câmera/estado/fotos. Integrar apenas via `src/api.py`.
4. **`main.py` requer webcam:** `cv2.VideoCapture(0)`. Sem câmera, encerra com `SystemExit(1)`. Para rodar só a API sem câmera, use `uvicorn src.api:app`.
5. **Porta 8000 compartilhada:** frontend (`http.server`) e backend (`uvicorn`) usam a mesma porta. Não rodar os dois ao mesmo tempo sem mudar uma porta.
6. **`.env` obrigatório para o banco:** `banco_dados.py` faz `load_dotenv(BASE_DIR / ".env")` e lê `os.environ["POSTGRES_PASSWORD"]`. Sem `.env`, a conexão com PostgreSQL falha.
7. **Sessão facial expira em 3s:** `estado.py` considera autenticação válida apenas por 3 segundos após o reconhecimento. `/sessao` falha se o estado estiver expirado.
8. **Não commitar `.env` nem `database/*`** (já estão no `.gitignore`).
9. **Conteúdo acadêmico com lacunas:** marcar com `[PROVISÓRIO]` ou `[DEMO]`. Não inventar dados nem alterar requisitos silenciosamente.
10. **Biometria nunca é persistida:** reconhecimento no frontend é simulação; no backend, DeepFace compara em diretório temporário que é removido.

---

## 10. Workflow

- Mudanças pequenas e navegáveis.
- `git status` + `git diff` antes de commit.
- Sem push/PR sem pedido explícito.
- Testar manualmente: `index → login → painel → artigo` (frontend) e `docker compose up → uvicorn → pytest` (backend).

---

## 11. Resumo do que está no GitHub

- ✅ Site completo com mapas, vídeos, gráficos, fotos, artigos por nível
- ✅ Cadastro com escolha de nível de acesso (permissão)
- ✅ Contas demo (`cidadao@verdeid.demo`, `pesquisador@verdeid.demo`, `gestor@verdeid.demo`, senha `demo123`)
- ✅ Controle de acesso por nível (1, 2, 3)
- ✅ Reconhecimento facial **não modificado** (outro time)
- ✅ Análise de segurança e vazamentos documentada
- ✅ Comandos exatos para rodar frontend e backend