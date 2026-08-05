import { defineConfig } from 'vite';

export default defineConfig({
  // 🚀 เพิ่มบรรทัดนี้: ต้องตรงกับชื่อ Repository บน GitLab ของคุณ (มี Slash ปิดหน้าหลัง)
  base: '/pattaya-3d-map/', 

  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});