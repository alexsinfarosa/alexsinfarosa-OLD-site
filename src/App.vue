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
import markdown from './posts/logistic-article.md'
import navigation from './Nav.vue'
import myFooter from './footer.vue'

export default {
  data () {
    return {
      msg: 'Hello Vue 2.0!'
    }
  },
  components: {
    markdown,
    navigation,
    myFooter
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
