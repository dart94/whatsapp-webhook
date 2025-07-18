export function renderTemplate(template: string, parameters: string[]): string {
  return template.replace(/{{(\d+)}}/g, (_, index) => {
    const i = parseInt(index, 10) - 1;
    return parameters[i] !== undefined ? parameters[i] : "";
  });
}