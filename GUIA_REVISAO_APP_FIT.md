# Guia de Revisao Tecnica - App Fit

Data da revisao: 2026-03-28

## Escopo

Revisao do projeto `diet-protocol` considerando:

- frontend em Next.js/App Router
- backend em NestJS
- fluxos principais de landing, onboarding, autenticacao, plano, scanner, agua, progresso e webhook

## Como esta revisao foi feita

- leitura estatica dos arquivos principais do frontend e backend
- inspeção de fluxos criticos e integracoes entre telas, guards e servicos
- tentativa de validacao automatica com `build`, `lint` e `test`

## Limitacao do ambiente

Nao foi possivel rodar verificacoes automatizadas neste terminal porque o ambiente atual nao possui `node`, `npm`, `npx`, `pnpm`, `yarn` nem `bun` instalados. Entao este guia separa:

- problemas confirmados por leitura do codigo
- riscos provaveis que ainda precisam de validacao local com runtime

## Resumo executivo

- A base do produto ja existe e o projeto esta bem encaminhado como MVP.
- O frontend tem uma experiencia visual forte e os fluxos principais ja estao desenhados.
- O backend ja saiu do escopo inicial simples e hoje tem autenticacao, webhook, IA e persistencia em Postgres.
- Antes de criar novas features, vale corrigir alguns pontos criticos de seguranca e fluxo.
- O maior problema hoje e que o login da tela publica usa um bypass de demo e o webhook aceita pagamento sem validar assinatura.

## O que ja esta bom

- Separacao de frontend e backend esta clara.
- O backend separa autenticacao e autorizacao de pagamento em guards distintos.
- A geracao de plano esta centralizada em `AiService`.
- O onboarding captura dados relevantes para personalizacao do plano.
- O scanner ja tem fluxo completo de upload, compressao e exibicao de macros.
- O app ja tem helper para anexar `Authorization: Bearer TOKEN` nas chamadas.

## Achados prioritarios

### [P0] O login publico usa um endpoint de bypass e concede acesso pago

- Onde: `frontend/src/app/login/page.tsx:24-42`
- Onde: `backend/src/auth/auth.controller.ts:29-35`
- Onde: `backend/src/auth/auth.service.ts:73-84`
- Problema: a tela "Ja comprei" chama `POST /auth/demo-login` em vez de `POST /auth/magic-link`.
- Problema: `demoLogin` cria ou atualiza usuario com `createOrUpdateFromKiwify`, marcando `hasPaid = true` e gerando JWT.
- Impacto: qualquer pessoa com qualquer email pode obter acesso autenticado e pago sem compra real.
- Recomendacao: remover `demo-login` do frontend imediatamente e desabilitar ou proteger o endpoint no backend antes de qualquer deploy.

### [P0] O webhook da Kiwify aceita payload aprovado sem validar assinatura

- Onde: `backend/src/webhook/webhook.controller.ts:10-13`
- Onde: `backend/src/webhook/webhook.service.ts:30-70`
- Problema: o webhook confia em `order_status/status/event` e libera acesso sem verificar origem, assinatura ou segredo compartilhado.
- Impacto: qualquer POST para `/webhook/kiwify` com payload parecido com "approved" pode criar usuario pago e disparar acesso.
- Recomendacao: validar assinatura oficial da Kiwify, rejeitar requests invalidos com `401/403`, registrar replay protection e auditar o payload minimo esperado.

### [P1] O backend pode dizer que enviou o magic link mesmo sem conseguir mandar email

- Onde: `backend/src/auth/mail.service.ts:15-17`
- Onde: `backend/src/auth/auth.service.ts:39-42`
- Problema: se `BREVO_API_KEY` nao estiver configurada, `MailService` apenas loga erro e retorna; `sendMagicLink` continua respondendo sucesso.
- Impacto: o usuario ve "Link enviado" sem nenhum email real ter sido entregue.
- Recomendacao: falhar a request quando o provedor nao estiver configurado ou quando o envio retornar erro.

### [P1] Os magic links existem so em memoria

- Onde: `backend/src/auth/auth.service.ts:11-13`
- Onde: `backend/src/auth/auth.service.ts:45-70`
- Problema: os tokens vivem em um `Map` local do processo.
- Impacto: reinicio do servidor invalida todos os links; ambientes com mais de uma instancia quebram a verificacao; nao ha trilha de auditoria.
- Recomendacao: mover os tokens para Redis ou tabela dedicada no banco com expiracao e uso unico.

### [P1] O app usa datas em UTC no frontend e pode registrar agua/peso no dia errado

- Onde: `frontend/src/context/ProtocolContext.tsx:67`
- Onde: `frontend/src/context/ProtocolContext.tsx:156-160`
- Onde: `frontend/src/app/dashboard/page.tsx:92`
- Onde: `frontend/src/app/water/page.tsx:7-22`
- Problema: o codigo usa `new Date().toISOString().split('T')[0]` para determinar "hoje".
- Impacto: no Brasil, perto da virada do dia, o app pode gravar agua e progresso na data errada.
- Recomendacao: usar data local formatada explicitamente, por exemplo uma funcao baseada em `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' })` ou na timezone do dispositivo.

