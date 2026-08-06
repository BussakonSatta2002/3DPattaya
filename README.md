# Pattaya 3D Map

[![Deploy Vite site to GitHub Pages](https://github.com/BussakonSatta2002/3DPattaya/actions/workflows/deploy.yml/badge.svg)](https://github.com/BussakonSatta2002/3DPattaya/actions/workflows/deploy.yml)

**Live 3D viewer:** [Open Pattaya 3D Map](https://bussakonsatta2002.github.io/3DPattaya/)

An interactive web viewer for testing the publication of Pattaya 3D data using **Gaussian Splatting**. The application combines a Gaussian Splat scene, a collision mesh, navigation controls, and 3D annotations, and is automatically deployed to GitHub Pages.

## Project overview

This project demonstrates how large 3D assets can be published on the web without storing them directly in the GitHub Pages artifact. The source code is kept in this repository, while the large Gaussian Splat and collision files are stored as GitHub Release assets. During deployment, GitHub Actions downloads the assets, builds the Vite application, and publishes the final site.

## Features

- Interactive Gaussian Splat rendering
- Orbit/map navigation for exploring the scene
- First-person (FPS) navigation
- Collision detection using a GLB collision mesh
- Collision-mesh visibility toggle
- Orbit/FPS mode toggle
- Adjustable 3D helper box with X, Y, Z, and size controls
- HTML annotations linked to positions in the 3D scene
- Responsive, browser-based viewer
- Automatic deployment with GitHub Actions and GitHub Pages

## Viewer controls

| Mode | Control | Action |
| --- | --- | --- |
| Orbit/map | Mouse drag | Rotate or pan around the scene |
| Orbit/map | Mouse wheel | Zoom in or out |
| FPS | Mouse | Look around after entering first-person mode |
| FPS | **W / A / S / D** | Move forward, left, backward, and right |
| FPS | **Shift** | Sprint |
| FPS | **Space** | Jump |
| FPS | **Esc** | Release the mouse pointer |
| Interface | Collision Mesh toggle | Show or hide the collision geometry |
| Interface | Orbit / FPS toggle | Change the navigation mode |
| Interface | X / Y / Z / Size controls | Move or resize the helper box |

> For the best experience, open the viewer on a desktop computer with WebGL support.

## 3D assets

The large 3D files are published in [Release v1.0.0](https://github.com/BussakonSatta2002/3DPattaya/releases/tag/v1.0.0).

| Asset | Purpose | Download |
| --- | --- | --- |
| `pattaya.splat` | Gaussian Splat scene displayed by the viewer | [Download](https://github.com/BussakonSatta2002/3DPattaya/releases/download/v1.0.0/pattaya.splat) |
| `output_pattaya577.collision.glb` | Collision geometry used by first-person navigation | [Download](https://github.com/BussakonSatta2002/3DPattaya/releases/download/v1.0.0/output_pattaya577.collision.glb) |
| `output_pattaya577.voxel.bin` | Binary voxel data | [View repository file](https://github.com/BussakonSatta2002/3DPattaya/blob/main/output_pattaya577.voxel.bin) |
| `output_pattaya577.voxel.json` | Voxel metadata and configuration | [View repository file](https://github.com/BussakonSatta2002/3DPattaya/blob/main/output_pattaya577.voxel.json) |

Keeping the large `.splat` and `.glb` files in a GitHub Release prevents them from unnecessarily increasing the repository and Pages artifact sizes.

## Technology stack

- [Vite](https://vite.dev/) — development server and production build
- [Three.js](https://threejs.org/) — 3D rendering and scene utilities
- [GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D) — Gaussian Splat rendering
- [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) — efficient collision queries
- [GitHub Actions](https://github.com/features/actions) — automated build and deployment
- [GitHub Pages](https://pages.github.com/) — static web hosting

## Project structure

| Path | Description |
| --- | --- |
| `src/main.js` | Loads the Gaussian Splat scene, navigation, collisions, helper box, and annotations |
| `src/style.css` | Application styling |
| `public/` | Static assets included in the Vite build |
| `index.html` | Viewer interface, toggles, controls, and annotation elements |
| `vite.config.js` | Vite configuration and the `/3DPattaya/` Pages base path |
| `package.json` | Project dependencies and npm scripts |
| `.github/workflows/deploy.yml` | GitHub Pages deployment workflow |
| `.gitlab-ci.yml` | GitLab CI configuration retained for the related GitLab deployment |
| `output_pattaya577.voxel.bin` | Voxel binary data |
| `output_pattaya577.voxel.json` | Voxel metadata |

## Run locally

### Requirements

- Node.js 22 or a compatible current Node.js version
- npm
- A modern browser with WebGL support

### Installation

```bash
git clone https://github.com/BussakonSatta2002/3DPattaya.git
cd 3DPattaya
npm install
```

Before starting the local viewer, download these release assets into the `public/` directory:

```text
public/pattaya.splat
public/output_pattaya577.collision.glb
```

Then start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite in your browser.

### Production build

```bash
npm run build
npm run preview
```

The production files are generated in the `dist/` directory.

## Deployment workflow

Every push to the `main` branch triggers the workflow in `.github/workflows/deploy.yml`.

The workflow:

1. Checks out the repository.
2. Sets up Node.js 22.
3. Installs dependencies with `npm ci`.
4. Downloads `pattaya.splat` and the collision GLB from Release v1.0.0 into `public/`.
5. Builds the Vite application with `npm run build`.
6. Uploads the `dist/` directory as the GitHub Pages artifact.
7. Deploys the artifact to GitHub Pages.

You can review deployments on the [GitHub Actions page](https://github.com/BussakonSatta2002/3DPattaya/actions/workflows/deploy.yml).

## Editing annotations

Annotation elements are defined in `index.html`, while their 3D positions and screen updates are controlled in `src/main.js`.

To add an annotation:

1. Copy an existing `.annotation-marker` block in `index.html`.
2. Give it a unique ID such as `anno-4`.
3. Change the text inside `.anno-box`.
4. Add the corresponding 3D position and update logic in `src/main.js`.
5. Commit the changes to `main` and wait for GitHub Pages to redeploy.

## Links

- [Live 3D viewer](https://bussakonsatta2002.github.io/3DPattaya/)
- [GitHub repository](https://github.com/BussakonSatta2002/3DPattaya)
- [3D asset release](https://github.com/BussakonSatta2002/3DPattaya/releases/tag/v1.0.0)
- [Deployment workflow](https://github.com/BussakonSatta2002/3DPattaya/actions/workflows/deploy.yml)

## Status

The personal GitHub Pages deployment is active. Source updates pushed to `main` are deployed automatically after the GitHub Actions workflow completes.
