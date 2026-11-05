# Halk Büfe ingredients and nutrition estimates

The 44 menu entries have localized ingredient, energy, nutritional-contribution and ingredient-vitamin information in Turkish, Russian, English and German. The module provides 42 assumed-recipe energy ranges. The snack platter and changing dessert of the day have information sections but **no invented calorie range**: platter quantities and the dessert recipe are not known.

## Meaning of the values

No café recipe cards, serving weights, exact product labels or laboratory analysis were supplied. All recipe amounts and energy intervals in `dist/nutrition-data.js` are editorial models for explicitly assumed edible portions. They are not café-approved declarations, guaranteed bounds or measured vitamin content. Actual portions and recipes can fall outside the displayed ranges.

`recipe` is a list of `[ingredientKey, assumedLowAmount, assumedHighAmount]`. Amounts are grams except where the ingredient explicitly specifies millilitres. Calculations multiply the assumed amount by generic kcal per 100 g or 100 ml, sum the components and round the endpoints outward for display. The arithmetic describes the stated model, not the accuracy of the café serving.

The original photographed menu supplies dish names and principal fillings. The owner separately confirmed the sides of the four adult chicken plates (rice, fries, red cabbage) and both kids meals (rice, fries, red cabbage, cucumber). These are included in the models. Adult köfte sides were not confirmed: its estimate explicitly covers köfte alone. Sandwiches and burgers exclude additional side dishes. Frying oil already represented in fried-food density is not separately added to those ingredients; the additional oil allowance on chicken plates models pilaf, marinade and dressing.

The photograph's snack-platter line lists chicken nuggets, crispy chicken, onion rings, sigara böreği and fries. Counts, weights and sauces remain unknown, so an energy total is withheld. The dessert of the day also requires identification before calculation.

Breakfast contents, mixed omelette/toast fillings, burger sauces, salata vegetables, creamy/curry sauces, dough recipes, dessert recipes and their portion weights are typical-recipe assumptions where the supplied menu does not specify them. Ingredients are not a complete allergen declaration. The images are generated serving illustrations and were not used to establish recipes.

Coffee and tea estimates assume an unsweetened drink. Nescafe assumes black instant coffee on water, explicitly excluding milk, sugar and sweetened premix; this must be confirmed with the café. The herbal blend is unknown and receives no therapeutic or caffeine-free claim. Plain drinks do not receive a meaningful-vitamin claim.

## Sources and modelling choices

Primary reference pages consulted on 2026-11-05:

- [Health Canada — Nutrient Value of Some Common Foods (2008)](https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data/nutrient-value-some-common-foods-2008.html). Generic ready-to-eat comparisons, not Turkish café data. Examples: cooked white rice 109 kcal/83 g; cooked pasta 220/169 g and spaghetti 209/148 g; roast chicken breast meat 119/75 g and mixed chicken meat/skin 179/75 g; raw red cabbage 11/37 g; egg 74–78/50 g; white bread 93–100/35 g; fries 236/76 g; olive oil 121/14 g. The source explains recipe variation and generic/composite data.
- [NHS — B vitamins and folic acid](https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-b/). Ingredient-level profiles: eggs and dairy contain B vitamins, poultry contains B6, meat supplies B12, and leafy vegetables supply folate. No daily-value percentage or measured amount per café portion is claimed.
- [NHS — Vitamin C](https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-c/). Ingredient-level context for vegetables and potatoes; preparation and storage affect amounts.

Ingredient energy densities are broad editorial comparison intervals. They do not assert that the endpoints were measured at the café or retrieved as exact matching products. For example, köfte, sucuk, lor, breaded chicken, curry/burger sauces and revani vary considerably by recipe. Their model ranges are assumptions based on generic analogous foods; no specific supplier, meat type, fat percentage or proprietary recipe is asserted. Pumpkin's beta-carotene profile describes the ingredient, not a quantified benefit of the served dessert. No weight-loss, detoxification, immunity, treatment or disease-prevention claims are used.

Before labelling the information café-approved, obtain actual servings and full recipes including marinades, sauces, oils, sugar and packaged-product labels, then recalculate. Vitamin quantities require recipe-specific nutrient data or analysis. The models remain visibly labelled as estimates until then.

## Verification

`tests/nutrition.test.mjs` checks all 44 records and four languages; valid recipe components and outward energy bounds; unknown-dish handling; adult/kids side coverage; absence of invented sides for adult köfte; and plain-drink vitamin and sugar assumptions. These tests validate coverage and arithmetic, not the real café's ingredient weights.

## Interface and release checks

The feed and photo cards show a 44px nutrition button over the image; it opens the dish with the nutrition section expanded and scrolled into view. Ordinary dish opening keeps the section collapsed. Search includes ingredient descriptions in all four languages. The three menu views, personal reactions, order prices and basket behavior remain available.

Light and dark themes use warmer surfaces and readable foreground colors; the dark hero no longer keeps a bright light-theme background. The theme button names the next action. New visitors follow their system preference until they choose a theme; that choice persists across visits. Explicit theme URLs are respected. Category scrollbars are hidden while horizontal scrolling and keyboard access remain available.

Completed on 2026-11-05:

- 5 nutrition tests, 5 theme-preference tests and the 5 existing personal-reaction tests passed. Syntax checks and `git diff --check` passed.
- Browser: 320×568 Russian light feed and expanded chicken-kids nutrition; 390×844 German dark nutrition including the long potato/cheese/spinach gözleme title; 360×640 English list-to-details and nutrition for Nescafe and unknown dessert. The checked page/dialog states had no horizontal document overflow.
- On 320×568 with a populated basket, the 314px feed card ends at y=485.6 and the basket dock begins at y=512. Close, share and add controls stay available in the detail dialog.
- Ingredient search for Russian “манка” finds Revani. Native disclosure, nutrition-button opening and light↔dark switching were exercised.
- All 44 referenced photo files exist and have WebP headers. Both kids-meal photos loaded in the selected preview. During further image checks the shared preview switched to another project (Roby's), so failures from that route are not treated as Halk asset defects or as a full 44-photo browser pass.

Not covered: real iOS/Android browser chrome, virtual keyboard, enlarged text and café recipe/serving verification. Desktop visual checks after the shared-preview switch remain unverified. Gözleme/şepit estimates explicitly exclude extra served vegetables and sauces.
