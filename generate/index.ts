import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Handlebars.registerHelper('capitalize', (str) => {
  if (typeof str !== 'string' || !str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper('upper', (str) => {
  if (typeof str !== 'string' || !str) return str;
  return str.toUpperCase();
});

async function main() {
  console.log(chalk.blue.bold('\n🚀 Angular Module Generator\n'));

  const moduleName = await input({ 
    message: 'What is the name of the new module? (e.g. category, order)',
    validate: (value) => value.length > 0 ? true : 'Module name is required'
  });

  const nameLower = moduleName.toLowerCase();
  const nameCapitalized = nameLower.charAt(0).toUpperCase() + nameLower.slice(1);

  const context = {
    nameLower,
    nameCapitalized
  };

  const templatesDir = path.join(__dirname, 'templates');
  const targetDir = path.join(__dirname, '../src/app/features', nameLower);

  if (fs.existsSync(targetDir)) {
    console.log(chalk.red(`\n❌ Error: Module '${nameLower}' already exists.`));
    process.exit(1);
  }

  // Create directory structure
  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'components'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'constants'), { recursive: true });

  const templates = [
    { src: 'service.hbs', dest: `${nameLower}.service.ts` },
    { src: 'serviceSpec.hbs', dest: `${nameLower}.service.spec.ts` },
    { src: 'list.hbs', dest: `${nameLower}-list-page.component.ts` },
    { src: 'listSpec.hbs', dest: `${nameLower}-list-page.spec.ts` },
    { src: 'form.hbs', dest: `${nameLower}-form-page.component.ts` },
    { src: 'formSpec.hbs', dest: `${nameLower}-form-page.spec.ts` },
    { src: 'constants.hbs', dest: `constants/${nameLower}.constants.ts` },
    { src: 'filters.hbs', dest: `components/${nameLower}-filters.component.ts` },
    { src: 'filtersSpec.hbs', dest: `components/${nameLower}-filters.spec.ts` },
  ];

  for (const template of templates) {
    const templatePath = path.join(templatesDir, template.src);
    const content = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(content);
    const result = compiled(context);
    
    fs.writeFileSync(path.join(targetDir, template.dest), result);
    console.log(chalk.green(`✔️ Created ${template.dest}`));
  }

  console.log(chalk.blue.bold(`\n🎉 Module '${nameCapitalized}' generated successfully!`));
  console.log(chalk.yellow('\nNext steps:\n'));
  console.log(chalk.white(`1. Update columns in src/app/features/${nameLower}/${nameLower}-list-page.component.ts`));
  console.log(chalk.white(`2. Update form fields in src/app/features/${nameLower}/${nameLower}-form-page.component.ts`));
  console.log(chalk.white(`3. Add routes in src/app/app.routes.ts:\n`));
  console.log(chalk.white(`   { path: '${nameLower}s', component: ${nameCapitalized}ListPageComponent },`));
  console.log(chalk.white(`   { path: '${nameLower}s/new', component: ${nameCapitalized}FormPageComponent },`));
  console.log(chalk.white(`   { path: '${nameLower}s/update/:id', component: ${nameCapitalized}FormPageComponent },\n`));
}

main().catch(console.error);
