import React from 'react';
import { Video } from '../types';
import { VIDEOS } from '../constants';
import { PlayIcon, YouTubeIcon } from './Icons';

interface VideoGridProps {
  onSelectVideo: (video: Video) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ onSelectVideo }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">The Collection</h2>
        <div className="w-24 h-1 bg-gold-500 mx-auto rounded-full mb-6"></div>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {VIDEOS.map((video) => (
          <div 
            key={video.id}
            onClick={() => onSelectVideo(video)}
            className="group relative bg-midnight-800 rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-gold-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-gold-900/10"
          >
            {/* Thumbnail Wrapper */}
            <div className="aspect-video relative overflow-hidden bg-black">
              <img 
                src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt={video.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                <div className="transform scale-75 group-hover:scale-100 transition-transform duration-300 bg-red-600 text-white p-3 rounded-full shadow-lg shadow-red-600/30">
                    <PlayIcon className="w-6 h-6 ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-mono border border-white/10">
                {video.publishDate}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-base font-serif font-bold text-white mb-2 line-clamp-2 group-hover:text-gold-400 transition-colors h-10 leading-tight">
                {video.title}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>{video.views}</span>
                </span>
                <span className="text-gold-500/80 font-medium group-hover:text-gold-400">
                   Analyze
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