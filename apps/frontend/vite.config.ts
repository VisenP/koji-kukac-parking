import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    "babel-plugin-twin",
                    "babel-plugin-macros",
                    "babel-plugin-styled-components",
                    [
                        "prismjs",
                        {
                            languages: ["python", "c", "cpp", "go", "rust", "java"],
                            plugins: ["line-numbers", "match-braces"],
                            css: true,
                        },
                    ],
                ],
                ignore: ["\u0000commonjsHelpers.js"], // weird babel-macro bug workaround
            },
        }),
    ],
});
