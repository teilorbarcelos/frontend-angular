# Frontend Angular - Gold Standard Boilerplate

Este é um boilerplate Angular de alta qualidade, funcionalmente idêntico ao projeto React existente (`frontend-vite`). Ele utiliza as práticas mais modernas do ecossistema Angular (v19+).

## Tech Stack

- **Angular 19+** (Standalone Components, Signals, New Control Flow)
- **Tailwind CSS v4** para estilização.
- **Lucide Angular** para ícones.
- **Vitest** para testes unitários e de integração (substituindo Karma/Jasmine).
- **RxJS** para comunicação assíncrona.
- **HttpClient** com interceptores funcionais.

## Arquitetura

- **Feature-based modules**: O projeto é organizado por funcionalidades (`auth`, `product`, `user`, `role`).
- **Signals**: Gerenciamento de estado reativo e eficiente.
- **Smart/Dumb Components**: Separação clara de responsabilidades.
- **Lazy Loading**: Roteamento otimizado para performance.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O app estará disponível em `http://localhost:3000`.

## Testes

O projeto mantém 100% de cobertura de testes.

Para rodar os testes:
```bash
npm test
```

Para ver a cobertura:
```bash
npx ng test --coverage
```

## Integração com Backend

O frontend está configurado para se comunicar com o mesmo backend do projeto React. As URLs base e os headers são idênticos.

## Estrutura de Diretórios

- `src/app/core`: Serviços globais, guards, interceptors e utilitários.
- `src/app/shared`: Componentes, layouts, pipes e diretivas reutilizáveis.
- `src/app/features`: Módulos de funcionalidades (páginas, serviços específicos).
