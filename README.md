# Meus Gastos (React + Firebase)

App pessoal de controle de gastos. Cada usuário tem login próprio (Firebase Authentication)
e seus dados ficam no Firestore em `usuarios/{uid}/...`, visíveis só para ele.

## Rodar

```bash
npm install
npm run dev
```

## Firebase

- Authentication: método **E-mail/senha** ativado.
- Firestore: publique as regras do arquivo `firestore.rules`.
- A configuração do projeto está em `src/firebase.js`.

## Estrutura

```
src/
  App.jsx                    # decide entre Auth e Painel (onAuthStateChanged)
  firebase.js                # inicialização do Firebase
  hooks/useDados.js          # listeners em tempo real (categorias e lançamentos do mês)
  components/
    Auth.jsx                 # login, cadastro e "esqueci minha senha"
    Painel.jsx               # tela principal e resumo do mês
    FormLancamento.jsx       # CRUD 1: criar lançamento
    ListaLancamentos.jsx     # CRUD 1: listar e excluir
    Categorias.jsx           # CRUD 2: criar, listar e excluir categorias
```
