// Supabase Client Configuration
// AI Travel Planner - Supabase 연결 설정

const SUPABASE_URL = 'https://cpnughcwgtzyvvquaaoe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbnVnaGN3Z3R6eXZ2cXVhYW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDY5ODUsImV4cCI6MjA4Mzg4Mjk4NX0.N7IhdAUy1fjZS7X_s8paMXUUPNyMp6_dHLrcaMirCoM';

// Supabase 클라이언트 생성 (전역 변수로 노출)
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client initialized');
