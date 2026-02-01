'use client';

import { useRouter } from 'next/navigation';
import { Modal } from '../common/modal';
import { transactionTypes } from '../../constants/transactions';

interface TransactionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionTypeModal({ isOpen, onClose }: TransactionTypeModalProps) {
  const router = useRouter();

  const handleSelect = (typeId: string) => {
    router.push(`/diagnostico?tipo=${typeId}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecione o Tipo de Due Diligence">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transactionTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className="group relative overflow-hidden bg-white border border-border rounded-xl p-6 hover:shadow-glow hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center text-left"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <type.icon />
            </div>
            <h3 className="font-bold text-text-primary text-sm mb-1 leading-tight">{type.title}</h3>
            <p className="text-xs text-text-muted font-mono">{type.subtitle}</p>
            
            {/* Tech decoration */}
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-green-400 transition-colors"></div>
          </button>
        ))}
      </div>
    </Modal>
  );
}