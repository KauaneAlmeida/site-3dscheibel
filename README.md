# Scheibel — A Próxima Evolução da Saúde da Consciência

Site institucional imersivo da **Scheibel**, com narrativa cinematográfica,
3D em tempo real e scroll-driven storytelling.

## Tecnologias

- **React 18** + **Vite 5**
- **Three.js** via `@react-three/fiber` + `@react-three/drei`
- **GSAP** + **ScrollTrigger** (animações scroll-amarradas)
- **Lenis** (smooth scroll integrado ao ScrollTrigger via `scrollerProxy`)
- **GLTF/Meshopt** (modelos 3D otimizados)

## Estrutura

```
.
├── web/                          # Aplicação Vite + React (single-page)
│   ├── public/                   # Modelos .glb, vídeos dos mocks, imagens
│   ├── src/
│   │   ├── App.jsx               # Composição das sections + smooth scroll
│   │   ├── components/           # SphereHero, JourneyOrb, DnaScene, TopBar...
│   │   ├── sections/             # Hero, Silence, Science, App, Screens, Partners, CTA
│   │   ├── hooks/                # useLenis, useScrollProgress
│   │   └── styles/global.css     # Design tokens + responsivo
│   └── package.json
├── vercel.json                   # Config de deploy (root → web/)
└── README.md
```

## Sections

| # | Nome | Conceito |
|---|---|---|
| 01 | Hero | Esfera 3D dourada (Saturno) com OrbitControls — apresentação da marca |
| 02 | Silence | "A maioria dos pacientes se sente sozinha na recuperação" + estatísticas |
| 03 | Science (DNA) | Pin-scrolled: hélice 3D + manifesto de pilares + closing stats |
| 04 | App | Mockup do iPhone subindo do bottom, textos atrás revelando o app |
| 05 | Screens | Três telas dos mocks (carrossel swipe em mobile) |
| 06 | Partners | Citação institucional com linha animada |
| 07 | CTA | "Pronto para começar?" + botão Solicitar acesso |

## Identidade visual

- **Bolinha dourada** (Journey Orb) — corpo celeste em Three.js que segue o scroll, atravessa a jornada e some na DNA
- **Paleta** cream `#f3eadb` + bronze `#8a5a3c` + dark green `#0d1f17`
- **Tipografia** Fraunces (display, serif), Inter (body), JetBrains Mono (mono)

## Running locally

```sh
cd web
npm install
npm run dev   # http://localhost:5173
```

## Build

```sh
cd web
npm run build
npm run preview
```

## Deploy

Configurado pra Vercel. O `vercel.json` na raiz aponta o build pra `web/`.
Push em `main` → deploy automático em produção.

```sh
vercel --prod
```
