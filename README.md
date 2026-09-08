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
- SEO técnico incluído com canonical, Open Graph, dados estruturados, `robots.txt` e `sitemap.xml`.

## Aparecer no Google

O Google não garante a primeira posição nem indexa um site instantaneamente. Para acelerar a descoberta:

1. Acesse [Google Search Console](https://search.google.com/search-console) com sua conta Google.
2. Clique em **Adicionar propriedade** e escolha **Prefixo do URL**.
3. Informe `https://gamermigueltaikon.github.io/MSTeletronicos/`.
4. Escolha a verificação por **Tag HTML** ou **Arquivo HTML** e conclua a verificação.
5. Abra **Sitemaps**, informe `sitemap.xml` e clique em **Enviar**.
6. Use **Inspeção de URL**, informe a URL do site e clique em **Solicitar indexação**.

Depois, pesquise por `site:gamermigueltaikon.github.io/MSTeletronicos` para acompanhar quando a página aparecer. Para ser encontrado digitando apenas **MST Eletrônicos**, o nome precisa ganhar relevância com tempo, links de redes sociais, divulgação e avaliações reais; não existe botão que garanta essa posição.

## Checkout real com Mercado Pago

O repositório agora inclui uma API serverless em `api/` que cria preferências de pagamento no Mercado Pago e recebe webhooks. O token nunca fica no `index.html`.

Para ativar:

1. Crie uma aplicação em [Mercado Pago Developers](https://www.mercadopago.com.br/developers/pt).
2. Copie o **Access Token de produção**. Nunca o coloque no HTML ou em um commit.
3. Crie um projeto na Vercel conectado a este repositório, usando a raiz do projeto.
4. Cadastre estas variáveis no projeto Vercel: `MP_ACCESS_TOKEN`, `SITE_URL`, `SITE_ORIGIN` e `API_URL`. Use `.env.example` como referência.
5. Faça o deploy e copie a URL do projeto, por exemplo `https://mst-checkout.vercel.app`.
6. No `index.html`, altere `CHECKOUT_API_URL` para essa URL, sem `/api` no final:

```js
const CHECKOUT_API_URL = 'https://mst-checkout.vercel.app';
```

7. Publique novamente o site. O botão **Continuar para pagamento** abrirá o Checkout Pro do Mercado Pago com PIX, cartão e boleto disponíveis conforme a conta.

O backend recalcula o preço e o frete com um catálogo server-side em `api/catalog.js`; não confia no valor enviado pelo navegador. Para alterar preços/estoque do checkout, atualize esse catálogo junto com os produtos exibidos.

O webhook confirma o pagamento consultando a API do Mercado Pago. Para operação completa de estoque e painel de pedidos, o próximo passo é conectar o webhook a um banco de dados seguro; não use `localStorage` para conciliação financeira.