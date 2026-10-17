/* VerdeID — dados [DEMO]. Níveis [PROVISÓRIO]: 1 Cidadão, 2 Pesquisador, 3 Gestor. */
window.VERDEID_NIVEIS = [
  { id: 1, nome: "Cidadão", desc: "Guias, coleta seletiva, denúncias e educação ambiental básica." },
  { id: 2, nome: "Pesquisador", desc: "Dados, metodologias, relatórios técnicos e séries históricas. [PROVISÓRIO]" },
  { id: 3, nome: "Gestor", desc: "Protocolos de fiscalização, gestão de áreas e respostas a incidentes. [PROVISÓRIO]" }
];

window.VERDEID_ARTIGOS = [
  { id:"guia-coleta", nivel:1, titulo:"Guia prático de coleta seletiva no bairro", resumo:"O que separar, como higienizar e onde entregar. Conteúdo educativo aberto ao nível Cidadão.", corpo:["[DEMO] Este artigo demonstra o controle de acesso por nível. O conteúdo definitivo deve vir da proposta acadêmica.","Separar recicláveis (papel, plástico, metal, vidro) dos orgânicos e rejeitos reduz contaminação e aumenta a reciclagem.","Dica operacional: enxágue rápido, seque e acondicione. Pilhas, remédios e eletrônicos vão a pontos específicos — nunca ao lixo comum."] },
  { id:"denuncia", nivel:1, titulo:"Como registrar uma denúncia ambiental", resumo:"Passo a passo, quais evidências reunir e quais canais acionar.", corpo:["[DEMO] Registre data, hora, local com ponto de referência e fotos sem se expor a risco.","Descreva os fatos de forma objetiva: o que aconteceu, onde, quando e possíveis responsáveis.","Guarde protocolos. Em emergência (fogo, derramamento), acione os serviços locais de urgência primeiro."] },
  { id:"agua-casa", nivel:1, titulo:"Economia de água em casa: 7 hábitos", resumo:"Medidas simples de redução de consumo e detecção de vazamentos.", corpo:["[DEMO] Pequenos vazamentos somam milhares de litros por mês.","Verifique hidrômetro, descargas e torneiras; priorize reparo de goteiras.","Reúso da água da máquina para limpeza e captação de chuva para rega são exemplos didáticos."] },
  { id:"metodologia", nivel:2, titulo:"Metodologia de monitoramento [PROVISÓRIO]", resumo:"Desenho amostral, indicadores e periodicidade para estudos locais.", corpo:["[PROVISÓRIO] Estrutura sugerida até a proposta final definir os indicadores oficiais.","Defina área, pontos de coleta, frequência e responsável por cada medição.","Registre metadados (data, operador, equipamento) para permitir auditoria posterior."] },
  { id:"serie-historica", nivel:2, titulo:"Leitura de séries históricas ambientais", resumo:"Como interpretar tendências sem confundir variação com tendência.", corpo:["[PROVISÓRIO] Exemplo didático de interpretação de dados.","Compare médias móveis e observe sazonalidade antes de concluir.","Documente fontes e limites dos dados; correlação não implica causa."] },
  { id:"relatorio-tecnico", nivel:2, titulo:"Estrutura de relatório técnico", resumo:"Seções mínimas: objetivo, método, resultados, limites e recomendações.", corpo:["[PROVISÓRIO] Modelo simplificado para a disciplina.","Descreva método com detalhe suficiente para reprodução.","Liste limites do estudo e próximos passos com honestidade técnica."] },
  { id:"fiscalizacao", nivel:3, titulo:"Protocolo de fiscalização [PROVISÓRIO]", resumo:"Roteiro de verificação em campo e registro de ocorrência.", corpo:["[PROVISÓRIO] Simulação acadêmica — não usar como norma real.","Planeje equipe, EPI, rota e comunicação antes da saída.","Registre com fotos, coordenadas e testemunhas quando houver."] },
  { id:"areas-protegidas", nivel:3, titulo:"Gestão de áreas sensíveis", resumo:"Zoneamento, controle de acesso e plano de visitação.", corpo:["[PROVISÓRIO] Conteúdo ilustrativo.","Delimite zonas de uso e restrinja acesso a áreas de recuperação.","Monitore trilhas, resíduos e capacidade de carga de visitantes."] },
  { id:"incidentes", nivel:3, titulo:"Resposta a incidentes ambientais", resumo:"Classificação, contenção inicial e comunicação institucional.", corpo:["[PROVISÓRIO] Fluxo didático.","Classifique severidade, isole a área e acione responsáveis.","Registre linha do tempo para lições aprendidas e melhoria do protocolo."] }
];

window.VERDEID_USUARIOS_DEMO = [
  { nome:"Ana Cidadã", email:"cidadao@verdeid.demo", senha:"demo123", nivel:1 },
  { nome:"Bruno Pesquisador", email:"pesquisador@verdeid.demo", senha:"demo123", nivel:2 },
  { nome:"Carla Gestora", email:"gestor@verdeid.demo", senha:"demo123", nivel:3 }
];
