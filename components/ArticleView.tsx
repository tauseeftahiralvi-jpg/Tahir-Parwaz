import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Video, GeneratedArticle } from '../types';
import { generateArticleFromVideo } from '../services/geminiService';
import { ArrowLeftIcon, SparklesIcon, YouTubeIcon, SpeakerIcon, StopIcon, TextSizeIcon, FacebookIcon, TwitterIcon, WhatsAppIcon, PlayIcon, PauseIcon, QuillIcon } from './Icons';

interface ArticleViewProps {
  video: Video;
  onBack: () => void;
}

const loadingPhrases = [
    "Listening to the silence...",
    "Weaving words of wisdom...",
    "Translating the soul...",
    "Composing the analysis...",
    "Finding the hidden rhythms...",
    "Ink flowing from emotions..."
];

const ArticleView: React.FC<ArticleViewProps> = ({ video, onBack }) => {
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [audioState, setAudioState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
        interval = setInterval(() => {
            setLoadingPhraseIndex(prev => (prev + 1) % loadingPhrases.length);
        }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    let isMounted = true;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await generateArticleFromVideo(video);
        if (isMounted) {
          setArticle(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to generate content.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticle();

    // Setup Speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
    }

    return () => {
      isMounted = false;
      if (synthRef.current) {
          synthRef.current.cancel();
      }
    };
  }, [video]);

  const handlePlayPause = () => {
      if (!article || !synthRef.current) return;

      if (audioState === 'playing') {
          synthRef.current.pause();
          setAudioState('paused');
      } else if (audioState === 'paused') {
          synthRef.current.resume();
          setAudioState('playing');
      } else {
          // Idle - start fresh
          const textToRead = `${article.title}. ${article.englishContent.replace(/[#*]/g, '')}`;
          
          const utterance = new SpeechSynthesisUtterance(textToRead);
          utterance.rate = 0.9; // Slightly slower for poetic effect
          utterance.pitch = 1.0;
          
          utterance.onend = () => setAudioState('idle');
          utterance.onerror = () => setAudioState('idle');

          utteranceRef.current = utterance;
          synthRef.current.speak(utterance);
          setAudioState('playing');
      }
  };

  const handleStop = () => {
      if (!synthRef.current) return;
      synthRef.current.cancel();
      setAudioState('idle');
  };

  const toggleFontSize = () => {
      setFontSize(prev => prev === 'normal' ? 'large' : 'normal');
  };

  // Share URL configuration
  const shareUrl = encodeURIComponent(`https://www.youtube.com/watch?v=${video.youtubeId}`);
  const shareText = encodeURIComponent(`Experience "${video.title}" - A poetic journey by Tahir Parwaz`);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      {/* Navigation Bar */}
      <div className="bg-midnight-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-2xl">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-gold-400 hover:text-gold-300 transition-colors group"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
             <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-serif font-bold hidden sm:block">Back to Gallery</span>
        </button>
        
        <div className="flex items-center space-x-3">
             {/* Controls */}
             {!loading && article && (
                 <>
                    <button 
                        onClick={toggleFontSize}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        title={fontSize === 'normal' ? "Increase Font Size" : "Reset Font Size"}
                    >
                        <TextSizeIcon className="w-5 h-5" />
                    </button>
                    
                    {/* Audio Controls */}
                    <div className="flex items-center space-x-1 bg-white/5 rounded-full p-1 border border-white/10 ml-2">
                        {audioState === 'idle' ? (
                            <button 
                                onClick={handlePlayPause}
                                className="p-2 rounded-full bg-gold-500 text-midnight-900 hover:bg-gold-400 transition-all flex items-center space-x-2 px-4 shadow-lg shadow-gold-500/20"
                                title="Read Article Aloud"
                            >
                                <SpeakerIcon className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Listen</span>
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={handlePlayPause}
                                    className="p-2 rounded-full hover:bg-white/10 text-gold-400 transition-all"
                                    title={audioState === 'playing' ? "Pause Reading" : "Resume Reading"}
                                >
                                    {audioState === 'playing' ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                                </button>
                                <button 
                                    onClick={handleStop}
                                    className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-all"
                                    title="Stop Reading"
                                >
                                    <StopIcon className="w-5 h-5" />
                                </button>
                                <div className="px-2 hidden md:block">
                                    <div className="flex space-x-0.5 items-end h-4">
                                        <div className="w-1 bg-gold-500/80 animate-[bounce_1s_infinite] h-2"></div>
                                        <div className="w-1 bg-gold-500/80 animate-[bounce_1.2s_infinite] h-4"></div>
                                        <div className="w-1 bg-gold-500/80 animate-[bounce_0.8s_infinite] h-3"></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                 </>
             )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        
        {/* Cinematic Hero Section */}
        <div className="relative w-full min-h-[50vh] lg:min-h-[60vh] flex items-end">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
                style={{ 
                    backgroundImage: `url(https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg)`,
                    backgroundPosition: 'center 20%' 
                }}
            >
                {/* Gradient Overlays for Readability and Mood */}
                <div className="absolute inset-0 bg-gradient-to-b from-midnight-900/30 via-midnight-900/60 to-[#0f172a]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/90 to-transparent"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 pb-12 w-full">
                <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up">
                    <span className="px-3 py-1 bg-gold-500/20 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
                        Poetic Analysis
                    </span>
                    <span className="text-gray-400 text-sm font-medium border-l border-white/20 pl-3">
                        {video.publishDate}
                    </span>
                    <span className="text-gray-400 text-sm font-medium">
                        • {video.views} Views
                    </span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl animate-fade-in-up delay-100">
                    {video.title}
                </h1>

                <div className="flex flex-col md:flex-row gap-8 items-start md:items-end animate-fade-in-up delay-200">
                    <div className="flex-1">
                         <p className="text-lg md:text-2xl text-gray-200 font-serif italic leading-relaxed border-l-4 border-gold-500 pl-6 drop-shadow-lg">
                            "{video.description}"
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                         <a 
                            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full transition-all shadow-xl hover:shadow-red-900/50 hover:-translate-y-1"
                        >
                            <YouTubeIcon className="w-6 h-6" />
                            <span className="font-bold tracking-wide uppercase text-sm">Watch Original</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Container */}
        <div className="bg-[#0f172a] relative">
            <div className="max-w-4xl mx-auto px-6 py-12">
            
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 min-h-[400px]">
                {/* Quill Animation */}
                <div className="relative mb-10 group">
                    <div className="absolute -inset-4 bg-gold-500/5 rounded-full blur-2xl animate-pulse"></div>
                    <QuillIcon className="w-16 h-16 text-gold-500 animate-writing drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                </div>
                
                {/* Text Animation */}
                <div className="h-10 overflow-hidden relative w-full max-w-lg text-center">
                    <p className="text-2xl font-serif text-white/90 animate-fade-in-up key-{loadingPhraseIndex} italic">
                        {loadingPhrases[loadingPhraseIndex]}
                    </p>
                </div>
                
                {/* Progress Ink Line */}
                <div className="w-48 h-0.5 bg-white/10 rounded-full mt-8 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-transparent via-gold-500 to-transparent w-full animate-shimmer"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-8 bg-red-900/10 border border-red-500/20 rounded-2xl text-center mt-8">
                <div className="inline-block p-3 bg-red-500/10 rounded-full mb-4">
                    <StopIcon className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl text-white font-bold mb-2">Analysis Unavailable</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-colors"
                >
                    Try Again
                </button>
              </div>
            )}

            {article && !loading && (
              <div className="animate-fade-in space-y-20">
                 
                 {/* Emotional Spectrum Widget */}
                 {article.emotionalSpectrum.length > 0 && (
                     <div className="bg-midnight-800/50 backdrop-blur p-8 rounded-2xl border border-white/5 shadow-2xl">
                        <div className="flex items-center space-x-2 mb-6">
                            <SparklesIcon className="w-5 h-5 text-gold-500" />
                            <h4 className="text-sm uppercase tracking-widest text-gold-500 font-bold">Emotional Resonance</h4>
                        </div>
                        
                        <div className="flex h-6 rounded-full overflow-hidden bg-black/50 mb-4 ring-1 ring-white/10">
                            {article.emotionalSpectrum.map((emotion, idx) => (
                                <div 
                                    key={idx}
                                    style={{ width: `${emotion.percentage}%`, backgroundColor: emotion.color }}
                                    className="h-full transition-all duration-1000 relative group"
                                >
                                    {/* Tooltip on hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap justify-between gap-4">
                            {article.emotionalSpectrum.map((emotion, idx) => (
                                <div key={idx} className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: emotion.color, boxShadow: `0 0 10px ${emotion.color}` }}></div>
                                    <span className="text-gray-200 text-sm font-medium">{emotion.label}</span>
                                    <span className="text-gray-500 text-xs font-mono">{emotion.percentage}%</span>
                                </div>
                            ))}
                        </div>
                     </div>
                 )}

                 {/* English Section */}
                 <div className={`prose prose-invert max-w-none ${fontSize === 'large' ? 'text-xl leading-loose' : 'text-lg leading-relaxed'} font-serif`}>
                    
                    <h2 className="text-3xl md:text-5xl text-white font-bold mb-10 pb-6 border-b border-white/10">{article.title}</h2>
                    
                    <ReactMarkdown
                         components={{
                            h1: ({node, ...props}) => <h2 className="text-2xl text-gold-400 font-bold mt-12 mb-6 tracking-wide" {...props} />,
                            h2: ({node, ...props}) => <h3 className="text-xl text-white font-semibold mt-10 mb-4 border-l-2 border-gold-600 pl-4" {...props} />,
                            p: ({node, ...props}) => <p className="mb-6 text-gray-300 text-opacity-90" {...props} />,
                            blockquote: ({node, ...props}) => (
                                <div className="relative my-10 pl-8">
                                    <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-gold-400 to-transparent"></div>
                                    <blockquote className="text-2xl italic text-white/90 font-serif leading-relaxed" {...props} />
                                </div>
                            ),
                            strong: ({node, ...props}) => <strong className="text-gold-200 font-bold" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 mb-6 space-y-3 text-gray-400 marker:text-gold-500" {...props} />,
                         }}
                    >
                        {article.englishContent}
                    </ReactMarkdown>
                 </div>

                 {/* Divider */}
                 <div className="flex items-center justify-center py-12">
                     <div className="w-2 h-2 bg-gold-500 rounded-full mx-2"></div>
                     <div className="w-2 h-2 bg-gold-500 rounded-full mx-2 opacity-50"></div>
                     <div className="w-2 h-2 bg-gold-500 rounded-full mx-2 opacity-25"></div>
                 </div>

                 {/* Urdu Section */}
                 <div className="relative group">
                     {/* Decorative Glow */}
                     <div className="absolute -inset-1 bg-gradient-to-r from-gold-600/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                     
                     <div className="rtl bg-[#16213e] p-8 md:p-14 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                        
                        <div className="flex items-center space-x-3 space-x-reverse text-gold-500 mb-10 border-b border-white/10 pb-4">
                            <span className="text-sm font-sans tracking-[0.2em] uppercase font-bold">Urdu Interpretation</span>
                            <div className="flex-1 h-px bg-white/10"></div>
                        </div>

                        <div className={`text-right font-urdu ${fontSize === 'large' ? 'text-3xl leading-[2.8]' : 'text-2xl leading-[2.6]'} text-gray-200`}>
                            <ReactMarkdown
                                components={{
                                    h1: ({node, ...props}) => <h2 className="text-gold-400 font-bold mt-10 mb-8" {...props} />,
                                    strong: ({node, ...props}) => <span className="text-gold-200" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-10" {...props} />,
                                    blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-gold-500/50 pr-6 my-8 text-white/90 bg-black/20 p-6 rounded-l-xl" {...props} />,
                                }}
                            >
                                {article.urduContent}
                            </ReactMarkdown>
                        </div>
                     </div>
                 </div>

                 {/* Tags */}
                 <div className="flex flex-wrap gap-3 justify-center pt-8">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-5 py-2 bg-midnight-800 text-gray-400 text-sm rounded-full border border-gray-700/50 hover:border-gold-500/50 hover:text-gold-400 transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Social Share */}
                <div className="pt-16 pb-8 border-t border-white/5">
                    <h3 className="text-center text-gold-500 font-serif text-2xl italic mb-8">Share this Poetic Journey</h3>
                    <div className="flex justify-center gap-8">
                        <a 
                            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group relative p-4 bg-[#1877F2] rounded-full text-white transition-transform hover:-translate-y-1 shadow-lg shadow-blue-900/20"
                            title="Share on Facebook"
                        >
                            <FacebookIcon className="w-6 h-6" />
                        </a>
                        <a 
                            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group relative p-4 bg-black border border-gray-800 rounded-full text-white transition-transform hover:-translate-y-1 shadow-lg shadow-gray-900/20"
                            title="Share on X (Twitter)"
                        >
                            <TwitterIcon className="w-6 h-6" />
                        </a>
                        <a 
                            href={`https://wa.me/?text=${shareText} ${shareUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group relative p-4 bg-[#25D366] rounded-full text-white transition-transform hover:-translate-y-1 shadow-lg shadow-green-900/20"
                            title="Share on WhatsApp"
                        >
                            <WhatsAppIcon className="w-6 h-6" />
                        </a>
                    </div>
                </div>

              </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;