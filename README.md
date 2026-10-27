# week.FM

Gera uma colagem ("semaninha") com os álbuns mais ouvidos de qualquer usuário do Last.fm.

HTML/CSS/JS puro no front + 2 funções serverless (Vercel) que escondem a chave da API.

## Rodar localmente
1. Crie uma chave em https://www.last.fm/api/account/create
2. `cp .env.example .env` e cole a chave em `LASTFM_API_KEY`
3. `npx vercel dev` (a 1ª vez pede login/link do projeto) e abra http://localhost:3000

## Deploy (grátis)
1. Suba o repositório no GitHub
2. Em vercel.com → *Add New Project* → importe o repo
3. Em *Environment Variables* adicione `LASTFM_API_KEY`
4. *Deploy*

## Segurança
- A chave nunca vai pro navegador nem pro repositório (`.env` está no `.gitignore`)
- `/api/img` só aceita imagens do domínio do Last.fm
