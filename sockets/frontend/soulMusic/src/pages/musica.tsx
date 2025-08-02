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

  // Função para buscar a playlist atualizada
  const fetchPlaylist = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/musica/');
      if (!response.ok) throw new Error('Falha ao buscar playlist');
      const data = await response.json();
      setPlaylist(data.map((item: any) => ({
        id: item.id.toString(),
        musica: item.nome,
        artista: item.autor,
        link: item.link
      })));
    } catch (error) {
      console.error("Erro ao buscar playlist:", error);
    }
  };

  // Carrega a playlist inicial
  useEffect(() => {
    fetchPlaylist();
  }, []);

  const adicionarNaFila = async (novaMusica: Omit<MusicaNaFila, "id">) => {
    try {
      const response = await fetch('http://localhost:3000/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaMusica)
      });
      
      if (!response.ok) throw new Error('Falha ao adicionar música');
      
      // Atualiza a playlist após adicionar nova música
      await fetchPlaylist();
    } catch (error) {
      console.error("Erro ao adicionar música:", error);
    }
  };

  const carregarMusica = async (musica: MusicaNaFila) => {
    if (!audioRef.current) return;
    
    setIsLoading(true);
    try {
      const audio = audioRef.current;
      
      // Limpa o src atual para forçar recarregamento
      audio.src = '';
      
      // Cria um objeto URL para o stream de áudio
      const audioUrl = `http://localhost:8000/api/musica/${musica.id}/download/`;
      audio.src = audioUrl;
      
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

  const togglePlay = async () => {
    if (!audioRef.current || playlist.length === 0) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        // Se não há música carregada ou é uma música diferente, carrega a atual
        if (!audioRef.current.src || 
            audioRef.current.src !== `http://localhost:8000/api/musica/${playlist[currentMusicIndex].id}/download/`) {
          await carregarMusica(playlist[currentMusicIndex]);
        }
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Erro ao controlar reprodução:", error);
    }
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
    carregarMusica(playlist[nextIndex]);
    if (isPlaying) {
      audioRef.current?.play().catch(console.error);
    }
  };

  const playPrevious = () => {
    if (playlist.length <= 1) return;
    const prevIndex = (currentMusicIndex - 1 + playlist.length) % playlist.length;
    setCurrentMusicIndex(prevIndex);
    carregarMusica(playlist[prevIndex]);
    if (isPlaying) {
      audioRef.current?.play().catch(console.error);
    }
  };

  // Atualiza a música quando o índice muda
  useEffect(() => {
    if (playlist.length > 0) {
      carregarMusica(playlist[currentMusicIndex]);
    }
  }, [currentMusicIndex]);

  // Configura o listener para quando a música terminar
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => playNext();
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playlist, currentMusicIndex]);

  return (
    <div className="player-container">
      <div className="player-content">
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
        preload="none"
        volume={volume}
      />
    </div>
  );
};

export default Musica;