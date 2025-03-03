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
      component: HomeView, // Home route
    },
    {
      path: "/bookmark",
      name: "bookmark",
      component: BookMark, // Bookmark route
    },
    {
      path: "/password",
      name: "password",
      component: PassWord, // Password route
    },
    {
      path: "/note",
      name: "note",
      component: Note, // Note route
    },
    {
      path: "/backup",
      name: "backup",
      component: Backup, // Backup route
    },
    {
      path: "/import",
      name: "import",
      component: Import, // Import route
    },
    {
      path: "/sync",
      name: "sync",
      component: Sync, // Sync route
    },
  ],
});

export default router;
