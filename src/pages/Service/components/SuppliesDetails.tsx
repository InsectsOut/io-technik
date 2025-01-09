import { destructure } from "@solid-primitives/destructure";
import { createSignal, For, onCleanup, onMount } from "solid-js";

import { classNames, DeviceType, deviceType } from "@/utils";
import { getSimpleUnit } from "../Service.utils";
import { supabase, Tables } from "@/supabase";
import { Modal } from "@/components";

import css from "../Service.module.css"

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
    cantidad_usada: number,
    unidad: string;
    dosis_min: string;
    dosis_max: string;
}

async function updateUsedProduct(item: Supply, cantidad: number) {
    if (isNaN(cantidad)) {
        return alert("Cantidad inválida");
    }

    const { status } = await supabase
        .from("RegistroAplicacion")
        .update({ cantidad_usada: cantidad })
        .eq("id", item.id);

    if (status === 204) {
        document.dispatchEvent(new Event("UpdateService"));
    } else {
        alert("No se pudo actualizar la cantidad usada");
    }
}

/**
 * Component that shows the supplies details tab
 * @param props The supplies props to be rendered
 * @returns A `JSX` element that lists the supplies
 */
export function SuppliesDetails(props: SuppliesDetails) {
    const { registros } = destructure(props);
    if (!registros()?.length) {
        return (
            <section class="no-contact" style={{ height: "65vh", "margin-bottom": "1rem" }}>
                <h1 class="title has-text-centered">Sin suministros asignados 🔎</h1>
                <br />
                <h2 class="subtitle has-text-centered">No se encontró equipo asignado a este servicio.</h2>
            </section>
        );
    }

    const suministros = props.registros.map((r) => ({
        dosis_min: r.Productos?.dosis_min || "0",
        dosis_max: r.Productos?.dosis_max || "0",
        cantidad_usada: r.cantidad_usada || 0,

        registro: r.Productos?.registro || "Sin registro",
        nombre: r.Productos?.nombre || "N/A",
        cantidad: r.cantidad || 0,
        unidad: r.unidad || "unidades",
        id: r.id,

        ingrediente: r.Productos?.ingrediente_activo || "N/A",
        presentacion: r.Productos?.presentacion || "N/A",
        tipo: r.tipo_aplicacion || "N/A",
    }));

    return (
        <table class="table is-striped" style={{ width: "100%", height: "65vh" }}>
            <thead>
                <tr class={css.slim_pad}>
                    <th class="no-pad-left">Nombre</th>
                    <th>Cantidad</th>
                    <th class="has-text-centered">Delta</th>
                    <th class="has-text-centered no-pad-right">Editar</th>
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
    const [cantidad, setCantidad] = createSignal(item.cantidad_usada || item.cantidad);
    const delta = () => item.cantidad_usada - item.cantidad;
    const [showInfo, setShowInfo] = createSignal(false);
    const simpleUnit = () => getSimpleUnit(item.unidad);
    const closeInfo = () => setShowInfo(false);

    function handleEnterKey(e: KeyboardEvent) {
        if (e.key === "Enter") {
            updateUsedProduct(item, cantidad()).then(closeInfo);
        }
    }

    // Saves the updated supply details on Enter keydown
    onMount(() => document.addEventListener("keydown", handleEnterKey));
    onCleanup(() => document.addEventListener("keydown", handleEnterKey));

    return (
        <tr class={css.slim_pad}>
            <td class="no-pad-left">
                <span onClick={() => setShowInfo(true)}
                    class="has-text-link is-pointer"
                    title={item.nombre}
                >
                    {item.nombre}
                </span>
            </td>

            <td>
                <div class="has-text-info" style={{ "margin-bottom": "0.5rem" }}>
                    Sugerido: {item.cantidad} {simpleUnit()}
                </div>
                <div>Usado: {item.cantidad_usada} {simpleUnit()}</div>
            </td>

            <td style={{ "text-align-last": "center", "vertical-align": "baseline" }}>
                <span class="is-block">{delta()} {simpleUnit()}</span>
                <span class="icon is-right is-pointer">
                    <i aria-hidden="true"
                        class={classNames("fas fa-lg is-inline",
                            ["fa-arrow-up has-text-danger", delta() > 0],
                            ["fa-arrow-down has-text-success", delta() < 0]
                        )}
                    />
                    <i aria-hidden="true"
                        class={classNames("fas fa-lg is-inline",
                            ["fa-arrow-up has-text-danger", delta() > 0],
                            ["fa-arrow-down has-text-success", delta() < 0]
                        )}
                    />
                    <i aria-hidden="true"
                        class={classNames("fas fa-lg is-inline",
                            ["fa-arrow-up has-text-danger", delta() > 0],
                            ["fa-arrow-down has-text-success", delta() < 0]
                        )}
                    />
                </span>
            </td>
            <td class="no-pad-right" style={{ "text-align-last": "center", "vertical-align": "baseline" }}>
                <div title="Editar" onClick={() => setShowInfo(true)}>
                    <span class="icon is-left is-pointer">
                        <i class="fas fa-pen-to-square fa-lg has-text-warning" aria-hidden="true" />
                    </span>
                </div>
            </td>

            <Modal show={showInfo()} onClose={closeInfo}>
                <h1 class="title" style={{ "margin-bottom": "0.5rem" }}>{item.nombre}</h1>
                <h2>{item.registro}</h2>

                <form class="scrollable hide_scroll" style={{ padding: "unset", "margin-top": "1rem" }}>
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

                        <label class="label">Ingrediente Activo</label>
                        <p class="control has-icons-left">
                            <input id="p_ingrediente" disabled
                                value={item.ingrediente}
                                class="input"
                                type="text"
                            />
                            <span class="icon is-medium is-left">
                                <i class="fas fa-flask-vial has-text-warning" />
                            </span>
                        </p>
                    </div>

                    <div class={classNames("field is-grouped is-flex-direction-column hide_scroll scrollable", css.io_field)}>
                        <label class="label">Dosis Mínima</label>
                        <p class="control has-icons-left">
                            <input id="p_presentacion" disabled
                                value={item.dosis_min}
                                class="input"
                                type="text"
                            />
                            <span class="icon is-medium is-left">
                                <i class="fas fa-minus has-text-danger" />
                            </span>
                        </p>

                        <label class="label">Dosis Máxima</label>
                        <p class="control has-icons-left">
                            <input id="p_ingrediente" disabled
                                value={item.dosis_max}
                                class="input"
                                type="text"
                            />
                            <span class="icon is-medium is-left">
                                <i class="fas fa-plus has-text-success" />
                            </span>
                        </p>

                    </div>

                    <div class={classNames(
                        "field is-grouped is-flex-direction-column hide_scroll scrollable",
                        css.io_field, [css.three_cols, deviceType() > DeviceType.Mobile])}
                    >
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

                        <label class="label">Cantidad Sugerida</label>
                        <p class="control has-icons-left">
                            <input id="p_cantidad" disabled
                                value={item.cantidad}
                                class="input"
                                type="number"
                            />
                            <span class="icon is-medium is-left">
                                <i class="fas fa-fill has-text-info" />
                            </span>
                            <span class={css.units}>
                                {simpleUnit()}
                            </span>
                        </p>

                        <label class="label">Cantidad Utilizada</label>
                        <p class="control has-icons-left">
                            <input id="p_cantidad_usada" required
                                onInput={(e) => setCantidad(e.target.valueAsNumber)}
                                value={cantidad()}
                                class="input"
                                type="number"
                                min={0}
                            />
                            <span class="icon is-medium is-left">
                                <i class="fas fa-fill-drip has-text-danger" />
                            </span>
                            <span class={css.units}>
                                {simpleUnit()}
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