<!-- Documentation — Single page with all sections -->

<!-- Skeleton reusável — injetado pelo NoJS via template[include] -->
<template id="doc-skeleton">
  <div class="doc-skeleton"><span class="skl-badge"></span><div class="skl-h1"></div><div class="skl-sub"></div><div class="skl-code"></div><div class="skl-h2"></div><div class="skl-line"></div><div class="skl-line w85"></div><div class="skl-line w65"></div><div class="skl-code sm"></div></div>
</template>

<div class="doc-with-sidebar">

    <div class="sidebar-skeleton">
        <div class="sidebar-skeleton-inner">
            <div class="skl-sidebar-group"><div class="skl-sidebar-title"></div><div class="skl-sidebar-link"></div><div class="skl-sidebar-link w75"></div><div class="skl-sidebar-link w85"></div><div class="skl-sidebar-link w65"></div></div>
            <div class="skl-sidebar-group"><div class="skl-sidebar-title"></div><div class="skl-sidebar-link"></div><div class="skl-sidebar-link w85"></div><div class="skl-sidebar-link w75"></div><div class="skl-sidebar-link"></div><div class="skl-sidebar-link w65"></div></div>
            <div class="skl-sidebar-group"><div class="skl-sidebar-title"></div><div class="skl-sidebar-link w85"></div><div class="skl-sidebar-link"></div><div class="skl-sidebar-link w75"></div></div>
            <div class="skl-sidebar-group"><div class="skl-sidebar-title"></div><div class="skl-sidebar-link"></div><div class="skl-sidebar-link w75"></div><div class="skl-sidebar-link w65"></div><div class="skl-sidebar-link w85"></div></div>
        </div>
    </div>
    <template src="./sidebar.tpl"></template>

    <div class="doc-main">

        <div id="getting-started"><template src="./getting-started.tpl" loading="#doc-skeleton"></template></div>

        <div id="cheatsheet"><template src="./cheatsheet.tpl" loading="#doc-skeleton"></template></div>
        <div id="actions-refs"><template src="./actions-refs.tpl" loading="#doc-skeleton"></template></div>
        <div id="custom-directives"><template src="./custom-directives.tpl" loading="#doc-skeleton"></template></div>
        <div id="error-handling"><template src="./error-handling.tpl" loading="#doc-skeleton"></template></div>
        <div id="configuration"><template src="./configuration.tpl" loading="#doc-skeleton"></template></div>
        <div id="state-management"><template src="./state-management.tpl" loading="#doc-skeleton"></template></div>

        <div id="events"><template src="./events.tpl" loading="#doc-skeleton"></template></div>
        <div id="data-binding"><template src="./data-binding.tpl" loading="#doc-skeleton"></template></div>
        <div id="conditionals"><template src="./conditionals.tpl" loading="#doc-skeleton"></template></div>
        <div id="loops"><template src="./loops.tpl" loading="#doc-skeleton"></template></div>
        <div id="templates"><template src="./templates.tpl" loading="#doc-skeleton"></template></div>
        <div id="data-fetching"><template src="./data-fetching.tpl" loading="#doc-skeleton"></template></div>
        <div id="routing"><template src="./routing.tpl" loading="#doc-skeleton"></template></div>
        <div id="forms-validation"><template src="./forms-validation.tpl" loading="#doc-skeleton"></template></div>
        <div id="styling"><template src="./styling.tpl" loading="#doc-skeleton"></template></div>
        <div id="animations"><template src="./animations.tpl" loading="#doc-skeleton"></template></div>
        <div id="filters"><template src="./filters.tpl" loading="#doc-skeleton"></template></div>
        <div id="i18n"><template src="./i18n.tpl" loading="#doc-skeleton"></template></div>

    </div><!-- /doc-main -->
</div><!-- /doc-with-sidebar -->

