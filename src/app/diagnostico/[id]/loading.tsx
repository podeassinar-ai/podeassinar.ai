import { Topbar } from '@ui/components/layout/topbar';
import { MainContainer } from '@ui/components/layout/main-container';

export default function DiagnosisReportLoading() {
  return (
    <>
      <Topbar />
      <MainContainer title="Carregando Relatório..." subtitle="">
        <div className="animate-pulse space-y-8">
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainContainer>
    </>
  );
}
