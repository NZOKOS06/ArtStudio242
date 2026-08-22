#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🚀 Art Studio 242 - Démarrage du mode développement\n');

// Vérifier Redis
function checkRedis() {
  return new Promise((resolve) => {
    exec('redis-cli ping', (error, stdout) => {
      if (error) {
        console.log('⚠️  Redis n\'est pas démarré');
        console.log('💡 Exécutez: scripts/install-redis-windows.ps1 (Windows)');
        console.log('💡 Ou: brew install redis && redis-server (macOS)');
        console.log('💡 Ou: sudo apt install redis-server (Linux)\n');
        resolve(false);
      } else if (stdout.trim() === 'PONG') {
        console.log('✅ Redis connecté');
        resolve(true);
      } else {
        console.log('❌ Redis ne répond pas correctement');
        resolve(false);
      }
    });
  });
}

// Démarrer un processus
function startProcess(name, command, args, cwd) {
  const process = spawn(command, args, {
    cwd: cwd || __dirname,
    stdio: 'pipe',
    shell: true
  });

  console.log(`🔄 Démarrage ${name}...`);

  process.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`[${name}] ${line}`);
    });
  });

  process.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`[${name}] ⚠️  ${line}`);
    });
  });

  process.on('close', (code) => {
    console.log(`[${name}] 🛑 Processus terminé (code: ${code})`);
  });

  return process;
}

async function main() {
  // Vérifier Redis
  const redisOk = await checkRedis();
  
  if (!redisOk) {
    console.log('⚠️  L\'application démarrera sans cache Redis');
    console.log('   Les performances peuvent être réduites\n');
  }

  const rootDir = path.join(__dirname, '..');

  // Démarrer l'API
  const apiProcess = startProcess(
    'API',
    'npm',
    ['run', 'dev'],
    path.join(rootDir, 'backend')
  );

  // Attendre un peu avant de démarrer le web
  setTimeout(() => {
    // Démarrer l'application web
    const webProcess = startProcess(
      'WEB',
      'npm',
      ['run', 'dev'],
      path.join(rootDir, 'web')
    );

    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\n🛑 Arrêt des services...');
      
      apiProcess.kill('SIGTERM');
      webProcess.kill('SIGTERM');
      
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    });

    process.on('SIGTERM', () => {
      apiProcess.kill('SIGTERM');
      webProcess.kill('SIGTERM');
      process.exit(0);
    });

  }, 2000);

  console.log('\n💡 Appuyez sur Ctrl+C pour arrêter les services');
  console.log('🌐 Application web: http://localhost:3000');
  console.log('🔧 API: http://localhost:4000');
  
  if (redisOk) {
    console.log('💾 Redis: localhost:6379');
  }
}

main().catch(console.error);