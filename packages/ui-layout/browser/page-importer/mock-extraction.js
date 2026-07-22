                                                                             

export function createMockPageExtractionResult(sourceUrl = 'https://example.local/customer-intake')                       {
  const html = `<main class="customer-intake">
  <section class="hero">
    <h1>Customer Intake</h1>
    <p>Use this form to capture a new customer request.</p>
    <img src="https://example.local/assets/customer-intake.png" alt="Customer intake dashboard">
  </section>
  <form id="customerForm" name="customer">
    <label for="firstName">First name</label>
    <input id="firstName" name="firstName" required value="Ada">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" placeholder="person@example.com">
    <label for="phone">Phone</label>
    <input id="phone" name="phone" type="tel" placeholder="(555) 010-1000">
    <label for="requestType">Request type</label>
    <select id="requestType" name="requestType">
      <option>Support</option>
      <option>Sales</option>
      <option>Billing</option>
    </select>
    <button type="submit">Save customer</button>
  </form>
  <dl class="summary">
    <dt>Status</dt>
    <dd>Draft</dd>
  </dl>
  <section class="dashboard">
    <article>Open requests: 12</article>
    <article>Average response: 2 days</article>
  </section>
</main>`;
  const css = `.customer-intake{display:grid;gap:1rem;max-width:960px}
.hero{display:grid;grid-template-columns:1fr 18rem;gap:1rem}
form{display:grid;grid-template-columns:12rem 1fr;gap:.75rem}
.dashboard{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}`;
  const js = `document.querySelector('#customerForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log('save customer');
});`;

  return {
    source: { html, css, js },
    items: [
      {
        id: 'item_instructions_1',
        kind: 'instruction',
        label: 'Customer Intake',
        value: 'Use this form to capture a new customer request.',
        componentTag: 'uib-heading-block',
        position: { order: 1, sectionId: 'section_hero', selector: '.hero', gridColumn: '1 / 2' },
      },
      {
        id: 'item_asset_1',
        kind: 'asset',
        label: 'Customer intake dashboard',
        value: 'https://example.local/assets/customer-intake.png',
        componentTag: 'uib-media',
        position: { order: 2, sectionId: 'section_hero', selector: '.hero img', gridColumn: '2 / 3' },
      },
      field('item_field_firstName', 'First name', 'text', 'firstName', 'firstName', 'Ada', true, 3),
      field('item_field_email', 'Email', 'email', 'email', 'email', '', false, 4, 'person@example.com'),
      field('item_field_phone', 'Phone', 'tel', 'phone', 'phone', '', false, 5, '(555) 010-1000', 'uib-forms-phone'),
      {
        id: 'item_field_requestType',
        kind: 'field',
        label: 'Request type',
        inputType: 'select',
        name: 'requestType',
        elementId: 'requestType',
        options: ['Support', 'Sales', 'Billing'],
        componentTag: 'uib-forms-select',
        position: { order: 6, sectionId: 'section_form', selector: '#requestType', domPath: 'main/form/select[1]', gridColumn: '2 / 3' },
        database: {
          fieldName: 'requestType',
          label: 'Request type',
          type: 'string',
          required: false,
          sampleValue: 'Support',
          entityGuess: 'customer',
        },
      },
      {
        id: 'item_action_save',
        kind: 'action',
        label: 'Save customer',
        componentTag: 'uib-action-button',
        position: { order: 7, sectionId: 'section_form', selector: 'button[type="submit"]' },
      },
      {
        id: 'item_static_status',
        kind: 'static-value',
        label: 'Status',
        value: 'Draft',
        componentTag: 'uib-detail-item',
        position: { order: 8, sectionId: 'section_summary', selector: '.summary' },
      },
      {
        id: 'item_dashboard_open_requests',
        kind: 'dashboard',
        label: 'Open requests',
        value: '12',
        componentTag: 'uib-card',
        position: { order: 9, sectionId: 'section_dashboard', selector: '.dashboard article:nth-child(1)' },
      },
      {
        id: 'item_unknown_priority',
        kind: 'unknown',
        label: 'Priority widget',
        value: '<legacy-priority-picker value="standard"></legacy-priority-picker>',
        sourceSnippet: '<legacy-priority-picker value="standard"></legacy-priority-picker>',
        position: { order: 10, sectionId: 'section_form', selector: 'legacy-priority-picker' },
      },
    ],
    tree: {
      id: 'page_customer_intake',
      label: 'Customer Intake',
      kind: 'page',
      children: [
        { id: 'section_hero', label: 'Hero', kind: 'section', children: treeItems(['item_instructions_1', 'item_asset_1']) },
        { id: 'section_form', label: 'Customer form', kind: 'section', children: treeItems(['item_field_firstName', 'item_field_email', 'item_field_phone', 'item_field_requestType', 'item_action_save', 'item_unknown_priority']) },
        { id: 'section_summary', label: 'Summary', kind: 'section', children: treeItems(['item_static_status']) },
        { id: 'section_dashboard', label: 'Dashboard', kind: 'section', children: treeItems(['item_dashboard_open_requests']) },
      ],
    },
    assets: [
      {
        id: 'asset_customer_intake_image',
        url: 'https://example.local/assets/customer-intake.png',
        type: 'image',
        label: 'Customer intake dashboard',
        usedBy: ['item_asset_1'],
      },
    ],
    logs: [
      {
        id: 'log_mock_started',
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Mock extraction loaded for ${sourceUrl}.`,
      },
      {
        id: 'log_mock_complete',
        timestamp: new Date().toISOString(),
        level: 'success',
        message: 'Separated source and classified initial page items.',
      },
    ],
  };
}

function field(id        , label        , inputType        , name        , elementId        , value        , required         , order        , placeholder = '', componentTag = 'uib-forms-textbox') {
  return {
    id,
    kind: 'field'         ,
    label,
    inputType,
    name,
    elementId,
    value,
    placeholder,
    required,
    componentTag,
    position: { order, sectionId: 'section_form', selector: `#${elementId}`, domPath: `main/form/input[name="${name}"]`, gridColumn: '2 / 3' },
    database: {
      fieldName: name,
      label,
      type: inputType === 'email' || inputType === 'tel' ? 'string' : inputType,
      required,
      sampleValue: value || placeholder,
      entityGuess: 'customer',
    },
  };
}

function treeItems(ids          ) {
  return ids.map((id) => ({
    id: `node_${id}`,
    label: id.replace(/^item_/, '').replaceAll('_', ' '),
    kind: id.includes('field') ? 'field'          : 'group'         ,
    itemId: id,
    children: [],
  }));
}

