# Meu quadro pessoal

Um quadro Kanban pessoal para organizar tarefas por etapa, prazo e etiqueta. A interface está em português e foi pensada para ser simples de personalizar e expandir.

## Recursos

- Criar, editar e excluir tarefas.
- Mover cartões entre etapas por arrastar e soltar.
- Definir detalhes e prazo para cada tarefa.
- Criar, editar e remover etiquetas com cores personalizadas.
- Associar várias etiquetas a uma tarefa e filtrar o quadro por etiqueta.
- Escolher a cor de destaque do quadro.
- Salvar as alterações automaticamente no navegador.

## Tecnologias

- React
- TypeScript
- Vite
- CSS
- JSON para os dados iniciais

## Requisitos

- Node.js 20.19 ou superior.
- npm (incluído na instalação do Node.js).

## Começar

No terminal, entre na pasta `outputs/quadro-pessoal` e instale as dependências:

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

O quadro inicial, suas etapas, etiquetas e tarefas de exemplo estão em `src/data/initial-board.json`. Os tipos usados pela aplicação estão definidos em `src/types.ts`.

Depois que o quadro é aberto, as alterações são gravadas como JSON no `localStorage` do navegador. Isso mantém os dados entre visitas nesse navegador, mas não sincroniza entre dispositivos nem entre navegadores. A sincronização pode ser adicionada posteriormente com uma API e um banco de dados.

Para começar novamente com os dados de exemplo, remova a chave `meu-quadro-pessoal:v1` do armazenamento local do site no navegador.

## Estrutura do projeto

```text
quadro-pessoal/
├── index.html                  # Documento HTML principal
├── package.json                # Dependências e comandos
├── vite.config.ts              # Configuração do Vite
├── tsconfig.json               # Configuração do TypeScript
└── src/
    ├── App.tsx                 # Interface e comportamento do quadro
    ├── main.tsx                # Inicialização do React
    ├── styles.css              # Estilos da aplicação
    ├── types.ts                # Tipos dos dados
    └── data/
        └── initial-board.json  # Dados iniciais de exemplo
```
