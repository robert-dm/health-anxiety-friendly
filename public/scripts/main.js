document.documentElement.classList.add("js");

// Expose the existing directory search to browsers with WebMCP support.
if (document.modelContext?.registerTool) {
  const controller = new AbortController();
  Promise.resolve(document.modelContext.registerTool({
    name: 'navigate_directory_search',
    title: 'Buscar profesionales y centros',
    description: 'Abre la búsqueda del directorio con una especialidad y zona; no crea registros.',
    inputSchema: {type:'object',properties:{query:{type:'string',maxLength:120},location:{type:'string',maxLength:100}},additionalProperties:false},
    annotations: {readOnlyHint:false,untrustedContentHint:false},
    execute(input) {
      if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => !['query','location'].includes(key)) || (input.query !== undefined && (typeof input.query !== 'string' || input.query.length > 120)) || (input.location !== undefined && (typeof input.location !== 'string' || input.location.length > 100))) throw new Error('Búsqueda inválida');
      const params = new URLSearchParams({q:input.query || '',where:input.location || ''});
      window.location.assign('/buscar?' + params.toString());
      return {navigationStarted:true};
    }
  },{signal:controller.signal})).catch(() => {});
  window.addEventListener('pagehide',()=>controller.abort(),{once:true});
}
