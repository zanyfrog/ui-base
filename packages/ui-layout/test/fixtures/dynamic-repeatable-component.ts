export const dynamicRepeatableComponent = `
export class UibRepeatable extends HTMLElement {
  render() {
    return \`
      <section class="rows">
        \${this.items.map((item) => \`<p>\${item.label}</p>\`).join('')}
      </section>
    \`;
  }
}
`;
