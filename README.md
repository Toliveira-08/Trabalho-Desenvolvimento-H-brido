# Meus Gastos

App web para controlar receitas e despesas pessoais, com login por usuário e uma comunidade com chat ao vivo. Feito com **React (Vite)** e **Firebase**.

- **App publicado:** _(colar aqui o link do Netlify)_
- **Código-fonte:** https://github.com/Toliveira-08/Trabalho-Desenvolvimento-H-brido/tree/feature/chat

## Funcionalidades

**Controle de gastos**
- Cadastro, login (e-mail e senha) e recuperação de senha
- Cada usuário só enxerga os próprios dados
- Lançamentos de receitas e despesas (criar, listar e excluir) e categorias personalizadas
- Resumo do mês: saldo, receitas, despesas e gastos por categoria

**Comunidade (estilo Reddit)**
- Bolinha branca flutuante: arraste para mover e clique para abrir
- Publicar, votar (▲ ▼), comentar e ordenar por Populares ou Novos
- **Chat ao vivo:** o botão "Falar com usuário" abre uma conversa privada em tempo real
- Aba **Conversas** com a caixa de entrada de cada pessoa

## Tecnologias

React 18, Vite, Firebase Authentication, Cloud Firestore (gastos) e Realtime Database (comunidade e chat).

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo `.env.example` para `.env` e preencha com os dados do seu projeto Firebase (Console do Firebase > Configurações do projeto > Seus aplicativos). O `.env` não vai para o GitHub.
3. Inicie o projeto:
   ```bash
   npm run dev
   ```

## Configuração do Firebase

- **Authentication:** ative o método E-mail/senha.
- **Firestore:** publique as regras de `firestore.rules`.
- **Realtime Database:** crie o banco e publique as regras de `database.rules.json`.

Variáveis de ambiente (`.env`):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Estrutura de dados

**Firestore** (gastos, privado por usuário)
```
usuarios/{uid}/categorias
usuarios/{uid}/lancamentos
```

**Realtime Database** (comunidade e chat)
```
forum/posts, forum/votos, forum/comentarios
chats/{idDaConversa}/mensagens/{id}
userChats/{uid}/{idDaConversa}      <- caixa de entrada
```
O `idDaConversa` junta os dois uids em ordem alfabética, então a conversa entre duas pessoas tem sempre o mesmo id.

## Segurança

- As regras do Firestore e do Realtime Database limitam leitura e escrita ao dono dos dados.
- No chat, só os dois participantes leem a conversa, ninguém envia mensagem em nome de outro e mensagens não podem ser editadas.
- A configuração do Firebase fica em variáveis de ambiente (`.env`), que o Git ignora. O `.env.example` mostra quais variáveis o projeto usa.

## Estrutura do projeto

```
src/
  App.jsx                      # decide entre login, painel e comunidade
  firebase.js                  # inicializa o Firebase (lê o .env)
  utils.js                     # funções auxiliares
  hooks/
    useDados.js                # gastos em tempo real (Firestore)
    useForum.js                # publicações, votos e comentários
    useChat.js                 # enviar e receber mensagens
    useConversas.js            # caixa de entrada
  components/
    Auth.jsx                   # login, cadastro e recuperação de senha
    Painel.jsx                 # tela principal e resumo do mês
    FormLancamento.jsx         # criar lançamento
    ListaLancamentos.jsx       # listar e excluir lançamentos
    Categorias.jsx             # criar, listar e excluir categorias
    BolinhaComunidade.jsx      # bolinha flutuante que abre a comunidade
    Comunidade.jsx             # publicações e abas (Populares, Novos, Conversas)
    PostCard.jsx / PostDetalhe.jsx / Votos.jsx
    ChatPrivado.jsx            # tela do chat
    ListaConversas.jsx         # lista da aba Conversas
```

## Deploy

Publicado no Netlify, a partir da branch `feature/chat`, com build `npm run build` e pasta de publicação `dist`. As variáveis `VITE_FIREBASE_*` estão cadastradas nas configurações do projeto no Netlify.
