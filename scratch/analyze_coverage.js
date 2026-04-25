import fs from 'fs';
const coverage = JSON.parse(fs.readFileSync('./coverage/frontend-angular/coverage-final.json', 'utf8'));

const results = [];
for (const file in coverage) {
  const data = coverage[file];
  const totalStmts = Object.keys(data.s).length;
  const coveredStmts = Object.values(data.s).filter(v => v > 0).length;
  const totalBranches = Object.keys(data.b).length;
  const coveredBranches = Object.values(data.b).flat().filter(v => v > 0).length;
  
  if (coveredStmts < totalStmts || coveredBranches < totalBranches) {
    const uncoveredLines = [];
    for (const line in data.statementMap) {
      if (data.s[line] === 0) {
        uncoveredLines.push(data.statementMap[line].start.line);
      }
    }
    results.push({
      file: file.split('/').pop(),
      stmts: `${coveredStmts}/${totalStmts}`,
      uncovered: uncoveredLines.join(', ')
    });
  }
}

console.table(results);
