// Ambient declaration for react-pannellum (no official @types package exists)
declare module "react-pannellum" {
  import type { CSSProperties, ComponentType } from "react";

  interface PannellumConfig {
    autoLoad?: boolean;
    showControls?: boolean;
    hfov?: number;
    pitch?: number;
    yaw?: number;
    [key: string]: unknown;
  }

  interface ReactPannellumProps {
    id: string;
    sceneId: string;
    imageSource: string;
    style?: CSSProperties;
    config?: PannellumConfig;
    [key: string]: unknown;
  }

  const ReactPannellum: ComponentType<ReactPannellumProps>;
  export default ReactPannellum;
}
