export type Lang = 'pt' | 'en' | 'es'

/** Erros do authDb chegam como códigos e são traduzidos aqui. */
export type AuthErrorKey =
  | 'auth/invalid-credentials'
  | 'auth/email-taken'
  | 'auth/invalid-email'
  | 'auth/weak-password'
  | 'auth/not-admin'
  | 'auth/self-delete'
  | 'auth/unavailable'

export interface Messages {
  brand: { first: string; highlight: string }
  login: {
    tagline: string
    email: string
    emailPlaceholder: string
    password: string
    passwordPlaceholder: string
    fillBoth: string
    signIn: string
    signingIn: string
    restricted1: string
    restricted2: string
    genericError: string
  }
  authErrors: Record<AuthErrorKey, string>
  header: {
    progress: (visited: number, total: number, pct: string) => string
    signOut: string
  }
  controls: { map2d: string; globe3d: string; share: string; menu: string; close: string }
  tabs: { countries: string; stats: string; users: string }
  sync: { cloud: string; local: string; loading: string }
  roles: { admin: string; user: string }
  list: {
    searchPlaceholder: string
    all: string
    legendVisited: string
    legendWishlist: string
    empty: string
    flyTo: (name: string) => string
    markVisited: string
    unmarkVisited: string
    alreadyVisited: string
    addWishlist: string
    removeWishlist: string
  }
  status: { visited: string; wishlist: string; none: string }
  stats: {
    visitedCountries: string
    ofWorld: string
    ofLandArea: string
    wishlist: string
    byContinent: string
    reset: string
    resetConfirm: string
  }
  continents: Record<string, string>
  share: {
    title: string
    download: string
    shareBtn: string
    cardSubtitle: (total: number, pct: string) => string
    shareText: (visited: number, pct: string) => string
    close: string
  }
  admin: {
    newUser: string
    emailPlaceholder: string
    passwordPlaceholder: string
    create: string
    creating: string
    created: (email: string) => string
    deleted: (email: string) => string
    deleteConfirm: (email: string) => string
    registered: (n: number) => string
    you: string
    delete: string
    cantDeleteSelf: string
    deleteTitle: (email: string) => string
    fillBoth: string
    genericError: string
  }
}

const CONTINENTS_PT = [
  'África',
  'América do Norte',
  'América do Sul',
  'Antártida',
  'Ásia',
  'Europa',
  'Oceania',
]

const pt: Messages = {
  brand: { first: 'Meu Mundo', highlight: 'Visitado' },
  login: {
    tagline: 'entre para marcar os países do seu mundo',
    email: 'E-mail',
    emailPlaceholder: 'seu@email.com',
    password: 'Senha',
    passwordPlaceholder: '••••••••',
    fillBoth: 'Preencha e-mail e senha.',
    signIn: 'Entrar',
    signingIn: 'Entrando…',
    restricted1: 'Acesso restrito a usuários cadastrados.',
    restricted2: 'Peça ao administrador para criar a sua conta.',
    genericError: 'Não foi possível entrar.',
  },
  authErrors: {
    'auth/invalid-credentials': 'E-mail ou senha incorretos.',
    'auth/email-taken': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/weak-password': 'A senha precisa ter ao menos 6 caracteres.',
    'auth/not-admin': 'Apenas administradores podem fazer isso.',
    'auth/self-delete': 'Você não pode excluir o próprio usuário logado.',
    'auth/unavailable': 'Serviço indisponível. Tente novamente.',
  },
  header: {
    progress: (v, t, p) => `${v} / ${t} países · ${p}% do mundo`,
    signOut: 'sair',
  },
  controls: {
    map2d: '🗺 Mapa 2D',
    globe3d: '🌐 Globo 3D',
    share: '↗ Compartilhar',
    menu: '☰ Menu',
    close: '✕ Fechar',
  },
  tabs: { countries: 'Países', stats: 'Estatísticas', users: 'Usuários' },
  sync: { cloud: '☁ sincronizado na nuvem', local: 'salvo neste navegador', loading: 'carregando…' },
  roles: { admin: 'admin', user: 'usuário' },
  list: {
    searchPlaceholder: 'Buscar país…',
    all: 'Todos',
    legendVisited: 'visitado',
    legendWishlist: 'quero visitar',
    empty: 'Nenhum país encontrado.',
    flyTo: (n) => `Voar até ${n}`,
    markVisited: 'Marcar como visitado',
    unmarkVisited: 'Desmarcar visitado',
    alreadyVisited: 'Já visitado',
    addWishlist: 'Marcar como "quero visitar"',
    removeWishlist: 'Remover de "quero visitar"',
  },
  status: { visited: '✓ visitado', wishlist: '★ quero visitar', none: 'não visitado' },
  stats: {
    visitedCountries: 'Países visitados',
    ofWorld: 'do mundo',
    ofLandArea: 'da área terrestre',
    wishlist: 'Quero visitar',
    byContinent: 'Por continente',
    reset: 'Zerar progresso',
    resetConfirm: 'Apagar todos os países marcados?',
  },
  continents: Object.fromEntries(CONTINENTS_PT.map((c) => [c, c])),
  share: {
    title: 'Compartilhar',
    download: '⬇ Baixar PNG',
    shareBtn: '↗ Compartilhar',
    cardSubtitle: (t, p) => `de ${t} países · ${p}% do mundo`,
    shareText: (v, p) => `Já visitei ${v} países, ${p}% do mundo! 🌍`,
    close: 'Fechar',
  },
  admin: {
    newUser: 'Novo usuário',
    emailPlaceholder: 'email@exemplo.com',
    passwordPlaceholder: 'senha (mín. 6 caracteres)',
    create: '+ Criar usuário',
    creating: 'Criando…',
    created: (e) => `Usuário ${e} criado.`,
    deleted: (e) => `Usuário ${e} excluído.`,
    deleteConfirm: (e) => `Excluir o usuário ${e}? O mapa dele será apagado.`,
    registered: (n) => `Usuários cadastrados (${n})`,
    you: '(você)',
    delete: 'Excluir',
    cantDeleteSelf: 'Não é possível excluir o próprio usuário',
    deleteTitle: (e) => `Excluir ${e}`,
    fillBoth: 'Preencha e-mail e senha.',
    genericError: 'Algo deu errado.',
  },
}

