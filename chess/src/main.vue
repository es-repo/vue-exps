<template>
  <main>
    <game :db="db" :user="user"></game>
  </main>
</template>

<script module>
import Firebase from 'firebase'
import 'firebase/firestore'
import Game from './game.vue'

Firebase.initializeApp({
  apiKey: 'AIzaSyC-63ApL_7XETn31Xp2cl3xDwATy-l2HYw',
  authDomain: 'chess-d790f.firebaseapp.com',
  projectId: 'chess-d790f'
})

export default {
  components: { Game },
  data() {
    const usrId = Math.random() * 100000 | 0
    return {
      db: Firebase.firestore(),
      user: {
        id: usrId,
        name: 'vasya-' + usrId }
    }
  }
}
</script>

<style>

</style>
