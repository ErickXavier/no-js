<div data-test="card" style="border: 1px solid #ccc; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
  <h3 data-test="card-title" bind="title"></h3>
  <slot name="body"><p>Default card body</p></slot>
  <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #888;">
    <slot name="footer"><span data-test="card-default-footer">Default footer</span></slot>
  </div>
</div>
