<template>
  <section>
    <div style="text-align:right">
      <player-panel :player="topPlayer" />
    </div>
    <burger-menu :class="$style.menu"
                 :items="menuItems"
                 @item-click="onMenuItemClick" />
    <div :class="$style.boardContainer">
      <board :class="$style.board"
             :model="game.board"
             :lastMove="lastMove"
             :selectedPiece="selectedPiece"
             ref="board" />
      <game-result :result="gameResult"
                   :class="$style.notification" />
      <notification :message="notificationMessage"
                    :class="$style.notification" />
    </div>
    <div :class="$style.gameControls">
      <player-panel :player="bottomPlayer" />
      <button @click="onUndoClick"
              :style="{visibility: isUndoAvailable ? '':'hidden'}"
              :class="$style.controlButton">Undo</button>
    </div>

  </section>
</template>

<script module>
import wait from './utils/wait'
import Vue from 'vue'
import Chess from './model/chess/game'
import UIPlayer from './ui-player'
import OnlineGameFactory from './online-game-factory'
import OfflineGameFactory from './offline-game-factory'
import Board from './board.vue'
import BurgerMenu from './burger-menu.vue'
import GameResult from './game-result.vue'
import Notification from './ui-utils/notification.vue'
import PlayerPanel from './player-panel.vue'

import pieceMoveSoundFile from './pieces/sounds/move.mp3'
const pieceMoveSound = new Audio(pieceMoveSoundFile)

import pieceCapturedSoundFile from './pieces/sounds/captured.mp3'
const pieceCapturedSound = new Audio(pieceCapturedSoundFile)

import pieceRejectedSoundFile from './pieces/sounds/rejected.mp3'
const rejectedCapturedSound = new Audio(pieceRejectedSoundFile)

import kingInCheckSoundFile from './pieces/sounds/check.mp3'
const kingInCheckSound = new Audio(kingInCheckSoundFile)

const waitMessage = 'Waiting for opponent ...'
const errorMessage = { message: 'Something gone wrong.', severity: 'error' }

export default {
  components: { Board, BurgerMenu, GameResult, Notification, PlayerPanel },

  props: {
    'db': {
      required: true,
      type: Object
    },
    'user': {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      game: new Chess(),
      menuItems: [
        { text: 'New online game', value: 'new-online' },
        { text: 'New offline game', value: 'new-offline' }],
      selectedPiece: null,
      gameResult: null,
      onlineGameFactory: new OnlineGameFactory(this.db, this),
      offlineGameFactory: new OfflineGameFactory(this),
      notificationMessage: '',
      isOnlineGame: false,
      isOnlineGameCanceled: false
    }
  },

  computed: {
    lastMove() {
      return this.game.log.length > 0
        ? this.game.log[this.game.log.length - 1].move
        : null
    },

    topPlayer() {
      return this.game != null && this.game.plrs.length > 1
        ? this.game.plrs[1]
        : null
    },

    bottomPlayer() {
      return this.game != null && this.game.plrs.length > 0
        ? this.game.plrs[0]
        : null
    },

    isUndoAvailable(){
      return !this.isOnlineGame && this.game.log.length > 0 && !this.game.isEnded
    }
  },

  methods: {
    startGame(game) {
      this.gameResult = null
      this.attachGameEventHandlers(game)
      this.attachPlayerEventHandlres(game.plrs)
      this.game = game
      Vue.nextTick(() => {
        this.game.run()
        pieceMoveSound.play()
      })
    },

    attachPlayerEventHandlres(plrs) {
      for (const p of plrs) {
        if (p instanceof UIPlayer) {
          p.pieceSelectedEvent.on(piece => {
            this.selectedPiece = piece
          })
        }
      }
    },

    attachGameEventHandlers(game) {
      game.moveAcceptedEvent.on((plr, move) => {
        this.selectedPiece = null
        const oppPlr = this.game.opponentPlayer(plr)
        const isOppKingInCheck = this.game.isKingInCheck(oppPlr)
        const sound = isOppKingInCheck ? kingInCheckSound : pieceMoveSound
        sound.play()
        if (move.capture != null && move.capture.pieces.length > 0) {
          pieceCapturedSound.play()
        }
        this.handleKingInCheck()
      })

      game.moveRejectedEvent.on(() => {
        this.selectedPiece = null
        rejectedCapturedSound.play()
      })

      game.lastMoveUndoneEvent.on(() => {
        this.selectedPiece = null
        pieceMoveSound.play()
        this.handleKingInCheck()
      })

      game.gameEndedEvent.on(async (result) => {
        await wait(500)
        this.gameResult = result
      })
    },

    onUndoClick() {
      this.$emit('undo-click')
    },

    async onMenuItemClick(i) {
      this.game.stop()
      switch (i.value) {

      case 'new-offline': {
        this.isOnlineGame = false
        this.isOnlineGameCanceled = true
        this.notificationMessage = ''
        const game = this.offlineGameFactory.create()
        this.startGame(game)
        break
      }

      case 'new-online': {
        if (this.notificationMessage != waitMessage) {
          this.isOnlineGame = true
          this.isOnlineGameCanceled = false
          this.notificationMessage = waitMessage
          // Create empty game instance to clear board while online game will be creating.
          this.game = new Chess()

          try {
            const game = await this.onlineGameFactory.create(this.user)
            if (!this.isOnlineGameCanceled) {
              this.notificationMessage = ''
              this.startGame(game)
            }
          }
          catch (e) {
            console.error(e)
            this.notificationMessage = errorMessage
          }
        }
        break
      }
      }
    },

    handleKingInCheck() {
      Vue.nextTick(() => {
        for (const plr of this.game.plrs) {
          const inCheck = this.game.isKingInCheck(plr)
          for (const p of this.game.board.findPiecesOfColor(plr.color)) {
            const pieceVm = this.$refs.board.pieceVm(p.piece, p.x, p.y)
            pieceVm.stickToFearExpresion = inCheck
          }
        }
      })
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
  .menu {
    transform: translate(-5em, 0em);
  }
}

@media (orientation: portrait) {
  .menu {
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
  justify-content: space-between;
}

.control-button {
  border: none;
  background-color: var(--board-color);
  border-radius: 0.1em;
  padding: 1px 8px 1px 8px;
  outline: none;
  box-shadow: 0 0 0.5em var(--shadow-color);
  z-index: 1;
  color: white;
  margin-top: 0.5em;
}

@media all and (pointer: coarse) {
  .control-button {
    font-size: 2em;
  }
}

.control-button:active {
  transform: translate(0, 2px);
}

.board-container {
  position: relative;
}

.notification {
  box-shadow: 0 0 0.5em 0.2em var(--shadow-color);
  position: absolute;
  z-index: 4;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
