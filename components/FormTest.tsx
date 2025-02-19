"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const Titular = z.object({
  nombreTitular: z.string().min(1, {
    message: "El nombre del titular debe tener al menos 1 caracter",
  }),
  porcentajeTitular: z
    .number()
    .min(0, { message: "El porcentaje del titular debe ser mayor a 0" })
    .max(100, { message: "El porcentaje del titular debe ser menor a 100" }),
});

const Marca = z.object({
  denominacion: z.string().min(1, {
    message: "La denominación de la marca debe tener al menos 1 caracter",
  }),
  tipo: z
    .string()
    .min(1, { message: "El tipo de la marca debe tener al menos 1 caracter" }),
  clase: z
    .number()
    .gte(1, { message: "La clase de la marca debe ser mayor a 0" })
    .lte(45, { message: "La clase de la marca debe ser menor a 45" }),
});

enum TipoPersona {
  FISICA = "FISICA",
  JURIDICA = "JURIDICA",
}

const PersonaSchema = z.object({
  idCliente: z
    .number()
    .gte(1, { message: "El id del cliente debe ser mayor a 0" }),
  idFirmante: z
    .number()
    .gte(1, { message: "El id del firmante debe ser mayor a 0" }),
  titulares: Titular.array().min(1, {
    message: "Debe haber al menos un titular",
  }),
  marcas: Marca.array().min(1, { message: "Debe haber al menos una marca" }),
  tipoPersona: z.nativeEnum(TipoPersona),
  nombreJuridico: z.string().optional(),
  file: z
    .any()
    .refine(
      (file) =>
        file.length == 1
          ? ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
              file?.[0]?.type
            )
            ? true
            : false
          : true,
      "Invalid file. choose either JPEG or PNG image"
    )
    .refine(
      (file) =>
        file.length == 1 ? (file[0]?.size <= 2000000 ? true : false) : true,
      "Max file size allowed is 8MB."
    ),
});

const SchemaRefinado = PersonaSchema.superRefine((data, ctx) => {
  if (data.tipoPersona === TipoPersona.JURIDICA && !data.nombreJuridico) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El nombre jurídico es requerido para personas morales",
      path: ["nombreJuridico"],
    });
  }
});

export default function FormTest() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SchemaRefinado),
    mode: "onChange",
    defaultValues: {
      idCliente: 1,
      idFirmante: 1,
      titulares: [{ nombreTitular: "", porcentajeTitular: undefined }],
      marcas: [{ denominacion: "", tipo: "", clase: undefined }],
      tipoPersona: TipoPersona.FISICA,
    },
  });

  const tipoPersona = watch("tipoPersona");

  const onSubmit = (data: any) => {
    console.log("Submitted Data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-4">
      {/* Selección del Tipo de Persona */}
      {tipoPersona === TipoPersona.FISICA && "Física"}
      {tipoPersona === TipoPersona.JURIDICA && "Juridica"}
      <div className="mb-4">
        <label htmlFor="tipoPersona" className="block mb-1 font-medium">
          Tipo de Persona
        </label>
        <select
          id="tipoPersona"
          {...register("tipoPersona")}
          className="w-full p-2 border rounded"
        >
          <option value={TipoPersona.FISICA}>Física</option>
          <option value={TipoPersona.JURIDICA}>Jurídica</option>
        </select>
        {errors.tipoPersona && (
          <p className="text-red-500 text-sm">{errors.tipoPersona.message}</p>
        )}
      </div>

      {/* Campos comunes */}
      <div className="mb-4">
        <label htmlFor="idCliente" className="block mb-1 font-medium">
          ID Cliente
        </label>
        <input
          type="number"
          id="idCliente"
          {...register("idCliente", { valueAsNumber: true })}
          className="w-full p-2 border rounded"
        />
        {errors.idCliente && (
          <p className="text-red-500 text-sm">{errors.idCliente.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="idFirmante" className="block mb-1 font-medium">
          ID Firmante
        </label>
        <input
          type="number"
          id="idFirmante"
          {...register("idFirmante", { valueAsNumber: true })}
          className="w-full p-2 border rounded"
        />
        {errors.idFirmante && (
          <p className="text-red-500 text-sm">{errors.idFirmante.message}</p>
        )}
      </div>

      {/* Ejemplo de campos comunes adicionales: Titulares y Marcas */}
      <div className="mb-4">
        <label
          htmlFor="titulares.0.nombreTitular"
          className="block mb-1 font-medium"
        >
          Nombre Titular
        </label>
        <input
          type="text"
          id="titulares.0.nombreTitular"
          {...register("titulares.0.nombreTitular")}
          className="w-full p-2 border rounded"
        />
        {errors.titulares?.[0]?.nombreTitular && (
          <p className="text-red-500 text-sm">
            {errors.titulares[0].nombreTitular.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="titulares.0.porcentajeTitular"
          className="block mb-1 font-medium"
        >
          Porcentaje Titular
        </label>
        <input
          type="number"
          id="titulares.0.porcentajeTitular"
          step="0.01"
          {...register("titulares.0.porcentajeTitular", {
            valueAsNumber: true,
          })}
          className="w-full p-2 border rounded"
        />
        {errors.titulares?.[0]?.porcentajeTitular && (
          <p className="text-red-500 text-sm">
            {errors.titulares[0].porcentajeTitular.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="marcas.0.denominacion"
          className="block mb-1 font-medium"
        >
          Denominación de la Marca
        </label>
        <input
          type="text"
          id="marcas.0.denominacion"
          {...register("marcas.0.denominacion")}
          className="w-full p-2 border rounded"
        />
        {errors.marcas?.[0]?.denominacion && (
          <p className="text-red-500 text-sm">
            {errors.marcas[0].denominacion.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="marcas.0.tipo" className="block mb-1 font-medium">
          Tipo de Marca
        </label>
        <input
          type="text"
          id="marcas.0.tipo"
          {...register("marcas.0.tipo")}
          className="w-full p-2 border rounded"
        />
        {errors.marcas?.[0]?.tipo && (
          <p className="text-red-500 text-sm">
            {errors.marcas[0].tipo.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="marcas.0.clase" className="block mb-1 font-medium">
          Clase de la Marca
        </label>
        <input
          type="number"
          id="marcas.0.clase"
          {...register("marcas.0.clase", { valueAsNumber: true })}
          className="w-full p-2 border rounded"
        />
        {errors.marcas?.[0]?.clase && (
          <p className="text-red-500 text-sm">
            {errors.marcas[0].clase.message}
          </p>
        )}
      </div>

      {tipoPersona === TipoPersona.JURIDICA && (
        <div className="mb-4">
          <label htmlFor="nombre" className="block mb-1 font-medium">
            Nombre (Persona Jurídica)
          </label>
          <input
            type="text"
            id="nombre"
            {...register("nombreJuridico")}
            className="w-full p-2 border rounded"
          />
          {errors.nombreJuridico && (
            <p className="text-red-500 text-sm">
              {errors.nombreJuridico.message}
            </p>
          )}
        </div>
      )}

      <input type="file" accept="image/png, image/jpeg" {...register("file")} />
      {errors.file && (
        <p className="text-red-500 text-sm">
          {errors.file.message?.toString()}
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Enviar
      </button>
    </form>
  );
}
