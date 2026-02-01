export const formatCurrency = (value: string | number): string => {
  let val = String(value).replace(/\D/g, '');
  
  if (!val) return '';
  
  const numberValue = parseInt(val, 10) / 100;
  
  return numberValue.toLocaleString('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatNumber = (value: string | number): string => {
  return String(value).replace(/\D/g, '');
};

export const applyMask = (value: string, maskType: 'currency' | 'number'): string => {
  if (maskType === 'currency') return formatCurrency(value);
  if (maskType === 'number') return formatNumber(value);
  return value;
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  return Number(value.replace(/\./g, '').replace(',', '.'));
};
