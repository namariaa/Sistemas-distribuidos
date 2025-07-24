import "./style.css";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object().shape({
  musica: yup.string().required(),
  artista: yup.string().required(),
  link: yup.string().required(),
});

function Forms() {
  const Conferir = async (data: {
    musica: string;
    artista: string;
    link: string;
  }) => {
      try {
      const res = await fetch("http://10.25.2.165:3000/save-music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({
          musica: data.musica,
          artista: data.artista,
          link: data.link
        }),
    });

    const text = await res.text();
    console.log("Texto",text);
    } catch (error) {
      console.error("Erro ao chamar gateway:", error);
    }
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  return (
    <section>
      <div className="conteudo">
        <form onSubmit={handleSubmit(Conferir)}>
          <div className="cartao">
            <h2>Escolha uma música</h2>

            <div className="br-input small" style={{ paddingTop: "15px" }}>
              <div className="input-group">
                <input
                  className="small"
                  id="musica"
                  type="text"
                  placeholder="Nome música"
                  {...register("musica")}
                />
                {errors.musica?.message !== undefined && (
                  <div className="mb-3">
                    <span className="feedback danger" role="alert">
                      <i className="fas fa-times-circle" aria-hidden="true"></i>
                      Coloque o nome da música
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="br-input small" style={{ paddingTop: "15px" }}>
              <div className="input-group">
                <input
                  className="small"
                  type="text"
                  id="artista"
                  placeholder="Nome do artista"
                  {...register("artista")}
                />

                {errors.artista?.message !== undefined && (
                  <div className="mb-3">
                    <span className="feedback danger" role="alert">
                      <i className="fas fa-times-circle" aria-hidden="true"></i>
                      Coloque o nome do artista
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="br-input small" style={{ paddingTop: "15px" }}>
              <div className="input-group">
                <input
                  className="small"
                  type="url"
                  id="link"
                  placeholder="Link do youtube da música"
                  {...register("link")}
                  style={{ color: "#6a5acd" }}
                />

                {errors.link?.message !== undefined && (
                  <div className="mb-3">
                    <span className="feedback danger" role="alert">
                      <i className="fas fa-times-circle" aria-hidden="true"></i>
                      Coloque o link da música
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              className="br-button block primary mb-3"
              style={{ top: "30px", backgroundColor: "#6a5acd" }}
            >
              Escutar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Forms;
