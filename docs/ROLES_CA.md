# Modèle d'accès (SaaS robuste)

## Qui crée les organisations ?

**Uniquement le Super Admin plateforme.**

C’est le modèle standard des SaaS multi-tenant (Salesforce, Shopify Plus partners, etc.) :

1. **Super Admin** crée l’organisation  
2. Il assigne (ou crée) un **Responsable organisation**  
3. Le responsable gère **son** org uniquement (magasins, missions, équipe)  
4. Les **opérateurs terrain** sont invités dans l’org et utilisent le **mobile**

L’inscription publique (`/auth/register`) crée **seulement un utilisateur**, sans organisation.

## Rôles

| Rôle | Code / flag | Droits |
|------|-------------|--------|
| Super Admin | `isSuperAdmin=true` | Toutes les orgs, créer/suspendre/activer, stats plateforme |
| Responsable organisation | `ORG_MANAGER` | Web admin, **uniquement son org** |
| Opérateur terrain | `EMPLOYEE` | Mobile, missions assignées |

## Comptes démo

| Compte | Email | Password |
|--------|--------|----------|
| Super Admin | admin@yoobic-demo.com | Password123! |
| Responsable | sarah.manager@globalretail.com | Password123! |
| Opérateur | alex.frontline@globalretail.com | Password123! |

## API

- `POST /api/v1/organizations` → **requireSuperAdmin**
- `POST /api/v1/admin/organizations` → idem
- Body optionnel : `managerEmail`, `managerFirstName`, `managerLastName` pour créer/lier le premier responsable
