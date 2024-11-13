import { useState, useCallback, useRef } from 'react';
import { FileVideo, Upload, Hexagon, LayoutList } from 'lucide-react';
import { HexagonalBarcodeGenerator } from './components/HexagonalBarcodeGenerator';
import { LinearBarcodeGenerator } from './components/LinearBarcodeGenerator';
import { MixtapeCards } from './components/MixtapeCards';
import { SocialShare } from './components/SocialShare';
import { ColorFilters, FilterType } from './components/ColorFilters';

function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState<'miny' | 'linear'>('miny');
  const [filter, setFilter] = useState<FilterType>('vibrant');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (!file.type.startsWith('video/')) {
          throw new Error('Please upload a valid video file');
        }
        
        if (file.size > 100 * 1024 * 1024) {
          throw new Error('Video file size must be less than 100MB');
        }

        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
        }
        
        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setVideoFile(null);
        setVideoUrl('');
      }
    }
  }, [videoUrl]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              MINY Album Art
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center justify-center gap-3">
              <FileVideo className="w-8 h-8" />
              Video Color Pattern Generator
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Transform your videos into unique abstract patterns perfect for album covers
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700/50 mb-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center">
              <button
                onClick={handleUploadClick}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Upload className="w-5 h-5" />
                Upload Video
              </button>
              {videoFile && (
                <p className="text-sm text-gray-300 mt-2">
                  Selected: {videoFile.name}
                </p>
              )}
              {error && (
                <p className="text-red-400 mt-2 text-sm">{error}</p>
              )}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setView('miny')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                view === 'miny'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Hexagon className="w-5 h-5" />
              MINY Pattern
            </button>
            <button
              onClick={() => setView('linear')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                view === 'linear'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <LayoutList className="w-5 h-5" />
              Linear Pattern
            </button>
          </div>

          {/* Color Filters */}
          <div className="mb-8">
            <ColorFilters
              selectedFilter={filter}
              onFilterChange={setFilter}
            />
          </div>

          {/* Pattern Display */}
          <div className="mb-8">
            {videoUrl ? (
              <>
                <div className="mb-4">
                  {view === 'miny' ? (
                    <HexagonalBarcodeGenerator
                      videoUrl={videoUrl}
                      canvasRef={canvasRef}
                      colorFilter={filter}
                    />
                  ) : (
                    <LinearBarcodeGenerator
                      videoUrl={videoUrl}
                      canvasRef={canvasRef}
                      colorFilter={filter}
                    />
                  )}
                </div>
                <div className="flex justify-center">
                  <SocialShare canvasRef={canvasRef} />
                </div>
              </>
            ) : (
              <div className="aspect-video bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-400">
                Upload a video to generate its color pattern
              </div>
            )}
          </div>

          {/* Mixtape Cards */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700/50 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Create Your MINY Mixtape</h3>
              <p className="text-gray-300">Choose your preferred platform to start creating</p>
            </div>
            <MixtapeCards />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;