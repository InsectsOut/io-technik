import { createMutable } from "solid-js/store";
import { createSignal, For, Match, onMount, Show, Switch } from "solid-js";
import { match } from "ts-pattern";

import { Tables } from "@/supabase";
import { classNames } from "@/utils";

import { FaSolidCalendarDays, FaSolidCloudArrowUp } from "solid-icons/fa";

import rawSurvey from "@/assets/survey.json";
import {
    DateQuestion,
    FreeTextQuestion,
    LinearScaleQuestion,
    MultiChoiceQuestion,
    parseSurveyConfig,
    RatingQuestion,
    SingleChoiceQuestion,
    SurveyAnswers,
    SurveyQuestion,
    YesNoQuestion,
} from "../Survey.types";

type SurveyProps = {
    service?: Tables<"Servicios">;
};

// ─── Question renderers ────────────────────────────────────────────────────

function RatingInput(props: { question: RatingQuestion; answers: SurveyAnswers }) {
    const range = Array.from(
        { length: props.question.max - props.question.min + 1 },
        (_, i) => props.question.min + i
    );
    return (
        <div class="buttons">
            <For each={range}>
                {(value) => (
                    <button
                        type="button"
                        class={classNames(
                            "button",
                            ["is-primary", props.answers[props.question.id] === value]
                        )}
                        onClick={() => { props.answers[props.question.id] = value; }}
                    >
                        {value}
                    </button>
                )}
            </For>
        </div>
    );
}

function YesNoInput(props: { question: YesNoQuestion; answers: SurveyAnswers }) {
    const current = () => props.answers[props.question.id];
    return (
        <div class="buttons">
            <button
                type="button"
                class={classNames("button", ["is-success", current() === true])}
                onClick={() => { props.answers[props.question.id] = true; }}
            >
                Sí
            </button>
            <button
                type="button"
                class={classNames("button", ["is-danger", current() === false])}
                onClick={() => { props.answers[props.question.id] = false; }}
            >
                No
            </button>
        </div>
    );
}

function SingleChoiceInput(props: { question: SingleChoiceQuestion; answers: SurveyAnswers }) {
    return (
        <div class="control">
            <For each={props.question.options}>
                {(option) => (
                    <label class="radio is-block mb-1">
                        <input
                            type="radio"
                            name={props.question.id}
                            value={option}
                            checked={props.answers[props.question.id] === option}
                            onChange={() => { props.answers[props.question.id] = option; }}
                            class="mr-2"
                        />
                        {option}
                    </label>
                )}
            </For>
        </div>
    );
}

function MultiChoiceInput(props: { question: MultiChoiceQuestion; answers: SurveyAnswers }) {
    function toggle(option: string) {
        const current = (props.answers[props.question.id] as string[] | undefined) ?? [];
        props.answers[props.question.id] = current.includes(option)
            ? current.filter((v) => v !== option)
            : [...current, option];
    }

    return (
        <div class="control">
            <For each={props.question.options}>
                {(option) => (
                    <label class="checkbox is-block mb-1">
                        <input
                            type="checkbox"
                            value={option}
                            checked={((props.answers[props.question.id] as string[] | undefined) ?? []).includes(option)}
                            onChange={() => toggle(option)}
                            class="mr-2"
                        />
                        {option}
                    </label>
                )}
            </For>
        </div>
    );
}

function LinearScaleInput(props: { question: LinearScaleQuestion; answers: SurveyAnswers }) {
    const current = () => props.answers[props.question.id] as number | undefined;
    return (
        <div>
            <div class="is-flex is-align-items-center gap-3 mb-1">
                <input
                    type="range"
                    class="is-flex-grow-1"
                    min={props.question.min}
                    max={props.question.max}
                    step={1}
                    value={current() ?? props.question.min}
                    onInput={(e) => { props.answers[props.question.id] = e.currentTarget.valueAsNumber; }}
                />
                <span class="tag is-info is-medium" style="min-width:2.5rem;text-align:center">
                    {current() ?? "—"}
                </span>
            </div>
            <Show when={props.question.minLabel || props.question.maxLabel}>
                <div class="is-flex is-justify-content-space-between">
                    <span class="is-size-7 has-text-grey">{props.question.minLabel}</span>
                    <span class="is-size-7 has-text-grey">{props.question.maxLabel}</span>
                </div>
            </Show>
        </div>
    );
}

function FreeTextInput(props: { question: FreeTextQuestion; answers: SurveyAnswers }) {
    return (
        <div class="control">
            <textarea
                class="textarea"
                maxLength={props.question.maxLength}
                placeholder="Escriba su respuesta aquí…"
                value={(props.answers[props.question.id] as string | undefined) ?? ""}
                onInput={(e) => { props.answers[props.question.id] = e.currentTarget.value; }}
                rows={4}
            />
        </div>
    );
}

function DateInput(props: { question: DateQuestion; answers: SurveyAnswers }) {
    return (
        <p class="control has-icons-left">
            <input
                type="date"
                class="input"
                value={(props.answers[props.question.id] as string | undefined) ?? ""}
                onInput={(e) => { props.answers[props.question.id] = e.currentTarget.value; }}
            />
            <span class="icon is-medium is-left">
                <FaSolidCalendarDays />
            </span>
        </p>
    );
}

// ─── Question wrapper ──────────────────────────────────────────────────────

function QuestionField(props: { question: SurveyQuestion; answers: SurveyAnswers }) {
    return (
        <div class="field mb-5">
            <label class="label">
                {props.question.text}
                <Show when={props.question.required}>
                    <span class="has-text-danger ml-1" aria-hidden="true">*</span>
                </Show>
            </label>
            {match(props.question)
                .with({ type: "rating" }, (q) => <RatingInput question={q} answers={props.answers} />)
                .with({ type: "yes_no" }, (q) => <YesNoInput question={q} answers={props.answers} />)
                .with({ type: "single_choice" }, (q) => <SingleChoiceInput question={q} answers={props.answers} />)
                .with({ type: "multi_choice" }, (q) => <MultiChoiceInput question={q} answers={props.answers} />)
                .with({ type: "linear_scale" }, (q) => <LinearScaleInput question={q} answers={props.answers} />)
                .with({ type: "free_text" }, (q) => <FreeTextInput question={q} answers={props.answers} />)
                .with({ type: "date" }, (q) => <DateInput question={q} answers={props.answers} />)
                .exhaustive()}
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────

export function ServiceSurvey(_props: SurveyProps) {
    const [questions, setQuestions] = createSignal<SurveyQuestion[]>([]);
    const [parseError, setParseError] = createSignal(false);
    const answers = createMutable<SurveyAnswers>({});

    onMount(() => {
        const config = parseSurveyConfig(rawSurvey);
        if (!config) {
            setParseError(true);
            return;
        }
        setQuestions(config.questions);
    });

    return (
        <>
            <form class="hide-scroll">
                <Switch>
                    <Match when={parseError()}>
                        <p class="notification is-danger">
                            No se pudo cargar la encuesta. Por favor contacte al administrador del sistema.
                        </p>
                    </Match>

                    <Match when={questions().length > 0}>
                        <For each={questions()}>
                            {(question) => <QuestionField question={question} answers={answers} />}
                        </For>
                    </Match>
                </Switch>
            </form>

            <div class="panel-block is-justify-content-center">
                <button type="button" class="button is-success is-outlined is-fullwidth" disabled style="opacity: 1">
                    <span>Guardar Encuesta</span>
                    <span class="icon">
                        <FaSolidCloudArrowUp class="is-size-5" />
                    </span>
                </button>
            </div>
        </>
    );
}
