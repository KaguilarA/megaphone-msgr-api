export default async (_req, res) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500); // Max 2.5s de espera

  try {
    const response = await fetch(
      "https://countriesnow.space/api/v0.1/countries/codes",
      {
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error en API de países: ${response.status}`);
    }

    const result = await response.json();

    const countries = result.data
      .map((c) => ({
        code: c.code,
        idd: c.dial_code,
      }))
      .filter((c) => c.idd && c.code)
      .sort((a, b) => a.code.localeCompare(b.code));

    res.status(200).json(countries);
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("API de países falló o expiró. Cargando lista de respaldo.");

    res.status(200).json([
      { code: "CR", idd: "+506" },
      { code: "US", idd: "+1" },
      { code: "MX", idd: "+52" },
      { code: "ES", idd: "+34" },
      { code: "AR", idd: "+54" },
      { code: "CO", idd: "+57" },
    ]);
  }
};