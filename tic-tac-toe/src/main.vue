<template>
  <main>
    <h1>{{title}}</h1>
    <section class="settings">
      <selector name="size" :items="sizes" v-model="setSize" class="setting" />
      <selector name="mode" :items="modes" v-model="mode" class="setting setting-mode" />
      <selector name="bot-level" :items="botLevels" v-model="botLevel" class="setting" :style="{visibility: mode > 0 ?'' : 'hidden'}" />
    </section>
    <section class="board-container">
      <div class="board-overlay" v-if="isGameEnd" @click="restartGameIn">
        <section class="game-end" :class="{'game-end-leave':isGameRestarting}">
          <div v-for="(p, i) in gameEndMsgParts" :key="i" :class="{'game-end-big': i == 0 && isGameEndMsgFirstPartBig}">{{p}}</div>
        </section>
      </div>
      <board id="board" :size="size" @cell-clicked="cellClicked" ref="board" :class="'board-size-'+size" />
    </section>
  </main>
</template>

<script>
import Board from './board.vue'
import Selector from './selector.vue'
import { HumanPlayer, Board as GameBoard } from './game'
import Game, { TicTacToeBotPlayer as BotPlayer } from './tic-tac-toe-game.js'

// const b = new GameBoard(3)
// const bot = new BotPlayer('x', b, 3, 2, 0)
// b.addPiece('x', 1, 1)
// b.addPiece('o', 0, 0)
// b.addPiece('x', 2, 0)
// b.addPiece('o', 0, 2)

// bot.fillMoves('x')
// bot.moves.forEach((v, i, j, a) => a.set(i, j, v.join(',')))
// console.table(bot.moves.array)
// const xbm = bot.findBestMoves('x')
// console.table(xbm)
// const xtemp = bot.getMoveTemp(xbm[0])
// console.log(xtemp)

// bot.fillMoves('o')
// bot.moves.forEach((v, i, j, a) => a.set(i, j, v.join(',')))
// console.table(bot.moves.array)
// const obm = bot.findBestMoves('o')
// console.table(obm)
// const otemp = bot.getMoveTemp(obm[0])
// console.log(otemp)

export default {

  components: {
    Board, Selector
  },

  data() {
    const sizes = [3, 10].map(s =>
      ({
        value: s, label: s + 'x' + s
      }))

    const botLevels = [
      { value: 0, label: 'easy' },
      { value: 1, label: 'medium' },
      { value: 2, label: 'hard' }]

    const modes = [
      { value: 0, label: '\ue87c\ue87c' },
      { value: 1, label: '\uE60E\ue87c' },
      { value: 2, label: '\ue87c\uE60E' },
      { value: 3, label: '\uE60E\uE60E' }
    ]

    return {
      title: 'Tic-Tac-Toe',
      sizes,
      size: sizes[0].value,
      setSize: sizes[0].value,
      botLevels,
      botLevel: botLevels[1].value,
      modes: modes,
      mode: modes[1].value,
      plrs: [],
      aims: { '3': 3, '10': 5 },
      gameResult: null,
      isGameRestarting: false
    }
  },

  computed: {
    aim() {
      return this.aims[this.size]
    },

    isGameEnd() {
      return this.gameResult != null
    },

    gameEndMsg() {
      if (this.gameResult == null)
        return ''

      if (this.gameResult.draw)
        return 'Draw!'

      if (this.humVsBot) {
        return this.gameResult.winPlr instanceof HumanPlayer ? 'You won!' : 'You lose!'
      }
      else {
        return this.gameResult.winPlr.id + ' won!'
      }
    },

    gameEndMsgParts() {
      return this.gameEndMsg.split(' ')
    },

    isGameEndMsgFirstPartBig() {
      return !this.humVsBot && this.gameResult != null && !this.gameResult.draw
    },

    hasBotPlr() {
      return this.plrs.find(p => p instanceof BotPlayer) != undefined
    },

    hasHumPlr() {
      return this.plrs.find(p => p instanceof HumanPlayer) != undefined
    },

    humVsBot() {
      return this.hasBotPlr && this.hasHumPlr
    }
  },

  watch: {
    setSize() {
      this.restartGameIn()
    },

    botLevel() {
      this.restartGameIn()
    },

    mode() {
      this.restartGameIn()
    }
  },

  mounted() {
    this.restartGame()
  },

  methods: {
    cellClicked(x, y) {
      for (const p of this.plrs) {
        if (p instanceof HumanPlayer) {
          p.userInput({ x, y })
        }
      }
    },

    restartGameIn() {
      if (this.isGameRestarting)
        return

      this.isGameRestarting = true
      if (this.game)
        this.game.stop()
      this.$refs.board.clear()
      setTimeout(this.restartGame.bind(this), 500)
    },

    restartGame() {
      this.gameResult = null
      this.isGameRestarting = false
      this.size = this.setSize

      const board = new GameBoard(this.size)
      this.plrs = this.createPlayers(board)
      this.game = new Game(this.plrs, board, this.aim)
      this.game.run({
        bindTo: this,
        playerOnTurn() {
        },
        moveAccepted(p, m) {
          this.$refs.board.putPiece(m.x, m.y, { type: p.id, isAim: false })
        },
        gameEnded(r) {
          if (!r.draw) {
            for (const c of r.aimSeq) {
              this.$refs.board.cell(c.x, c.y)[0].isAim = true
            }
          }
          setTimeout((() => this.gameResult = r).bind(this), r.draw ? 500 : 1000)
        },
        moveRejected() {
        }
      })
    },

    createPlayers(board) {
      switch (this.mode) {
      case 0: return [this.createHumanPLayer('x'), this.createHumanPLayer('o')]
      case 1: return [this.createBotPLayer('x', board), this.createHumanPLayer('o')]
      case 2: return [this.createHumanPLayer('o'), this.createBotPLayer('x', board)]
      case 3: return [this.createBotPLayer('x', board), this.createBotPLayer('o', board)]
      }
    },

    createBotPLayer(id, board) {
      return new BotPlayer(id, board, this.aim, this.botLevel, 500)
    },

    createHumanPLayer(id) {
      return new HumanPlayer(id)
    }
  }
}
</script>


