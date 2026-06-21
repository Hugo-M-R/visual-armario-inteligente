# Visual Armário Inteligente

Frontend em React + TypeScript para o sistema [Armário Inteligente](https://github.com/Tokseg/armario-inteligente).

## Stack

- React 19 + TypeScript
- Vite
- React Router
- TanStack Query
- Axios

## Pré-requisitos

- Node.js 20+
- Backend rodando em `http://localhost:8080`

## Configuração

```bash
cp .env.example .env
npm install
```

Ajuste `VITE_API_BASE_URL` se o backend estiver em outra URL.

## Executar

```bash
npm run dev
```

A aplicação inicia em `http://localhost:3000` (porta já liberada no CORS do backend).

## Funcionalidades

- Login e registro público de moradores
- Sessão restaurada via `GET /api/v1/auth/me`
- Dashboard com indicadores
- Encomendas (registrar, gerar código, validar e retirar)
- Fluxo guiado de retirada para moradores (`/encomendas/retirar`)
- Armários (listagem e gestão para admin)
- Usuários (admin/porteiro)
- Notificações (admin/morador)
- Compartimentos
- Auditoria (admin)

## Perfis de acesso

| Módulo | ADMIN | PORTEIRO | MORADOR |
|--------|:-----:|:--------:|:-------:|
| Dashboard | ✓ | ✓ | ✓ |
| Encomendas | ✓ | ✓ | ✓ |
| Armários | ✓ | ✓ | ✓ |
| Compartimentos | ✓ | ✓ | ✓ |
| Usuários | ✓ | ✓ | — |
| Notificações | ✓ | — | ✓ |
| Auditoria | ✓ | — | — |

## Build

```bash
npm run build
npm run preview
```
