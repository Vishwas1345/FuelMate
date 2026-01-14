import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3001, // Keep frontend on 5173 to avoid conflict with backend on 3000/3001
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./"),
        },
    },
});
