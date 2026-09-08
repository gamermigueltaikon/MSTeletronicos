# MST Eletrônicos

Site estático da MST Eletrônicos, feito em HTML, CSS e JavaScript puro.

## Publicar na internet com GitHub Pages

1. Faça push deste repositório para o GitHub.
2. Abra **Settings > Pages** no repositório.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch `main`, a pasta `/ (root)` e clique em **Save**.

O GitHub Pages publicará o arquivo `index.html` automaticamente. O endereço será:

`https://SEU_USUARIO.github.io/MSTeletronicos/`

## Configuração da loja

Abra **⚙ Admin** no site para definir o nome, WhatsApp e chave PIX. Os produtos de demonstração podem ser editados ou removidos pelo mesmo painel.

O site não exige servidor para funcionar. O modo publicado usa armazenamento local do navegador: produtos, configurações e solicitações não são enviados para um banco compartilhado. O painel administrativo é apenas local e não substitui autenticação de servidor.

## Segurança incluída

- Política CSP aplicada para reduzir execução de conteúdo inesperado.
- URLs de imagens, vídeos e links externos validadas antes da renderização.
- Dados dinâmicos escapados antes de entrar no HTML.
- Solicitações de clientes não são carregadas por visitantes nem sincronizadas publicamente.
- Validação de preço, tamanho de nome e descrição no cadastro de produtos.
- Sanitização dos dados recuperados do armazenamento local e expiração da sessão administrativa após 15 minutos.
- Link do YouTube usa `youtube-nocookie.com`, `sandbox` e `rel="noopener noreferrer"`.
- Manifesto web incluído para instalação como aplicativo no celular.