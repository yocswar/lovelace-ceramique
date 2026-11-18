-- Mise à jour des étapes sur une base existante.
-- Les 6 étapes existantes gardent leur id : les tickets déjà en base restent valides.
-- Peut être relancé sans risque.

BEGIN;

-- ordre est UNIQUE et PostgreSQL le vérifie ligne par ligne :
-- on décale d'abord tout hors de la plage 1 à 9 pour éviter les collisions
UPDATE etape SET ordre = ordre + 100;

INSERT INTO etape (nom, ordre)
SELECT v.nom, v.ordre
FROM (VALUES ('À faire', 1), ('Décor', 4), ('Perte', 9)) AS v(nom, ordre)
WHERE NOT EXISTS (SELECT 1 FROM etape e WHERE e.nom = v.nom);

UPDATE etape SET ordre = CASE nom
    WHEN 'À faire'         THEN 1
    WHEN 'Façonnage'       THEN 2
    WHEN 'Séchage'         THEN 3
    WHEN 'Décor'           THEN 4
    WHEN 'Cuisson biscuit' THEN 5
    WHEN 'Émaillage'       THEN 6
    WHEN 'Cuisson émail'   THEN 7
    WHEN 'Terminé'         THEN 8
    WHEN 'Perte'           THEN 9
END;

COMMIT;