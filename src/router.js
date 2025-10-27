import { createRouter, createWebHashHistory } from "vue-router";

import Dashboard from "@/views/dashboard.vue";
import Note from "@/views/note.vue";
import NoteEdit from "@/views/note-edit.vue";
import Backup from "@/views/backup.vue";
import Stats from "@/views/stats.vue";
import p2p from "@/views/p2p.vue";
import S3 from "@/views/s3.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
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
      path: "/p2p",
      name: "p2p",
      component: p2p,
    },
    {
      path: "/S3",
      name: "S3",
      component: S3,
    },
  ],
});

export default router;
