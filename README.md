# Quadely

Um espaço pessoal para organizar tarefas, acompanhar seu progresso e planejar compromissos com horários definidos. A interface está em português e foi pensada para uso individual, sem login ou perfil.

## Recursos

- Criar, editar e excluir tarefas.
- Mover cartões entre etapas por arrastar e soltar.
- Definir detalhes e prazo para cada tarefa.
- Criar, editar e remover etiquetas com cores personalizadas.
- Associar várias etiquetas a uma tarefa e filtrar o quadro por etiqueta.
- Escolher entre oito cores de fundo, usar a pinça de cor ou inserir um hexadecimal.
- Salvar as alterações automaticamente no navegador.
- Consultar um painel com estatísticas calculadas a partir das tarefas e dos compromissos.
- Planejar compromissos na agenda em visualização de dia, semana ou mês.
- Definir data, hora de início, hora de término, categoria e cor de cada compromisso.
- Consultar um mini calendário, os próximos horários e os compromissos do dia.
- Ver feriados nacionais e datas comemorativas brasileiras na agenda.
- Mover todos os cartões de uma etapa para outra pelo menu da lista.

## Tecnologias

- React
- TypeScript
- Vite
- CSS
- JSON para os dados iniciais

## Identidade visual

O projeto usa a marca Quadely e sua paleta (creme, rosa, azul, amarelo e azul-marinho). A logo recortada está em `src/assets/quadely-logo.png`. A cor de fundo do espaço é uma preferência independente da paleta da marca e pode ser escolhida entre oito cores, pela pinça ou por um valor hexadecimal. O gráfico acompanha cada escolha com um tom de contraste.

## Requisitos

- Node.js 20.19 ou superior.
- npm (incluído na instalação do Node.js).

## Começar

No terminal, entre na pasta raiz do projeto e instale as dependências:

```bash
npm install
```

Inicie o servidor local:

```bash
npm run dev
```

Abra no navegador o endereço local mostrado pelo Vite.

## Criar versão de produção

Para gerar os arquivos otimizados:

```bash
npm run build
```

Para visualizar localmente essa versão:

```bash
npm run preview
```

## Dados e armazenamento

O quadro inicial, etapas, etiquetas, tarefas e compromissos de exemplo estão em `src/data/initial-board.json`. Os tipos usados pela aplicação estão definidos em `src/types.ts`.

Depois que o projeto é aberto, as alterações são gravadas como JSON no `localStorage` do navegador. As estatísticas do painel são calculadas com base nesses dados. Isso mantém as informações entre visitas nesse navegador, mas não sincroniza entre dispositivos nem entre navegadores. A sincronização pode ser adicionada posteriormente com uma API e um banco de dados.

Para começar novamente com os dados de exemplo, remova a chave `meu-quadro-pessoal:v1` do armazenamento local do site no navegador.

## Estrutura do projeto

```text
Quadely/
├── index.html                  # Documento HTML principal
├── package.json                # Dependências e comandos
├── vite.config.ts              # Configuração do Vite
├── tsconfig.json               # Configuração do TypeScript
└── src/
    ├── App.tsx                 # Navegação, dados e formulários
    ├── CalendarView.tsx        # Agenda de dia, semana e mês
    ├── brazilian-holidays.ts   # Feriados e datas móveis do calendário brasileiro
    ├── Dashboard.tsx           # Estatísticas e resumo de progresso
    ├── assets/
    │   └── quadely-logo.png    # Logo usada na navegação
    ├── main.tsx                # Inicialização do React
    ├── styles.css              # Estilos base
    ├── redesign.css            # Estilos do painel e da agenda
    ├── brand.css               # Paleta e preferências visuais da marca
    ├── types.ts                # Tipos dos dados
    └── data/
        └── initial-board.json  # Dados iniciais de exemplo
```
