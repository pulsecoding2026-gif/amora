import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Save, Loader2, ShieldCheck, Lock, Info, ServerCog, Truck, PackageSearch, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PROJECT_ID = "a8b20a27-a24e-4999-a50a-1c4273c858bc";

interface ShippingOption {
  id: string | number;
  name: string;
  price: number;
  deliveryTime: number;
  company?: string;
}

export default function ShippingSettings() {
  const [originPostalCode, setOriginPostalCode] = useState('');
  const [environmentPreview, setEnvironmentPreview] = useState<'sandbox' | 'production'>('sandbox');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [cepError, setCepError] = useState('');

  // Teste real da edge function shipping-calculate
  const [testPostalCode, setTestPostalCode] = useState('');
  const [testCepError, setTestCepError] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [quoteOptions, setQuoteOptions] = useState<ShippingOption[] | null>(null);

  const sampleItems = [
    { price: 249.9, quantity: 1 },
    { price: 75.0, quantity: 2 },
  ];

  useEffect(() => {
    const stored = localStorage.getItem('amora_origin_postal_code');
    if (stored) {
      setOriginPostalCode(stored);
    }
    const storedEnv = localStorage.getItem('amora_env_preview');
    if (storedEnv === 'sandbox' || storedEnv === 'production') {
      setEnvironmentPreview(storedEnv);
    }
  }, []);

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOriginPostalCode(formatCep(e.target.value));
  };

  const handleCepBlur = () => {
    const digits = originPostalCode.replace(/\D/g, '');
    if (!digits) {
      setCepError('Informe o CEP de origem da loja.');
    } else if (digits.length !== 8) {
      setCepError('O CEP deve conter 8 dígitos (ex.: 01001-000).');
    } else {
      setCepError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = originPostalCode.replace(/\D/g, '');

    if (digits.length !== 8) {
      setCepError('O CEP deve conter 8 dígitos (ex.: 01001-000).');
      setFeedback({ message: 'Corrija o CEP de origem antes de salvar.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setFeedback({ message: '', type: '' });

    try {
      localStorage.setItem('amora_origin_postal_code', originPostalCode);
      setFeedback({ message: 'CEP de origem salvo para referência do painel.', type: 'success' });
    } catch (error) {
      setFeedback({ message: 'Erro ao salvar o CEP de origem.', type: 'error' });
      console.error('Failed to save origin postal code to localStorage', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestPostalCode(formatCep(e.target.value));
    setTestCepError('');
  };

  const handleTestCepBlur = () => {
    const digits = testPostalCode.replace(/\D/g, '');
    if (digits && digits.length !== 8) {
      setTestCepError('O CEP deve conter 8 dígitos (ex.: 04538-133).');
    } else {
      setTestCepError('');
    }
  };

  const runShippingTest = async () => {
    const digits = testPostalCode.replace(/\D/g, '');
    if (digits.length !== 8) {
      setTestCepError('Informe um CEP de destino válido com 8 dígitos.');
      return;
    }

    setQuoteLoading(true);
    setQuoteError('');
    setQuoteOptions(null);

    try {
      const response = await fetch('https://pulse-hub-ia.vercel.app/api/app/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: PROJECT_ID,
          action: 'invoke',
          name: 'shipping-calculate',
          payload: {
            toPostalCode: digits,
            items: sampleItems,
          },
        }),
      });

      const json = await response.json();

      if (!response.ok || json.error) {
        throw new Error(json.error || 'Não foi possível calcular o frete agora.');
      }

      const result = json.result || {};
      const options: ShippingOption[] = Array.isArray(result.options) ? result.options : [];

      if (options.length === 0) {
        setQuoteOptions([]);
      } else {
        setQuoteOptions(options);
      }
    } catch (error: any) {
      console.error('Shipping test failed');
      setQuoteError(error?.message || 'Erro ao consultar a edge function shipping-calculate. Verifique a secret MELHORENVIO_TOKEN.');
    } finally {
      setQuoteLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="bg-zinc-950/90 min-h-dvh text-zinc-100 lg:ml-64 pt-16 lg:pt-0">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <nav className="text-xs text-zinc-400 mb-4">
          <span>Admin</span> <span className="mx-1">/</span> <span className="text-fuchsia-400">Frete</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Configurações de Frete</h1>
        <p className="text-sm text-zinc-400 mb-8 max-w-2xl leading-relaxed">
          O cálculo de frete via Melhor Envio agora acontece de forma segura no servidor, através de uma edge function dedicada. Nenhuma credencial fica exposta no navegador.
        </p>

        <div className="bg-zinc-900 border border-fuchsia-500/20 rounded-xl p-6 mb-8 flex gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-fuchsia-500/15 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-fuchsia-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-100 mb-1">Integração real e protegida</h2>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-[65ch]">
              O token de acesso do Melhor Envio é guardado como secret do projeto
              (<code className="px-1.5 py-0.5 rounded bg-zinc-800 text-fuchsia-300 font-mono text-xs">MELHORENVIO_TOKEN</code>)
              e usado apenas dentro da edge function <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-fuchsia-300 font-mono text-xs">shipping-calculate</code>,
              que monta a cotação e devolve somente as opções de frete (transportadora, prazo e preço) para o checkout. O front-end nunca tem acesso à chave.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-8 rounded-xl shadow-lg">
          <div>
            <label htmlFor="originPostalCode" className="block text-sm font-medium text-zinc-200 mb-1">
              CEP de origem da loja
            </label>
            <input
              id="originPostalCode"
              name="originPostalCode"
              type="text"
              inputMode="numeric"
              placeholder="01001-000"
              maxLength={9}
              value={originPostalCode}
              onChange={handleCepChange}
              onBlur={handleCepBlur}
              className={`block w-full rounded-md border-0 bg-zinc-800 py-2 px-3 text-zinc-100 shadow-sm ring-1 ring-inset ${cepError ? 'ring-red-500' : 'ring-zinc-700'} focus:ring-2 focus:ring-inset focus:ring-fuchsia-500 sm:text-sm`}
            />
            {cepError ? (
              <p className="mt-1 text-xs text-red-400">{cepError}</p>
            ) : (
              <p className="mt-1 text-xs text-zinc-500">
                Usado apenas como referência neste painel. O endereço de despacho efetivo é fixado na configuração da edge function.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="environmentPreview" className="block text-sm font-medium text-zinc-200 mb-1 flex items-center gap-2">
              Ambiente do Melhor Envio
              <span className="inline-flex items-center gap-1 text-[11px] font-normal text-zinc-500 uppercase tracking-wide">
                <Info className="h-3 w-3" /> apenas informativo
              </span>
            </label>
            <select
              id="environmentPreview"
              name="environmentPreview"
              value={environmentPreview}
              disabled
              onChange={() => {}}
              aria-disabled="true"
              className="block w-full rounded-md border-0 bg-zinc-800/60 py-2 px-3 text-zinc-400 shadow-sm ring-1 ring-inset ring-zinc-700 cursor-not-allowed sm:text-sm"
            >
              <option value="sandbox">Sandbox (Testes)</option>
              <option value="production">Produção</option>
            </select>
            <p className="mt-2 flex items-start gap-2 text-xs text-zinc-500 leading-relaxed">
              <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-zinc-500" />
              A troca real de ambiente é feita pela secret <code className="px-1 py-0.5 rounded bg-zinc-800 text-fuchsia-300 font-mono text-[11px]">MELHORENVIO_ENV</code>
              {' '}(sandbox ou production), junto com o token de acesso — não é possível alterar por aqui.
            </p>
          </div>

          {feedback.message && (
            <div className={`flex items-center gap-2 p-3 rounded-md ${feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <p className="text-sm">{feedback.message}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-fuchsia-600 text-white rounded-md px-4 py-2 text-sm font-semibold shadow-sm hover:bg-fuchsia-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-600 transition-colors active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isLoading ? 'Salvando...' : 'Salvar CEP de referência'}
          </Button>
        </form>

        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-fuchsia-500/15 flex items-center justify-center">
              <Truck className="h-5 w-5 text-fuchsia-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Testar cotação real</h2>
              <p className="text-xs text-zinc-500">Chama a edge function shipping-calculate de verdade, com um carrinho de exemplo.</p>
            </div>
          </div>

          <p className="text-xs text-zinc-500 mb-4 leading-relaxed max-w-[65ch]">
            Itens de teste: Vibrador Ponto G Íntimo (1 un. · {formatCurrency(sampleItems[0].price)}) e Óleo de Massagem Beijo da Sedução (2 un. · {formatCurrency(sampleItems[1].price)} cada). Informe um CEP de destino para consultar as opções reais retornadas pelo Melhor Envio.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="w-full sm:w-56">
              <label htmlFor="testPostalCode" className="block text-sm font-medium text-zinc-200 mb-1">
                CEP de destino
              </label>
              <input
                id="testPostalCode"
                name="testPostalCode"
                type="text"
                inputMode="numeric"
                placeholder="04538-133"
                maxLength={9}
                value={testPostalCode}
                onChange={handleTestCepChange}
                onBlur={handleTestCepBlur}
                className={`block w-full rounded-md border-0 bg-zinc-800 py-2 px-3 text-zinc-100 shadow-sm ring-1 ring-inset ${testCepError ? 'ring-red-500' : 'ring-zinc-700'} focus:ring-2 focus:ring-inset focus:ring-fuchsia-500 sm:text-sm`}
              />
              {testCepError && <p className="mt-1 text-xs text-red-400">{testCepError}</p>}
            </div>

            <Button
              type="button"
              onClick={runShippingTest}
              disabled={quoteLoading}
              className="flex items-center justify-center gap-2 bg-zinc-800 text-zinc-100 border border-fuchsia-500/30 rounded-md px-4 py-2 text-sm font-semibold shadow-sm hover:bg-zinc-700 transition-colors active:scale-[0.98] disabled:opacity-60"
            >
              {quoteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageSearch className="h-4 w-4" />}
              {quoteLoading ? 'Consultando...' : 'Calcular frete de teste'}
            </Button>
          </div>

          {quoteError && (
            <div className="mt-4 flex items-start gap-3 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-300">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm">{quoteError}</p>
                <button
                  type="button"
                  onClick={runShippingTest}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-300 hover:text-fuchsia-200 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
                </button>
              </div>
            </div>
          )}

          {quoteOptions !== null && !quoteError && (
            <div className="mt-4">
              {quoteOptions.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-md bg-zinc-800/60 border border-zinc-700">
                  <Info className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  <p className="text-sm text-zinc-400">Nenhuma opção de frete retornada para este CEP. Verifique se o token e o ambiente estão configurados corretamente nas secrets.</p>
                </div>
              ) : (
                <ul className="divide-y divide-zinc-800 rounded-md border border-zinc-800 overflow-hidden">
                  {quoteOptions.map((option) => (
                    <li key={option.id} className="flex items-center justify-between gap-4 p-4 bg-zinc-800/40">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-100 truncate">{option.name}</p>
                        <p className="text-xs text-zinc-500">Prazo estimado: {option.deliveryTime} dia(s) útil(is)</p>
                      </div>
                      <p className="text-sm font-mono font-semibold text-fuchsia-300 flex-shrink-0">{formatCurrency(option.price)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
            <ServerCog className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-zinc-100 mb-1">Como o cálculo funciona</h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-[65ch]">
              No checkout, o cliente informa o CEP de destino e a edge function <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-fuchsia-300 font-mono text-xs">shipping-calculate</code> consulta
              a API do Melhor Envio (sandbox ou produção, conforme a secret configurada) e retorna as opções de frete disponíveis, já com preço e prazo estimado, sem nunca expor o token no navegador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}