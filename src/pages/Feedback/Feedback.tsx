import "./Feedback.module.css";

export function Feedback() {
    return (
        <section>
            <h1 class="title no-padding">Reportar un Problema</h1>
            <div class="field">
                <label class="label">Nombre</label>
                <div class="control">
                    <input class="input" type="text" placeholder="Juan Manuel Ramírez..." />
                </div>
            </div>
            <div class="field">
                <label class="label">Título</label>
                <div class="control">
                    <input class="input" type="text" placeholder="No hay ningún servicio" />
                </div>
            </div>

            <div class="field">
                <label class="label">Descripción</label>
                <div class="control">
                    <textarea class="textarea" placeholder="Cuéntanos del problema que encontraste..." />
                </div>
            </div>
            
            <label class="label">Tipo de Error</label>
            <div class="field is-grouped is-column">
                <div class="control">
                    <div class="select">
                        <select>
                            <option>Error de interfaz</option>
                            <option>No puedo salvar un reporte</option>
                            <option>No carga ningún servicio</option>
                            <option>Se muestra una pantalla de error</option>
                        </select>
                    </div>
                </div>

                <div class="file has-name is-fullwidth">
                    <label class="file-label">
                        <input class="file-input" type="file" name="resume" />
                        <span class="file-cta file-btn">
                            <span class="file-icon">
                                <i class="fas fa-upload"></i>
                            </span>
                            <span class="file-label"> Agrega una captura </span>
                        </span>
                        <span class="file-name"> Error-{new Date().toISOString()}.png </span>
                    </label>
                </div>
            </div>
            
            <div class="field is-grouped flex-center-mobile gapless">
                <div class="control">
                    <button class="button is-link">Reportar</button>
                </div>
                <div class="control">
                    <button class="button is-link is-light">Cancelar</button>
                </div>
            </div>
        </section>
    );
}