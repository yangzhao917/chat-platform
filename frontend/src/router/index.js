import { createRouter, createWebHistory } from 'vue-router';
import ChatLayout from '@/views/ChatLayout.vue';
import ChatPage from '@/views/ChatPage.vue';
const routes = [
    {
        path: '/',
        component: ChatLayout,
        children: [
            {
                path: '',
                name: 'chat',
                component: ChatPage,
            },
        ],
    },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});
export default router;
