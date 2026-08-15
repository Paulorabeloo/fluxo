"""Taxonomia de grupos e categorias de um orcamento domestico tipico."""

CATALOGO = {
    "receita": {"Receitas": ["Salário", "Aluguel recebido", "Pensão", "Horas extras",
                             "13º salário", "Férias", "Outros"]},
    "investimento": {"Investimentos": ["Ações", "Tesouro Direto", "Renda fixa",
                                       "Previdência privada", "Outros"]},
    "divida": {"Dívidas": ["Pagamento de dívidas", "Empréstimo", "Cartão atrasado", "Outros"]},
    "despesa": {
        "Fixas": ["Aluguel", "Condomínio", "Prestação da casa", "Seguro da casa", "Diarista",
                  "Prestação do carro", "Seguro do carro", "Estacionamento", "Seguro saúde",
                  "Plano de saúde", "Colégio", "Faculdade", "Curso", "IPTU", "IPVA", "DAS (MEI)"],
        "Variáveis": ["Luz", "Água", "Telefone celular", "Gás", "TV / Streaming", "Internet",
                      "Uber", "Ônibus", "Combustível", "Supermercado", "Feira", "Besteiras",
                      "Medicamentos", "Cabeleireiro", "Perfume e cosméticos",
                      "Produtos de cuidado", "Academia"],
        "Extras": ["Médico", "Dentista", "Lentes e óculos", "Manutenção do carro",
                   "Manutenção da casa", "Curso TI", "Outros cursos"],
        "Adicionais": ["Jogos e assinaturas", "Cartão de crédito", "Restaurantes e bares",
                       "Itens de computador", "Roupas e calçados", "Presentes",
                       "Acessórios", "Festas e lazer"],
    },
}