### [P1] `apiFetch` derruba a sessao tambem quando recebe 403

- Onde: `frontend/src/lib/api.ts:28-33`
- Problema: o helper trata `401` e `403` do mesmo jeito, limpando token e redirecionando para `/login`.
- Impacto: usuario autenticado mas sem pagamento confirmado, ou com acesso temporariamente negado, e deslogado a forca.
- Recomendacao: limpar sessao apenas em `401`; para `403`, manter sessao e mostrar CTA apropriado, como paywall, status de pagamento ou mensagem de acesso negado.

### [P1] O streak nunca e calculado e deve ficar sempre em zero

- Onde: `frontend/src/context/ProtocolContext.tsx:82`
- Onde: `frontend/src/context/ProtocolContext.tsx:121-129`
- Onde: `frontend/src/app/dashboard/page.tsx:106`
- Onde: `frontend/src/app/progress/page.tsx:43`
- Problema: existe estado de `streak`, mas nao ha nenhuma rotina que o atualize.
- Impacto: o app exibe um KPI importante sem logica real.
- Recomendacao: definir regra de streak e recalcular a partir de `progress`, refeicoes concluidas, agua ou outro evento diario.

### [P2] O "desfazer agua" nao desfaz a ultima acao, ele sempre subtrai 250 ml

- Onde: `frontend/src/app/water/page.tsx:101-109`
- Onde: `frontend/src/context/ProtocolContext.tsx:147-152`
- Problema: o botao se vende como "Desfazer ultimo copo", mas o codigo sempre remove `250`.
- Impacto: se a ultima acao foi `500`, `750` ou `1000`, o historico fica incorreto.
- Recomendacao: guardar um log de eventos de hidratacao por dia ou mudar o texto do botao para refletir o comportamento real.

### [P2] Excluir a ultima pesagem nao reseta o peso global

- Onde: `frontend/src/context/ProtocolContext.tsx:165-176`
- Problema: ao deletar a ultima entrada, `weight` so e atualizado se ainda restar algum item em `progress`.
- Impacto: a tela pode continuar mostrando um peso que ja nao existe no historico.
- Recomendacao: definir fallback claro quando `newProgress.length === 0`, por exemplo voltar ao valor do perfil salvo no backend ou para `null`.

### [P2] O menu inferior aparece em telas em que nao deveria

- Onde: `frontend/src/components/BottomNav.tsx:9-11`
- Problema: o menu e escondido apenas em `/`, `/onboarding` e `/paywall`.
- Impacto: ele continua aparecendo em `/login` e `/auth/verify`, o que atrapalha a experiencia de autenticacao.
- Recomendacao: esconder tambem em `/login` e `/auth/verify`, ou renderizar o menu apenas em rotas internas protegidas.

### [P2] As paginas publicas dependem do bootstrap de auth e podem ficar em branco

- Onde: `frontend/src/context/AuthContext.tsx:21-49`
- Onde: `frontend/src/context/AuthContext.tsx:87-93`
- Problema: o `AuthProvider` retorna `null` ate terminar a validacao inicial do token.
- Impacto: landing, login e outras paginas publicas podem piscar vazias enquanto `/auth/me` responde.
- Recomendacao: separar bootstrap de sessao de renderizacao de paginas publicas ou permitir render imediato para rotas nao protegidas.

### [P2] O dashboard descarta parte dos dados do plano gerado pela IA

- Onde: `frontend/src/app/dashboard/page.tsx:52-63`
- Onde: `frontend/src/context/ProtocolContext.tsx:22-25`
- Problema: o frontend salva apenas `waterTarget` e `weeklyPlan`, ignorando `warnings`, `dailyMacros`, `shoppingList` e `summary` retornados pelo backend.
- Impacto: informacoes valiosas ja geradas pela IA ficam indisponiveis para UI futura.
- Recomendacao: ampliar o tipo `Plan` no frontend e persistir o objeto completo retornado pela API.

### [P2] O paywall simulado redireciona para uma rota protegida sem autenticar o usuario

- Onde: `frontend/src/app/paywall/page.tsx:14-19`
- Onde: `frontend/src/context/AuthContext.tsx:133-135`
- Problema: a simulacao manda para `/dashboard`, mas a rota exige JWT.
- Impacto: o fluxo tende a cair em redirecionamento para login, o que deixa a jornada confusa.
- Recomendacao: no estado atual, redirecionar para `/login` apos a simulacao ou explicar explicitamente que o proximo passo e receber o acesso por email.

### [P2] `PlanModule` e `ScannerModule` existem, mas estao vazios

