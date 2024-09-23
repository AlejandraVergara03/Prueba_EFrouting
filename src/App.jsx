import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Grafica from './Components/Graficas/Grafica'
const App = () => {
  return (
    
    <main className='overflow-x-hidden'>
        <Navbar/>
        <div className="p-4"> 
            <Grafica />
        </div>
    </main>

  )
}

export default App