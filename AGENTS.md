# AGENTS.md — APS-6Semestre / VerdeID + Reconhecimento Facial

## 1. Visão geral

**VerdeID** = landing pública estática + plataforma autenticada por nível de acesso + backend de reconhecimento facial (FastAPI/PostgreSQL). Idioma do conteúdo e commits: **pt-BR**.

O repo tem **duas partes com regras diferentes**:

| Parte | Pode alterar? | Observação |
|---|---|---|
| **Site (frontend)** — HTML, CSS, JS em raiz e `assets/` | ✅ Sim | Pode editar, integrar e consertar livremente. |
| **Reconhecimento facial (backend `src/`)** | ❌ **NÃO** | Foi feito por outra parte do time. **Não alterar.** Apenas integrar com o site para funcionar. |

## 2. Stack

- **Frontend:** HTML/CSS/JS estático, sem build. HTMLs na raiz + `assets/css/style.css` + `assets/js/`. Usa `localStorage`/`sessionStorage` → **não abrir via `file://`**. Servir com `python3 -m http.server 8000` na raiz → `http://localhost:8000`.
- **Backend:** Python em `src/`. FastAPI + uvicorn. Banco PostgreSQL via `compose.yaml` (porta 5432). Schema em `sql/inicializacao.sql`.
- **Reconhecimento facial:** simulação didática no frontend; backend real em `src/reconhecimento.py` (DeepFace). Não persistir biometria real.

## 3. Comandos exatos (ordem importa)

### 3.1 Frontend (site)
```
python3 -m http.server 8000   # executar NA RAIZ do repositório
```
Abrir `http://localhost:8000/index.html`. Fluxo de validação manual: `index → login → painel → artigo`.

### 3.2 Backend (API + reconhecimento)
```
docker compose up          # 1) sobe PostgreSQL na porta 5432 (precisa do .env)
pip install -r requirements.txt   # 2) instala dependências Python
uvicorn src.api:app        # 3) inicia a API (ou python src/main.py, que sobe API + câmera)
```
**Ordem obrigatória:** banco primeiro, depois dependências, depois uvicorn. `banco_dados.py` carrega `.env` na raiz (`load_dotenv`) e exige `POSTGRES_PASSWORD`.

### 3.3 Testes
```
pytest tests/              # todos os testes
pytest tests/test_api.py   # um arquivo específico
```
Os testes exigem o PostgreSQL rodando (`docker compose up`) antes de executar.

### 3.4 Porta 8000
Usada tanto pelo `http.server` (frontend) quanto pelo uvicorn (backend). Não rodar ambos na mesma porta simultaneamente sem ajustar.

## 4. Estrutura do repositório e responsabilidades

### Raiz — site (pode alterar)
| Arquivo | Função |
|---|---|
| `index.html` | Landing pública |
| `login.html` | Login (usa `Auth.entrar`) |
| `cadastro.html` | Cadastro de conta demo com escolha de nível (usa `Auth.cadastrar`) |
| `painel.html` | Acervo por nível (usa `Auth.exigir`, filtra artigos) |
| `artigo.html` | Leitura de artigo com controle de acesso por nível |
| `privacidade.html` | Política LGPD / didático |
| `compose.yaml` | Sobe PostgreSQL (`aps-postgres`, porta 5432) |
| `requirements.txt` | `deepface`, `opencv-contrib-python`, `psycopg[binary]`, `fastapi`, `uvicorn`, `httpx2` |
| `sql/inicializacao.sql` | Cria tabelas `usuarios` e `dados_ambientais` com dados iniciais por nível (1,2,3) |
| `.env` | **Não commitar.** Contém `POSTGRES_PASSWORD`. Criar localmente. |

### `assets/js/` — ordem de carregamento (importa)
`data.js` → `auth.js` → `app.js` (carregados no rodapé dos HTMLs da raiz).

| Arquivo | Função | Pode alterar? |
|---|---|---|
| `data.js` | Fonte da verdade frontend: `VERDEID_NIVEIS`, `VERDEID_ARTIGOS`, `VERDEID_USUARIOS_DEMO` | ✅ Sim |
| `auth.js` | Expõe `Auth` (login/cadastro/sair/exigir/marcarRosto/nomeNivel/pode). Mock front-only, sem biometria. Sessão em `sessionStorage` + `localStorage` (persistente se "lembrar"). | ✅ Sim |
| `app.js` | Nav, reveal, simulação facial (câmera opcional via `getUserMedia`, nunca grava/envia). | ✅ Sim |

