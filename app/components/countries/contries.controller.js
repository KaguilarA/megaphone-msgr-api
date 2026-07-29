import { countries } from "country-codes-flags-phone-codes";

export default async (_req, res) => {
  try {

    const countriesData = countries
      .map((c) => ({
        code: c.code,
        idd: c.dialCode,
      }))
      .filter((c) => c.idd && c.code)
      .sort((a, b) => a.code.localeCompare(b.code));

    res.status(200).json(countriesData);
  } catch (error) {
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