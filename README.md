# App Treino

App web em Next.js para controle de treinos de academia: cadastro de treinos, exercícios, séries, carga (kg) e repetições.

## Funcionalidades

- **Cadastrar treinos**: nome do treino e lista de exercícios com quantidade de séries
- **Listar treinos**: ver todos os treinos cadastrados
- **Executar treino**: na tela do treino, preencher carga (kg) e repetições por série e marcar como feito
- **Editar treino**: alterar nome e exercícios (incluindo número de séries)
- **Excluir treino**: com confirmação

Os dados são salvos em **SQLite** (arquivo `data/treino.db` no servidor).

## Como rodar em desenvolvimento

```bash
npm install
npm run dev
```

Acesse [http://localhost:3005](http://localhost:3005). Para acessar de outro dispositivo na rede use `http://<IP-DO-SERVIDOR>:3005` (ex.: `http://192.168.1.10:3005`).

## Deploy em servidor interno (MVP)

1. No servidor, clone o repositório e instale as dependências:

```bash
git clone https://github.com/pedroo-garciaa/app_treino.git
cd app_treino
npm install
```

2. Faça o build e inicie o servidor:

```bash
npm run build
npm start
```

3. O app sobe na porta **3005** e escuta em todas as interfaces (`0.0.0.0`), então pode ser acessado pela rede com `http://<IP-do-servidor>:3005`. Para usar outra porta:

```bash
npx next start -H 0.0.0.0 -p 8080
```

4. O banco SQLite é criado automaticamente na pasta `data/` (arquivo `data/treino.db`). Mantenha essa pasta com permissão de escrita pelo usuário que roda o processo.

5. (Opcional) Atrás de um proxy reverso (nginx, Caddy, etc.), aponte para `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```
