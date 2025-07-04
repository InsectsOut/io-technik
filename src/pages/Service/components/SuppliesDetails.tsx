import { destructure } from "@solid-primitives/destructure";
import { createSignal, For, Show } from "solid-js";

import { classNames, DeviceType, deviceType } from "@/utils";
import { getSimpleUnit } from "../Service.utils";
import { Modal, useToast } from "@/components";
import { supabase, Tables } from "@/supabase";

import css from "../Service.module.css"
import { BsPencilSquare } from "solid-icons/bs";
import { FaSolidArrowDown, FaSolidArrowUp, FaSolidBoxesPacking, FaSolidCirclePlus, FaSolidFill, FaSolidFillDrip, FaSolidFlaskVial, FaSolidMinus, FaSolidPlus, FaSolidVestPatches, FaSolidXmark } from "solid-icons/fa";
import { match } from "ts-pattern";

type SuppliesDetails = {
    registros: Array<Tables<"RegistroAplicacion"> & {
        Productos: Maybe<Tables<"Productos">>
    }>;
}

type Supply = ReturnType<typeof getSuppliesList>[number];

const { addToast } = useToast();

/** Updates the amount of product used during a service */
async function updateUsedProduct(item: Supply, cantidad: number) {
    if (isNaN(cantidad)) {
        return addToast("Cantidad inválida", "is-warning");
    }

    const { status, error } = await supabase
        .from("RegistroAplicacion")
        .update({ cantidad_usada: cantidad })
        .eq("id", item.id);

    if (status === 204) {
        document.dispatchEvent(new Event("UpdateService"));
        addToast(
            `Se actualizó el uso de ${item.nombre} a ${cantidad} ${item.unidad}`,
            "is-info"
        );
    } else {
        addToast(`Error actualizando la cantidad usada\n${error?.details}`, "is-danger");
    }
}

