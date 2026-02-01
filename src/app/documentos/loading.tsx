import { MainContainer } from '@ui/components/layout/main-container';

export default function Loading() {
  return (
    <MainContainer
      title="Documentos"
      subtitle="Carregando documentos..."
    >
      <div className="bg-white rounded border border-gray-200 overflow-hidden animate-pulse">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
             <div className="h-4 w-1/4 bg-gray-200 rounded" />
        </div>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-10 w-10 bg-gray-200 rounded" />
                <div className="space-y-2 flex-1 max-w-xs">
                   <div className="h-4 w-3/4 bg-gray-200 rounded" />
                   <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="hidden sm:block w-32">
                 <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
              <div className="hidden sm:block w-24">
                 <div className="h-5 w-16 bg-gray-200 rounded-full" />
              </div>
              <div className="hidden sm:block w-24">
                 <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
              <div className="w-20 text-right">
                 <div className="h-4 w-12 bg-gray-200 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainContainer>
  );
}
