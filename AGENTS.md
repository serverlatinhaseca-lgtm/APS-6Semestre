# AGENTS.md — APS-6Semestre / VerdeID + Reconhecimento Facial

> Projeto acadêmico (APS 6º semestre). Conteúdo e commits em **pt-BR**.
> Protótipo navegável de identificação biométrica com controle de acesso por nível a informações ambientais.

---

## 1. Visão geral do repositório

O VerdeID tem **duas partes com regras diferentes**:

| Parte | Pode alterar? | O que é |
|---|---|---|
| **Site (frontend)** — HTML, CSS, JS em raiz e `assets/` | ✅ **SIM** | Landing, login, cadastro com webcam, painel, artigos, portal com mapa/vídeos/gráficos. Pode editar livremente. |
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

Fluxo de validação manual: `index → login → cadastro → painel → artigo`.

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
| `cadastro.html` | Cadastro com CPF, nível de acesso (1/2/3) e webcam para foto |
| `painel.html` | Acervo filtrado por nível de acesso + webcam para verificação facial |
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
| `auth.js` | Expõe `Auth` (entrar/cadastrar/sair/exigir/marcarRosto/nomeNivel/pode). Sessão em `sessionStorage` + `localStorage`. | ✅ Sim |
| `app.js` | Nav, reveal, simulação facial (câmera opcional via `getUserMedia`, nunca grava/envia). | ✅ Sim |

### `assets/css/style.css`
Estilização única compartilhada por todos os HTMLs da raiz. ✅ Pode alterar.

### `src/` — backend (parte do reconhecimento facial — do outro time)
| Arquivo | Função | Pode alterar? |
|---|---|---|
| `api.py` | Endpoints FastAPI (`/usuarios`, `/cadastro/foto`, `/reconhecimento`, `/status`, `/sessao`, `/dados/{nivel}`) | ✅ Sim |
| `main.py` | Entry point: sobe API em thread daemon + loop da câmera OpenCV | ✅ Sim |
| `reconhecimento.py` | **DeepFace.find** (outro time — **não alterar**) | ❌ **NÃO** |
| `camera_compartilhada.py` | Frame compartilhado entre câmera e API (outro time — **não alterar**) | ❌ **NÃO** |
| `estado.py` | Estado do reconhecimento em memória (outro time — **não alterar**) | ❌ **NÃO** |
| `fotos_temporarias.py` | Fotos temporárias do cadastro/reconhecimento (outro time — **não alterar**) | ❌ **NÃO** |
| `banco_dados.py` | `conectar()` ao PostgreSQL | ✅ Sim |
| `usuarios.py` | CRUD de usuários (CPF 11 dígitos, nível 1-3, imagem BYTEA) | ✅ Sim |
| `sessoes.py` | Sessões em memória | ✅ Sim |
| `servicos.py` | Consulta `dados_ambientais` por nível | ✅ Sim |
| `cadastro.py` | Captura de imagem por webcam para cadastro local | ✅ Sim |

**Regra de ouro:** `src/reconhecimento.py`, `src/camera_compartilhada.py`, `src/estado.py` e `src/fotos_temporarias.py` são do outro time. **Não alterar.**

---

## 5. Funcionalidades do site (frontend)

### 5.1 Landing (`index.html`)
- Hero com varredura de biométria simulada
- 3 seções: Como funciona, Por que é importante, Caso monitorado (agrotóxicos proibidos)
- 3 níveis de acesso explicados com imagens
- Seção de segurança/privacidade (LGPD)
- Equipe e CTA para acessar

### 5.2 Login (`login.html`)
- Login com contas demo
- Link "Criar conta" para o cadastro

### 5.3 Cadastro (`cadastro.html`) — **NOVO**
- Nome completo
- CPF (com máscara e validação)
- E-mail
- Senha (mín. 6 caracteres)
- Nível de acesso (1, 2 ou 3 via select)
- **Webcam:** botão "Ativar câmera", "Capturar foto" com preview, "Limpar foto"
- **Botão "Criar conta e entrar":** envia para `POST /usuarios` da API; se API indisponível, salva no `localStorage` (modo demo)

