import { destructure } from "@solid-primitives/destructure";
import { createSignal, For } from "solid-js";

import { classNames } from "@/utils";
import { Modal } from "@/components";
import { supabase, Tables } from "@/supabase";

import css from "./Service.module.css"

type SuppliesDetails = {
    registros: Array<Tables<"RegistroAplicacion"> & {
        Productos: Maybe<Tables<"Productos">>
    }>;
}

type Supply = {
    id: number;
    nombre: string;
    ingrediente: string;
    presentacion: string;
    registro: string;
    tipo: string;
    cantidad: number;
    unidad: string;
}

async function updateUsedProduct(item: Supply, cantidad: number) {
    if (isNaN(cantidad)) {
        return alert("Cantidad inválida")
    }

    const { status } = await supabase.from("RegistroAplicacion")
        .update({ cantidad })
        .eq("id", item.id);

    if (status === 204) {
        document.dispatchEvent(new Event("UpdateService"));
    } else {
        alert("No se pudo actualizar la cantidad usada");
    }
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
        registro: r.Productos?.registro || "N/A",
        nombre: r.Productos?.nombre || "N/A",
        cantidad: r.cantidad || 0,
        unidad: r.unidad || "N/A",
        id: r.id,

        ingrediente: r.Productos?.ingrediente_activo || "N/A",
        presentacion: r.Productos?.presentacion || "N/A",
        tipo: r.tipo_aplicacion || "N/A",
    }));

    return (
        <table class="table is-striped" style={{ width: "100%", height: "65vh" }}>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Info</th>
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
    const [cantidad, setCantidad] = createSignal(item.cantidad);
    const [showInfo, setShowInfo] = createSignal(false);
    const closeInfo = () => setShowInfo(false);

    return (
        <tr>
            <td onClick={() => setShowInfo(true)}
                class="has-text-link is-pointer"
                title={item.nombre}
            >
                {item.nombre}
            </td>
            <td>{item.cantidad} {item.unidad}</td>
            <td style={{ "text-align-last": "start", "vertical-align": "baseline" }}>
                <div title="Editar" onClick={() => setShowInfo(true)}>
                    <span class="icon is-left" style={{ cursor: "pointer" }}>
                        <i class="fas fa-circle-info fa-lg has-text-info" aria-hidden="true" />
                    </span>
                </div>
            </td>

            <Modal show={showInfo()} onClose={closeInfo}>
                <h1 class="title" style={{ "margin-bottom": "0.5rem" }}>{item.nombre}</h1>
                <h2>{item.registro}</h2>

                <form style={{ padding: "unset", "margin-top": "1rem", height: "auto" }}>
                    <div class={classNames("field is-grouped is-flex-direction-column hide_scroll scrollable", css.io_field)}>
                        <label class="label">Presentación</label>
                        <p class="control has-icons-left">
                            <input id="p_presentacion" disabled
                                value={item.presentacion}
                                class="input"
                                type="text"
                            />
                            <span class="icon is-medium is-left">
                                <i class="fas fa-boxes-packing" />
                            </span>
                        </p>

                        <label class="label">Ingrediente</label>
                        <p class="control has-icons-left">
                            <input id="p_ingrediente" disabled
                                value={item.ingrediente}
                                class="input"
                                type="text"
                            />
                            <span class="icon is-medium is-left">
                                <i class="fas fa-flask-vial has-text-success" />
                            </span>
                        </p>
                    </div>

                    <div class={classNames("field is-grouped is-flex-direction-column hide_scroll scrollable", css.io_field)}>
                        <label class="label">Tipo Aplicación</label>
                        <p class="control has-icons-left">
                            <input id="p_tipo" disabled
                                value={item.tipo}
                                class="input"
                                type="text"
                            />
                            <span class="icon is-medium is-left">
                                <i class="fas fa-vest-patches has-text-warning" />
                            </span>
                        </p>

                        <label class="label">Cantidad Utilizada</label>
                        <p class="control has-icons-left">
                            <input id="p_cantidad" required
                                onInput={(e) => setCantidad(e.target.valueAsNumber)}
                                value={cantidad()}
                                class="input"
                                type="number"
                                min={0}
                            />
                            <span class="icon is-medium is-left">
                                <i class="fas fa-pen-ruler has-text-info" />
                            </span>
                            <span class={css.units}>
                                {item.unidad}
                            </span>
                        </p>

                    </div>

                    <div class="field is-flex is-justify-content-center" style={{ gap: "5%", "margin-top": "5rem" }}>
                        <button style={{ width: "45%" }}
                            class="column button is-danger is-outlined"
                            onClick={closeInfo}
                            type="button"
                        >
                            <span>Cancelar</span>
                            <span class="icon">
                                <i class="fas fa-xmark" />
                            </span>
                        </button>

                        <button style={{ width: "45%" }}
                            onClick={() => updateUsedProduct(item, cantidad()).then(closeInfo)}
                            class="column button is-success is-outlined"
                            type="button"
                        >
                            <span>Guardar</span>
                            <span class="icon">
                                <i class="fas fa-circle-plus" />
                            </span>
                        </button>
                    </div>
                </form>
            </Modal>
        </tr>
    );
}