// utils/renderTemplate.ts
export function renderTemplate(template: string, parameters: string[]): string {
  return template.replace(/{{\s*(\d+)\s*}}/g, (_, index) => {
    const i = parseInt(index, 10) - 1;
    console.log(i)
    console.log("✅ Render template:", { template, parameters });
    return parameters[i] ?? "";

  });
}
