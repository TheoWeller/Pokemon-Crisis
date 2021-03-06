import React from 'react';
import './App.css';
import semantic from 'semantic-ui-react';
import BattleContainer from './battle-components/BattleContainer'
import _ from 'lodash'
import PokemonSelect from './battle-components/PokemonSelect'
import PlayerSignIn from './battle-components/PlayerSignIn'
import PickPokemon from './battle-components/PickPokemon'
import Leaderboard from './battle-components/Leaderboard'
import pk from './Pokemon-Kry51s.png'
import b1 from './b1.jpg'
import b3 from './b3.jpg'

class App extends React.Component {
  state = { pokemons: [], player1: {}, player2: {}, battleReady: false, selectedPokemen: {} , turn: ""}

  componentDidMount(){
    this.fetchLeaderboard()
    this.fetchAllPokemon()
    this.setState({turn: _.sample(["player1", "player2"])})
  }

  fetchLeaderboard = () => {
    fetch('https://pokemon-cry51s-backend.herokuapp.com/api/v1/trainers')
    .then(resp => resp.json())
    .then(data => this.setState({leaderBoard: data}))
  }

  fetchAllPokemon = () => {
    fetch('https://pokemon-cry51s-backend.herokuapp.com/api/v1/pokemons')
    .then(resp => resp.json())
    .then(data => this.setState({pokemons: data}))
  }

  renderMoveNames = (pokemon) => {
    let moves = []
     pokemon.moves.forEach(move => {
       moves.push(_.capitalize(move.move.name))
    })
    moves = moves.join(", ")
    return moves
  }

  renderTypeNames = (pokemon) => {
    let types = []
    pokemon.types.forEach(type => {
      types.push(_.capitalize(type.type.name))
   })
   types = types.join(", ")
   return types
  }

  catchPokemon = (poke) => {
    const pokemon = {...poke, moveNames: this.renderMoveNames(poke), typeNames: this.renderTypeNames(poke)}
    this.setState( { selectedPokemen: pokemon } )
  }

  signUp = (p1, p2, e) => {
    e.preventDefault()
    fetch('https://pokemon-cry51s-backend.herokuapp.com/api/v1/trainers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }, body: JSON.stringify({

        'player1': p1,
        'player2': p2
      })
    })
    .then(r => r.json())
    .then(data => {
      this.setState({
        player1: {...this.state.player1, id: data.player1.id},
        player2: {...this.state.player2, id: data.player2.id}
      })
    })
    //optimistically set player names
    this.setState({ player1: {name: p1}, player2: {name: p2}, battleReady: true})
  }

  // renderLogo = () => {
  //   if(!this.state.player1.name && !this.state.player2.name) {
  //     return <img id="pk" src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${_.random(1, 807)}.png`} className="App-logo" alt="logo" />
  //   }
  // }

  renderTitle = () => {
    if(!this.state.player1.name && !this.state.player2.name) {
      return <img src={pk} />
    }
  }

  handlePokemonSelect = (e) => {
    e.preventDefault()
    if (this.state.selectedPokemen !== {} ) {
      this.setState( { [this.state.turn]: { ...this.state[this.state.turn], battlePoke: this.state.selectedPokemen }, selectedPokemen: "", turn: this.state.turn === "player1" ? "player2" : "player1" } )
    }
  }

  conditionallyRenderPickPokes = () => {
    if(this.state.player1.battlePoke && this.state.player2.battlePoke) {
      return <BattleContainer
        handleQuitBattle={this.handleQuitBattle}
        handleStats={this.handleStats}
        player1={this.state.player1}
        player2={this.state.player2}
        turn={this.state.turn}
        turnChange={this.turnChange}
        rematch={this.rematch}
        determineFirstPoke={this.determineFirstPoke}
      />
    } else {
      return(
        <div>
          <PokemonSelect catchPokemon={this.catchPokemon} pokemons={this.state.pokemons} battleReady={this.state.battleReady}/>
        </div>
      )
    }
  }

  renderSignIn = () => {
    if(!this.state.player1.name && !this.state.player1.name){
      return (
        <div>
          <PlayerSignIn signUp={this.signUp} player1={this.state.player1} player2={this.state.player2} />
          <Leaderboard leaderBoard={this.state.leaderBoard}/>
        </div>
      )
    }
  }

  renderPickPokemon = () => {
    // you can only pick your pokemon if:
    //  - the players are both created
    //  - a player's name renders
    //  - both players have not yet picked a pokemon
    if(this.state.battleReady && this.state.player1.name && (!this.state.player2.battlePoke || !this.state.player1.battlePoke)) {
      return <PickPokemon selectedPokemen={this.state.selectedPokemen} player1={this.state.player1} player2={this.state.player2} turn={this.state.turn} handlePokemonSelect={this.handlePokemonSelect}/>
    }
  }

  turnChange = () => {
    this.setState({turn: this.state.turn === "player1" ? "player2" : "player1"})
  }

  determineFirstPoke = (first) => {
    this.setState({turn: first})
  }

  rematch = () => {
    this.setState( {player1: {...this.state.player1, battlePoke: null }, player2: {...this.state.player2, battlePoke: null } } )
  }

  randomBackground = () => {
  return ""+b3+""
  }

  handleQuitBattle = () => {
    this.setState({
      pokemons: this.state.pokemons,
      player1: {},
      player2: {},
      battleReady: false,
      selectedPokemen: {},
      turn: ""
    })
  }

  handleStats = (results) => {
    fetch('https://pokemon-cry51s-backend.herokuapp.com/api/v1/trainers/:id',{
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(results)
    })
  }

  render(){
    console.log("APP STATE", this.state);
    return (
      <div className="App">
        <header className="App-header" style={{backgroundImage: `url(${this.randomBackground()})`}}>
          {this.renderTitle()}
          {this.state.pokemons.length == 0 ? <h1>Loading Pokemons...</h1> : this.renderPickPokemon()}
          {this.renderSignIn()}
          {this.conditionallyRenderPickPokes()}
        </header>
      </div>
    );

  }
}
//The code below renders random spinning pokemon
// {this.renderLogo()}

//Conditionally renders leaderboard
// { this.state.leaderBoard? this.renderLeaderBoard() : null }

export default App;
