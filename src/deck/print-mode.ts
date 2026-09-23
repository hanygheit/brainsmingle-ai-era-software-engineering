import { createContext, useContext } from "react";

/** True inside the /print route: hides interactive-only UI such as download buttons. */
export const PrintModeContext = createContext(false);
export const usePrintMode = () => useContext(PrintModeContext);
