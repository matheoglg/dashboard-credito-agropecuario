// Módulo central de Firebase: inicializa la app y exporta la conexión a Realtime Database.
// Los valores se copian de la consola de Firebase: Configuración del proyecto > General > Tus apps.
// No son contraseñas: identifican el proyecto. Lo que protege los datos son las reglas de la base.
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyBtEj04SHcW7ei0F1WapYlg1lDaUBVuENU',
  authDomain: 'dashboard-credito-agropecuario.firebaseapp.com',
  // Importante: sin databaseURL la app no encuentra la base de datos.
  databaseURL: 'https://dashboard-credito-agropecuario-default-rtdb.firebaseio.com/',
  projectId: 'dashboard-credito-agropecuario',
  storageBucket: 'dashboard-credito-agropecuario.firebasestorage.app',
  messagingSenderId: '1083761789538',
  appId: '1:1083761789538:web:c4f8a1b376209ee083df3b',
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
