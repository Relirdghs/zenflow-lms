import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Включить сжатие gzip/brotli
  compress: true,

  // Оптимизация изображений
  images: {
    // Форматы для автоконвертации (AVIF лучше WebP по сжатию)
    formats: ["image/avif", "image/webp"],
    // Размеры для srcset
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Разрешённые домены для внешних изображений
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
    // Data URLs не требуют remotePatterns — они inline
    // Минимальный TTL кэша изображений (в секундах)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 дней
  },

  // HTTP заголовки для кэширования
  async headers() {
    return [
      {
        // Статические ресурсы (JS, CSS, шрифты)
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Next.js static chunks
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Страницы - короткий кэш с ревалидацией
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Experimental features для производительности
  experimental: {
    // Оптимизация CSS
    optimizeCss: true,
  },

  // Отключаем Turbopack и используем webpack (из-за проблем с шрифтами в Turbopack)
  // Для использования webpack: npm run build -- --webpack
  // Или установить переменную окружения: NEXT_PRIVATE_SKIP_TURBOPACK=1

  // Оптимизация webpack для лучшего code splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Оптимизация для клиентской сборки
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunks
            framework: {
              name: "framework",
              chunks: "all",
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module: { context: string }) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
                return packageName ? `npm.${packageName.replace("@", "")}` : null;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: "commons",
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name: "shared-chunk",
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
