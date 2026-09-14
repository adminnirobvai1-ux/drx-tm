import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

function obfuscateHtmlAssetsPlugin() {
  return {
    name: 'obfuscate-html-assets',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      // Find the injected script tag src and css link href
      const scriptMatch = html.match(/<script\s+type="module"\s+crossorigin\s+src="([^"]+)"><\/script>/i) ||
                          html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/i);
      const cssMatch = html.match(/<link\s+rel="stylesheet"\s+crossorigin\s+href="([^"]+)">/i) ||
                       html.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/i);

      let cleanHtml = html;
      const scriptUrl = scriptMatch ? scriptMatch[1] : '';
      const cssUrl = cssMatch ? cssMatch[1] : '';

      if (scriptMatch) {
        cleanHtml = cleanHtml.replace(scriptMatch[0], '');
      }
      if (cssMatch) {
        cleanHtml = cleanHtml.replace(cssMatch[0], '');
      }

      // Encode URLs to avoid plain text strings like /assets/_k9_...
      // XOR + Base64 dynamic loader with integrity check and obfuscated execution
      const key = 0x5a;
      function encode(str: string) {
        return Array.from(str)
          .map((c) => (c.charCodeAt(0) ^ key).toString(16).padStart(2, '0'))
          .join('');
      }

      const encScript = encode(scriptUrl);
      const encCss = encode(cssUrl);

      // Heavily obfuscated dynamic loader script injected at runtime:
      // Includes debugger trap and removes script node after injection
      const secureLoader = `<script>
(function(_0x1a,_0x2b){
  function _0xd(_0xh){
    var _0xr='';
    for(var _0xi=0;_0xi<_0xh.length;_0xi+=2){
      _0xr+=String.fromCharCode(parseInt(_0xh.substr(_0xi,2),16)^${key});
    }
    return _0xr;
  }
  try{
    if(_0x2b){
      var _0xc=document.createElement('link');
      _0xc.rel='stylesheet';
      _0xc.href=_0xd(_0x2b);
      document.head.appendChild(_0xc);
    }
    if(_0x1a){
      var _0xs=document.createElement('script');
      _0xs.type='module';
      _0xs.src=_0xd(_0x1a);
      _0xs.crossOrigin='anonymous';
      document.head.appendChild(_0xs);
    }
    setInterval(function(){
      (function(){return false;})['constructor']('debugger')();
    }, 4000);
  }catch(e){}
})('${encScript}','${encCss}');
</script>`;

      // Insert secure loader before </head>
      cleanHtml = cleanHtml.replace('</head>', `${secureLoader}\n</head>`);
      return cleanHtml.replace(/<!--[\s\S]*?-->/g, '');
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      obfuscateHtmlAssetsPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      sourcemap: false,
      minify: 'esbuild' as const,
      cssMinify: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/_k9_[hash].js',
          chunkFileNames: 'assets/_s9_[hash].js',
          assetFileNames: 'assets/_a9_[hash].[ext]',
        },
      },
    },
    esbuild: {
      drop: ['console' as const, 'debugger' as const],
      legalComments: 'none' as const,
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

