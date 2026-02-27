# Forms & Validation

## Declarative Form Submission

```html
<form post="/api/register"
      success="#registerSuccess"
      error="#registerError"
      loading="#registerLoading"
      validate>

  <input type="text"     name="name"     required minlength="2" />
  <input type="email"    name="email"    required />
  <input type="password" name="password" required minlength="8"
         pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" />

  <button type="submit" bind-disabled="!$form.valid">Register</button>

</form>
```

---

## Validation Rules

```html
<!-- Built-in HTML5 validation -->
<input required />
<input minlength="3" maxlength="50" />
<input type="email" />
<input pattern="[0-9]{3}-[0-9]{4}" />

<!-- No.JS custom validators -->
<input validate="email" />
<input validate="cpf" />
<input validate="cnpj" />
<input validate="phone" />
<input validate="url" />
<input validate="creditcard" />
<input validate="match:password" />          <!-- Must match another field -->
<input validate="min:18" />                  <!-- Numeric min -->
<input validate="max:120" />
<input validate="between:1,100" />
<input validate="custom:validateUsername" />  <!-- Custom function -->

<!-- Error display -->
<input type="email" name="email" validate="email" error="#emailError" />
<template id="emailError" var="err">
  <span class="field-error" bind="err.message"></span>
</template>
```

---

## `$form` — Form Context

Inside any `<form>` with the `validate` attribute, `$form` provides:

| Property | Type | Description |
|----------|------|-------------|
| `$form.valid` | `boolean` | `true` if all fields pass validation |
| `$form.dirty` | `boolean` | `true` if any field has been modified |
| `$form.touched` | `boolean` | `true` if any field has been focused and blurred |
| `$form.submitting` | `boolean` | `true` while the request is in flight |
| `$form.errors` | `object` | Map of field names → error messages |
| `$form.values` | `object` | Current form values |
| `$form.reset()` | `function` | Reset form to initial values |

```html
<form post="/api/contact" validate>
  <input type="text" name="name" required />
  <input type="email" name="email" required validate="email" />
  <textarea name="message" required minlength="10"></textarea>

  <p show="$form.errors.email" class="error" bind="$form.errors.email"></p>

  <button type="submit"
          bind-disabled="!$form.valid || $form.submitting">
    <span hide="$form.submitting">Send</span>
    <span show="$form.submitting">Sending...</span>
  </button>
</form>
```

---

## Custom Validators

```html
<script>
  NoJS.validator('strongPassword', (value) => {
    if (value.length < 8) return 'Must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Must contain uppercase';
    if (!/[0-9]/.test(value)) return 'Must contain a number';
    return true;
  });
</script>

<input type="password" validate="strongPassword" />
```

---

**Next:** [Routing →](routing.md)
