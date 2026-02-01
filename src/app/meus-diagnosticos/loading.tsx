import { MainContainer } from '@ui/components/layout/main-container';

export default function Loading() {
  return (
    <MainContainer
      title="Minhas Análises"
      subtitle="Carregando histórico..."
    >
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse"
          >
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="h-7 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
            </div>
            
            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right hidden sm:block">
                <div className="h-3 w-10 bg-gray-200 rounded mb-1 ml-auto" />
                <div className="h-6 w-20 bg-gray-200 rounded ml-auto" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-32 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainContainer>
  );
}
