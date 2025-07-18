import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

// Obtener rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

console.log('📁 Directorio actual:', __dirname);
console.log('📄 Buscando .env en:', envPath);
console.log('📋 ¿Existe el archivo?', existsSync(envPath));

if (existsSync(envPath)) {
  console.log('📝 Contenido del archivo:');
  console.log(readFileSync(envPath, 'utf8'));
  
  console.log('\n🔧 Cargando con dotenv...');
  const result = dotenv.config({ path: envPath });
  console.log('📊 Resultado:', result);
  
  console.log('\n🌐 Variables de entorno:');
  console.log('HOLDED_API_KEY:', process.env.HOLDED_API_KEY);
  console.log('PORT:', process.env.PORT);
} else {
  // Intentar desde diferentes ubicaciones
  const altPaths = [
    join(__dirname, '..', '.env'),
    join(process.cwd(), '.env'),
    '.env'
  ];
  
  console.log('\n🔍 Buscando en ubicaciones alternativas:');
  for (const path of altPaths) {
    console.log(`   ${path}: ${existsSync(path) ? '✅' : '❌'}`);
    if (existsSync(path)) {
      console.log('📝 Contenido encontrado en:', path);
      console.log(readFileSync(path, 'utf8'));
      break;
    }
  }
}
