'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import TicketDetail from '@/components/TicketDetail';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleBack = () => {
        router.push('/central-de-servicos?tab=support');
    };

    return (
        <DashboardLayout>
            <div className="page-container">
                <TicketDetail
                    ticketId={params.id}
                    onBack={handleBack}
                />
            </div>
        </DashboardLayout>
    );
} 