const en: Messages = {
  brand: { first: 'My World', highlight: 'Visited' },
  login: {
    tagline: 'sign in to mark the countries of your world',
    email: 'E-mail',
    emailPlaceholder: 'you@email.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    fillBoth: 'Fill in e-mail and password.',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    restricted1: 'Access restricted to registered users.',
    restricted2: 'Ask the administrator to create your account.',
    genericError: 'Could not sign in.',
  },
  authErrors: {
    'auth/invalid-credentials': 'Incorrect e-mail or password.',
    'auth/email-taken': 'This e-mail is already registered.',
    'auth/invalid-email': 'Invalid e-mail.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/not-admin': 'Only administrators can do that.',
    'auth/self-delete': 'You cannot delete the user you are logged in as.',
    'auth/unavailable': 'Service unavailable. Try again.',
  },
  header: {
    progress: (v, t, p) => `${v} / ${t} countries · ${p}% of the world`,
    signOut: 'sign out',
  },
  controls: {
    map2d: '🗺 2D Map',
    globe3d: '🌐 3D Globe',
    share: '↗ Share',
    menu: '☰ Menu',
    close: '✕ Close',
  },
  tabs: { countries: 'Countries', stats: 'Statistics', users: 'Users' },
  sync: { cloud: '☁ synced to the cloud', local: 'saved in this browser', loading: 'loading…' },
  roles: { admin: 'admin', user: 'user' },
  list: {
    searchPlaceholder: 'Search country…',
    all: 'All',
    legendVisited: 'visited',
    legendWishlist: 'want to visit',
    empty: 'No country found.',
    flyTo: (n) => `Fly to ${n}`,
    markVisited: 'Mark as visited',
    unmarkVisited: 'Unmark visited',
    alreadyVisited: 'Already visited',
    addWishlist: 'Mark as "want to visit"',
    removeWishlist: 'Remove from "want to visit"',
  },
  status: { visited: '✓ visited', wishlist: '★ want to visit', none: 'not visited' },
  stats: {
    visitedCountries: 'Visited countries',
    ofWorld: 'of the world',
    ofLandArea: 'of the land area',
    wishlist: 'Want to visit',
    byContinent: 'By continent',
    reset: 'Reset progress',
    resetConfirm: 'Erase all marked countries?',
  },
  continents: {
    'África': 'Africa',
    'América do Norte': 'North America',
    'América do Sul': 'South America',
    'Antártida': 'Antarctica',
    'Ásia': 'Asia',
    Europa: 'Europe',
    Oceania: 'Oceania',
  },
  share: {
    title: 'Share',
    download: '⬇ Download PNG',
    shareBtn: '↗ Share',
    cardSubtitle: (t, p) => `of ${t} countries · ${p}% of the world`,
    shareText: (v, p) => `I've visited ${v} countries, ${p}% of the world! 🌍`,
    close: 'Close',
  },
  admin: {
    newUser: 'New user',
    emailPlaceholder: 'email@example.com',
    passwordPlaceholder: 'password (min. 6 characters)',
    create: '+ Create user',
    creating: 'Creating…',
    created: (e) => `User ${e} created.`,
    deleted: (e) => `User ${e} deleted.`,
    deleteConfirm: (e) => `Delete user ${e}? Their map will be erased.`,
    registered: (n) => `Registered users (${n})`,
    you: '(you)',
    delete: 'Delete',
    cantDeleteSelf: 'You cannot delete your own user',
    deleteTitle: (e) => `Delete ${e}`,
    fillBoth: 'Fill in e-mail and password.',
    genericError: 'Something went wrong.',
  },
}

