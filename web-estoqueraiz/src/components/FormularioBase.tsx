import { type ReactNode, type FormEvent } from 'react';

interface FormularioBaseProps {
  onSubmit: (e: FormEvent) => void;
  processando?: boolean;
  testId?: string;
  textoBotaoSubmit?: string;
  children: ReactNode; 
}

export const FormularioBase = ({
  onSubmit,
  processando = false,
  testId = 'formulario-base',
  textoBotaoSubmit = 'Salvar',
  children
}: FormularioBaseProps) => {
  

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!processando) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 p-6" data-testid={testId}>
      
      {children}

      <div className="mt-6 border-t border-raiz-borda pt-4">
        <button
          type="submit"
          disabled={processando}
          data-testid={`${testId}-submit`}
          className="er-primary-button w-full py-3"
        >
          {processando ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processando...
            </>
          ) : (
            textoBotaoSubmit
          )}
        </button>
      </div>
    </form>
  );
};
