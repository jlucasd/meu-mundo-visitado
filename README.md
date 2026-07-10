# 🌍 Meu Mundo Visitado

PWA de checklist interativo dos países que você já visitou, com um globo 3D
giratório estilo Google Earth como interface principal.

## Stack

- **React 18 + TypeScript + Vite 5**
- **react-globe.gl** (three.js) — globo 3D interativo
- **d3-geo** — mapa 2D (projeção Natural Earth) e cálculo de área terrestre
- **Zustand** (+ `persist`) — estado global salvo em `localStorage` sob a chave `meu-mundo-visitado:v1`
- **Tailwind CSS 3** — estética Dark Tech Brutalist (fundo escuro, ciano neon `#00e5ff`, dourado `#ffc857`)
- **vite-plugin-pwa** — manifest + service worker (instalável, funciona offline)
- **Natural Earth 110m** — GeoJSON de 177 países embutido localmente (`src/data/countries.geo.json`), com nomes em português, códigos ISO-3166 e continentes

## Funcionalidades

- Globo 3D com rotação automática quando ocioso; clique/tap alterna "visitado"
- Hover mostra tooltip com nome e status
- "Fly-to": clicar num país da lista voa a câmera até ele
- Vista alternativa em mapa 2D plano
- Lista pesquisável (ignora acentos, busca em PT e EN) e filtrável por continente
- Wishlist ("quero visitar") como estado secundário em dourado
- Dashboard: total, %, breakdown por continente e % da área terrestre mundial
- Card PNG 1080×1080 para compartilhar (download ou Web Share API)

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
