# Tijon / DMVDigital Studio

Photography and music video portfolio. Static site, no build step.

## Adding work

Everything the site shows is listed in `js/data.js`.

- **New photo set:** put the images in `media/sets/<number>/` and add an entry under `sets` with each file's width and height.
- **New film:** add the YouTube video id and title under `films`.
- **BTS to final swipe:** add a before/after pair under `reveals`.
- **Links:** add a label and URL under `links`.
- **Name or studio name:** change `name` / `studio` at the top of the file.
- **Intro film:** set `intro` to `null` to switch it off. `film` plays on wide screens, `filmTall` (a vertical cut) on phones held upright.

Sections with nothing in them hide themselves.

## Preview locally

Serve the folder with any static server and open it in a browser.

All photographs and films are the artist's own. No AI imagery.
