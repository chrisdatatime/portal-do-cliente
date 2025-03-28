// Verificar se estamos no navegador
const isBrowser = typeof window !== 'undefined';

// Função segura para obter item do localStorage
export const getStorageItem = (key: string): string | null => {
    if (!isBrowser) return null;
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`Erro ao ler do localStorage (${key}):`, error);
        return null;
    }
};

// Função segura para definir item no localStorage
export const setStorageItem = (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`Erro ao escrever no localStorage (${key}):`, error);
    }
};

// Função segura para remover item do localStorage
export const removeStorageItem = (key: string): void => {
    if (!isBrowser) return;
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Erro ao remover do localStorage (${key}):`, error);
    }
};

// Função segura para limpar todo o localStorage
export const clearStorage = (): void => {
    if (!isBrowser) return;
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Erro ao limpar localStorage:', error);
    }
};

// Função para verificar se o localStorage está disponível
export const isStorageAvailable = (): boolean => {
    if (!isBrowser) return false;
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
}; 