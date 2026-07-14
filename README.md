# 🌍 Meu Mundo Visitado

PWA de checklist interativo dos países que você já visitou, com um globo 3D
giratório estilo Google Earth como interface principal.

## Stack

- **React 18 + TypeScript + Vite 5**
- **react-globe.gl** (three.js) — globo 3D interativo
- **d3-geo** — mapa 2D (projeção Natural Earth) e cálculo de área terrestre
- **Zustand** (+ `persist`) — estado global salvo em `localStorage` sob a chave `meu-mundo-visitado:v1`
- **Supabase** — autenticação (e-mail/senha) + Postgres para salvar o mapa por usuário
- **Tailwind CSS 3** — estética Dark Tech Brutalist (fundo escuro, ciano neon `#00e5ff`, dourado `#ffc857`)
- **vite-plugin-pwa** — manifest + service worker (instalável, funciona offline)
- **Natural Earth 110m** — GeoJSON de 177 países embutido localmente (`src/data/countries.geo.json`), com nomes em português, códigos ISO-3166 e continentes

## Funcionalidades

- Globo 3D com rotação automática quando ocioso; clique/tap alterna "visitado"
- Hover mostra tooltip com nome e status
- "Fly-to": clicar num país da lista voa a câmera até ele
- Vista alternativa em mapa 2D plano
- Lista pesquisável (ignora acentos, busca em PT e EN) e filtrável por continente
- **Wishlist** ("quero visitar"): marcada pela **estrela ☆/★** ao lado de cada país na lista, com legenda explicativa. Marcar um país como visitado o remove automaticamente da wishlist
- **Login/cadastro** (Supabase): o mapa fica salvo na conta e sincroniza entre dispositivos. Sem login, funciona em "modo local" (localStorage)
- Dashboard: total, %, breakdown por continente e % da área terrestre mundial
- Card PNG 1080×1080 para compartilhar (download ou Web Share API)

## Login e banco de dados (Supabase)

O app roda **sem configuração** em modo local (dados só no navegador). Para ligar
login/cadastro e a sincronização em nuvem:

1. Crie um projeto grátis em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) (cria a tabela `user_countries` com Row Level Security por usuário).
3. Em **Project Settings → API**, copie a *Project URL* e a *anon public key*.
4. Crie um arquivo `.env.local` na raiz (baseie-se em [`.env.example`](.env.example)):

   ```bash
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

5. (Opcional) Em **Authentication → Providers → Email**, desligue "Confirm email"
   para permitir login imediato sem confirmação por e-mail.
6. No deploy da Vercel, adicione as mesmas duas variáveis em **Settings → Environment Variables** e refaça o deploy.

### Como os dados são salvos

- Uma linha por usuário em `user_countries` (`visited text[]`, `wishlist text[]`).
- Ao logar pela primeira vez, o que estava marcado no modo local é enviado para a conta.
- Cada alteração é salva na nuvem com debounce; a barra do painel mostra o status (`salvando…` / `✓ sincronizado`).

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:5173
```

Requisitos: Node 18+.

```bash
npm run build      # build de produção em dist/
npm run preview    # serve o build localmente
npm run icons      # regenera os PNGs do ícone a partir de public/icons/icon.svg
```

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. A Vercel detecta Vite automaticamente (build `npm run build`, output `dist`). Nenhuma configuração extra é necessária.
4. Ou via CLI:

```bash
npm i -g vercel
vercel --prod
```

O service worker e o manifest já saem prontos no build — depois do deploy o app
é instalável na home screen do celular ("Adicionar à tela inicial").

## Estrutura

```
src/
  components/
    GlobeView.tsx    # globo 3D (react-globe.gl)
    MapView.tsx      # mapa 2D SVG (d3-geo)
    CountryList.tsx  # lista pesquisável/filtrável
    StatsPanel.tsx   # dashboard de estatísticas
    ShareCard.tsx    # card PNG para redes sociais
  data/
    countries.geo.json  # Natural Earth 110m enxuto (nome PT, ISO, continente, centróide)
    countries.ts        # índices/derivações tipadas
  store/
    useCountryStore.ts  # Zustand + persist (localStorage)
  types/index.ts
```

## Notas de dados

- A contagem usa os 176 países do dataset Natural Earth 110m (Antártida fica
  clicável no globo, mas fora das estatísticas). Microestados como Mônaco e
  Singapura não têm polígono nessa resolução — dá para evoluir para o dataset
  50m se quiser incluí-los.
- Territórios disputados (Kosovo, Somalilândia, Norte do Chipre) usam os
  códigos do Natural Earth (KOS, SOL, CYN) para não colidir com o país "pai".
