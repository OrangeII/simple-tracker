import { defineStore } from "pinia";
import type { Task } from "../common/types";

export const useQRCodesStore = defineStore("qrcodes", () => {
  /**
   *     
   *```json
    {
      "taskId": "optional-uuid",
      "name": "optional-task-name",
      "altCode": "optional-alternate-code"
    }
    ```
    each key is optional, but at least one must be present.
   * @param jsonString 
   */
  function parseQRCodeJson(jsonString: string) {
    let parsed: any = null;
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to parse QR code JSON:", error);
      throw new Error("Invalid QR code JSON format");
    }

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Parsed JSON is not an object");
    }

    const { taskId, name, altCode } = parsed;

    if (!taskId && !name && !altCode) {
      throw new Error(
        "At least one of taskId, name, or altCode must be present"
      );
    }

    return { taskId, name, altCode };
  }

  function getQrCodeJsonFromTask(task: Task): string {
    if (!task) {
      throw new Error("Task is required to generate QR code JSON");
    }

    const qrCodeData: any = {};
    qrCodeData.taskId = task.id;
    qrCodeData.name = task.name;
    if (task.alt_code) {
      qrCodeData.altCode = task.alt_code;
    }

    return JSON.stringify(qrCodeData);
  }

  return { parseQRCodeJson, getQrCodeJsonFromTask };
});
