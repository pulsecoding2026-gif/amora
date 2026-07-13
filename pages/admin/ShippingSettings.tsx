import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Save, Loader2, Package, Truck, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MelhorEnvioConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  environment: 'sandbox' | 'production';
}

export default function ShippingSettings() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });

  const [errors, setErrors] = useState({
    clientId: '',
    clientSecret: '',
    accessToken: '',
  });

  useEffect(() => {
    const storedConfig = localStorage.getItem('amora_melhorenvio_config');
    if (storedConfig) {
      const config: MelhorEnvioConfig = JSON.parse(storedConfig);
      setClientId(config.clientId);
      setClientSecret(config.clientSecret);
      setAccessToken(config.accessToken);
      setEnvironment(config.environment);
    }
  }, []);

  const validateField = (name: string, value: string) => {
    if (!value.trim()) {
      return 'Este campo é obrigatório.';
    } else if (name === 'accessToken' && value.length < 32) {
      return 'O Token de acesso deve ter pelo menos 32 caracteres.';
    }
    return '';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ message: '', type: '' });

    const newErrors = {
      clientId: validateField('clientId', clientId),
      clientSecret: validateField('clientSecret', clientSecret),
      accessToken: validateField('accessToken', accessToken),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== '');

    if (hasErrors) {
      setIsLoading(false);
      setFeedback({ message: 'Por favor, corrija os erros no formulário.', type: 'error' });
      return;
    }

    const config: MelhorEnvioConfig = {
      clientId,
      clientSecret,
      accessToken,
      environment,
    };

    try {
      localStorage.setItem('amora_melhorenvio_config', JSON.stringify(config));
      setFeedback({ message: 'Configurações de frete salvas com sucesso!', type: 'success' });
    } catch (error) {
      setFeedback({ message: 'Erro ao salvar as configurações.', type: 'error' });
      console.error('Failed to save Melhor Envio config to localStorage', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950/90 min-h-dvh text-zinc-100 lg:ml-64 pt-16 lg:pt-0">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <nav className="text-xs text-zinc-400 mb-4">
          <span>Admin</span> <span className="mx-1">/</span> <span className="text-fuchsia-400">Frete</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Configurações de Frete</h1>

        <p className="text-sm text-zinc-400 mb-8 max-w-2xl">
          Configure suas credenciais do Melhor Envio para integrar o cálculo de frete. Atenção: estas chaves são armazenadas localmente no seu navegador para simulações e cálculos preliminares. Para um cálculo de frete em tempo real e seguro em produção, um backend é indispensável, onde as chaves devem ser gerenciadas com segurança.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-8 rounded-xl shadow-lg">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-zinc-200 mb-1">Client ID</label>
            <input
              id="clientId"
              name="clientId"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              onBlur={handleBlur}
              className={`block w-full rounded-md border-0 bg-zinc-800 py-2 px-3 text-zinc-100 shadow-sm ring-1 ring-inset ${errors.clientId ? 'ring-red-500' : 'ring-zinc-700'} focus:ring-2 focus:ring-inset focus:ring-fuchsia-500 sm:text-sm`}
            />
            {errors.clientId && <p className="mt-1 text-xs text-red-400">{errors.clientId}</p>}
          </div>

          <div>
            <label htmlFor="clientSecret" className="block text-sm font-medium text-zinc-200 mb-1">Client Secret</label>
            <input
              id="clientSecret"
              name="clientSecret"
              type="text"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              onBlur={handleBlur}
              className={`block w-full rounded-md border-0 bg-zinc-800 py-2 px-3 text-zinc-100 shadow-sm ring-1 ring-inset ${errors.clientSecret ? 'ring-red-500' : 'ring-zinc-700'} focus:ring-2 focus:ring-inset focus:ring-fuchsia-500 sm:text-sm`}
            />
            {errors.clientSecret && <p className="mt-1 text-xs text-red-400">{errors.clientSecret}</p>}
          </div>

          <div>
            <label htmlFor="accessToken" className="block text-sm font-medium text-zinc-200 mb-1">Token de Acesso</label>
            <input
              id="accessToken"
              name="accessToken"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              onBlur={handleBlur}
              className={`block w-full rounded-md border-0 bg-zinc-800 py-2 px-3 text-zinc-100 shadow-sm ring-1 ring-inset ${errors.accessToken ? 'ring-red-500' : 'ring-zinc-700'} focus:ring-2 focus:ring-inset focus:ring-fuchsia-500 sm:text-sm`}
            />
            {errors.accessToken && <p className="mt-1 text-xs text-red-400">{errors.accessToken}</p>}
          </div>

          <div>
            <label htmlFor="environment" className="block text-sm font-medium text-zinc-200 mb-1">Ambiente</label>
            <select
              id="environment"
              name="environment"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as 'sandbox' | 'production')}
              className="block w-full rounded-md border-0 bg-zinc-800 py-2 px-3 text-zinc-100 shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-fuchsia-500 sm:text-sm"
            >
              <option value="sandbox">Sandbox (Testes)</option>
              <option value="production">Produção</option>
            </select>
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
            className="w-full flex items-center justify-center gap-2 bg-fuchsia-600 text-white rounded-md px-4 py-2 text-sm font-semibold shadow-sm hover:bg-fuchsia-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-600 transition-colors"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>
      </div>
    </div>
  );
}