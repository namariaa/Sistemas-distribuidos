import "./style.css";
import Logo from "../assets/marca-branca.svg";
import React, { useState, useRef, useEffect } from "react";
import diskImage from "./assets/disk.png";
import capa from "./assets/capa.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  type IconDefinition,
  faImage,
  faPause,
  faVolumeHigh,
  faVolumeMute,
  faVolumeDown,
} from "@fortawesome/free-solid-svg-icons";
import type { MusicaModel } from "./interfaces/musica";
import MusicaService from "../service/MusicaService";
import Forms from "./forms";

const Musica: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [lastVolume, setLastVolume] = useState(1);
  const [infoMusica, setInfoMusica] = useState<MusicaModel>();
  const [iconMusicActive, setIconMusicActive] = useState(faVolumeHigh);
  const [CurrentMusic, setCurrentMusic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  function getIconFromVolume(value: number): IconDefinition {
    if (value > 0.5) {
      return faVolumeHigh;
    } else if (value > 0 && value <= 0.5) {
      return faVolumeDown;
    }
    return faVolumeMute;
  }

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    setIconMusicActive(getIconFromVolume(newVolume));

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }

    if (newVolume > 0) {
      setLastVolume(newVolume);
    }
  };

  const toggleButtonVolume = () => {
    if (volume > 0) {
      setLastVolume(volume);
      setVolume(0);
      setIconMusicActive(faVolumeMute);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    } else {
      setVolume(lastVolume);
      setIconMusicActive(getIconFromVolume(lastVolume));
      if (audioRef.current) {
        audioRef.current.volume = lastVolume;
      }
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  async function getMusica() {
    try {
      setIsLoading(true);

      const musicaResponse = await MusicaService.downloadMusica();
      console.log(musicaResponse);

      const videoBlob = new Blob([musicaResponse.data], { type: "video/mp4" });
      const videoUrl = URL.createObjectURL(videoBlob);
      setCurrentMusic(videoUrl);
      setInfoMusica({
        nomeMusica: musicaResponse.headers["nome_musica"],
        nomeAutor: musicaResponse.headers["nome_autor"],
      });
    } catch (error) {
      console.error("Erro ao carregar música ou vídeo:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (infoMusica == undefined) {
      getMusica();
    }
  }, [infoMusica]);

  return (
    <div className="foto-section">
      <div className="scroll-container">
        <section
          className="section"
          style={{ backgroundColor: "#1D203E" }}
          id="musica"
        >
          <header className="header">
            <div className="logo">
              <img src={Logo} alt="Logo" />
            </div>
          </header>
          <Forms />
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}

          <div className="musica-container">
            <div className="disco-container">
              <img
                src={diskImage}
                alt="Disco de vinil"
                className={`disco-imagem ${isPlaying ? "playing" : ""}`}
              />
            </div>
            <div className="capa-container">
              {infoMusica?.imagem ? (
                <img src={capa} alt="Capa do álbum" className="capa-imagem" />
              ) : (
                <div className="placeholder-imagem">
                  <img src={capa} alt="Capa do álbum" className="capa-imagem" />
                </div>
              )}
            </div>
            <div className="musica-informacoes">
              <h1 className="musica-titulo">
                {infoMusica?.nomeMusica ?? "Carregando música..."}
              </h1>
              <p className="musica-artista">
                {infoMusica?.nomeAutor ?? "Carregando artista..."}
              </p>
              <div className="controls-container">
                <button
                  className="play-pause-button"
                  onClick={togglePlayPause}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon
                    icon={isPlaying ? faPause : faPlay}
                    style={{ color: "black", fontSize: "20px" }}
                  />
                </button>
                <div className="volume-control">
                  <button
                    className="volume-button"
                    onClick={toggleButtonVolume}
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon
                      icon={iconMusicActive}
                      style={{ color: "black", fontSize: "20px" }}
                    />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                    style={{ "--value": volume } as React.CSSProperties}
                    disabled={isLoading}
                  />
                </div>
              </div>
              {CurrentMusic && <audio ref={audioRef} src={CurrentMusic} />}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Musica;
