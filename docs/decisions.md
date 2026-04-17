# Makiné — Décisions Techniques

## Infrastructure
- **Port app** : 3100 (127.0.0.1:3100:3000) — libre sur le VPS Contabo
- **Subnet** : 172.40.0.0/24 — loin des subnets existants (172.17-172.33)
- **Réseau** : makine_network (≠ makine_default qui existe déjà)
- **Nginx** : pas de nouveau conteneur — configuration dans nginx_default existant

## Paiement
- **Wave** : 2 clés distinctes (WAVE_API_KEY pour payouts, WAVE_CHECKOUT_API_KEY pour checkout)
- **Orange Money** : token OAuth2 mis en cache (TTL 55min) pour éviter re-génération
- **Webhook Wave** : signature HMAC-SHA256 avec timingSafeEqual() contre timing attacks

## WhatsApp Bot
- **Anti-boucle** : comparaison BOT_NUMBER normalisé
- **Session** : upsert() pour éviter unique constraint sur création simultanée
- **Rate limiting** : délai 500ms entre envois d'images WASender
- **Async** : réponse 200 immédiate + traitement asynchrone du message

## Base de données
- **PostgreSQL 16** : sans port exposé à l'extérieur du réseau makine_network
- **Backup** : pg_dump quotidien avec rétention 7 jours
