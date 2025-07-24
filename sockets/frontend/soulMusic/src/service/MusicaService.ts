import axiosInstance from "./index";

class MusicaService {
  private static baseUrl = "/musica";

  static async downloadMusica() {
    try {
      const response = await axiosInstance.get(`http://localhost:3000/download/`, {
        responseType: "blob",
      });
      return response;
    } catch (error) {
      console.error("Erro ao baixar música:", error);
      throw error;
    }
  }

  static async getMusicaImagem() {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/imagem/`);
      return response;
    } catch (error) {
      console.error("Erro ao baixar imagem da música:", error);
      throw error;
    }
  }
}

export default MusicaService;
