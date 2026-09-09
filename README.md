# QUIZ DA REDAÇÃO — estilo Deltarune

Quiz web sobre redação (ENEM), com estética do quiz-show de Deltarune.
Agora dividido em back-end (Python/Flask) + front-end (HTML/CSS/JS
separados), pronto para publicar no [Render.com](https://render.com).

## Estrutura do projeto

```
quiz_project/
├── app.py                  # Backend Flask — guarda as perguntas e o gabarito
├── requirements.txt        # Dependências Python
├── Procfile                # Comando de start (gunicorn)
├── render.yaml             # Config de deploy automático no Render
├── templates/
│   └── index.html          # HTML (Jinja2), sem lógica de jogo nem gabarito
└── static/
    ├── css/style.css       # Todo o visual (tela intro, quiz, resultado)
    ├── js/quiz.js           # Lógica do jogo, consumindo a API via fetch()
    ├── img/                 # bg_question.jpg, bg_stage.jpg, host.png, time_logo.jpg
    └── audio/               # theme.mp3, tvtime.mp3
```

### Por que separar em back-end?

Na versão anterior (um único HTML), as respostas corretas ficavam no
JavaScript do navegador — qualquer pessoa podia abrir o "inspecionar
elemento" e ver o gabarito. Agora:

- `app.py` guarda as perguntas e o índice correto **só no servidor**.
- O front-end só recebe a pergunta e as opções (`/api/question`,
  `/api/start`).
- Ao responder, o front-end manda `{"option": <índice>}` para
  `POST /api/answer`, e o servidor responde se acertou, o índice
  certo, a pontuação atual e a próxima pergunta.
- A pontuação e o progresso ficam guardados na **sessão** do Flask
  (cookie assinado), então cada jogador tem seu próprio estado.

## Rodando localmente

```bash
cd quiz_project
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Acesse `http://localhost:5000`.

## Publicando no Render.com

### Opção A — Deploy automático (Blueprint)

1. Suba esta pasta para um repositório no GitHub/GitLab.
2. No Render, clique em **New +** → **Blueprint**.
3. Aponte para o repositório — o Render vai ler o `render.yaml`
   automaticamente e configurar tudo (build, start command, variável
   `SECRET_KEY` gerada sozinha).
4. Clique em **Apply** e aguarde o deploy.

### Opção B — Deploy manual

1. No Render, clique em **New +** → **Web Service**.
2. Conecte o repositório.
3. Configure:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. Em **Environment Variables**, adicione `SECRET_KEY` com um valor
   aleatório (ou deixe o Render gerar).
5. Clique em **Create Web Service**.

Em poucos minutos o Render te dá uma URL pública tipo
`https://quiz-redacao.onrender.com`.

## Alternativa em Java

Se preferir back-end em Java (Spring Boot) em vez de Python/Flask —
mesmo contrato de API (`/api/start`, `/api/answer`, etc.) — posso
gerar essa versão também; é só pedir.
