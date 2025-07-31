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
  faStepBackward
} from "@fortawesome/free-solid-svg-icons";
import Forms from "./forms";

interface MusicaNaFila {
  id: string;
  musica: string;
  artista: string;
  link: string;
}

const Musica: React.FC = () => {
  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  // Estados da playlist
  const [playlist, setPlaylist] = useState<MusicaNaFila[]>([]);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Adiciona música à fila (chamado pelo Forms)
  const adicionarNaFila = (novaMusica: Omit<MusicaNaFila, 'id'>) => {
    const musicaComId = {
      ...novaMusica,
      id: Date.now().toString() // ID único simples
    };
    
    setPlaylist(prev => [...prev, musicaComId]);
    
    // Se for a primeira música, já começa a tocar
    if (playlist.length === 0) {
      setCurrentMusicIndex(0);
    }
  };

  // Controles do player
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    
    const nextIndex = (currentMusicIndex + 1) % playlist.length;
    setCurrentMusicIndex(nextIndex);
  };

  const playPrevious = () => {
    if (playlist.length === 0) return;
    
    const prevIndex = (currentMusicIndex - 1 + playlist.length) % playlist.length;
    setCurrentMusicIndex(prevIndex);
  };

  // Efeito para carregar a música atual
  useEffect(() => {
    if (playlist.length === 0 || !audioRef.current) return;
    
    const musicaAtual = playlist[currentMusicIndex];
    setIsLoading(true);
    
    // Aqui você pode processar o link do YouTube se necessário
    // Por enquanto, vamos usar o link diretamente (assumindo que já é um link de áudio)
    audioRef.current.src = musicaAtual.link;
    
    if (isPlaying) {
      audioRef.current.play()
        .catch(error => console.error("Erro ao reproduzir:", error));
    }
    
    setIsLoading(false);
    
  }, [currentMusicIndex, playlist]);

  return (
    <div className="player-container">
      <Forms onMusicSubmit={adicionarNaFila} />
      
      {/* Player de Música */}
      <div className="music-player">
        {/* Disco e Capa */}
        <div className="cover-container">
          <img 
            src={diskImage} 
            alt="Vinil" 
            className={`vinyl ${isPlaying ? 'spinning' : ''}`} 
          />
          <img src={capa} alt="Capa" className="album-cover" />
        </div>
        
        {/* Informações da Música */}
        <div className="music-info">
          <h2>
            {playlist[currentMusicIndex]?.musica || "Nenhuma música na fila"}
          </h2>
          <p>
            {playlist[currentMusicIndex]?.artista || ""}
          </p>
        </div>
        
        {/* Controles */}
        <div className="controls">
          <button onClick={playPrevious} disabled={playlist.length === 0}>
            <FontAwesomeIcon icon={faStepBackward} />
          </button>
          
          <button 
            onClick={togglePlay} 
            disabled={playlist.length === 0 || isLoading}
          >
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
          
          <button onClick={playNext} disabled={playlist.length === 0}>
            <FontAwesomeIcon icon={faStepForward} />
          </button>
          
          <button onClick={toggleMute}>
            <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeHigh} />
          </button>
        </div>
        
        {/* Player de áudio invisível */}
        <audio 
          ref={audioRef} 
          onEnded={playNext}
          volume={volume}
        />
      </div>
      
      {/* Lista de Reprodução */}
      <div className="playlist">
        <h3>Fila de Reprodução ({playlist.length})</h3>
        <ul>
          {playlist.map((musica, index) => (
            <li 
              key={musica.id}
              className={index === currentMusicIndex ? 'active' : ''}
              onClick={() => setCurrentMusicIndex(index)}
            >
              {musica.musica} - {musica.artista}
              {index === currentMusicIndex && isLoading && " (carregando...)"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Musica;