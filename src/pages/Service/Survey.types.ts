import { isMatching, match, P } from "ts-pattern";
import { Logger } from "@/supabase";

// ─── Patterns (single source of truth for types and runtime validation) ──────

const basePattern = {
    id: P.string,
    text: P.string,
    required: P.boolean.optional(),
} as const;

const ratingPattern = {
    ...basePattern,
    type: "rating" as const,
    min: P.number,
    max: P.number,
} as const;

const yesNoPattern = {
    ...basePattern,
    type: "yes_no" as const,
} as const;

const singleChoicePattern = {
    ...basePattern,
    type: "single_choice" as const,
    options: P.array(P.string),
} as const;

const multiChoicePattern = {
    ...basePattern,
    type: "multi_choice" as const,
    options: P.array(P.string),
} as const;

const freeTextPattern = {
    ...basePattern,
    type: "free_text" as const,
    maxLength: P.number.optional(),
} as const;

const linearScalePattern = {
    ...basePattern,
    type: "linear_scale" as const,
    min: P.number,
    max: P.number,
    minLabel: P.string.optional(),
    maxLabel: P.string.optional(),
} as const;

const datePattern = {
    ...basePattern,
    type: "date" as const,
} as const;

/** Top-level shape — question items are validated individually for granular error reporting */
const surveyConfigPattern = {
    version: P.string,
    questions: P.array(),
} as const;

// ─── Types derived from patterns ──────────────────────────────────────────────

export type RatingQuestion = P.infer<typeof ratingPattern>;
export type YesNoQuestion = P.infer<typeof yesNoPattern>;
export type SingleChoiceQuestion = P.infer<typeof singleChoicePattern>;
export type MultiChoiceQuestion = P.infer<typeof multiChoicePattern>;
export type FreeTextQuestion = P.infer<typeof freeTextPattern>;
export type LinearScaleQuestion = P.infer<typeof linearScalePattern>;
export type DateQuestion = P.infer<typeof datePattern>;

export type SurveyQuestion =
    | RatingQuestion
    | YesNoQuestion
    | SingleChoiceQuestion
    | MultiChoiceQuestion
    | FreeTextQuestion
    | LinearScaleQuestion
    | DateQuestion;

export type SurveyConfig = {
    version: string;
    questions: SurveyQuestion[];
};

/** Maps question answer values — keyed by question `id` */
export type SurveyAnswers = Record<string, number | boolean | string | string[] | undefined>;

/** Validates a single raw question object against its declared type */
function parseQuestion(raw: unknown): SurveyQuestion | null {
    return match(raw)
        .returnType<SurveyQuestion | null>()
        .with(ratingPattern, (q) => q)
        .with(yesNoPattern, (q) => q)
        .with(singleChoicePattern, (q) => q)
        .with(multiChoicePattern, (q) => q)
        .with(freeTextPattern, (q) => q)
        .with(linearScalePattern, (q) => q)
        .with(datePattern, (q) => q)
        .otherwise(() => null);
}

/**
 * Validates a raw JSON value against the `SurveyConfig` shape at runtime.
 * Returns `null` and logs an error if any field or question fails validation.
 */
export function parseSurveyConfig(raw: unknown): SurveyConfig | null {
    if (!isMatching(surveyConfigPattern, raw)) {
        Logger.write({
            message: "Survey config validation failed: top-level shape is invalid",
            severity: "Mid",
            type: "Error",
            debug: { raw: JSON.stringify(raw) },
        });
        return null;
    }

    const questions: SurveyQuestion[] = [];
    for (const item of raw.questions) {
        const parsed = parseQuestion(item);
        if (!parsed) {
            Logger.write({
                message: `Survey config validation failed for question: ${JSON.stringify(item)}`,
                severity: "Mid",
                type: "Error",
                debug: { raw: JSON.stringify(item) },
            });
            return null;
        }
        questions.push(parsed);
    }

    return { version: raw.version, questions };
}

