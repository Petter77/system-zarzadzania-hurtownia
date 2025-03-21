import { useState } from 'react'
import Header from './Header'
import Content from './Content'
import Footer from './Footer'
import ToolBar from './ToolBar'
import './App.css'


function App() {

  return (
      <>
        <div className='Container'>
          <Header/>
          <ToolBar/>
          <Content/>
          <Footer/>
        </div>
      </>

  )
}

export default App