- Onde: `backend/src/plan/plan.module.ts:1-4`
- Onde: `backend/src/scanner/scanner.module.ts:1-4`
- Problema: os modulos estao importados no `AppModule`, mas nao possuem controllers, services nem responsabilidade clara.
- Impacto: aumenta a impressao de codigo incompleto e dificulta entendimento de ownership.
- Recomendacao: ou completar esses modulos ou removelos ate haver responsabilidade real.

### [P2] Falta camada forte de DTO, validacao e tipagem

- Onde: `backend/src/auth/auth.controller.ts`
- Onde: `backend/src/auth/auth.service.ts:87`
- Onde: `backend/src/ai/ai.controller.ts:12-18`
- Onde: `backend/src/webhook/webhook.controller.ts:12`
- Onde: `frontend/src/context/AuthContext.tsx:9`
- Problema: ha muitos `any`, payloads sem DTO e pouca validacao estruturada.
- Impacto: o projeto fica mais fragil para evolucao, refatoracao e protecao contra payloads invalidos.
- Recomendacao: introduzir DTOs com `class-validator`, tipos compartilhados e respostas mapeadas para a UI.

### [P2] Configuracao de producao ainda esta arriscada

- Onde: `backend/src/app.module.ts:23`
- Onde: `backend/src/main.ts:16`
- Problema: `synchronize: true` e `CORS origin: '*'` estao ligados diretamente no codigo.
- Impacto: risco operacional em producao e menor controle de seguranca.
- Recomendacao: mover isso para config por ambiente e endurecer as defaults de producao.

## Lacunas importantes para fechar o MVP real

- Login via magic link ainda nao esta implementado de ponta a ponta no frontend publico.
- Falta uma historia completa de pagamento real entre paywall, Kiwify, webhook e desbloqueio.
- Agua, refeicoes concluidas e progresso sao persistidos so no `localStorage`.
- Nao existe uma documentacao do projeto com variaveis de ambiente, setup local e passos de deploy.
- O backend tem poucos testes reais e os READMEs ainda sao os padroes de scaffolding.

## Ordem sugerida de implementacao

### Fase 1 - Fechar riscos criticos

- remover `demo-login` da tela publica
- remover ou proteger `POST /auth/demo-login`
- validar assinatura do webhook da Kiwify
- fazer `sendMagicLink` falhar quando o email nao for enviado

### Fase 2 - Consertar o fluxo real de autenticacao

- ligar a tela `/login` a `POST /auth/magic-link`
- manter `/auth/verify` como troca de token por JWT
- persistir magic links em Redis ou banco
- ajustar `apiFetch` para nao derrubar sessao em `403`
- esconder `BottomNav` das rotas publicas de auth

### Fase 3 - Corrigir o diario do usuario

- trocar todas as funcoes de "hoje" para data local correta
- implementar calculo real de `streak`
- corrigir `undoWater`
- corrigir `deleteProgress` quando a ultima entrada for removida
- alinhar o paywall simulado com o estado real de autenticacao

### Fase 4 - Melhorar modelagem e confiabilidade

- salvar o plano completo no frontend
- introduzir DTOs e validacoes no backend
- tipar melhor `user`, `plan` e respostas de API
- decidir se progresso, agua e meals devem subir para o backend
- completar ou remover modulos vazios

### Fase 5 - Hardening e qualidade

- criar README real do projeto
- documentar `.env` do frontend e backend
- adicionar testes de auth, webhook e geracao de plano
- criar smoke tests manuais para onboarding, login e scanner

## Sugestao de backlog inicial

1. Corrigir login para usar magic link real.
2. Remover bypass `demo-login`.
3. Validar webhook da Kiwify.
4. Corrigir datas locais.
5. Corrigir `403` sem logout forcado.
6. Implementar streak real.
7. Corrigir `undoWater` e exclusao da ultima pesagem.
8. Salvar o plano completo no frontend.
9. Endurecer configs de producao.
10. Documentar ambiente e fluxos.

## Checklist de validacao depois das correcoes

- usuario nao autenticado consegue navegar em `/`, `/login`, `/onboarding` e `/paywall` sem tela em branco
- tela de login chama `POST /auth/magic-link`
- email so retorna sucesso quando realmente foi enfileirado/enviado
- link magico continua valido mesmo se o backend reiniciar
- `GET /auth/verify` gera JWT valido e redireciona corretamente para `/dashboard`
- usuario sem pagamento recebe bloqueio de acesso sem ser deslogado
- webhook invalido e rejeitado
- webhook valido cria/libera usuario corretamente
- agua e progresso entram no dia correto em horario local
- streak muda conforme a regra definida
- menu inferior nao aparece em login e verificacao
- build, lint e testes passam localmente com Node instalado

## Minha recomendacao pratica

Se a ideia e ganhar velocidade sem aumentar divida tecnica, eu começaria por esta ordem:

- seguranca do acesso
- fluxo real de autenticacao
- bugs do diario do usuario
- tipagem e documentacao

Depois disso, da para entrar com tranquilidade nas proximas features e refinamentos de UX.
