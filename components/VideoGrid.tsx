import React from 'react';
import { Video } from '../types';
import { VIDEOS } from '../constants';
import { PlayIcon, YouTubeIcon, SparklesIcon } from './Icons';

interface VideoGridProps {
  onSelectVideo: (video: Video) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ onSelectVideo }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">The Collection</h2>
        <div className="w-24 h-1 bg-gold-500 mx-auto rounded-full mb-6"></div>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg font-serif">
          Dive into the complete library of Tahir Parwaz. Over 20+ selections available for deep analysis.
        </p>
        <a 
            href="https://www.youtube.com/@Gogipk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 mt-8 text-white hover:text-red-400 transition-colors bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full font-bold shadow-lg shadow-red-900/20"
        >
            <YouTubeIcon className="w-6 h-6" />
            <span>Visit Official Channel @Gogipk</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {VIDEOS.map((video) => (
          <div 
            key={video.id}
            onClick={() => onSelectVideo(video)}
            className="group relative bg-midnight-800 rounded-xl overflow-hidden shadow-xl border border-gray-800 hover:border-gold-500/50 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold-900/10"
          >
            {/* Thumbnail Wrapper */}
            <div className="aspect-[16/10] relative overflow-hidden bg-black">
              <img 
                src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                alt={video.title}
                loading="lazy"
                onError={(e) => {
                    // Fallback if maxres is unavailable
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              
              {/* Play Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                    <SparklesIcon className="w-6 h-6 text-gold-400" />
                </div>
              </div>

              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] text-white font-mono border border-white/10 uppercase tracking-widest">
                {video.publishDate}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 relative">
              <h3 className="text-lg font-serif font-bold text-white mb-3 line-clamp-2 group-hover:text-gold-400 transition-colors leading-snug">
                {video.title}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-white/5">
                <span className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span>{video.views}</span>
                </span>
                <span className="text-gold-500 font-bold text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                   Generate Article →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;