### `assets/css/style.css`
Estilização única compartilhada por todos os HTMLs da raiz. ✅ Pode alterar.

### `src/` — backend (parte do reconhecimento facial)
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

## 5. Endpoints da API (FastAPI, porta 8000)

| Método | Caminho | Autenticação | Descrição |
|---|---|---|---|
| POST | `/usuarios` | Não | Cadastra usuário (CPF, nome, nível 1-3, imagem JPEG/PNG ≤5MB) |
| POST | `/cadastro/foto` | Não | Captura frame da webcam e salva foto temporária |
| POST | `/reconhecimento` | Não | Reconhece facial no frame da webcam (usa DeepFace) |
| GET | `/status` | Bearer token | Dados do usuário da sessão válida + foto base64 |
| POST | `/sessao` | Não | Cria sessão apenas se houver reconhecimento recente (estado válido ≤3s) |
| DELETE | `/sessao` | Bearer token | Encerra sessão |
| GET | `/dados/{nivel_recurso}` | Bearer token | Dados ambientais se `nivel_usuario >= nivel_recurso` |

## 6. Contas demo (senha `demo123`)

- `cidadao@verdeid.demo` → nível 1
- `pesquisador@verdeid.demo` → nível 2
- `gestor@verdeid.demo` → nível 3

No cadastro (`cadastro.html`) é possível escolher o nível de acesso (1, 2 ou 3) do novo usuário via select; o `Auth.cadastrar` aceita o parâmetro `nivel` e valida que seja 1, 2 ou 3. Todas as contas são mock no `localStorage`/`sessionStorage` — não há backend de usuários nesta versão demo do site.

## 7. Controle de acesso por nível

- Nível 1 = Cidadão, Nível 2 = Pesquisador, Nível 3 = Gestor.
- Usuário acessa recurso se `nivel_usuario >= nivel_recurso`.
- Painel mostra apenas artigos com `nivel ≤ nível do usuário`.
- Artigo com nível superior exibe "Acesso negado".

## 8. ANÁLISE DE SEGURANÇA E VAZAMENTOS (leitura obrigatória antes de alterar anything)

Esta seção lista pontos de atenção verificados no código. **Nenhum arquivo de reconhecimento facial foi modificado.**

### 8.1 Dados biométricos (imagens faciais) — PONTOS DE ATENÇÃO

| Onde | O que acontece | Risco |
|---|---|---|
| `sql/inicializacao.sql` | Tabela `usuarios` tem coluna `imagem` (BYTEA) que armazena a foto facial do usuário. | Armazena dado biométrico no banco. |
| `src/usuarios.py` (`cadastrar_usuario`) | Recebe `imagem` em bytes e insere na coluna `imagem` da tabela `usuarios`. | Persiste biometria no banco. |
| `src/api.py` (`/status`) | Retorna a imagem do usuário em **Base64** no campo `foto` da resposta JSON. | **Expõe a imagem biométrica via API.** Qualquer pessoa com o token pode baixar a foto do rosto. |
| `src/api.py` (`/usuarios`) | Aceita upload de imagem via formulário e salva no banco. | Entrada de biometria no sistema. |
| `src/reconhecimento.py` | (outro time — não modificar) Grava imagens em `tempfile.TemporaryDirectory()` para DeepFace. | Arquivos temporários são removidos ao sair do contexto `with`. |
| `src/fotos_temporarias.py` | Salva fotos em pasta temporária removida via `atexit`. | Removida ao encerrar o processo. |

**Ação recomendada (somente no site/frontend, sem tocar no reconhecimento):** não exibir a imagem facial retornada por `/status` na interface do site, a menos que seja estritamente necessário. O campo `foto` vem em Base64 e é a imagem biométrica do usuário.

### 8.2 CPF (dado pessoal sensível — LGPD)

| Onde | O que acontece | Risco |
|---|---|---|
| `sql/inicializacao.sql` | `cpf CHAR(11) PRIMARY KEY` na tabela `usuarios`. | CPF é chave primária — dado sensível exposto no schema. |
| `src/api.py` (`/usuarios`) | Retorna `cpf` na resposta do cadastro (status 201). | CPF exposto na resposta da API. |
| `src/api.py` (`/status`) | Retorna `cpf` no campo `cpf` da resposta. | CPF exposto via API autenticada. |
| `src/usuarios.py` (`buscar_usuario_por_cpf`) | Consulta usuário por CPF. | Endpoint não exposto na API, mas disponível no backend. |

