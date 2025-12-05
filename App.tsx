import React, { useState } from 'react';
import { ViewState, Video } from './types';
import VideoGrid from './components/VideoGrid';
import ArticleView from './components/ArticleView';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('GALLERY');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);
    setViewState('ARTICLE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGallery = () => {
    setViewState('GALLERY');
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-gold-500 selection:text-white">
      {/* Header */}
      <header className="bg-midnight-900 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center shadow-lg shadow-gold-500/20">
                <span className="text-2xl font-serif font-bold text-black">T</span>
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide">
                TAHIR PARWAZ
                </h1>
                <p className="text-xs text-gold-400 uppercase tracking-widest hidden sm:block">The Voice of Soul</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
             <button onClick={() => setViewState('GALLERY')} className="hover:text-gold-400 transition-colors">Videos</button>
             <a href="https://www.youtube.com/@Gogipk" target="_blank" rel="noreferrer" className="hover:text-gold-400 transition-colors">YouTube Channel</a>
             <span className="text-gray-600">|</span>
             <span className="text-gold-500">Gemini Powered</span>
          </nav>
        </div>
      </header>

      {/* Hero Section (Only in Gallery) */}
      {viewState === 'GALLERY' && (
        <div className="relative bg-midnight-900 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://picsum.photos/id/231/1920/600')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-midnight-900/80 to-transparent"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center">
                <span className="text-gold-400 font-serif italic text-lg md:text-xl mb-4 animate-fade-in-up">Welcome to the world of words</span>
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                    Poetry in <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-yellow-200">Motion</span>
                </h1>
                <p className="text-gray-300 max-w-2xl text-lg md:text-xl leading-relaxed mb-10">
                    Experience the ghazals and nazms of Tahir Parwaz. Select a video below to let our AI transcribe the emotions into written art.
                </p>
                <button 
                    onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                    className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                    Explore Videos
                </button>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow bg-[#0f172a] relative">
         {/* Background Decoration */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[-10%] w-96 h-96 bg-gold-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[10%] right-[-10%] w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
         </div>

         <div className="relative z-10">
            {viewState === 'GALLERY' ? (
            <VideoGrid onSelectVideo={handleSelectVideo} />
            ) : (
            selectedVideo && <ArticleView video={selectedVideo} onBack={handleBackToGallery} />
            )}
         </div>
      </main>

      {/* Footer */}
      <footer className="bg-midnight-900 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-white">Tahir Parwaz</h3>
            <p className="text-gray-500 text-sm mt-2">© 2024 All Rights Reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
            <a href="https://www.youtube.com/@Gogipk" className="text-gray-400 hover:text-red-500 transition-colors">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
