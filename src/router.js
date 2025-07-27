import { createRouter, createWebHashHistory } from "vue-router";

import Dashboard from "@/views/dashboard.vue";
import Backup from "@/views/backup.vue";
import Import from "@/views/import.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/dashboard"
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,
    },
    {
      path: "/backup",
      name: "backup",
      component: Backup,
    },
    {
      path: "/import",
      name: "import",
      component: Import,
    },
  ],
});

export default router;
