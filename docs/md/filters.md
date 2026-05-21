# Filters & Pipes

Filters transform values in `bind` expressions using the `|` pipe syntax.

## Built-in Filters

### Text

```html
<span bind="name | uppercase"></span>           <!-- JOHN -->
<span bind="name | lowercase"></span>           <!-- john -->
<span bind="name | capitalize"></span>          <!-- John doe → John Doe -->
<span bind="text | truncate:100"></span>        <!-- First 100 chars + ... -->
<span bind="text | stripHtml"></span>           <!-- Remove HTML tags -->
<span bind="slug | slugify"></span>             <!-- hello-world -->
<span bind="text | nl2br"></span>               <!-- Newlines to <br> -->
<span bind="name | trim"></span>               <!-- Remove whitespace -->
<span bind="url | encodeUri"></span>            <!-- URL-encode value -->
```

### Numbers

```html
<span bind="price | currency"></span>           <!-- $29.99 -->
<span bind="value | number:2"></span>           <!-- 1,234.56 -->
<span bind="ratio | percent"></span>            <!-- 42% -->
<span bind="bytes | filesize"></span>           <!-- 1.5 MB -->
<span bind="value | ordinal"></span>            <!-- 1st, 2nd, 3rd -->
```

### Arrays

```html
<span bind="items | count"></span>              <!-- 5 -->
<span bind="items | first"></span>              <!-- First item -->
<span bind="items | last"></span>               <!-- Last item -->
<span bind="items | join:', '"></span>          <!-- a, b, c -->
<span bind="items | reverse"></span>            <!-- Reversed array -->
<span bind="items | unique"></span>             <!-- Deduplicated -->
<span bind="items | pluck:'name'"></span>       <!-- Extract property -->
<span bind="items | sortBy:'date'"></span>      <!-- Sort by property -->
<span bind="items | where:'status','active'"></span>  <!-- Filter by property value -->
```

### Date

```html
<span bind="date | date:'short'"></span>        <!-- 02/25/26 -->
<span bind="date | relative"></span>            <!-- 3 days ago -->
<span bind="date | fromNow"></span>             <!-- in 2 hours -->
```

> **Note:** `relative` looks backward ("3 days ago"), while `fromNow` looks forward ("in 2 hours"). For past dates, `fromNow` falls back to `relative`.

### Utility

```html
<span bind="value | default:'N/A'"></span>      <!-- Fallback for null/undefined -->
<span bind="obj | json"></span>                 <!-- JSON.stringify -->
<span bind="items | debug"></span>              <!-- console.log + passthrough -->
<span bind="obj | keys"></span>                <!-- Object.keys() -->
<span bind="obj | values"></span>              <!-- Object.values() -->
```

---

## Chaining Filters

```html
<span bind="user.bio | stripHtml | truncate:200 | capitalize"></span>
<span bind="price | number:2 | currency:'USD'"></span>
```

---

## Custom Filters

```html
<script>
  NoJS.filter('initials', (fullName) => {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  });

  NoJS.filter('timeAgo', (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return minutes + 'm ago';
    if (minutes < 1440) return Math.floor(minutes / 60) + 'h ago';
    return Math.floor(minutes / 1440) + 'd ago';
  });
</script>

<span bind="user.name | initials"></span>      <!-- JD -->
<span bind="post.createdAt | timeAgo"></span>   <!-- 3h ago -->
```

---

## Complete Filter Reference

| Filter | Arguments | Description |
|--------|-----------|-------------|
| `uppercase` | — | Convert to UPPERCASE |
| `lowercase` | — | Convert to lowercase |
| `capitalize` | — | Capitalize First Letter Of Each Word |
| `truncate` | `length` (default: 100) | Truncate with "..." |
| `trim` | — | Remove leading/trailing whitespace |
| `stripHtml` | — | Remove HTML tags |
| `slugify` | — | Convert to url-safe-slug |
| `nl2br` | — | Newlines to `<br>` (HTML-escaped) |
| `encodeUri` | — | `encodeURIComponent()` |
| `number` | `decimals` (default: 0) | Locale-formatted number |
| `currency` | `code` (default: "USD") | Locale-formatted currency |
| `percent` | `decimals` (default: 0) | Percentage (multiplies by 100) |
| `filesize` | — | Human-readable file size |
| `ordinal` | — | 1st, 2nd, 3rd, etc. |
| `count` | — | Array length |
| `first` | — | First array element |
| `last` | — | Last array element |
| `join` | `separator` (default: ", ") | Join array elements |
| `reverse` | — | Reverse array |
| `unique` | — | Deduplicate array |
| `pluck` | `key` | Extract property from each item |
| `sortBy` | `key` (prefix `-` for desc) | Sort array by property |
| `where` | `key`, `value` | Filter array where key equals value |
| `date` | `format` (short/long/full) | Locale-formatted date |
| `datetime` | — | Locale-formatted date and time |
| `relative` | — | Relative time ("3d ago") |
| `fromNow` | — | Future relative time ("in 2h") |
| `default` | `fallback` (default: "") | Fallback for null/empty |
| `json` | `indent` (default: 2) | JSON.stringify |
| `debug` | — | console.log + passthrough |
| `keys` | — | Object.keys() |
| `values` | — | Object.values() |

---

## See Also

- [Data Binding](data-binding.md) — using filters in `bind` expressions
- [Internationalization](i18n.md) — locale-aware formatting filters
- [Custom Directives](custom-directives.md) — `NoJS.filter()` for custom filters

**Previous:** [Animations ←](animations.md) | **Next:** [Actions & Refs →](actions-refs.md)
