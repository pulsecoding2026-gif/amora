import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-fuchsia-500">Amora</h2>
          <p className="text-zinc-300">Segredos partilhados, prazer sem tabus.</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-zinc-200 font-semibold text-lg">Navegação</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-fuchsia-400 transition-colors">Início</Link></li>
            <li><Link to="/vibradores" className="hover:text-fuchsia-400 transition-colors">Vibradores</Link></li>
            <li><Link to="/lingerie" className="hover:text-fuchsia-400 transition-colors">Lingerie</Link></li>
            <li><Link to="/cosmeticos" className="hover:text-fuchsia-400 transition-colors">Cosméticos</Link></li>
            <li><Link to="/casais" className="hover:text-fuchsia-400 transition-colors">Casais</Link></li>
            <li><Link to="/acessorios" className="hover:text-fuchsia-400 transition-colors">Acessórios</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-zinc-200 font-semibold text-lg">Atendimento</h3>
          <ul className="space-y-2">
            <li><p>Embalagem discreta.</p></li>
            <li><p>Envio para maiores de 18 anos.</p></li>
            <li><p>Segunda a Sexta, das 9h às 18h.</p></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-zinc-200 font-semibold text-lg">Contato</h3>
          <ul className="space-y-2">
            <li><p>contato@amora.com</p></li>
            <li><p>(11) 98765-4321</p></li>
            <li><p>Rua da Paixão, 123 - Centro, São Paulo - SP</p></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-sm">
        <p>&copy; 2024 Amora. Todos os direitos reservados.</p>
        <Link to="/admin" className="text-zinc-600 hover:text-fuchsia-400 transition-colors">
          Painel admin
        </Link>
      </div>
    </footer>
  );
};

export default Footer;