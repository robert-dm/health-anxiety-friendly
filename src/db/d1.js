export function d1Database(binding) {
  function prepare(sql, args) {
    let params = args;
    if (args.length === 1 && args[0] !== null && typeof args[0] === 'object') {
      const values = args[0];
      params = [];
      sql = sql.replace(/'(?:''|[^'])*'|"(?:""|[^"])*"|[:$]([a-zA-Z_]\w*)/g, (match, key) => {
        if (!key) return match;
        if (!Object.hasOwn(values, key)) throw new Error(`Missing SQL parameter ${key}`);
        params.push(values[key]);
        return '?';
      });
    }
    return binding.prepare(sql).bind(...params);
  }
  return {
    prepare(sql) {
      return {
        get: (...args) => prepare(sql, args).first(),
        all: async (...args) => (await prepare(sql,args).all()).results,
        run: async (...args) => { const result = await prepare(sql,args).run(); return {changes:result.meta.changes}; },
      };
    },
    batchStatements: async statements => binding.batch(statements.map(({sql,params=[]})=>prepare(sql,params))),
  };
}