### 8.3 Senhas — VAZAMENTO CONFIRMADO (frontend, pode ser corrigido)

| Onde | O que acontece | Risco |
|---|---|---|
| `assets/js/auth.js` | `Auth.cadastrar` armazena `senha` em plain text no `localStorage` (chave `verdeid.users.v1`). | **Senhas em texto claro no navegador.** Qualquer script ou extensão com acesso ao `localStorage` pode ler as senhas. |
| `assets/js/auth.js` | `VERDEID_USUARIOS_DEMO` contém senhas hardcoded `demo123`. | Senhas demo expostas no código fonte. |
| `assets/js/auth.js` | `Auth.entrar` armazena a sessão (com `senha`? não, a sessão não armazena senha) — mas `leUsers()` lê usuários com senhas do localStorage. | Usuários cadastrados pelo site têm senhas em plain text persistentes. |

**Ação recomendada (frontend, pode ser alterado):** não armazenar senhas em plain text no `localStorage`. Para a versão demo, considerar armazenar apenas um hash ou não persistir usuários cadastrados entre sessões.

### 8.4 Token de sessão e expiração

| Onde | O que acontece | Risco |
|---|---|---|
| `src/sessoes.py` | Tokens gerados com `token_urlsafe(32)`, armazenados em memória (`sessoes_ativas`). | Seguro para demo local. Sessões expiram por inatividade (15 min) ou duração máxima (8 h). |
| `src/estado.py` | Estado de reconhecimento válido por apenas **3 segundos**. | `/sessao` falha se o reconhecimento estiver expirado. É por design, não é vazamento. |
| `assets/js/auth.js` | Sessão em `sessionStorage` (temporária) + `localStorage` (persistente se "lembrar" marcado). | `localStorage` persiste após fechar o navegador. |

### 8.5 Variáveis de ambiente e segredos

| Onde | O que acontece | Risco |
|---|---|---|
| `.gitignore` | Ignora `.env`, `.venv`, `database/*`, `database/*.pkl`. | ✅ Segredos e cache do DeepFace não são commitados. |
| `src/banco_dados.py` | `load_dotenv(BASE_DIR / ".env")` e lê `os.environ["POSTGRES_PASSWORD"]`. | Exige `.env` local com `POSTGRES_PASSWORD`. Sem ele, a conexão falha. |
| `compose.yaml` | `env_file: - .env`, expõe porta `127.0.0.1:5432:5432`. | Banco acessível apenas no localhost. |

### 8.6 Controle de acesso (autorização)

| Onde | O que acontece | Status |
|---|---|---|
| `src/servicos.py` (`pode_acessar`) | `nivel_usuario >= nivel_recurso`. | ✅ Correto. |
| `src/api.py` (`/dados/{nivel}`) | Verifica sessão e chama `consultar_dados`. Retorna 403 se acesso negado. | ✅ Correto. |
| `assets/js/painel.html` | Filtra artigos: `a.nivel <= s.nivel`. | ✅ Correto no frontend. |
| `assets/js/artigo.html` | Bloqueia leitura se `a.nivel > s.nivel`. | ✅ Correto no frontend. |

### 8.7 Webcam / câmera

| Onde | O que acontece | Risco |
|---|---|---|
| `src/main.py` | `cv2.VideoCapture(0)`. Sem câmera → `SystemExit(1)`. | Requer câmera física. |
| `assets/js/app.js` | `navigator.mediaDevices.getUserMedia({video:true})` apenas para simulação visual. Nunca grava/envia. | ✅ Sem vazamento de vídeo no frontend. |
| `src/api.py` (`/cadastro/foto`, `/reconhecimento`) | Lê frame da `camera_compartilhada` (memória) e codifica em JPEG. | Frame fica em memória, não é salvo em disco (exceto fotos temporárias via `fotos_temporarias.py`). |

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

## 10. Workflow

- Mudanças pequenas e navegáveis.
- `git status` + `git diff` antes de commit.
- Sem push/PR sem pedido explícito.
- Testar manualmente: `index → login → painel → artigo` (frontend) e `docker compose up → uvicorn → pytest` (backend).
