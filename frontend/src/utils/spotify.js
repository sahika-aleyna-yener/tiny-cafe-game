import { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/spotify-callback';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'user-read-email',
  'user-read-private'
].join(' ');

export function useSpotify(language = 'tr') {
  const [accessToken, setAccessToken] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    // Check if we have a token from backend
    checkToken();
  }, []);

  useEffect(() => {
    if (accessToken && !deviceId) {
      initializePlayer();
    }
  }, [accessToken]);

  const checkToken = async () => {
    try {
      const res = await fetch(`${API}/spotify/token`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const { access_token } = await res.json();
        setAccessToken(access_token);
      }
    } catch (err) {
      console.error('Failed to check Spotify token:', err);
    }
  };

  const login = () => {
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${SPOTIFY_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(SCOPES)}`;
    
    window.location.href = authUrl;
  };

  const initializePlayer = () => {
    if (!window.Spotify) {
      // Load Spotify SDK
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Tiny Café Player',
        getOAuthToken: cb => { cb(accessToken); },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Spotify player ready with device ID:', device_id);
        setDeviceId(device_id);
      });

      player.addListener('player_state_changed', state => {
        if (state) {
          setCurrentTrack(state.track_window.current_track);
          setIsPlaying(!state.paused);
        }
      });

      player.connect();
    };
  };

  const getCurrentlyPlaying = async () => {
    if (!accessToken) return null;

    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (res.ok && res.status === 200) {
        const data = await res.json();
        setCurrentTrack(data.item);
        setIsPlaying(data.is_playing);
        return data;
      }
    } catch (err) {
      console.error('Failed to get currently playing:', err);
    }
    return null;
  };

  const play = async (uris = null) => {
    if (!accessToken) return;

    try {
      const endpoint = deviceId 
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : 'https://api.spotify.com/v1/me/player/play';

      const body = uris ? JSON.stringify({ uris }) : undefined;

      await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body
      });

      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play:', err);
      toast.error(language === 'tr' ? 'Çalma başarısız' : 'Play failed');
    }
  };

  const pause = async () => {
    if (!accessToken) return;

    try {
      await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      setIsPlaying(false);
    } catch (err) {
      console.error('Failed to pause:', err);
    }
  };

  const skipToNext = async () => {
    if (!accessToken) return;

    try {
      await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
    } catch (err) {
      console.error('Failed to skip:', err);
    }
  };

  const skipToPrevious = async () => {
    if (!accessToken) return;

    try {
      await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
    } catch (err) {
      console.error('Failed to skip back:', err);
    }
  };

  const setVolume = async (volumePercent) => {
    if (!accessToken) return;

    try {
      await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
    } catch (err) {
      console.error('Failed to set volume:', err);
    }
  };

  const searchTracks = async (query) => {
    if (!accessToken) return [];

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (res.ok) {
        const data = await res.json();
        return data.tracks.items;
      }
    } catch (err) {
      console.error('Failed to search:', err);
    }
    return [];
  };

  const getRecommendations = async (genres = ['study', 'chill', 'lo-fi']) => {
    if (!accessToken) return [];

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/recommendations?seed_genres=${genres.join(',')}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (res.ok) {
        const data = await res.json();
        return data.tracks;
      }
    } catch (err) {
      console.error('Failed to get recommendations:', err);
    }
    return [];
  };

  return {
    isConnected: !!accessToken,
    currentTrack,
    isPlaying,
    login,
    play,
    pause,
    skipToNext,
    skipToPrevious,
    setVolume,
    searchTracks,
    getRecommendations,
    getCurrentlyPlaying,
  };
}

export function SpotifyPlayer({ language = 'tr' }) {
  const spotify = useSpotify(language);
  const [volume, setVolumeState] = useState(50);

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolumeState(newVolume);
    spotify.setVolume(newVolume);
  };

  if (!spotify.isConnected) {
    return (
      <div className="bg-[#F5E6D3] rounded-xl border-2 border-[#D4C4A8] p-4 text-center">
        <Music className="w-12 h-12 mx-auto mb-3 text-[#8B6B4D]" />
        <p className="text-sm text-[#8B6B4D] mb-3">
          {language === 'tr' 
            ? 'Spotify ile dinle' 
            : 'Listen with Spotify'}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={spotify.login}
          className="px-4 py-2 bg-[#1DB954] text-white rounded-lg font-bold"
        >
          {language === 'tr' ? 'Spotify\'a Bağlan' : 'Connect Spotify'}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-xl border-2 border-[#D4C4A8] p-4 text-white shadow-lg">
      {spotify.currentTrack ? (
        <div>
          <div className="flex items-center gap-3 mb-3">
            {spotify.currentTrack.album?.images?.[0] && (
              <img 
                src={spotify.currentTrack.album.images[0].url} 
                alt={spotify.currentTrack.name}
                className="w-12 h-12 rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{spotify.currentTrack.name}</p>
              <p className="text-sm text-white/80 truncate">
                {spotify.currentTrack.artists?.map(a => a.name).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={spotify.skipToPrevious}
              className="p-2 hover:bg-white/20 rounded-full"
            >
              <SkipBack className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={spotify.isPlaying ? spotify.pause : () => spotify.play()}
              className="p-3 bg-white text-[#1DB954] rounded-full"
            >
              {spotify.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={spotify.skipToNext}
              className="p-2 hover:bg-white/20 rounded-full"
            >
              <SkipForward className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1"
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <Music className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <p className="text-sm">
            {language === 'tr' 
              ? 'Spotify\'da bir şey çal' 
              : 'Play something on Spotify'}
          </p>
        </div>
      )}
    </div>
  );
}