/** Maps the supply details to a renderable list of supplies */
function getSuppliesList(supplies: SuppliesDetails["registros"]) {
    return supplies.map((r) => ({
        area_aplicacion: r.area_aplicacion?.toUpperCase(),
        tipo_producto: r.Productos?.tipo_de_producto!.toUpperCase(),
        dosis_recomendada: r.dosis_recomendada!,
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
}

/**
 * Component that shows the supplies details tab
 * @param props The supplies props to be rendered
 * @returns A `JSX` element that lists the supplies
 */
export function SuppliesDetails(props: SuppliesDetails) {
    const { registros } = destructure(props);
    const viewWidth = { height: "65dvh" };

    if (!registros()?.length) {
        return (
            <section class="no-contact mb-4" style={viewWidth}>
                <h1 class="title has-text-centered">Sin suministros asignados 🔎</h1>
                <br />
                <h2 class="subtitle has-text-centered">No se encontró equipo asignado a este servicio.</h2>
            </section>
        );
    }

    return (
        <table class="table is-striped fullwidth mb-4" style={viewWidth}>
            <thead>
                <tr class={css.slim_pad}>
                    <th class="pl-0">Nombre</th>
                    <th>Cantidad</th>
                    <th class="has-text-centered">Delta</th>
                    <th class="has-text-centered pr-0">Editar</th>
                </tr>
            </thead>

            <tbody>
                <For each={getSuppliesList(registros())}>{SupplyDetail}</For>
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

    return (
        <tr class={css.slim_pad}>
            <td class="pl-0">
                <div onClick={() => setShowInfo(true)}
                    class="has-text-link is-clickable is-flex gap-3 is-flex-wrap-wrap"
                    title={item.nombre}
                >
                    <Show when={item.area_aplicacion}>
                        <span class="tag is-warning has-text-weight-bold">
                            {item.area_aplicacion}
                        </span>
                    </Show>
                    <Show when={item.tipo_producto}>
                        <span class="tag is-info">{item.tipo_producto}</span>
                    </Show>
                    {item.nombre}
                </div>
            </td>

            <td>
                <div class="has-text-info mb-2">
                    Sugerido: {item.cantidad} {simpleUnit()}
                </div>
                <div>Usado: {item.cantidad_usada} {simpleUnit()}</div>
            </td>

            <td class="text-baselines" style={{ "text-align-last": "center" }}>
                <span>{delta()} {simpleUnit()}</span>
                <span class="icon is-right is-clickable">
                    {match(delta())
                        .when(d => d < 0, () => <FaSolidArrowDown class="has-text-success" />)
                        .when(d => d > 0, () => <FaSolidArrowUp class="has-text-danger" />)
                        .otherwise(() => null)}
                </span>
            </td>
            <td class="pr-0 text-baseline" style={{ "text-align-last": "center" }}>
                <div title="Editar" onClick={() => setShowInfo(true)}>
                    <span class="icon is-left is-clickable">
                        <BsPencilSquare class="has-text-warning is-size-4" aria-hidden="true" />
                    </span>
                </div>
            </td>

            <Modal show={showInfo()} onClose={closeInfo}>
                <h1 class="title mb-2">{item.nombre}</h1>
                <h2>{item.registro}</h2>

                <form class="scrollable hide-scroll mb-4 paddingless" style={{ height: "50dvh" }} onKeyDown={handleEnterKey}>
                    <div class={classNames("field is-grouped is-flex-direction-column hide-scroll scrollable", css.io_field)}>
                        <label class="label">Presentación</label>
                        <p class="control has-icons-left">
                            <input id="p_presentacion" disabled
                                value={item.presentacion}
                                class="input"
                                type="text"
                            />
                            <span class="icon is-medium is-left">
                                <FaSolidBoxesPacking class="is-size-5" />
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
                                <FaSolidFlaskVial class="has-text-warning is-size-5" />
                            </span>
                        </p>
                    </div>

                    <div class="field is-flex-direction-column two_col_grid">
                        <label class="label">Dosis Mínima</label>
                        <p class="control has-icons-left">
                            <input id="p_presentacion" disabled
                                value={item.dosis_min}
                                class="input"
                                type="text"
                            />
                            <span class="icon is-medium is-left">
                                <FaSolidMinus class="has-text-danger is-size-5" />
                            </span>
                            <Show when={item.dosis_recomendada === "min"}>
                                <span class={classNames("tag is-success ml-2 z-10", css.dosis_tag)}>
                                    Recomendado
                                </span>
                            </Show>
                        </p>

                        <label class="label">Dosis Máxima</label>
                        <p class="control has-icons-left">
                            <input id="p_ingrediente" disabled
                                value={item.dosis_max}
                                class="input"
                                type="text"
                            />
                            <span class="icon is-medium is-left">
                                <FaSolidPlus class="has-text-success is-size-5" />
                            </span>
                            <Show when={item.dosis_recomendada === "max"}>
                                <span class={classNames("tag is-success ml-2 z-10", css.dosis_tag)}>
                                    Recomendado
                                </span>
                            </Show>
                        </p>

                    </div>

                    <div class={classNames(
                        "field is-grouped is-flex-direction-column hide-scroll scrollable",
                        css.io_field, [css.three_cols, deviceType() > DeviceType.Mobile])}
                    >
                        <label class="label">Tipo Aplicación</label>
                        <p class="control has-icons-left">
                            <input title="Tipo de aplicación" id="p_tipo" disabled
                                value={item.tipo}
                                class="input"
                                type="text"
                            />
                            <span class="icon is-medium is-left">
                                <FaSolidVestPatches class="has-text-warning is-size-5" />
                            </span>
                        </p>

                        <label class="label">Cantidad Sugerida</label>
                        <p class="control has-icons-left">
                            <input title="Cantidad sugerida" id="p_cantidad" disabled
                                value={item.cantidad}
                                class="input"
                                type="number"
                            />
                            <span class="icon is-medium is-left">
                                <FaSolidFill class="has-text-info is-size-5" />
                            </span>
                            <span class={css.units}>
                                {simpleUnit()}
                            </span>
                        </p>

                        <label class="label">Cantidad Utilizada</label>
                        <p class="control has-icons-left">
                            <input title="Cantidad usada" id="p_cantidad_usada" required
                                onInput={(e) => setCantidad(e.target.valueAsNumber)}
                                value={cantidad()}
                                class="input"
                                type="number"
                                min={0}
                            />
                            <span class="icon is-medium is-left">
                                <FaSolidFillDrip class="has-text-danger is-size-5" />
                            </span>
                            <span class={css.units}>
                                {simpleUnit()}
                            </span>
                        </p>

                    </div>
                </form>

                <div class="field is-flex is-justify-content-center gap-3 mt-4">
                    <button
                        class="column button is-danger is-outlined"
                        onClick={closeInfo}
                        type="button"
                    >
                        <span class="text-top">Cancelar</span>
                        <span class="icon">
                            <FaSolidXmark />
                        </span>
                    </button>

                    <button
                        onClick={() => updateUsedProduct(item, cantidad()).then(closeInfo)}
                        class="column button is-success is-outlined"
                        type="button"
                    >
                        <span class="text-top">Guardar</span>
                        <span class="icon">
                            <FaSolidCirclePlus />
                        </span>
                    </button>
                </div>
            </Modal>
        </tr>
    );
}