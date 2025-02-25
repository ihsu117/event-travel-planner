export const checkAuth = () => {
    return document.cookie.includes('jwt');
}