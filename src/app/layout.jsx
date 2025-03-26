// src/app/layout.jsx
import '@/styles/animations.css';
import '@/styles/accessibility.css';
import AccessibleLayout from '@/components/layout/AccessibleLayout';

export const metadata = {
    title: 'Portal do Cliente',
    description: 'Portal para clientes acessarem serviços e informações',
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#4a90e2" />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body>
                <AccessibleLayout>
                    {children}
                </AccessibleLayout>
            </body>
        </html>
    );
}