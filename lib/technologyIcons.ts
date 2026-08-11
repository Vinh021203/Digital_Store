const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

const technologyIconPaths: Record<string, string> = {
  html: 'html5/html5-original.svg',
  html5: 'html5/html5-original.svg',
  css: 'css3/css3-original.svg',
  css3: 'css3/css3-original.svg',
  javascript: 'javascript/javascript-original.svg',
  'javascript es6': 'javascript/javascript-original.svg',
  typescript: 'typescript/typescript-original.svg',
  react: 'react/react-original.svg',
  'next.js': 'nextjs/nextjs-original.svg',
  nextjs: 'nextjs/nextjs-original.svg',
  vue: 'vuejs/vuejs-original.svg',
  'vue.js': 'vuejs/vuejs-original.svg',
  nuxt: 'nuxtjs/nuxtjs-original.svg',
  'nuxt.js': 'nuxtjs/nuxtjs-original.svg',
  angular: 'angular/angular-original.svg',
  svelte: 'svelte/svelte-original.svg',
  astro: 'astro/astro-original.svg',
  node: 'nodejs/nodejs-original.svg',
  'node.js': 'nodejs/nodejs-original.svg',
  express: 'express/express-original.svg',
  tailwind: 'tailwindcss/tailwindcss-original.svg',
  'tailwind css': 'tailwindcss/tailwindcss-original.svg',
  bootstrap: 'bootstrap/bootstrap-original.svg',
  jquery: 'jquery/jquery-original.svg',
  figma: 'figma/figma-original.svg',
  canva: 'canva/canva-original.svg',
  laravel: 'laravel/laravel-original.svg',
  php: 'php/php-original.svg',
  python: 'python/python-original.svg',
  django: 'django/django-plain.svg',
  java: 'java/java-original.svg',
  '.net': 'dotnetcore/dotnetcore-original.svg',
  'dotnet': 'dotnetcore/dotnetcore-original.svg',
  wordpress: 'wordpress/wordpress-original.svg',
  shopify: 'shopify/shopify-original.svg',
  webflow: 'webflow/webflow-original.svg',
  framer: 'framer/framer-original.svg',
  'font awesome': 'fontawesome/fontawesome-original.svg',
  flutter: 'flutter/flutter-original.svg',
  dart: 'dart/dart-original.svg',
  kotlin: 'kotlin/kotlin-original.svg',
  swift: 'swift/swift-original.svg',
  ruby: 'ruby/ruby-original.svg',
  rails: 'rails/rails-plain.svg',
  go: 'go/go-original.svg',
  golang: 'go/go-original.svg',
  rust: 'rust/rust-original.svg',
  mysql: 'mysql/mysql-original.svg',
  postgresql: 'postgresql/postgresql-original.svg',
  postgres: 'postgresql/postgresql-original.svg',
  firebase: 'firebase/firebase-plain.svg',
  supabase: 'supabase/supabase-original.svg',
  docker: 'docker/docker-original.svg',
  git: 'git/git-original.svg',
  github: 'github/github-original.svg',
  vercel: 'vercel/vercel-original.svg',
};

export function normalizeTechnologyName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getTechnologyIconUrl(value: string) {
  const path = technologyIconPaths[normalizeTechnologyName(value)];
  return path ? `${DEVICON_BASE}/${path}` : null;
}
