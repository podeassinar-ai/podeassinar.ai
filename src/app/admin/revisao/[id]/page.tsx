import { redirect } from 'next/navigation';
import { getDiagnosisDetails } from '@app/actions/admin-actions';
import ReviewControlRoom from '../components/review-client';

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getDiagnosisDetails(id);

    if (!data) {
        redirect('/admin/revisao');
    }

    return <ReviewControlRoom data={data} />;
}
