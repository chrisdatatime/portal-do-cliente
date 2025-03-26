import { useRouter } from 'next/router';

const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = () => {
        // Remover o token ou limpar sessão
        localStorage.removeItem('token'); // ou sessionStorage.removeItem('token')
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Redirecionar para a página de login
        router.push('/login');
    };

    return <button onClick={handleLogout}>Sair</button>;
};

export default LogoutButton;
