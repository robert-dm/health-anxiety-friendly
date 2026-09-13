export async function runBatch(db, statements) {
  if (db.batchStatements) return db.batchStatements(statements);
  // Native SQLite transaction has no awaits, so requests cannot interleave.
  db.exec('begin');
  try {
    const results = statements.map(({sql,params=[]}) => db.prepare(sql).run(...params));
    db.exec('commit');
    return results;
  } catch (error) { db.exec('rollback'); throw error; }
}
