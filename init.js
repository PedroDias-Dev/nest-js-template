/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const inquirer = require('inquirer');
const ora = require('ora');
const lodash = require('lodash');
const rimraf = require('rimraf');
const childProcess = require('child_process');

async function init() {
  await awaitWarning();
  await checkYarn();

  const params = await askParams();

  let promise = cleanup(params);
  ora.promise(promise, 'Renomeando projeto...');
  await promise;

  if (params.delete) {
    promise = removePackages(params);
    ora.promise(promise, 'Limpando dependencias...');
    await promise;

    promise = selfDestruction(params);
    ora.promise(promise, 'Auto destruição...');
    await promise;
  }

  promise = resetGit(params);
  ora.promise(promise, 'Resetando Git...');
  await promise;
}

async function awaitWarning() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('\nPROJECT GENERATOR\n');
      resolve();
    });
  });
}

async function checkYarn() {
  await execCommand('yarn -v').catch(() => {
    throw new Error('Yarn is required');
  });
}

async function askParams(answers = {}) {
  const params = await inquirer.prompt([
    {
      name: 'project',
      default: answers.project,
      message: 'Nome do projeto',
      validate: i => (i.length >= 3 ? true : 'Pelo menos 3 letras')
    },
    {
      name: 'repository',
      default: answers.repository,
      message: 'Repositorio'
    },
    {
      name: 'delete',
      type: 'confirm',
      message: 'Remover arquivos e dependencias de inicialização?'
    },
    {
      name: 'confirmed',
      type: 'confirm',
      message: 'Confirma as configurações?'
    }
  ]);

  if (!params.confirmed) {
    console.log('---- Responda novamente:');
    return askParams(params);
  }

  return {
    ...params,
    slug: lodash.kebabCase(params.project.endsWith('-api') ? params.project : `${params.project}-api`).toLowerCase()
  };
}

async function cleanup(params) {
  await replaceContent('./package.json', [
    {
      from: 'kinja-base',
      to: params.slug
    },
    {
      from: /kinja\/api-base/gi,
      to: `kinja/${params.slug}`
    },
    {
      from: 'kinja-repository',
      to: params.repository
    }
  ]);

  await replaceContent('./docker-compose.yml', [
    {
      from: 'kinja-api',
      to: params.slug
    },
    {
      from: 'kinja-database',
      to: params.slug.replace('-api', '-database')
    },
    {
      from: 'POSTGRES_DB=kinja',
      to: `POSTGRES_DB=${lodash.camelCase(params.slug.replace('-api', ''))}`
    },
    {
      from: 'DATABASE_DB=kinja',
      to: `DATABASE_DB=${lodash.camelCase(params.slug.replace('-api', ''))}`
    }
  ]);

  await replaceContent('./src/index.ts', [
    {
      from: 'Kinja API',
      to: params.project
    }
  ]);

  fs.copyFileSync('./.env.example', './.env');
}

async function replaceContent(file, replacers) {
  let content = await new Promise((resolve, reject) =>
    fs.readFile(file, 'utf8', (err, data) => (err ? reject(err) : resolve(data)))
  );

  for (let replacer of replacers) {
    content = content.replace(replacer.from, replacer.to);
  }

  await new Promise((resolve, reject) =>
    fs.writeFile(file, content, (err, data) => (err ? reject(err) : resolve(data)))
  );
}

async function removePackages() {
  await execCommand('yarn remove inquirer ora rimraf');
}

async function resetGit(params) {
  if (params.repository) {
    const originalRepo = await execCommand('git remote get-url origin');
    await execCommand('git remote remove origin');
    await execCommand(`git remote add seed ${originalRepo}`);
    await execCommand(`git remote add origin ${params.repository}`);
  }

  await execCommand('git add . && git commit -am "Initial Setup" --no-verify');

  await execCommand('git branch development');

  await execCommand('git branch homolog');
}

async function selfDestruction() {
  await new Promise((resolve, reject) => rimraf('./init.js', err => (err ? reject(err) : resolve())));
}

async function execCommand(command) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (err, std) => (err ? reject(err) : resolve(std)));
  });
}

init()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
