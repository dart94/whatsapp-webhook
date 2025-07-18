// utils/renderTemplate.ts
export function renderTemplate(template: string, parameters: string[]): string {
  console.log("🔍 Plantilla raw:", template.split("").map(c => `${c} (${c.charCodeAt(0)})`).join(" "));

  return template.replace(/{{\s*(\d+)\s*}}/g, (_, index) => {
    const i = parseInt(index, 10) - 1;
    return parameters[i] ?? "";
  });
}
