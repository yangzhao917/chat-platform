import { createRouter, createWebHistory } from 'vue-router';
import ChatPage from '@/views/ChatPage.vue';
const routes = [
    {
        path: '/',
        name: 'chat',
        component: ChatPage,
    },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});
export default router;
