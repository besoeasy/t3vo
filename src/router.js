import { createRouter, createWebHashHistory } from "vue-router";

import Dashboard from "@/views/dashboard.vue";
import Note from "@/views/note.vue";
import NoteEdit from "@/views/note-edit.vue";
import Backup from "@/views/backup.vue";
import Stats from "@/views/stats.vue";
import Sync from "@/views/sync.vue";

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
      path: "/notes/:id",
      name: "note",
      component: Note,
    },
    {
      path: "/notes/:id/edit",
      name: "note-edit",
      component: NoteEdit,
    },
    {
      path: "/backup",
      name: "backup",
      component: Backup,
    },
    {
      path: "/stats",
      name: "stats",
      component: Stats,
    },
    {
      path: "/sync",
      name: "sync",
      component: Sync,
    },
  ],
});

export default router;
