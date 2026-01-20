export const tools = {
  pickFile: async ({ accept, onEvent }) => {
    try {
      if (onEvent) {
        onEvent("picker_opened");
      }
      const extension = accept || ".pdf";
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{ accept: { "application/pdf": [extension] } }],
      });
      const file = await fileHandle.getFile();
      if (onEvent) {
        onEvent("picker_result", { name: file.name, size: file.size });
      }
      return { name: file.name, size: file.size };
    } catch (err) {
      if (onEvent) {
        onEvent("picker_error");
      }
      return { error: "User cancelled or failed" };
    }
  },
};