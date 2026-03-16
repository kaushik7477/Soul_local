import React from 'react';
// import Footer from '../components/Footer';
// import Header from '../components/Header';

const NotFoundPage: React.FC = () => {
  // No header/footer here, App handles them

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <main className="flex-1 flex flex-col items-center justify-center py-24">
        <div className="flex flex-col items-center animate-fade-in-up">
          <div className="relative mb-8">
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-500/10 rounded-full blur-2xl animate-pulse" />
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tight mb-2 text-green-500 drop-shadow-lg animate-bounce">404</h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 animate-fade-in">Page Not Found</h2>
          <p className="text-zinc-400 mb-10 text-center max-w-md animate-fade-in delay-200">The page you are looking for does not exist or has been moved.<br/>But don't worry, you can always find your way back home!</p>
          <a href="/" className="px-8 py-4 bg-green-500 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-fade-in delay-300">
            Go Home
          </a>
        </div>
        <style>{`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(.4,0,.2,1) both; }
          @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
        `}</style>
      </main>
    </div>
  );
};

export default NotFoundPage;
