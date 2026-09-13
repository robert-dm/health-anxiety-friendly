import { route } from './app.js';
import { withDatabase } from './db/connection.js';
import { d1Database } from './db/d1.js';
import { EventEmitter } from 'node:events';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/styles/') || url.pathname.startsWith('/scripts/') || url.pathname === '/favicon.svg') {
      return env.ASSETS.fetch(request);
    }
    if (!env.DB) return new Response('El directorio no está disponible por el momento.', {status:503});
    try {
      const bridge = new EventEmitter();
      Object.assign(bridge, {
        url: url.pathname + url.search,
        method: request.method,
        headers: Object.fromEntries(request.headers),
        socket: {encrypted:url.protocol === 'https:'},
        publicOrigin: url.origin,
        verifiedOwnerEmail: env.ADMIN_EMAIL && request.headers.get('oai-authenticated-user-id') && request.headers.get('oai-authenticated-user-email')?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase() ? env.ADMIN_EMAIL.toLowerCase() : null,
        bodyReader: async () => {
          if (Number(request.headers.get('content-length')) > 100000) throw new Error('Body too large');
          const reader = request.body?.getReader();
          if (!reader) return '';
          let size = 0;
          const decoder = new TextDecoder(), parts = [];
          for (;;) {
            const {done,value} = await reader.read();
            if (done) break;
            size += value.length;
            if (size > 100000) { await reader.cancel(); throw new Error('Body too large'); }
            parts.push(decoder.decode(value,{stream:true}));
          }
          parts.push(decoder.decode());
          return parts.join('');
        },
      });
      // The URL's actual origin is authoritative; forwarded host headers are ignored.
      bridge.headers.host = url.host;
      const output = { status:200, headers:{}, body:'', writeHead(status,headers={}) {this.status=status;this.headers=headers;}, end(body='') {this.body=body;} };
      await withDatabase(d1Database(env.DB), () => route(bridge,output));
      if (output.headers['set-cookie']) {
        const cookie = output.headers['set-cookie'];
        if (!cookie.includes('; Secure')) output.headers['set-cookie'] = cookie + '; Secure';
      }
      return new Response(output.body || null,{status:output.status,headers:output.headers});
    } catch (error) {
      console.error('Directory request failed',error.message);
      const status = error.message === 'Body too large' ? 413 : 503;
      return new Response(status === 413 ? 'El formulario supera el tamaño permitido.' : 'No pudimos completar la solicitud. Volvé a la página anterior para conservar lo que escribiste e intentá nuevamente.', {status,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}});
    }
  }
};
