# Third-party and runtime

## Bundled dependencies

| Package | Version (range) | License | Rights holder |
| --- | --- | --- | --- |
| react | ^19 | MIT | Meta Platforms, Inc. and affiliates |
| react-dom | ^19 | MIT | Meta Platforms, Inc. and affiliates |
| vite | ^8 | MIT | Vite contributors |
| @vitejs/plugin-react | ^6 | MIT | Vite contributors |
| typescript | ^5.7 | Apache-2.0 | Microsoft Corporation |

Development-only packages (`@types/react`, `@types/react-dom`) follow the same licenses as the types they describe.

## Runtime not shipped to the browser

**Node.js** runs the Vite dev server and build. It is not bundled into the page.

## Browser APIs and assets

The preview uses the **Canvas 2D API** for all phosphor drawing.

Typography in the UI uses the system **ui-sans-serif** stack. There is **no Tailwind CSS**, no icon font, and no Google Fonts loaded for this app.

The **3×5 bogey tag** marks are drawn procedurally on the canvas by this project’s renderer. They are not loaded from a third-party font file.

## License for this folder

This folder does **not** include a project **LICENSE** file. Add one before publishing or redistributing the tuner.
