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
```

### Date

```html
<span bind="date | date:'short'"></span>        <!-- 02/25/26 -->
<span bind="date | relative"></span>            <!-- 3 days ago -->
<span bind="date | fromNow"></span>             <!-- in 2 hours -->
```

### Utility

```html
<span bind="value | default:'N/A'"></span>      <!-- Fallback for null/undefined -->
<span bind="obj | json"></span>                 <!-- JSON.stringify -->
<span bind="items | debug"></span>              <!-- console.log + passthrough -->
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

**Next:** [Actions & Refs →](actions-refs.md)
