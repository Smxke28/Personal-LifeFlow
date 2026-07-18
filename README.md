# Personal OS

Personal OS é um aplicativo web 100% client-side focado no gerenciamento da vida pessoal, oferecendo ferramentas para controle financeiro, agenda de compromissos e foco, além de acompanhamento de treinos. O sistema foi construído para ser rápido, seguro e funcionar offline (como um PWA).

## 🚀 Funcionalidades

- **Dashboard Integrado:** Visão geral rápida dos seus gastos, blocos de foco, treinos e atividades do dia.
- **Controle Financeiro:** Acompanhe receitas, despesas, itens recorrentes e analise seus gastos através de gráficos e categorias customizáveis.
- **Agenda e Foco:** Sistema de calendário para gerenciar compromissos, blocos de tempo para estudos/trabalho e visualizações em formato semanal e mensal.
- **Gerenciador de Treinos:** Registre sessões de treino, configure séries, repetições e cargas, e acompanhe o volume total movimentado.
- **Temas Customizáveis:** Interface *cyber-grid* com diversas opções de cores para personalização.
- **Privacidade Local:** Todos os dados são salvos localmente no seu dispositivo via `localStorage`, sem banco de dados externo ou rastreamento em nuvem.
- **Segurança Reforçada (PIN):** Opcionalmente, bloqueie o acesso ao aplicativo com um PIN de 4 dígitos.
- **Exportação/Importação:** Capacidade de exportar todo o histórico de dados em formato JSON para backups seguros.

## 🛠️ Tecnologias Utilizadas

- **React 19 + TypeScript:** Base do projeto para construção de interfaces escaláveis e código tipado.
- **Vite:** Ferramenta de build rápida e otimizada.
- **Tailwind CSS v4:** Estilização utilitária com design *mobile-first* (adaptado também para desktop) e suporte a temas dinâmicos.
- **Recharts:** Visualização de dados de finanças.
- **Lucide React:** Biblioteca de ícones simples e consistentes.
- **Motion (Framer Motion):** Animações e transições fluidas.
- **Vite PWA:** Configuração para funcionamento offline e instalação como aplicativo (Progressive Web App).

## 🔒 Foco em Segurança

Embora seja um app puramente client-side, aplicamos várias práticas de segurança ("hardening"):
- **Validação de Inputs e LocalStorage:** Os dados lidos do armazenamento local passam por tratamento de erro estrito, prevenindo falhas caso os dados sejam modificados no console ou corrompidos.
- **Ausência de Execução de Código Dinâmico:** Zero uso de `eval()`, `new Function()` ou `dangerouslySetInnerHTML`.
- **Proteção via PIN Local:** Um PIN criptografado com hash simples para bloquear curiosos caso você deixe o celular desbloqueado.
- **Vercel Security Headers:** O `vercel.json` inclui cabeçalhos robustos para proteger contra XSS, sniff de MIME types, iFrame clickjacking (`X-Frame-Options: DENY`, `Content-Security-Policy`, etc.).

## 📦 Como Rodar o Projeto (Desenvolvimento)

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. O app estará rodando em `http://localhost:3000`.

## 🚀 Deploy (Vercel)

O projeto está otimizado para deploy na Vercel. O script de build é configurado com:
```bash
npm run build
```
Basta importar o repositório na Vercel e o app será publicado, herdando automaticamente as configurações e as regras de segurança do `vercel.json`.
