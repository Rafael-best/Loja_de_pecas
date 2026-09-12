(() => {

    const searchForm =
      document.getElementById(
        "headerSearchForm"
      );
  
  
    const searchInput =
      document.getElementById(
        "headerSearchInput"
      );
  
  
    const mobileSearchInput =
      document.getElementById(
        "mobileSearchInput"
      );
  
  
    const vehicleForm =
      document.getElementById(
        "vehicleForm"
      );
  
  
  
    /* =========================
       BUSCA
    ========================= */
  
    function buscarProduto(
      termo
    ) {
  
      const valor =
        String(
          termo || ""
        ).trim();
  
  
      if (!valor) {
  
        window.location.href =
          "produtos.html";
  
        return;
  
      }
  
  
      window.location.href =
  
        `produtos.html?busca=${
          encodeURIComponent(
            valor
          )
        }`;
  
    }
  
  
  
    searchForm?.addEventListener(
  
      "submit",
  
      (event) => {
  
        event.preventDefault();
  
  
        buscarProduto(
  
          searchInput?.value
  
        );
  
      }
  
    );
  
  
  
    mobileSearchInput
      ?.addEventListener(
  
        "keydown",
  
        (event) => {
  
          if (
            event.key ===
            "Enter"
          ) {
  
            event.preventDefault();
  
  
            buscarProduto(
  
              mobileSearchInput
                .value
  
            );
  
          }
  
        }
  
      );
  
  
  
    /* =========================
       BUSCA POR VEÍCULO
    ========================= */
  
    vehicleForm?.addEventListener(
  
      "submit",
  
      (event) => {
  
        event.preventDefault();
  
  
        const marca =
  
          document
            .getElementById(
              "vehicleBrand"
            )
            ?.value
          || "";
  
  
        const modelo =
  
          document
            .getElementById(
              "vehicleModel"
            )
            ?.value
          || "";
  
  
        const ano =
  
          document
            .getElementById(
              "vehicleYear"
            )
            ?.value
          || "";
  
  
        const params =
  
          new URLSearchParams();
  
  
  
        if (marca) {
  
          params.set(
            "marca",
            marca
          );
  
        }
  
  
        if (modelo) {
  
          params.set(
            "modelo",
            modelo
          );
  
        }
  
  
        if (ano) {
  
          params.set(
            "ano",
            ano
          );
  
        }
  
  
        const query =
          params.toString();
  
  
        if (query) {
  
          window.location.href =
  
            `produtos.html?${query}`;
  
        }
        else {
  
          window.location.href =
  
            "produtos.html";
  
        }
  
      }
  
    );
  
  })();