import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Video, GeneratedArticle } from '../types';
import { generateArticleFromVideo } from '../services/geminiService';
import { ArrowLeftIcon, SparklesIcon, YouTubeIcon, SpeakerIcon, StopIcon, TextSizeIcon, FacebookIcon, TwitterIcon, WhatsAppIcon, PlayIcon, PauseIcon } from './Icons';

interface ArticleViewProps {
  video: Video;
  onBack: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ video, onBack }) => {
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [audioState, setAudioState] = useState<'idle' | 'playing' | 'paused'>('idle');
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
      <div className="bg-midnight-900/90 backdrop-blur border-b border-white/10 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-lg">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-gold-400 hover:text-gold-300 transition-colors group"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10">
             <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-serif font-bold hidden sm:block">Back to Gallery</span>
        </button>
        <div className="flex items-center space-x-4">
             {/* Accessibility Controls */}
             {!loading && article && (
                 <>
                    <button 
                        onClick={toggleFontSize}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        title="Toggle Font Size"
                    >
                        <TextSizeIcon className="w-5 h-5" />
                    </button>
                    
                    {/* Audio Controls */}
                    <div className="flex items-center space-x-1 bg-white/5 rounded-full p-1 border border-white/10">
                        {audioState === 'idle' ? (
                            <button 
                                onClick={handlePlayPause}
                                className="p-2 rounded-full bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-all flex items-center space-x-2 px-3"
                                title="Read Article Aloud"
                            >
                                <SpeakerIcon className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase hidden md:block">Listen</span>
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
                                    <div className="space-y-1">
                                        <div className="h-0.5 w-8 bg-gold-500/50 animate-pulse"></div>
                                        <div className="h-0.5 w-6 bg-gold-500/30 animate-pulse delay-75"></div>
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
        {/* Video Player Section */}
        <div className="w-full bg-black">
          <div className="max-w-6xl mx-auto">
            <div className="relative pt-[56.25%] w-full">
              <iframe
                className="absolute top-0 left-0 w-full h-full shadow-2xl"
                src={`https://www.youtube.com/embed/${video.youtubeId}?origin=${typeof window !== 'undefined' ? window.location.origin : ''}&rel=0&modestbranding=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        {/* Video Info Section */}
        <div className="bg-midnight-900 border-b border-white/5">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-400">
               <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded uppercase tracking-wider">Now Playing</span>
               <span>{video.publishDate}</span>
               <span>•</span>
               <span>{video.views} Views</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
               {video.title}
            </h1>

            <div className="bg-white/5 rounded-lg p-6 border-l-4 border-gold-500">
              <p className="text-gray-300 text-lg leading-relaxed font-serif italic">
                 "{video.description}"
              </p>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
                 <a 
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full transition-colors text-sm font-bold uppercase tracking-wide shadow-lg"
                 >
                    <YouTubeIcon className="w-5 h-5" />
                    <span>Watch on @Gogipk Channel</span>
                 </a>
            </div>
          </div>
        </div>

        {/* Generated Content Container */}
        <div className="max-w-4xl mx-auto px-6 py-12">
            
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-gold-600/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-gold-400 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-serif text-gold-400 animate-pulse">Consulting the Muses...</h3>
                  <p className="text-gray-400 mt-2">Translating emotions into words (English & Urdu)</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-lg text-center mt-8">
                <h3 className="text-red-400 font-bold mb-2">Analysis Failed</h3>
                <p className="text-gray-300">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-white underline">Try Again</button>
              </div>
            )}

            {article && !loading && (
              <div className="animate-fade-in space-y-16">
                 
                 {/* Emotional Spectrum Widget */}
                 {article.emotionalSpectrum.length > 0 && (
                     <div className="bg-midnight-800 p-6 rounded-xl border border-white/5 shadow-xl">
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Emotional Spectrum</h4>
                        <div className="flex h-4 rounded-full overflow-hidden bg-black/50">
                            {article.emotionalSpectrum.map((emotion, idx) => (
                                <div 
                                    key={idx}
                                    style={{ width: `${emotion.percentage}%`, backgroundColor: emotion.color }}
                                    className="h-full transition-all duration-1000"
                                    title={`${emotion.label}: ${emotion.percentage}%`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 text-xs md:text-sm font-medium">
                            {article.emotionalSpectrum.map((emotion, idx) => (
                                <div key={idx} className="flex items-center space-x-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: emotion.color }}></div>
                                    <span className="text-gray-300">{emotion.label} <span className="text-gray-500">({emotion.percentage}%)</span></span>
                                </div>
                            ))}
                        </div>
                     </div>
                 )}

                 {/* English Section */}
                 <div className={`prose prose-invert max-w-none ${fontSize === 'large' ? 'text-xl leading-relaxed' : 'text-lg leading-relaxed'} font-serif`}>
                    <div className="flex items-center space-x-2 text-gold-500 mb-6 border-b border-gray-800 pb-2">
                        <SparklesIcon className="w-5 h-5" />
                        <span className="text-sm font-sans tracking-widest uppercase">English Analysis</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl text-white font-bold mb-8">{article.title}</h2>
                    
                    <ReactMarkdown
                         components={{
                            h1: ({node, ...props}) => <h2 className="text-2xl text-gold-400 font-bold mt-10 mb-6" {...props} />,
                            h2: ({node, ...props}) => <h3 className="text-xl text-white font-semibold mt-8 mb-4 border-l-4 border-gold-600 pl-4" {...props} />,
                            p: ({node, ...props}) => <p className="mb-6 text-gray-300" {...props} />,
                            blockquote: ({node, ...props}) => (
                                <blockquote className="border-l-4 border-gold-500 bg-midnight-800/50 p-6 my-8 italic text-xl text-white/90 shadow-inner rounded-r-lg quote-box" {...props} />
                            ),
                            strong: ({node, ...props}) => <strong className="text-gold-200 font-bold" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-gray-400" {...props} />,
                         }}
                    >
                        {article.englishContent}
                    </ReactMarkdown>
                 </div>

                 {/* Divider */}
                 <div className="flex items-center justify-center py-8">
                     <div className="h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent w-full max-w-sm"></div>
                 </div>

                 {/* Urdu Section */}
                 <div className="rtl bg-[#16213e] p-8 md:p-12 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                     
                     <div className="flex items-center space-x-2 space-x-reverse text-gold-500 mb-8 border-b border-white/10 pb-4">
                        <span className="text-sm font-sans tracking-widest uppercase">Urdu Interpretation</span>
                     </div>

                     <div className={`text-right font-urdu ${fontSize === 'large' ? 'text-3xl leading-[2.8]' : 'text-2xl leading-[2.5]'} text-gray-200`}>
                        <ReactMarkdown
                            components={{
                                h1: ({node, ...props}) => <h2 className="text-gold-400 font-bold mt-8 mb-6" {...props} />,
                                strong: ({node, ...props}) => <span className="text-gold-200" {...props} />,
                                p: ({node, ...props}) => <p className="mb-8" {...props} />,
                            }}
                        >
                            {article.urduContent}
                        </ReactMarkdown>
                     </div>
                 </div>

                 {/* Tags */}
                 <div className="pt-8 flex flex-wrap gap-2 justify-center">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-midnight-800 text-gray-400 text-sm rounded-full border border-gray-700 hover:border-gold-500/50 transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Social Share */}
                <div className="pt-12 mt-12 border-t border-white/10">
                    <h3 className="text-center text-gold-500 font-serif text-xl mb-6">Share this Masterpiece</h3>
                    <div className="flex justify-center gap-6">
                        <a 
                            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 hover:scale-110 transition-all shadow-lg"
                            title="Share on Facebook"
                        >
                            <FacebookIcon className="w-6 h-6" />
                        </a>
                        <a 
                            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 bg-black border border-gray-800 rounded-full text-white hover:bg-gray-900 hover:scale-110 transition-all shadow-lg"
                            title="Share on X (Twitter)"
                        >
                            <TwitterIcon className="w-6 h-6" />
                        </a>
                        <a 
                            href={`https://wa.me/?text=${shareText} ${shareUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 bg-green-500 rounded-full text-white hover:bg-green-600 hover:scale-110 transition-all shadow-lg"
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
  );
};

export default ArticleView;