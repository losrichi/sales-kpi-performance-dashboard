# Guide rapide — mettre ce projet sur GitHub

Le dossier est **déjà prêt**. Les données, le code SQL, les résultats d'analyse, un classeur Excel, le tableau de bord HTML et ses captures d'écran sont inclus.

**Publier le dépôt :** crée un dépôt public `sales-kpi-performance-dashboard` sur GitHub et charge **tout le contenu de ce dossier**, sans ajouter un dossier parent supplémentaire. Si tu actives GitHub Pages, sélectionne une publication via GitHub Actions ou le dossier racine et utilise l'URL `.../dashboard/` comme page du dashboard.

**Voir le tableau de bord sans installer de logiciel :** double-clique sur `dashboard/index.html` (les graphiques sont 100 % locaux).

**Vérifier le code :** `python -m unittest discover -s tests -v`. Pour rejouer le pipeline : `python -m src.generate_data`, puis `python -m src.run_analysis`, puis `python -m src.build_dashboard_data`.

**Attention pour ton CV :** les transactions sont **100 % synthétiques**. Tu peux indiquer que tu as réalisé un projet de portfolio sur données synthétiques. Le dashboard livré fonctionne en **HTML / JavaScript**, avec SQL et Excel ; aucun fichier `.pbix` certifié Power BI n'est inclus. Tu ne dois donc pas déclarer avoir construit le dashboard *dans Power BI* tant que tu ne l'as pas recréé et enregistré via Power BI Desktop.
