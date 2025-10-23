import { defineConfig, loadEnv } from "vite"
import uni from "@dcloudio/vite-plugin-uni"
import path from "path"
import AutoImport from 'unplugin-auto-import/vite'


export default ({ command, mode, base }) => {
  console.log("🚀 ~ command:", command, mode, base)
  const env = loadEnv(mode, process.cwd());
  console.log("🚀 ~ env:", env)
  return defineConfig({
    base: base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@img': path.resolve(__dirname, 'src/static/images'),
      },
    },
    server: {
      host: '0.0.0.0', // 允许外部访问
      // port: 3000, // 指定端口
      // open: true, // 自动打开浏览器
    },
    build: {
      sourcemap: env.VITE_APP_ENV !== 'production',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: env.VITE_APP_ENV === 'production', // 去除 console
          drop_debugger: env.VITE_APP_ENV === 'production',
        },
      },
      chunkSizeWarningLimit: 1500, // chunk 大小警告的限制（以 kbs 为单位）
    },
    plugins: [
      uni(),
      AutoImport({
        imports: ['vue', 'uni-app'],
        // 可以选择auto-import.d.ts生成的位置，使用ts建议设置为'src/auto-import.d.ts'
        // dts: 'src/auto-import.d.ts'
        // 自动生成'eslintrc-auto-import.json'文件，在'.eslintrc.cjs'的'extends'中引入解决报错
          eslintrc: {
            enabled: true,
          },
      })
    ]
  });
};

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [uni()],
// });
