# Personal OS

> Um sistema pessoal all-in-one para gestão de rotina: finanças, agenda de foco e treinos — em uma interface única, com identidade visual neon/cyberpunk, funcionando 100% offline como PWA.

Desenvolvido com [Google AI Studio](https://aistudio.google.com/apps) (Gemini).

---

## ✨ Sobre o projeto

O Personal OS nasceu da necessidade de centralizar o controle do dia a dia — gastos, blocos de foco e treinos de academia — em um único app, sem depender de três ferramentas diferentes. Todo o desenvolvimento foi feito de forma iterativa, com foco em usabilidade real no celular (mobile-first), não apenas em uma vitrine visual.

## 🖥️ Módulos

### 🏠 Início
Dashboard resumo com os principais indicadores:
- Horas de foco acumuladas (calculado a partir dos blocos de foco concluídos)
- Sequência diária (streak) de dias consecutivos com foco registrado
- Saldo do mês (entradas − despesas), com detalhamento de cada lado
- Atividade recente (últimas transações)

### 💰 Finanças
- Registro de despesas (valor, categoria, descrição)
- Categorias dinâmicas, criadas pelo usuário (não fixas)
- **Receitas e despesas fixas (recorrentes)**: itens de entrada/saída com dia do mês definido, contabilizados automaticamente no saldo
- Gráfico de distribuição por categoria (donut chart, Recharts)
- Metas/limites mensais por categoria com barra de progresso
- Histórico de transações com edição e exclusão
- Filtro por período (mês atual / anterior / tudo)

### 📅 Agenda
- Criação de blocos de foco (título, categoria, duração)
- Marcação de conclusão de blocos
- Blocos concluídos alimentam automaticamente as métricas de Horas de Foco e Sequência na tela Início

### 🏋️ Treinos
- Cadastro de exercícios por grupo muscular
- Registro de sessões de treino (séries, repetições, carga)
- Histórico de sessões por data
- Gráfico de evolução de carga por exercício ao longo do tempo
- Estimativa de 1RM (fórmula de Epley)

### ⚙️ Ajustes
- Exportação de todos os dados em `.json`
- Limpeza total dos dados (factory reset)
- Personalização de cor de destaque do tema

## 🛠️ Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + Vite |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS v4 |
| Ícones | lucide-react |
| Animações | motion (Framer Motion) |
| Gráficos | Recharts |
| Persistência | localStorage (client-side, offline-first) |
| PWA | vite-plugin-pwa (Service Worker + Web App Manifest, instalável em Android/iOS) |

## 📱 Instalação como app (PWA)

O Personal OS é um Progressive Web App completo — não precisa de loja de aplicativos:

1. Abra o link do app no navegador do celular (Chrome recomendado no Android)
2. Toque no menu (⋮) → **"Adicionar à tela inicial"** / **"Instalar app"**
3. Pronto — ícone próprio, tela cheia, funcionamento offline

Como os dados ficam salvos localmente no navegador (`localStorage`), eles persistem entre sessões e atualizações de página, mas são específicos daquele dispositivo/navegador. Use a exportação em Ajustes para fazer backup ou migrar de aparelho.

### Rodando localmente

```bash
npm install
npm run dev