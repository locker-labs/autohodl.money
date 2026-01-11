# autoHODL Documentation

This directory contains the documentation for the autoHODL project, built with [Nextra](https://nextra.site).

## Running Locally

To run the documentation site on your local machine:

1.  **Install dependencies** (if you haven't already):
    ```bash
    bun install
    ```

2.  **Start the development server**:
    ```bash
    bun --filter @autohodl.money/docs dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Deployment is automated via GitHub Actions.

1.  **Push to `main`**:
    Any changes pushed to the `main` branch will automatically trigger the deployment workflow defined in `.github/workflows/deploy-docs.yml`.

2.  **GitHub Pages Settings**:
    Ensure your repository is configured to deploy from GitHub Actions:
    -   Go to **Settings** > **Pages**.
    -   Under **Build and deployment**, select **GitHub Actions** as the source.

The site will be live at your repository's GitHub Pages URL (e.g., `https://locker.github.io/autohodl.money/`).

