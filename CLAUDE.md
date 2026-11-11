# Grid Six

PWA tático de airsoft em arquivo único (`index.html`), servido pelo GitHub Pages em
https://sagdefaria-ui.github.io/grid-six/ . Backend: Supabase, projeto `oxakoccszlcdxayiuhun`.

O dono do projeto não publica nada à mão: quem altera também publica.

## Publicar o app (frontend)

1. Antes de editar, `git fetch origin main` e parta da ponta: outras sessões também publicam aqui.
   Edite `index.html` (e `sw.js` se for o caso; ao mudar o `sw.js`, suba o nome do `CACHE`).
2. Suba a versão nos dois lugares, com o mesmo valor: `var APP_VERSION` em `index.html` e
   `version.json`. Formato `AAAA.MM.DD-N`.
3. Rode `./scripts/check.sh` — tem que terminar em `OK`.
4. Commit e push direto na `main`. O GitHub Pages publica em 1–2 minutos.

Quem está com o app aberto vê a barra "Nova versão disponível" (o app consulta
`version.json` ao abrir, ao voltar para a tela e a cada 5 minutos) e atualiza com um toque.

## Banco de dados

- `supabase/migrations/` é o histórico do schema. Os arquivos 0001–0014 já estão aplicados
  em produção (foram rodados pelo SQL Editor antes de existir esta pasta).
- Mudança nova: crie o próximo arquivo numerado, aplique com a ferramenta de migração do
  conector Supabase e faça commit do arquivo no mesmo push.
- Só migrações aditivas sem perguntar. Qualquer coisa que apague dados ou colunas: confirme antes.

## Edge Functions

- Fonte em `supabase/functions/<nome>/index.ts`; publique pelo conector Supabase com
  `verify_jwt: false` (as duas funções foram criadas assim) e faça commit do fonte.
- `parse-intel` (segredo `GEMINI_API_KEY`) continua publicada, mas o app deixou de usá-la quando
  a leitura de documentos por IA foi removida. `send-invite-push` usa `VAPID_PUBLIC_KEY` e
  `VAPID_PRIVATE_KEY` e é chamada pelo webhook `on_party_invite` (insert em `party_invites`).
- O repositório é público: nunca coloque segredos nele. A chave `sb_publishable_…` e a
  chave pública VAPID em `index.html` são públicas por natureza.

## Cuidados

- No plano gratuito o Supabase pausa o projeto após cerca de uma semana sem uso. Se o app
  mostrar "sem conexão", confira o status do projeto e restaure antes de investigar código.
- O mesmo projeto Supabase guarda tabelas e uma função do ViziEye (`vizieye_*`). Não mexa nelas
  a partir daqui.
- Teste no iPhone é o que vale: Safari e app na Tela de Início se comportam diferente para
  microfone, câmera e notificações.
