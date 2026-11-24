# LP Pedra Forth Marmoraria | padrão QH4 (Variante A)

Slug IVO: `lp-pedra-forth` · WhatsApp da LP: (35) 99928-1011 (número de anúncios informado no briefing)

## Estrutura
```
index.html          LP
obrigado.html       página de conversão (o formulário redireciona para cá depois de abrir o WhatsApp)
404.html
site.webmanifest · robots.txt · sitemap.xml · favicon.ico
assets/css/style.css
assets/js/main.js       UI: menu, entrada do hero, reveal, abas, lightbox, processo, vídeo, formulário
assets/js/tracking.js   [QH4 SLOT 8] config + eventos (whatsapp_click, form_start, generate_lead) + envio ao CRM
assets/img/             WebP (versão -640 para mobile), og-image.jpg 1200x630, ícones
assets/video/showroom.mp4  tour de 35 s, sem áudio (1,2 MB)
```

## O que falta preencher antes de publicar
1. **GTM**: [QH4 SLOT 1] e [QH4 SLOT 5] em index.html, obrigado.html e 404.html.
2. **Pixel / Google Ads**: via GTM, ou `metaPixelId` no tracking.js, ou SLOTS 3/4. Nunca dois ao mesmo tempo.
3. **Domínio**: trocar `DOMINIO-A-DEFINIR` (canonical, OG, JSON-LD, robots, sitemap). A revista antiga cita `marmorarialavras.com`: confirmar com o Pablo se o domínio ainda é dele.
4. **CRM (GHL)**: `webhook` no tracking.js está vazio. Para usar o inbound padrão QH4, colar a URL comentada e filtrar `lp.variant == "lp-pedra-forth"` no n8n.
5. **Endereço (confirmado no Google)**: R. Antônio Virgilino, 275, Aquenta Sol, Lavras/MG, CEP 37202-874. Place ID do Google: ChIJG_QYur6typQR6NQ4BoBJdRw (usado nos links de rota e avaliações).
6. **[CONFIRMAR] WhatsApp**: a LP usa o número do briefing (35) 99928-1011. O contato do Pablo no contrato é (35) 98822-8888. Confirmar qual atende os leads.
7. **[CONFIRMAR] Anos**: o briefing diz "5 anos de mercado" e a matéria da revista diz "fundada em 2022". Por isso a LP não cita ano de fundação; usa "+20 anos" de ofício do Alessandro (a matéria cita 24 anos de experiência dele).
8. **Avaliações**: o carrossel usa 13 avaliações reais do perfil no Google, coletadas em 24/11/2026 (nota 5,0 em 68 avaliações). Nomes abreviados (primeiro nome + inicial). Quando o número de avaliações crescer, atualizar o "68" no hero e na seção (data-count). Ficou de fora a avaliação da "Guilarducci Consultoria", por ser da família.

## Fontes do conteúdo
- Briefing (formulário): história, diferenciais, FAQ de entrega e prazo, horário, público, destaques (cozinhas, escadas, curvas, rebaixo italiano, mesas de pedra), materiais que ele não quer mostrar (verde ubatuba, ocre, corumbá, básicos).
- Logo: frame final dos reels (versão P&B atual, "Exclusividade · Guilarducci · Mármores e Quartzitos").
- Revista Elitte Sul de Minas (posts do Instagram): endereço novo, cozinha em Taj Mahal, sócios.
- Reels do @pablobarao: citação sobre paginação de veios e o FAQ sobre quantidade de chapas.
