# Heatzy Pilote

Pilotez vos modules **Heatzy Pilote** (et Acova Elec'Pro) depuis Gladys Assistant.

## Prérequis

- Un compte Heatzy (celui de l'application Heatzy).
- Vos modules Pilote déjà appairés et en ligne dans l'application Heatzy.
- Un accès internet : Heatzy n'a pas d'API locale, tout passe par le cloud Heatzy.

## Configuration

1. Installez l'intégration depuis le catalogue Gladys.
2. Ouvrez l'onglet **Configuration** et saisissez votre e-mail et votre mot de passe Heatzy.
3. Réglez si besoin la durée par défaut du mode vacances (jours) et du boost (minutes).
4. Ouvrez l'onglet **Découverte**, lancez un scan, puis créez les modules souhaités.

## Ce que vous obtenez

| Module | Fonctionnalités |
| --- | --- |
| Pilote 1re génération | Mode : confort, éco, hors-gel, arrêt |
| Pilote 2e et 3e génération | Mode, Dérogation (aucune, vacances, boost), Verrouillage, Programmation |
| Pilote 4e génération (témoin de connexion vert) | Idem, plus Confort -1 et Confort -2 |

Une dérogation est prioritaire sur le reste : vacances passe en hors-gel, boost passe en confort, jusqu'à la fin de la durée.

## Bon à savoir

- L'état est actualisé toutes les 60 secondes : un changement fait sur le module ou dans l'application Heatzy apparaît dans Gladys au bout d'une minute au plus.
- Les autres produits Heatzy (Pilote Pro, Glow, Shine, Onyx) ne sont pas encore gérés et sont ignorés lors du scan.

## Dépannage

- **Rien trouvé au scan** : vérifiez vos identifiants et que les modules apparaissent en ligne dans l'application Heatzy. Les logs listent chaque produit trouvé avec sa clé produit et sa génération.
- **Connexion refusée** : ressaisissez votre mot de passe dans l'onglet Configuration.
- **Une commande n'a aucun effet** : vérifiez que le module est en ligne et non verrouillé.
