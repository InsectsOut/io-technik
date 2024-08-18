export * from "./About";
export * from "./Error";
export * from "./Feedback";
export * from "./Home";
export * from "./Login";
export * from "./NotFound";
export * from "./Profile";
export * from "./Service";

/** Base URL for the io-technik application */
export const BaseUrl = "https://io-technik-dev.netlify.app";

/**
 * Pages enum with all the app's pages
 */
export const enum Pages {
    /** About page */
    About = "/about",
    /** Feedback page */
    Feedback = "/feedback",
    /** Home page */
    Home = "/home",
    /** Login page */
    Login = "/login",
    /** 404 Page */
    NotFound = "*404",
    /** Root page */
    Root = "/",
    /** Service page */
    Services = "/services",
    /** Profile page */
    User = "/user",
}