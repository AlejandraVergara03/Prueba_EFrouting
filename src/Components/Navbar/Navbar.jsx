import React from 'react'

const NavLinks = [
{
 id: 1,
 tittle: "Graficas",
 link: "#",

},

]
const Navbar = () => {
  return (
    <>
    <div className='container py-4 flex  items-center gap-3'>
    {/* Logo section */}
    <img src="/Logo.png" alt="logo" className='w-22 h-20'/>
    <span className='text 4xl font-bold pr-96 ' >Prueba tecnica</span> 
 

    </div>
    </>
  )
}

export default Navbar