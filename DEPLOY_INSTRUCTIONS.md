# DEPLOY SISTEMA IMÓVEL CERTO™ → GitHub + Vercel
## Comandos copy-paste pro Terminal do Mac

Esses comandos assumem que você já tem `git` configurado e que vai criar o repo no GitHub `sistema-imovel-certo` (público).

---

## PARTE 1 — Limpar o git local + commit inicial

Abra o Terminal e cole o bloco abaixo:

```bash
cd "/Users/brunosilva/Downloads/heritage_signal_deploy/miami-ia"

# Limpa locks travados do sandbox
rm -f .git/index.lock .git/t3a026E

# Remove PNGs originais (já temos JPGs otimizados)
rm -f img/*.png

# Configura git
git config user.email "123playamazon@gmail.com"
git config user.name "Bruno Silva"

# Adiciona tudo + commit
git add -A
git commit -m "Sistema Imóvel Certo™ — landing page v1 com 18 imagens IA"

# Verifica
git log --oneline
```

Você deve ver uma linha tipo: `abc1234 (HEAD -> main) Sistema Imóvel Certo™ — landing page v1 com 18 imagens IA`

---

## PARTE 2 — Criar repo no GitHub

### Opção A: Via GitHub CLI (mais rápido, se você tem `gh` instalado)

```bash
gh repo create sistema-imovel-certo --public --source=. --remote=origin --push
```

Pronto. Pula pra PARTE 3.

### Opção B: Manual via web (se não tem `gh`)

1. Abra: https://github.com/new
2. Repository name: `sistema-imovel-certo`
3. Description: `Sistema Imóvel Certo™ — IA brasileira de matching imobiliário em Miami`
4. Public
5. **NÃO** marque "Add a README" / "Add .gitignore" / "Choose a license" (já tem tudo local)
6. Clique "Create repository"

GitHub vai te mostrar a URL. Copie e cole no Terminal:

```bash
cd "/Users/brunosilva/Downloads/heritage_signal_deploy/miami-ia"
git remote add origin https://github.com/SEU-USUARIO/sistema-imovel-certo.git
git branch -M main
git push -u origin main
```

(Troca `SEU-USUARIO` pelo teu username GitHub.)

---

## PARTE 3 — Deploy no Vercel

### Opção A: Via Vercel CLI (mais rápido, se tem `vercel` instalado)

```bash
cd "/Users/brunosilva/Downloads/heritage_signal_deploy/miami-ia"
vercel --prod
```

Vai perguntar:
- Set up and deploy? → **Y**
- Which scope? → escolhe sua conta
- Link to existing project? → **N**
- Project name? → **sistema-imovel-certo** (ou enter pra usar default)
- Directory? → **./** (enter)
- Override settings? → **N**

Vercel vai detectar `vercel.json` (já existe no folder) e fazer deploy. Em 30-90 segundos você tem a URL viva.

### Opção B: Via Vercel Web (se não tem CLI)

1. Abra: https://vercel.com/new
2. Import Git Repository → escolhe `sistema-imovel-certo`
3. Framework Preset: **Other** (é HTML estático)
4. Root Directory: **./** (default)
5. Build Command: deixa vazio
6. Output Directory: deixa vazio
7. Click "Deploy"

Em ~30s a URL fica disponível, tipo: `sistema-imovel-certo.vercel.app`

---

## PARTE 4 — Configurar domínio (opcional, depois)

Se quiser um subdomain customizado:

1. Vercel dashboard → projeto → Settings → Domains
2. Adicionar `sistemaimovelcerto.com` (se tiver) ou `imovelcerto.app`
3. Configurar DNS no registro do domínio (Vercel mostra os 2 records pra criar)

Custo: $10-15/ano de domínio + grátis no Vercel.

---

## PARTE 5 — Próximas atualizações

Toda vez que mudar algo no folder local:

```bash
cd "/Users/brunosilva/Downloads/heritage_signal_deploy/miami-ia"
git add -A
git commit -m "descrição da mudança"
git push
```

Vercel detecta o push automaticamente e re-deploya em ~30s. Sem precisar tocar em nada.

---

## CHECKLIST PRÉ-LAUNCH

Antes de enviar tráfego pago pro link Vercel, verifica:

- [ ] Abrir URL Vercel no celular — todas as imagens carregam?
- [ ] Quiz funciona end-to-end (3 perguntas → resultado)?
- [ ] Form de captura tá conectado no Formspree certo?
- [ ] Vídeo do André (se tiver) toca?
- [ ] Botões "WhatsApp" abrem no número certo?
- [ ] Mobile responsive OK (375px / iPhone SE)?
- [ ] Time-to-interactive < 3s?

Se algum item falhar, me chama que eu corrijo antes do push da campanha.
