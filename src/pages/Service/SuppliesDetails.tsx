import { destructure } from "@solid-primitives/destructure";
import { Tables } from "@/supabase";
import { windowSize } from "@/utils";
import { For, Show } from "solid-js";

import _css from "../Service.module.css";

type SuppliesDetails = {
    registros: Array<Tables<"RegistroAplicacion"> & {
        Productos: Maybe<Tables<"Productos">>
    }>;
}

type Supply = {
    nombre: string;
    ingrediente: string;
    presentacion: string;
    tipo: string | null;
    cantidad: number | null;
    unidad: string | null;
}

function updateUsedProduct(_item: Supply) {

}

export function SuppliesDetails(props: SuppliesDetails) {
    const { registros } = destructure(props);
    if (!registros()?.length) {
        return (
            <section class="no-contact">
                <h1 class="title has-text-centered">Sin suministros asignados 🔎</h1>
                <br />
                <h2 class="subtitle has-text-centered">No se encontró equipo asignado a este servicio.</h2>
            </section>
        );
    }

    const suministros = props.registros.map((r) => ({
        nombre: r.Productos?.nombre || "N/A",
        cantidad: r.cantidad,
        unidad: r.unidad,

        ingrediente: r.Productos?.ingrediente_activo || "N/A",
        presentacion: r.Productos?.presentacion || "N/A",
        tipo: r.tipo_aplicacion,
    }));

    return (
        <table class="table is-striped" style={{ width: "100%", height: "65vh" }}>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Tipo</th>
                    <Show when={windowSize.width > 550}>
                        <th>Presentación</th>
                        <th>Ingrediente</th>
                        <th>Reportar</th>
                    </Show>
                </tr>
            </thead>

            <tbody>
                <For each={suministros}>{SupplyDetail}</For>
            </tbody>
        </table>
    );
}

/**
     * Render function for a supply detail item
     * @param item The supply info to be rendered
     * @param index The index for the supply
     * @returns A JSX rendered supply item
    */
function SupplyDetail(item: Supply) {
    return (
        <>
            <tr>
                <td>{item.nombre}</td>
                <td>{item.cantidad} {item.unidad}</td>
                <td>{item.tipo}</td>

                <Show when={windowSize.width > 550}>
                    <td>{item.presentacion}</td>
                    <td>{item.ingrediente}</td>

                    <td style={{ "text-align-last": "center", "vertical-align": "baseline" }}>
                        <div title="Editar" onClick={() => updateUsedProduct(item)}>
                            <span class="icon is-left" style={{ cursor: "pointer" }}>
                                <i class="fas fa-check-to-slot fa-lg has-text-warning" aria-hidden="true" />
                            </span>
                        </div>

                    </td>
                </Show>
            </tr>

            {/* <Show when={windowSize.width <= 550}>
                <tr>
                    <td colSpan={3}>
                        <div class="is-flex is-justify-content-space-around">
                            <div title="Editar" onClick={() => editSugerencia(index)}>
                                <span class="icon is-left" style={{ cursor: "pointer" }}>
                                    <i class="fas fa-edit fa-lg has-text-warning" aria-hidden="true" />
                                </span>
                            </div>

                            <div title="Borrar" onClick={() => deleteSuggestion(index)}>
                                <span class="icon is-left" style={{ cursor: "pointer" }}>
                                    <i class="fas fa-trash-can fa-lg has-text-danger" aria-hidden="true" />
                                </span>
                            </div>

                            <div title="Foto" onClick={() => setShowPreview(true)}>
                                <span class="icon is-left" style={{ cursor: "pointer" }}>
                                    <i class={classNames("fas fa-lg",
                                        item.imagen ? "fa-image" : "fa-eye-slash",
                                        item.imagen ? "has-text-info" : "has-text-grey"
                                    )}
                                        aria-hidden="true"
                                    />
                                </span>
                            </div>
                        </div>
                    </td>
                </tr>
            </Show> */}
        </>
    );
}