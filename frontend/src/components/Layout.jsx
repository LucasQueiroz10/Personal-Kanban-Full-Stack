// Envolve todas as páginas: aplica o footer e deixa espaço reservado
// para o conteúdo principal crescer (footer sempre no final, mesmo em telas curtas).

import Footer from './Footer';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <main className="app-layout-content">{children}</main>
      <Footer />
    </div>
  );
}
