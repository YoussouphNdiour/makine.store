# Makiné — Bug Log & Corrections

| # | Fichier | Bug | Sévérité | Correction | Statut |
|---|---------|-----|----------|------------|--------|
| 001 | lib/wave.ts | env var undefined crash silencieux | CRITIQUE | Guard clause requireEnv() | OK |
| 002 | lib/wave.ts | amount avec décimales rejeté par Wave | CRITIQUE | Math.round() | OK |
| 003 | lib/wave.ts | format E.164 non validé | WARN | Validation +XXX... | OK |
| 004 | lib/wave.ts | timing attack webhook signature | CRITIQUE | timingSafeEqual() | OK |
| 005 | lib/wave.ts | WAVE_API_KEY != WAVE_CHECKOUT_API_KEY | CRITIQUE | 2 clés séparées | OK |
| 006 | lib/orangeMoney.ts | token OAuth2 re-généré à chaque requête | WARN | Cache 55min | OK |
| 007 | lib/orangeMoney.ts | pas de retry si token 401 expiré | WARN | Invalider cache + throw | OK |
| 008 | lib/orangeMoney.ts | numéro avec '+' rejeté par Orange | CRITIQUE | replace('+','') | OK |
| 009 | lib/whatsappBot.ts | bot répond à ses propres messages | CRITIQUE | Anti-boucle renforcé | OK |
| 010 | lib/whatsappBot.ts | session null → crash unique constraint | CRITIQUE | upsert() | OK |
| 011 | lib/whatsappBot.ts | rate limiting WASender sur images | WARN | Délai 500ms | OK |
| 012 | lib/whatsappBot.ts | cart non initialisé → JSON.parse crash | CRITIQUE | JSON.parse('[]') défaut | OK |
| 013 | app/api/whatsapp/webhook | timeout WASender si traitement sync | CRITIQUE | Réponse 200 + async | OK |
| 014 | docker-compose.yml | subnet conflit avec makine_default | CRITIQUE | 172.40.0.0/24 | OK |
| 015 | docker-compose.yml | port 3100 libre sur le VPS | INFO | Confirmé libre | OK |
| 016 | deploy | Nginx existant port 80/443 → pas de nouveau Nginx | CRITIQUE | Conf dans nginx_default | OK |
