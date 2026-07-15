export const nestedTemplateMethods = `
export class UibNested extends HTMLElement {
  render() {
    return \`
      <section class="outer">
        \${this.toolbarMarkup()}
        <main>Body</main>
      </section>
    \`;
  }

  toolbarMarkup() {
    return \`
      <header class="toolbar">
        <button>Save</button>
      </header>
    \`;
  }
}
`;
