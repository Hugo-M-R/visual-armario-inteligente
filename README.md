# Visual Armário Inteligente

Frontend em React + TypeScript para o sistema **Armário Inteligente**.

## Sobre o projeto

O **Armário Inteligente** é uma solução para condomínios e edifícios residenciais que automatiza o recebimento e a retirada de encomendas em armários inteligentes. Em vez de depender de entregas manuais na portaria, o sistema organiza o fluxo entre porteiros, moradores e administradores em um único painel.

Este repositório contém a interface web que consome a API do backend e oferece:

- **Porteiros e administradores** registram encomendas, alocam compartimentos e geram códigos de acesso para os moradores.
- **Moradores** acompanham entregas pendentes, recebem notificações e retiram encomendas por um fluxo guiado com validação de código.
- **Administradores** gerenciam usuários, armários, compartimentos e consultam trilhas de auditoria.

O objetivo é reduzir filas na portaria, dar rastreabilidade às entregas e tornar a retirada de pacotes mais segura e autônoma para quem mora no prédio.

[![Backend](https://img.shields.io/badge/Backend-armario--inteligente-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Hugo-M-R/armario-inteligente/tree/main)

## Stack

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)

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
