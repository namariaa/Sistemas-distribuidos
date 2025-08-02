import "./style.css";
import React, { useState, useRef, useEffect } from "react";
import diskImage from "./assets/disk.png";
import capa from "./assets/capa.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeHigh,
  faVolumeMute,
  faStepForward,
  faStepBackward,
} from "@fortawesome/free-solid-svg-icons";
import Forms from "./forms";

interface MusicaNaFila {
  id: string;
  musica: string;
  artista: string;
  link: string;
}

const Musica: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playlist, setPlaylist] = useState<MusicaNaFila[]>([]);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const adicionarNaFila = async (novaMusica: Omit<MusicaNaFila, "id">) => {
    try {
      const response = await fetch('http://localhost:3000/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaMusica)
      });
      
      if (!response.ok) throw new Error('Falha ao adicionar música');
      
      const data = await response.json();
      const musicaComId = {
        ...novaMusica,
        id: data.id
      };

      setPlaylist(prev => [...prev, musicaComId]);
      
      if (playlist.length === 0) {
        setCurrentMusicIndex(0);
        carregarMusica(musicaComId);
      }
    } catch (error) {
      console.error("Erro ao adicionar música:", error);
    }
  };

  const carregarMusica = async (musica: MusicaNaFila) => {
    if (!audioRef.current) return;
    
    setIsLoading(true);
    try {
      const audio = audioRef.current;
      audio.src = `http://localhost:3000/music/${musica.id}/stream`;
      
      await new Promise((resolve, reject) => {
        audio.oncanplay = resolve;
        audio.onerror = reject;
        audio.load();
      });

      if (isPlaying) {
        await audio.play();
      }
    } catch (error) {
      console.error("Erro ao carregar música:", error);
      playNext();
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || playlist.length === 0) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Erro ao reproduzir:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const playNext = () => {
    if (playlist.length <= 1) return;
    const nextIndex = (currentMusicIndex + 1) % playlist.length;
    setCurrentMusicIndex(nextIndex);
  };

  const playPrevious = () => {
    if (playlist.length <= 1) return;
    const prevIndex = (currentMusicIndex - 1 + playlist.length) % playlist.length;
    setCurrentMusicIndex(prevIndex);
  };

  useEffect(() => {
    if (playlist.length === 0) return;
    carregarMusica(playlist[currentMusicIndex]);
  }, [currentMusicIndex, playlist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (playlist.length > 1) playNext();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [playlist]);

  return (
    <div className="player-container">
      <div className="player-content">
        {/* Seção Esquerda: Formulário e Disco */}
        <div className="left-section">
          <Forms onMusicSubmit={adicionarNaFila} />
          
          <div className="music-player">
            <div className="cover-container">
              <img
                src={diskImage}
                alt="Vinil"
                className={`vinyl ${isPlaying ? "spinning" : ""}`}
              />
              <img src={capa} alt="Capa" className="album-cover" />
            </div>

            <div className="music-info">
              <h2>{playlist[currentMusicIndex]?.musica || "Nenhuma música na fila"}</h2>
              <p>{playlist[currentMusicIndex]?.artista || ""}</p>
            </div>

            <div className="controls">
              <button onClick={playPrevious} disabled={playlist.length <= 1}>
                <FontAwesomeIcon icon={faStepBackward} />
              </button>

              <button
                onClick={togglePlay}
                disabled={playlist.length === 0 || isLoading}
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
              </button>

              <button onClick={playNext} disabled={playlist.length <= 1}>
                <FontAwesomeIcon icon={faStepForward} />
              </button>

              <button onClick={toggleMute}>
                <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeHigh} />
              </button>
            </div>
          </div>
        </div>

        {/* Seção Direita: Fila de Reprodução */}
        <div className="right-section">
          <div className="playlist">
            <h3>Fila de Reprodução ({playlist.length})</h3>
            <ul>
              {playlist.map((musica, index) => (
                <li
                  key={musica.id}
                  className={index === currentMusicIndex ? "active" : ""}
                  onClick={() => setCurrentMusicIndex(index)}
                >
                  {musica.musica} - {musica.artista}
                  {index === currentMusicIndex && isLoading && " (carregando...)"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        preload="auto"
        volume={volume}
      />
    </div>
  );
};

export default Musica;