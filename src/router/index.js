import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/index.vue";
import BookMark from "../views/bookmark.vue";
import PassWord from "../views/password.vue";
import Note from "../views/note.vue";
import Backup from "../views/backup.vue";
import Import from "../views/import.vue";
import Sync from "../views/sync.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/bookmark",
      name: "bookmark",
      component: BookMark,
    },
    {
      path: "/password",
      name: "password",
      component: PassWord,
    },
    {
      path: "/note",
      name: "note",
      component: Note,
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
