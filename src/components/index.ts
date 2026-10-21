import { DefaultNotImplementedComponent } from "@uniformdev/canvas-react";
import Page from "./Page";
import Hero from "./Hero";
import MaintenanceNotice from "./MaintenanceNotice";
import { ComponentInstance } from "@uniformdev/canvas";

function resolveRenderer(component: ComponentInstance) {
  switch (component.type) {
    case "hero":
      return Hero;
    case "page":
      return Page;
    case "maintenanceNotice":
      return MaintenanceNotice;
    default:
      return DefaultNotImplementedComponent;
  }
}
export { resolveRenderer };
