"use client";

import { Provider } from "react-redux";
import { store } from "../redux/store"; // adjust path to your store

export default function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
