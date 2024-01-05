/// <reference types="vitest" />
import { mergeConfig, defineConfig } from 'vite';
import { defineConfig as vitetestConfig } from 'vitest/config'

import viteConfig from './vite.config';

export default defineConfig((env) => mergeConfig(
    viteConfig(env),
    vitetestConfig({
        test: {
            benchmark: {
                include: ['./benchmarks/**']
            },
            root: "./src",
            logHeapUsage: true,
            environment: 'jsdom',
            reporters: ["html", "default"],
            globals: true,
            setupFiles: ["./setup-vitest.ts"],
            include: ['./**/*.{test,spec}.{js,ts,tsx}'],
            coverage: {
                provider: 'istanbul', // or 'v8'
                reporter: ["text", "json"]
            },
            outputFile: "../html/index.html"
        }
    }))
);