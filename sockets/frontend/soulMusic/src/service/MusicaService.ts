import axiosInstance from "./index";

class MusicaService {
  private static baseUrl = "/musica";

  static async downloadMusica() {
    try {
      const response = await axiosInstance.get(`http://10.25.2.165:3000/download/`, {
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
      const response = await axiosInstance.get(`http://10.25.2.165:3000/imagem/`);
      return response;
    } catch (error) {
      console.error("Erro ao baixar imagem da música:", error);
      throw error;
    }
  }
}

export default MusicaService;
