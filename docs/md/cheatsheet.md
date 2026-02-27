# Directive Cheatsheet

Complete reference of every No.JS directive.

## Data

| Directive | Example | Description |
|-----------|---------|-------------|
| `base` | `base="https://api.com"` | Set API base URL for descendants |
| `get` | `get="/users"` | Fetch data (GET) |
| `post` | `post="/login"` | Submit data (POST) |
| `put` | `put="/users/1"` | Update data (PUT) |
| `patch` | `patch="/users/1"` | Partial update (PATCH) |
| `delete` | `delete="/users/1"` | Delete data (DELETE) |
| `as` | `as="users"` | Name for fetched data in context |
| `body` | `body='{"key":"val"}'` | Request body |
| `headers` | `headers='{"Auth":"Bearer x"}'` | Request headers |
| `params` | `params="{ page: 1 }"` | Query parameters |
| `cached` | `cached` or `cached="local"` | Cache responses (memory/local/session) |
| `into` | `into="currentUser"` | Write response to a named global store |
| `debounce` | `debounce="300"` | Debounce reactive URL refetches (ms) |

## State

| Directive | Example | Description |
|-----------|---------|-------------|
| `state` | `state="{ count: 0 }"` | Create local reactive state |
| `store` | `store="auth"` | Define/access global store |
| `computed` | `computed="total" expr="a+b"` | Derived reactive value |
| `watch` | `watch="search"` | React to value changes |
| `persist` | `persist="localStorage"` | Persist state to storage |
| `model` | `model="name"` | Two-way binding for inputs |

## Rendering

| Directive | Example | Description |
|-----------|---------|-------------|
| `bind` | `bind="user.name"` | Set text content |
| `bind-html` | `bind-html="content"` | Set innerHTML (sanitized) |
| `bind-*` | `bind-src="url"` | Bind any attribute |
| `if` | `if="condition"` | Conditional render |
| `else-if` | `else-if="cond"` | Chained conditional |
| `then` | `then="templateId"` | Template for truthy |
| `else` | `else="templateId"` | Template for falsy |
| `show` | `show="condition"` | Toggle visibility (CSS) |
| `hide` | `hide="condition"` | Inverse of show |
| `switch` | `switch="value"` | Switch/case render |
| `case` | `case="'admin'"` | Case match |
| `default` | `default` | Default case |

## Loops

| Directive | Example | Description |
|-----------|---------|-------------|
| `each` | `each="item in items"` | Simple loop |
| `foreach` | `foreach="item"` | Extended loop |
| `from` | `from="items"` | Source array |
| `template` | `template="tplId"` | Template to clone |
| `index` | `index="i"` | Index variable name |
| `key` | `key="item.id"` | Unique key for diffing |
| `filter` | `filter="item.active"` | Filter expression |
| `sort` | `sort="item.name"` | Sort property |
| `limit` | `limit="10"` | Max items |
| `offset` | `offset="5"` | Skip items |

## Events

| Directive | Example | Description |
|-----------|---------|-------------|
| `on:click` | `on:click="count++"` | Click handler |
| `on:submit` | `on:submit.prevent="..."` | Submit handler |
| `on:input` | `on:input="..."` | Input handler |
| `on:keydown.*` | `on:keydown.enter="..."` | Key handler |
| `on:mounted` | `on:mounted="init()"` | Lifecycle: mounted |
| `on:unmounted` | `on:unmounted="cleanup()"` | Lifecycle: unmounted |

## Styling

| Directive | Example | Description |
|-----------|---------|-------------|
| `class-*` | `class-active="isOn"` | Toggle CSS class |
| `class-map` | `class-map="{ a: x }"` | Class from object |
| `style-*` | `style-color="c"` | Set inline style |
| `style-map` | `style-map="{ ... }"` | Style from object |

## Forms

| Directive | Example | Description |
|-----------|---------|-------------|
| `validate` | `validate` or `validate="email"` | Enable form/field validation |
| `error` | `error="#tpl"` | Error template for field |
| `success` | `success="#tpl"` | Success template |
| `loading` | `loading="#tpl"` | Loading template |
| `confirm` | `confirm="Sure?"` | Confirmation dialog |
| `redirect` | `redirect="/home"` | Redirect on success |

## Routing

| Directive | Example | Description |
|-----------|---------|-------------|
| `route` | `route="/path"` | Define route or link |
| `route-view` | `route-view` | Route outlet |
| `route-view="name"` | `route-view="sidebar"` | Named route outlet |
| `outlet` | `outlet="sidebar"` | Target a named outlet from a route template |
| `route-active` | `route-active="cls"` | Active link class |
| `guard` | `guard="expr"` | Route guard condition |
| `lazy` | `lazy="ondemand"` | Defer route template fetch until first visit |
| `lazy` | `lazy="priority"` | Force template to load before all others |

## Animation

| Directive | Example | Description |
|-----------|---------|-------------|
| `animate` | `animate="fadeIn"` | Enter animation |
| `animate-enter` | `animate-enter="slideIn"` | Enter animation |
| `animate-leave` | `animate-leave="slideOut"` | Leave animation |
| `animate-duration` | `animate-duration="300"` | Duration in ms |
| `animate-stagger` | `animate-stagger="50"` | Stagger delay |
| `transition` | `transition="fade"` | CSS transition |

## i18n

| Directive | Example | Description |
|-----------|---------|-------------|
| `t` | `t="greeting"` | Translate key |
| `t-*` | `t-name="user.name"` | Translation param |

## Misc

| Directive | Example | Description |
|-----------|---------|-------------|
| `ref` | `ref="input"` | Named element ref |
| `call` | `call="/api/action"` | Trigger API call |
| `trigger` | `trigger="event-name"` | Emit custom event |
| `use` | `use="templateId"` | Instantiate template |
| `src` (on template) | `src="/tpl.html"` | Remote template (see also: `lazy`) |
| `loading` (on template) | `<template src="..." loading="#skl">` | Placeholder shown while remote template loads; removed on arrival |
| `include` (on template) | `<template include="#fragment">` | Synchronously clone an inline template into the current position |
| `error-boundary` | `error-boundary="#fb"` | Error boundary |
