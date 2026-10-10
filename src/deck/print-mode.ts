import { createContext, useContext } from "react";

/** True inside /print: screens render their static PDF state (no live data, no tallies). */
export const PrintMode = createContext(false);
export const usePrintMode = () => useContext(PrintMode);
