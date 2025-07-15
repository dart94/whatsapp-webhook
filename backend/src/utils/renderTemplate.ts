export function renderTemplate(body: string, parameters: string[]): string {
  let result = body;
  parameters.forEach((param, i) => {
    const regex = new RegExp(`{{${i + 1}}}`, "g");
    result = result.replace(regex, param);
  });
  return result;
}