### 5.4 Painel (`painel.html`) — **ATUALIZADO**
- Acervo filtrado por nível
- **Webcam:** botão "Ativar câmera", "Verificar rosto (simulação)", "Parar câmera"
- Busca e filtro por nível

### 5.5 Artigo (`artigo.html`)
- Leitura com controle de acesso por nível

### 5.6 Contas demo (senha `demo123`)
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
| POST | `/sessao` | Não | Cria sessão apenas se houver reconhecimento recente |
| DELETE | `/sessao` | Bearer token | Encerra sessão |
| GET | `/dados/{nivel_recurso}` | Bearer token | Dados ambientais se `nivel_usuario >= nivel_recurso` |

---

## 7. Controle de acesso por nível

- Nível 1 = Cidadão, Nível 2 = Pesquisador, Nível 3 = Gestor
- Usuário acessa recurso se `nivel_usuario >= nivel_recurso`
- Painel mostra apenas artigos com `nivel ≤ nível do usuário`
- Artigo com nível superior exibe "Acesso negado"

---

## 8. ANÁLISE DE SEGURANÇA E VAZAMENTOS

**Nenhum arquivo de reconhecimento facial foi modificado.**

### 8.1 Dados biométricos
| Onde | Risco |
|---|---|
| `sql/inicializacao.sql` | Coluna `imagem` (BYTEA) armazena foto facial |
| `src/api.py` (`/status`) | Retorna imagem em Base64 — expõe biometria via API |
| `src/fotos_temporarias.py` | Arquivos temporários removidos via `atexit` |

**Recomendação:** não exibir a imagem facial retornada por `/status` na interface do site, a menos que seja estritamente necessário.

### 8.2 Senhas (VAZAMENTO CONFIRMADO — frontend)
- `assets/js/auth.js` armazena senhas em plain text no `localStorage` (chave `verdeid.users.v1`)
- **Ação recomendada:** não armazenar senhas em plain text; usar hash ou não persistir entre sessões

### 8.3 Variáveis de ambiente
- `.gitignore` ignora `.env`, `.venv`, `database/*` ✅
- `banco_dados.py` exige `POSTGRES_PASSWORD` via `.env`

---

## 9. Regras e gotchas

1. **Site não abre via `file://`** — sempre subir `python3 -m http.server 8000` na raiz
2. **Ordem dos scripts JS importa:** `data.js` → `auth.js` → `app.js`
3. **Reconhecimento facial é intocável:** não editar `src/reconhecimento.py` nem módulos de câmera/estado/fotos
4. **`main.py` requer webcam:** `cv2.VideoCapture(0)`. Sem câmera, encerra com `SystemExit(1)`
5. **Porta 8000 compartilhada:** frontend e backend usam a mesma porta
6. **`.env` obrigatório:** sem ele, a conexão com PostgreSQL falha
7. **Sessão facial expira em 3s:** `estado.py` considera autenticação válida apenas por 3 segundos
8. **Não commitar `.env` nem `database/*`** (já no `.gitignore`)
9. **Conteúdo acadêmico:** usar `[PROVISÓRIO]` ou `[DEMO]` para lacunas
10. **Biometria nunca é persistida:** frontend é simulação; backend usa diretório temporário

---

## 10. Workflow

- Mudanças pequenas e navegáveis.
- `git status` + `git diff` antes de commit.
- Sem push/PR sem pedido explícito.
- Testar manualmente: `index → login → cadastro → painel → artigo`.

---

## 11. Resumo do que está no GitHub

- ✅ Site completo com mapas, vídeos, gráficos, fotos, artigos por nível
- ✅ **Cadastro com CPF, nível de acesso e webcam (botão "Criar conta e entrar")**
- ✅ **Painel com webcam para verificação facial simulada**
- ✅ Contas demo (`cidadao@verdeid.demo`, `pesquisador@verdeid.demo`, `gestor@verdeid.demo`, senha `demo123`)
- ✅ Controle de acesso por nível (1, 2, 3)
- ✅ Reconhecimento facial **não modificado** (outro time)
- ✅ Análise de segurança e vazamentos documentada
- ✅ Comandos exatos para rodar frontend e backend
- ✅ `.env.example`, `setup_backend.sh`, `instalar_tudo.sh`, `run_all.sh`, `stop_all.sh`
- ✅ Testes pytest em `tests/`