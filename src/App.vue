<template>
  <div id="app">

    <!-- HEADER -->
    <navigation></navigation>

    <!-- MAIN -->
    <section class="section">
      <div class="container-small">
        <div class="content">
          <markdown></markdown>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <myFooter></myFooter>

  </div>
</template>

<script>
import Markdown from './posts/logistic-article.md'
import Navigation from './Nav.vue'
import MyFooter from './footer.vue'

export default {
  components: {
    Markdown,
    Navigation,
    MyFooter
  },

  data () {
    return {
      msg: ""
    }
  }
}
</script>

<style lang="sass">
@import "../node_modules/bulma/bulma.sass";

.container-small {
  position: relative;
  margin: 0 auto;
  max-width: 50em;
}

</style>
