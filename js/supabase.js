// js/supabase.js
// CONFIGURA AQUÍ tus credenciales de Supabase
// (mantené los valores reales que ya tenías, esto es solo el patrón corregido)

const SUPABASE_URL = 'https://buzfejftzijslpybtlkz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GIzn1-tK4WEy0g3bXBWZdA_6UsGZXaD';

// ⚠️ CLAVE DEL FIX: el cliente se llama "db", NO "supabase".
// Si lo llamás "supabase" pisa al namespace de la librería (window.supabase)
// y cualquier supabase.from(...) posterior deja de existir → "not a function".
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
