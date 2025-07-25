import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from "@/views/index.vue";
import Dashboard from "@/views/dashboard.vue";
import Backup from "@/views/backup.vue";
import Import from "@/views/import.vue";
import Sync from "@/views/sync.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
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
    {
      path: "/sync",
      name: "sync",
      component: Sync,
    },
  ],
});

export default router;
