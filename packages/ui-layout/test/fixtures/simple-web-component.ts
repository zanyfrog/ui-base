export const simpleWebComponent = `
export class UibExample extends HTMLElement {
  render() {
    this.innerHTML = \`
      <section class="shell" data-layout-id="shell">
        <h1>Example</h1>
        <p class="lead">\${this.subtitle}</p>
      </section>
    \`;
  }
}

customElements.define('uib-example', UibExample);
`;
