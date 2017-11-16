<template>
  <main>
    <prompt message='Your name?'
            v-if="user==null"
            @value-entered="createUser" />
    <game :db="db"
          :user="user"
          v-if="user!=null"></game>
  </main>
</template>

<script module>
import uuid from 'uuid'
import Firebase from 'firebase'
import 'firebase/firestore'
import Game from './game.vue'
import Prompt from './ui-utils/prompt.vue'

Firebase.initializeApp({
  apiKey: 'AIzaSyC-63ApL_7XETn31Xp2cl3xDwATy-l2HYw',
  authDomain: 'chess-d790f.firebaseapp.com',
  projectId: 'chess-d790f'
})

export default {
  components: { Game, Prompt },
  data() {
    return {
      db: Firebase.firestore(),
      user: null
    }
  },

  created(){
    this.user = this.getUserFromLocalStorage()
  },

  methods: {
    createUser(userName) {
      this.user = { id: uuid(), name: userName.trim() }
      this.saveUserToLocalStorage(this.user)
    },

    getUserFromLocalStorage(){
      try{
        const usrStr = localStorage.getItem('user')
        if (usrStr != null){
          return JSON.parse(usrStr)
        }
      }
      catch(e){
        return null
      }
    },

    saveUserToLocalStorage(usr){
      try{
        const usrStr = JSON.stringify(usr)
        localStorage.setItem('user', usrStr)
      }
      catch(e){
        // Ignore
      }
    }
  }
}
</script>

<style>

</style>
