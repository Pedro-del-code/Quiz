"""
QUIZ DA REDAÇÃO — backend Flask
--------------------------------
Serve a página do quiz (estilo Deltarune) e expõe uma API que guarda
o gabarito no servidor, para que o cliente nunca receba a resposta
correta antes de responder.

Endpoints:
    GET  /                -> página principal (index.html)
    GET  /api/start        -> reinicia a sessão e devolve a 1ª pergunta
    GET  /api/question     -> devolve a pergunta atual (sem gabarito)
    POST /api/answer       -> recebe {"option": <int>}, devolve se acertou,
                               o índice correto, pontuação e se acabou
    GET  /api/state        -> estado atual (score, progresso)
"""

import os
import random
from flask import Flask, render_template, jsonify, request, session

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "troque-esta-chave-em-producao")

# ---------------------------------------------------------------------------
# Banco de perguntas — fica só no servidor. O front-end nunca vê "correct".
# ---------------------------------------------------------------------------
QUESTIONS = [
    {
        "q": "Qual é a estrutura básica exigida pela redação do ENEM?",
        "options": [
            "Introdução, desenvolvimento e conclusão com proposta de intervenção",
            "Apenas introdução e conclusão, sem desenvolvimento",
            "Um poema livre sobre o tema",
            "Diálogo entre dois personagens fictícios",
        ],
        "correct": 0,
        "fun": "O TV sabe: sem essas três partes, não tem show completo!",
    },
    {
        "q": "O que é 'tese', dentro do parágrafo de introdução?",
        "options": [
            "O título da redação",
            "O ponto de vista que o autor vai defender e desenvolver no texto",
            "Uma citação de um filósofo, obrigatoriamente",
            "O resumo de cada parágrafo de desenvolvimento",
        ],
        "correct": 1,
        "fun": "Sem tese definida, seu texto vira um passeio sem destino.",
    },
    {
        "q": "Para que serve o 'repertório sociocultural' em uma redação nota alta?",
        "options": [
            "Para encher linhas e aumentar o texto",
            "Para citar amigos e experiências pessoais aleatórias",
            "Para embasar os argumentos com dados, fatos, teorias ou referências pertinentes ao tema",
            "É apenas decorativo, não influencia a nota",
        ],
        "correct": 2,
        "fun": "Repertório bom é igual reviravolta de roteirista: sustenta a história toda.",
    },
    {
        "q": "O que caracteriza um bom uso de 'coesão' no texto?",
        "options": [
            "Repetir sempre as mesmas palavras para reforçar a ideia",
            "Usar conectivos e referências que ligam as frases e parágrafos de forma lógica",
            "Escrever frases desconexas de propósito para parecer criativo",
            "Ignorar a pontuação",
        ],
        "correct": 1,
        "fun": "Texto coeso é como uma sinfonia bem regida: cada parte conversa com a outra.",
    },
    {
        "q": "Qual das opções é um erro comum que derruba a nota da redação?",
        "options": [
            "Usar norma culta da língua portuguesa",
            "Apresentar proposta de intervenção detalhada",
            "Fugir do tema proposto",
            "Manter parágrafos bem organizados",
        ],
        "correct": 2,
        "fun": "Fugir do tema é tipo trocar de canal no meio do próprio programa.",
    },
    {
        "q": "Na proposta de intervenção do ENEM, o que NÃO pode faltar?",
        "options": [
            "Agente, ação, meio/modo, finalidade e detalhamento",
            "Apenas uma frase genérica tipo 'o governo deveria fazer algo'",
            "Uma crítica sem sugestão de solução",
            "Repetir a introdução com outras palavras",
        ],
        "correct": 0,
        "fun": "Sem esses cinco elementos, sua proposta é só um discurso vazio de bastidor.",
    },
    {
        "q": "O que significa 'coerência' em um texto dissertativo-argumentativo?",
        "options": [
            "Ter letra bonita e legível",
            "A lógica interna do texto: as ideias fazem sentido entre si, sem contradições",
            "Usar muitas palavras difíceis",
            "Escrever exatamente 30 linhas",
        ],
        "correct": 1,
        "fun": "Texto incoerente é feito personagem que muda de personalidade sem explicação.",
    },
    {
        "q": "Qual conectivo abaixo indica uma ideia de CONTRASTE entre argumentos?",
        "options": ["Além disso", "Portanto", "Entretanto", "Ou seja"],
        "correct": 2,
        "fun": "'Entretanto' é a reviravolta do roteiro: muda o rumo da cena.",
    },
    {
        "q": "Quantas competências avaliam a redação do ENEM ao todo?",
        "options": ["Três", "Cinco", "Sete", "Dez"],
        "correct": 1,
        "fun": "Cinco competências, cinco atos — como um bom especial de TV.",
    },
    {
        "q": "Por que é importante fazer um parágrafo de conclusão forte?",
        "options": [
            "Porque é ali que se retoma a tese e se reforça a proposta de intervenção, fechando o texto com coerência",
            "Porque é o único parágrafo que conta pontos",
            "Porque pode ser idêntico à introdução, copiado e colado",
            "A conclusão é opcional na redação do ENEM",
        ],
        "correct": 0,
        "fun": "Final fraco estraga até o melhor programa — encerre com estilo!",
    },
]


