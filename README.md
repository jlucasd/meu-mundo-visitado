# 🌍 Meu Mundo Visitado

PWA de checklist interativo dos países que você já visitou, com um globo 3D
giratório estilo Google Earth como interface principal.

## Stack

- **React 18 + TypeScript + Vite 5**
- **react-globe.gl** (three.js) — globo 3D interativo
- **d3-geo** — mapa 2D (projeção Natural Earth) e cálculo de área terrestre
- **Zustand** — estado global (o mapa é persistido por usuário logado)
- **Autenticação local** — login obrigatório, usuários com senha hasheada (PBKDF2-SHA-256 via Web Crypto), sessão persistida e painel de administração
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
- **Login obrigatório**: a tela de login é a primeira tela; nada é acessível sem autenticar. O mapa de cada usuário fica associado à conta dele
- **Gerenciamento de usuários** (aba "Usuários", visível só para admins): listar, criar (e-mail/senha/role) e excluir usuários (exceto o próprio admin logado)
- Dashboard: total, %, breakdown por continente e % da área terrestre mundial
- Card PNG 1080×1080 para compartilhar (download ou Web Share API)
- **Logo/ícones gerados do mapa real**: `npm run logo` projeta o GeoJSON com d3-geo e gera `logo.svg`/`icon.svg` (com estrela dourada sobre o Brasil)

## Autenticação e usuários

- Na primeira inicialização é criado automaticamente o admin padrão
  (`jlucasd01@gmail.com`) — a senha inicial fica na constante
  `ADMIN_SEED_PASSWORD` em [`src/lib/authDb.ts`](src/lib/authDb.ts).
- Senhas nunca são armazenadas em texto plano: PBKDF2-SHA-256 (150k iterações,
  salt aleatório por usuário) via Web Crypto API.
- Cada usuário tem ID único (`crypto.randomUUID()`); a sessão é validada a cada
  carga e o logout a limpa (o botão "voltar" não reexpõe conteúdo protegido,
  pois o gate de autenticação roda em toda renderização).
- Persistência via adapter `src/lib/storage.ts` (interface `get/set/list/delete`;
  usa `window.storage` quando disponível, senão `localStorage`), com chaves
  `mmv:user:{id}`, `mmv:session` e `mmv:countries:{userId}`.

> ⚠️ **Limitação honesta**: o app é 100% client-side — usuários, hashes e dados
> vivem no storage do navegador. Isso organiza contas e protege a UX, mas não é
> segurança de servidor (a seed do admin é visível no bundle). Para múltiplos
> dispositivos/segurança real, o caminho é um backend (ex.: Supabase com
> funções server-side), que já existiu neste repo — ver histórico do git.

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
  auth/
    AuthContext.tsx  # estado de autenticação (useContext) + guards de role
  components/
    LoginScreen.tsx    # tela de login (primeira tela obrigatória)
    UserAdminPanel.tsx # gerenciamento de usuários (só admin)
    GlobeView.tsx      # globo 3D (react-globe.gl)
    MapView.tsx        # mapa 2D SVG (d3-geo)
    CountryList.tsx    # lista pesquisável/filtrável
    StatsPanel.tsx     # dashboard de estatísticas
    ShareCard.tsx      # card PNG para redes sociais
  data/
    countries.geo.json  # Natural Earth 110m enxuto (nome PT, ISO, continente, centróide)
    countries.ts        # índices/derivações tipadas
  hooks/
    useUserCountries.ts # carrega/salva o mapa do usuário logado
  lib/
    authDb.ts    # usuários, hash de senha (PBKDF2), sessão, seed do admin
    storage.ts   # adapter get/set/list/delete (window.storage ou localStorage)
  store/
    useCountryStore.ts  # Zustand (visited/wishlist)
  types/index.ts
```

## Notas de dados

- A contagem usa os 176 países do dataset Natural Earth 110m (Antártida fica
  clicável no globo, mas fora das estatísticas). Microestados como Mônaco e
  Singapura não têm polígono nessa resolução — dá para evoluir para o dataset
  50m se quiser incluí-los.
- Territórios disputados (Kosovo, Somalilândia, Norte do Chipre) usam os
  códigos do Natural Earth (KOS, SOL, CYN) para não colidir com o país "pai".
