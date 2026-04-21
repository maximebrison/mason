/* @refresh reload */
import { render } from 'solid-js/web'
import App from './App'
import './css/main.css'
import './assets/fontawesome/css/all.css'

const root = document.getElementById('root')

render(() => <App />, root!)