const es: Messages = {
  brand: { first: 'Mi Mundo', highlight: 'Visitado' },
  login: {
    tagline: 'entra para marcar los países de tu mundo',
    email: 'Correo',
    emailPlaceholder: 'tu@email.com',
    password: 'Contraseña',
    passwordPlaceholder: '••••••••',
    fillBoth: 'Completa correo y contraseña.',
    signIn: 'Entrar',
    signingIn: 'Entrando…',
    restricted1: 'Acceso restringido a usuarios registrados.',
    restricted2: 'Pide al administrador que cree tu cuenta.',
    genericError: 'No fue posible entrar.',
  },
  authErrors: {
    'auth/invalid-credentials': 'Correo o contraseña incorrectos.',
    'auth/email-taken': 'Este correo ya está registrado.',
    'auth/invalid-email': 'Correo inválido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/not-admin': 'Solo los administradores pueden hacer eso.',
    'auth/self-delete': 'No puedes eliminar tu propio usuario.',
    'auth/unavailable': 'Servicio no disponible. Inténtalo de nuevo.',
  },
  header: {
    progress: (v, t, p) => `${v} / ${t} países · ${p}% del mundo`,
    signOut: 'salir',
  },
  controls: {
    map2d: '🗺 Mapa 2D',
    globe3d: '🌐 Globo 3D',
    share: '↗ Compartir',
    menu: '☰ Menú',
    close: '✕ Cerrar',
  },
  tabs: { countries: 'Países', stats: 'Estadísticas', users: 'Usuarios' },
  sync: { cloud: '☁ sincronizado en la nube', local: 'guardado en este navegador', loading: 'cargando…' },
  roles: { admin: 'admin', user: 'usuario' },
  list: {
    searchPlaceholder: 'Buscar país…',
    all: 'Todos',
    legendVisited: 'visitado',
    legendWishlist: 'quiero visitar',
    empty: 'Ningún país encontrado.',
    flyTo: (n) => `Volar hasta ${n}`,
    markVisited: 'Marcar como visitado',
    unmarkVisited: 'Desmarcar visitado',
    alreadyVisited: 'Ya visitado',
    addWishlist: 'Marcar como "quiero visitar"',
    removeWishlist: 'Quitar de "quiero visitar"',
  },
  status: { visited: '✓ visitado', wishlist: '★ quiero visitar', none: 'no visitado' },
  stats: {
    visitedCountries: 'Países visitados',
    ofWorld: 'del mundo',
    ofLandArea: 'del área terrestre',
    wishlist: 'Quiero visitar',
    byContinent: 'Por continente',
    reset: 'Reiniciar progreso',
    resetConfirm: '¿Borrar todos los países marcados?',
  },
  continents: {
    'África': 'África',
    'América do Norte': 'América del Norte',
    'América do Sul': 'América del Sur',
    'Antártida': 'Antártida',
    'Ásia': 'Asia',
    Europa: 'Europa',
    Oceania: 'Oceanía',
  },
  share: {
    title: 'Compartir',
    download: '⬇ Descargar PNG',
    shareBtn: '↗ Compartir',
    cardSubtitle: (t, p) => `de ${t} países · ${p}% del mundo`,
    shareText: (v, p) => `¡Ya visité ${v} países, el ${p}% del mundo! 🌍`,
    close: 'Cerrar',
  },
  admin: {
    newUser: 'Nuevo usuario',
    emailPlaceholder: 'email@ejemplo.com',
    passwordPlaceholder: 'contraseña (mín. 6 caracteres)',
    create: '+ Crear usuario',
    creating: 'Creando…',
    created: (e) => `Usuario ${e} creado.`,
    deleted: (e) => `Usuario ${e} eliminado.`,
    deleteConfirm: (e) => `¿Eliminar al usuario ${e}? Su mapa será borrado.`,
    registered: (n) => `Usuarios registrados (${n})`,
    you: '(tú)',
    delete: 'Eliminar',
    cantDeleteSelf: 'No puedes eliminar tu propio usuario',
    deleteTitle: (e) => `Eliminar ${e}`,
    fillBoth: 'Completa correo y contraseña.',
    genericError: 'Algo salió mal.',
  },
}

export const messages: Record<Lang, Messages> = { pt, en, es }

export const LANGS: { code: Lang; flag: string; label: string; htmlLang: string }[] = [
  { code: 'pt', flag: '🇧🇷', label: 'Português', htmlLang: 'pt-BR' },
  { code: 'en', flag: '🇺🇸', label: 'English', htmlLang: 'en' },
  { code: 'es', flag: '🇪🇸', label: 'Español', htmlLang: 'es' },
]
