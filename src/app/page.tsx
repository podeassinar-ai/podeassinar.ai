import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSlugFromId } from '@/ui/constants/transactions';

import { HeroSection } from '@ui/components/home/HeroSection';
import { ServicesGrid } from '@ui/components/home/ServicesGrid';
import { PillarsSection } from '@ui/components/home/PillarsSection';
import { CertificateSolverSection } from '@ui/components/home/CertificateSolverSection';
import { FinalCTA } from '@ui/components/home/FinalCTA';

export default async function HomePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  const getDiagnosticoHref = (id?: string) => {
    let slug = '';
    if (id) {
      slug = getSlugFromId(id);
    }
    const base = slug ? `/diagnostico?tipo=${slug}` : '/diagnostico';
    return isAuthenticated ? base : `/login?redirect_to=${encodeURIComponent(base)}`;
  };

  return (
    <>
      <Topbar />
      <MainContainer>
        <HeroSection getDiagnosticoHref={getDiagnosticoHref} />
        <ServicesGrid getDiagnosticoHref={getDiagnosticoHref} />
        <PillarsSection />
        <CertificateSolverSection getDiagnosticoHref={getDiagnosticoHref} />
        <FinalCTA getDiagnosticoHref={getDiagnosticoHref} />
      </MainContainer>
    </>
  );
}