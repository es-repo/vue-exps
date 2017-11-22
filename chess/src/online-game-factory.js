import Firebase from 'firebase'
import { olderThenMinutes } from './utils/date-utils'
import UIPlayer from './ui-player'
import RemotePlayer from './remote-player'
import Chess from './model/chess/game'

export default class {
  constructor(db, uiVm) {
    this.db = db
    this.uiVm = uiVm
  }

  async create(usr) {
    return this.join(usr)
      .catch(() => this.initiate(usr))
  }

  async initiate(usr) {
    const thisPlr = this.createUiPlayer(usr)
    const gameDocRef = await this.addGameToDb(thisPlr)
    const oppPlr = await this.waitOpponentJoining(gameDocRef)
    const game = this.createGame(gameDocRef, thisPlr, oppPlr)
    // Set board property for remote player
    // so he will be able to restore moves.
    oppPlr.board = game.board
    return game
  }

  async join(usr) {
    return this.db.runTransaction(async transaction => {
      const gameDocs = await this.findGamesToJoin(usr)
      // Take first game doc which is still has plr2Id field
      // set to null in transaction scope.
      let gameDoc = null
      for (const d of gameDocs) {
        // Get fresh doc and check if it still has plr2Id field set to null.
        const transDoc = await transaction.get(d.ref)
        if (transDoc.data().plr2Id == null) {
          gameDoc = transDoc
          break
        }
      }
      if (gameDoc == null)
        return Promise.reject(null)

      const thisPlr = this.createUiPlayer(usr)
      const gameDocData = gameDoc.data()
      const oppPlr = new RemotePlayer(gameDoc.ref, gameDocData.plr1Id, gameDocData.plr1Color, gameDocData.plr1Name)
      thisPlr.color = invertColor(oppPlr.color)

      transaction.update(gameDoc.ref,
        { plr2Id: thisPlr.id, plr2Name: thisPlr.name, plr2Color: thisPlr.color })

      const game = this.createGame(gameDoc.ref, thisPlr, oppPlr)
      // Set board property for remote player
      // so he will be able to restore moves.
      oppPlr.board = game.board
      return game
    })
  }

  async findGamesToJoin(usr) {
    // Find game docs with plr2Id field not set.
    const res = await this.db.collection('games')
      .where('plr2Id', '==', null)
      .orderBy('timestamp', 'desc')
      .get()

    // Filter game docs older then 3 min
    // and game initiated by same user.
    const mins = 3
    const filtered = []

    res.forEach(d => {
      if (!olderThenMinutes(d.data().timestamp, mins) &&
        d.data().plr1Id != usr.id) {
        filtered.push(d)
      }
    })
    return filtered
  }

  async waitOpponentJoining(gameDocRef) {
    return new Promise((resolve, reject) => {
      // Whait while "plr2Id" field will get non-null value
      // and then return the opponent player info.
      const unsubscribe = gameDocRef.onSnapshot(doc => {
        const docData = doc.data()
        if (docData.plr2Id != null) {
          unsubscribe()
          const oppPlr = new RemotePlayer(gameDocRef, docData.plr2Id, docData.plr2Color, docData.plr2Name)
          resolve(oppPlr)
        }
      },
      error => reject(error))
    })
  }

  createGame(gameDocRef, thisPlr, oppPlr) {
    const game = new Chess(thisPlr, oppPlr)

    // Listen for this player moves and interruptions and save then to db
    // so remote part will able to read these moves.
    game.moveAcceptedEvent.on((plr, move) => {
      if (plr === thisPlr) {
        this.addMoveToDb(gameDocRef, plr, move)
      }
    })
    game.interruptedEvent.on((plr, inter) => {
      if (plr === thisPlr) {
        this.addInterruptionToDb(gameDocRef, plr, inter)
      }
    })

    return game
  }

  async addGameToDb(plr) {
    const gameDocData = {
      plr1Id: plr.id,
      plr1Name: plr.name,
      plr1Color: plr.color,
      plr2Id: null,
      timestamp: Firebase.firestore.FieldValue.serverTimestamp()
    }
    return this.db.collection('games').add(gameDocData)
  }

  async addMoveToDb(gameDocRef, plr, move) {
    const moveDocData = {
      plrId: plr.id,
      move: JSON.stringify({from: move.from, to: move.to}),
      timestamp: Firebase.firestore.FieldValue.serverTimestamp()
    }
    return gameDocRef.collection('moves').add(moveDocData)
  }

  async addInterruptionToDb(gameDocRef, plr, inter){
    const interDocData = {
      plrId: plr.id,
      interruption: JSON.stringify(inter),
      timestamp: Firebase.firestore.FieldValue.serverTimestamp()
    }
    return gameDocRef.collection('interruptions').add(interDocData)
  }

  createUiPlayer(usr) {
    return new UIPlayer(this.uiVm, usr.id,
      Math.random() < 0.5 ? 'white' : 'black',
      usr.name)
  }
}

function invertColor(c) {
  return c === 'white' ? 'black' : 'white'
}