def _public_question(item: dict) -> dict:
    """Remove o gabarito antes de mandar a pergunta para o cliente."""
    return {"q": item["q"], "options": item["options"]}


@app.route("/")
def index():
    return render_template("index.html", total=len(QUESTIONS))


@app.route("/api/start")
def api_start():
    order = list(range(len(QUESTIONS)))
    random.shuffle(order)
    session["order"] = order
    session["current"] = 0
    session["score"] = 0

    idx = session["order"][0]
    return jsonify(
        {
            "question": _public_question(QUESTIONS[idx]),
            "progress": 1,
            "total": len(QUESTIONS),
            "score": 0,
        }
    )


@app.route("/api/question")
def api_question():
    order = session.get("order")
    current = session.get("current")
    if order is None or current is None:
        return jsonify({"error": "sessão não iniciada, chame /api/start"}), 400
    if current >= len(order):
        return jsonify({"error": "quiz já terminou"}), 400

    idx = order[current]
    return jsonify(
        {
            "question": _public_question(QUESTIONS[idx]),
            "progress": current + 1,
            "total": len(order),
            "score": session.get("score", 0),
        }
    )


@app.route("/api/answer", methods=["POST"])
def api_answer():
    order = session.get("order")
    current = session.get("current")
    if order is None or current is None:
        return jsonify({"error": "sessão não iniciada, chame /api/start"}), 400
    if current >= len(order):
        return jsonify({"error": "quiz já terminou"}), 400

    data = request.get_json(silent=True) or {}
    chosen = data.get("option")
    if not isinstance(chosen, int):
        return jsonify({"error": "envie {'option': <int>}"}), 400

    idx = order[current]
    item = QUESTIONS[idx]
    correct_idx = item["correct"]
    is_correct = chosen == correct_idx

    if is_correct:
        session["score"] = session.get("score", 0) + 1

    session["current"] = current + 1
    finished = session["current"] >= len(order)

    response = {
        "correct": is_correct,
        "correct_index": correct_idx,
        "fun_fact": item.get("fun", ""),
        "score": session["score"],
        "finished": finished,
    }

    if not finished:
        next_idx = order[session["current"]]
        response["next_question"] = _public_question(QUESTIONS[next_idx])
        response["progress"] = session["current"] + 1
        response["total"] = len(order)

    return jsonify(response)


@app.route("/api/state")
def api_state():
    return jsonify(
        {
            "score": session.get("score", 0),
            "progress": session.get("current", 0),
            "total": len(session.get("order", [])) or len(QUESTIONS),
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
