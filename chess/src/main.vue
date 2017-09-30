<template>
  <main @click="gameResult=null">
    <burger-menu :class="$style.menu"
                 :items="menuItems"
                 @item-click="onMenuItemClick" />
    <div :class="$style.boardContainer">
      <game-result :result="gameResult"
                   v-if="gameResult!=null"
                   :class="$style.gameResult" />
      <board :class="$style.board"
             :model="chess.board"
             :lastMove="lastMove"
             :selectedPiece="selectedPiece"
             ref="board" />
    </div>
    <div :class="$style.gameControls">
      <button @click="onUndoClick"
              :style="{visibility: chess.log.length>0?'':'hidden'}"
              :class="$style.controlButton">Undo</button>
    </div>

  </main>
</template>

<script module>
import wait from './utils/wait'
import Chess from './model/chess/game'
import Player from './ui-player'
import Board from './board.vue'
import BurgerMenu from './burger-menu.vue'
import GameResult from './game-result.vue'

import pieceMoveSoundFile from './pieces/sounds/move.mp3'
const pieceMoveSound = new Audio(pieceMoveSoundFile)

import pieceCapturedSoundFile from './pieces/sounds/captured.mp3'
const pieceCapturedSound = new Audio(pieceCapturedSoundFile)

import pieceRejectedSoundFile from './pieces/sounds/rejected.mp3'
const rejectedCapturedSound = new Audio(pieceRejectedSoundFile)

export default {

  components: { Board, BurgerMenu, GameResult },

  data() {
    return {
      chess: new Chess(),
      menuItems: [
        { text: 'New offline game', value: 'new-offline' }],
      selectedPiece: null,
      gameResult: null,
      bottomPlrColor: 'black',

      gameHooks: {
        bindTo: this,
        moveAccepted(plr, move) {
          this.selectedPiece = null
          pieceMoveSound.play()
          if (move.capture != null && move.capture.pieces.length > 0) {
            pieceCapturedSound.play()
          }
        },
        moveRejected(plr, move) {
          this.selectedPiece = null
          rejectedCapturedSound.play()
        },
        lastMoveUndone() {
          this.selectedPiece = null
          pieceMoveSound.play()
        },

        async gameEnded(result) {
          await wait(500)
          this.gameResult = result
        }
      }
    }
  },

  computed: {
    lastMove() {
      return this.chess.log.length > 0
        ? this.chess.log[this.chess.log.length - 1].move
        : null
    }
  },

  methods: {
    runNewGame(plr1, plr2) {
      this.gameResult = null
      this.chess = new Chess(plr1, plr2)
      this.chess.run(this.gameHooks)
    },

    getPlayerColors() {
      this.bottomPlrColor = this.bottomPlrColor === 'white' ? 'black' : 'white'
      const upperPlrColor = this.bottomPlrColor === 'white' ? 'black' : 'white'
      return [this.bottomPlrColor, upperPlrColor]
    },

    createUiPlayer(id, color) {
      const plr = new Player(this, id, color)
      plr.pieceSelectedEvent.on(piece => {
        this.selectedPiece = piece
      })
      return plr
    },

    onUndoClick() {
      this.$emit('undo-click')
    },

    onMenuItemClick(i) {
      const plrColors = this.getPlayerColors()
      this.chess.stop()
      switch (i.value) {
        case 'new-offline': {
          const plr1 = this.createUiPlayer(1, plrColors[0])
          const plr2 = this.createUiPlayer(1, plrColors[1])
          this.runNewGame(plr1, plr2)
          pieceMoveSound.play()
          break
        }
      }
    }
  }
}
</script>

<style module>
:root {
  --board-size: 30rem;
  --text-color: hsl(40, 40%, 77%);
  --board-color: hsl(32, 40%, 55%);
  --shadow-color: rgb(0, 0, 0, 0.4);
  --background-color: hsl(24, 26%, 32%);
}

.menu {
  position: absolute;
  z-index: 2;
  box-shadow: 0 0 1em 0.2em var(--shadow-color);
  height: 100%;
  display: flex;
  justify-content: center;
}

@media (orientation: landscape) {
  .menu{
    transform: translate(-5em, 0em);
  }
}

@media (orientation: portrait) {
  .menu{
    transform: translate(0em, -5em);
  }
}

.board {
  height: var(--board-size);
  width: var(--board-size);
  box-shadow: 0 0 1em 0.5em var(--shadow-color);
}

.game-controls {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5em;
}

.control-button {
  border: none;
  background-color: var(--board-color);
  border-radius: 4px;
  padding: 1px 8px 1px 8px;
  outline: none;
  box-shadow: 0 0 0.5em var(--shadow-color);
  z-index:1;
  color:white;
}

.control-button:active {
  transform: translate(0, 2px);
}

.board-container {
  position: relative;
}

.game-result {
  box-shadow: 0 0 0.5em 0.2em var(--shadow-color);
  position: absolute;
  z-index: 3;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
