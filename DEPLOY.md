# Deploy no repositório omniprof

## Enviar para GitHub

O conteúdo desta pasta está pronto para o repositório [amorimqueiroz-boop/omniprof](https://github.com/amorimqueiroz-boop/omniprof).

### Opção A — Usar esta pasta diretamente

```bash
cd omniprof_repo
git init
git add .
git commit -m "Initial commit: Omniprof standalone"
git branch -M main
git remote add origin https://github.com/amorimqueiroz-boop/omniprof.git
git push -u origin main
```

### Opção B — Copiar para um clone do repositório

```bash
git clone https://github.com/amorimqueiroz-boop/omniprof.git
cd omniprof
# Copie todos os arquivos de omniprof_repo/ para omniprof/ (incluindo .streamlit, .gitignore)
cp -r ../omniprof_repo/* .
cp -r ../omniprof_repo/.streamlit . 2>/dev/null || true
cp ../omniprof_repo/.gitignore . 2>/dev/null || true
git add .
git commit -m "Initial commit: Omniprof standalone"
git push -u origin main
```

> Se o branch padrão for `master`, use `git branch -M master` e `git push -u origin master`.

### Passo 4 — Streamlit Cloud

1. Acesse [share.streamlit.io](https://share.streamlit.io)
2. Connect ao repositório `amorimqueiroz-boop/omniprof`
3. **Main file path:** `omniprof_run.py`
4. Adicione as chaves de API em **Advanced settings → Secrets**
