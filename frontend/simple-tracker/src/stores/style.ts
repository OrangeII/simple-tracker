import { defineStore } from "pinia";

export const useStyleStore = defineStore("style", () => {
  /**
   * this store is used to provide programmatic access to the current css theming.
   * It allows to read css variables and set them programmatically.
   */

  const MAIN_DIV_ID = "main-div";
  const PROBE_DIV_ID = "probe";

  function getPrimaryColor(): string {
    //find the div with the id "main-div"
    const appDiv = document.getElementById(MAIN_DIV_ID);
    if (!appDiv) {
      throw new Error("app main-div not found");
    }
    //create a div with the id "probe" and append it to the app div
    const probeDiv = document.createElement("div");
    probeDiv.id = PROBE_DIV_ID;
    appDiv.appendChild(probeDiv);
    const computedStyle = getComputedStyle(probeDiv);
    const primaryColor = computedStyle.getPropertyValue("--primary");
    //remove the probe div
    appDiv.removeChild(probeDiv);
    //remove the probe div
    probeDiv.remove();
    //return the primary color
    return primaryColor;
  }

  function getTextColor(): string {
    //find the div with the id "main-div"
    const appDiv = document.getElementById(MAIN_DIV_ID);
    if (!appDiv) {
      throw new Error("app main-div not found");
    }
    //create a div with the id "probe" and append it to the app div
    const probeDiv = document.createElement("div");
    probeDiv.id = PROBE_DIV_ID;
    appDiv.appendChild(probeDiv);
    const computedStyle = getComputedStyle(probeDiv);
    const textColor = computedStyle.getPropertyValue("--text");
    //remove the probe div
    appDiv.removeChild(probeDiv);
    //remove the probe div
    probeDiv.remove();
    //return the text color
    return textColor;
  }

  return {
    MAIN_DIV_ID,
    getPrimaryColor,
    getTextColor,
  };
});
