import { useUserStore } from '../../stores/userStore'
import { useEventStore } from '../../stores/eventStore';

export const checkAuth = () => {
    const isAuthenticated = document.cookie.includes('jwt');
    if (!isAuthenticated) {
        const userStore = useUserStore();
        const eventStore = useEventStore();
        userStore.clearUser();
        eventStore.clearEvents();

    }
    return isAuthenticated;
}