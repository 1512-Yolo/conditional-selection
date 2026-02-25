import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'
import dts from 'vite-plugin-dts'
export default defineConfig(({ command }) => {
    const isDev = command === 'serve'
    return {
        plugins: [react(), dts({
            outDir: 'dist/types',
            insertTypesEntry: true, //这是dts插件的配置，用于生成类型文件
            include: ['packages/**/*.ts', 'packages/**/*.tsx'],
            rollupTypes: true
        })],
        root: isDev ? path.resolve(__dirname, 'example') : undefined,
        server: {
            port: 3000,
            open: true,
        },
        build: {
            outDir: path.resolve(__dirname, 'dist'),
            lib: {
                entry: path.resolve(__dirname, 'packages/index.ts'),
                name: 'ui',
                formats: ['es', 'umd', 'cjs', 'iife'],
                fileName: (format) => `ui.${format}.js`,
            },
            emptyOutDir: false,
            rollupOptions: {
                external: ['react', 'react-dom'],
                output: {
                    globals: {
                        react: 'React',
                        'react-dom': 'ReactDOM',
                    },
                },
            },
        },
    }
});