# App Treino

App web em Next.js para controle de treinos de academia: cadastro de treinos, exercícios, séries, carga (kg) e repetições.

## Funcionalidades

- **Cadastrar treinos**: nome do treino e lista de exercícios com quantidade de séries
- **Listar treinos**: ver todos os treinos cadastrados
- **Executar treino**: na tela do treino, preencher carga (kg) e repetições por série e marcar como feito
- **Editar treino**: alterar nome e exercícios (incluindo número de séries)
- **Excluir treino**: com confirmação

Os dados são salvos no **localStorage** do navegador (não há backend).

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```