<style>
@import './global.css';

:root {
  --back-color-light: hsl(250, 80%, 55%);
  --back-color-dark: hsl(250, 80%, 40%);
  --text-color: hsl(50, 100%, 75%);
  --text-border-color: hsl(40, 100%, 100%, 0.3);
  --text-font-family: sans-serif;
  --header-font-family: Modak, "Baloo Bhaina", sans-serif;
  --board-size: 23.5rem;
}

body {
  display: flex;
  justify-content: center;
  font-family: var(--text-font-family);
  color: var(--text-color);

  background-color: var(--back-color-dark);
  background-attachment: fixed;
  background-color: var(--back-color-dark);
  background-position: center;

  background-size: auto, 1.5rem 1.5rem, 1.5rem 1.5rem;

  background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0) 70%),

  repeating-linear-gradient(45deg,
  color(var(--back-color-light) alpha(50%)),
  color(var(--back-color-light) alpha(50%)) 25%,
  color(var(--back-color-dark) alpha(50%)) 25%,
  color(var(--back-color-dark) alpha(50%)) 50%,
  color(var(--back-color-dark) alpha(50%)) 50%),

  repeating-linear-gradient(-45deg,
  var(--back-color-light),
  var(--back-color-light) 25%,
  var(--back-color-dark) 25%,
  var(--back-color-dark) 50%,
  var(--back-color-dark) 50%);

  overflow: hidden;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}

#board {
  height: var(--board-size);
  width: var(--board-size);
}

.board-size-3 {
  font-size: 1em;
}

.board-size-10 {
  font-size: 0.5em;
}

main>h1 {
  margin-top: 0;
  margin-bottom: 0;
  padding: 1rem;
  padding-bottom: 0.5rem;
  font-weight: normal;
  font-size: 4rem;
  font-family: var(--header-font-family);
  white-space: nowrap;
  text-shadow: 2px 2px 4px var(--text-border-color),
  -2px 2px 4px var(--text-border-color),
  2px -2px 4px var(--text-border-color),
  -2px -2px 4px var(--text-border-color),
  0 0.5rem 1.5rem black;
}

.settings {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  width: var(--board-size);
  margin: 0.5em 0 0.25em 0;
  z-index: 1;
}

.setting {
  font-weight: bold;
  font-size: 1.2em;
}

.setting-mode {
  font-family: icons;
  font-weight: 200;
}

.board-container {
  position: relative;
}

.board-overlay {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: default;
}

.game-end {
  font-size: 6rem;
  text-shadow: 0 0 0.5rem white, 0 0 2rem black;
  font-family: 'Baloo Bhaina';
  color: color(var(--text-color) whiteness(90%));
  text-align: center;
  animation: bounceInUp 0.5s;
  z-index: 1;
}

.game-end-leave {
  animation: bounceOut 0.5s;
}

.game-end-big {
  font-size: 9rem;
  padding: 0;
  margin: 0;
  text-transform: uppercase;
}
</style>
